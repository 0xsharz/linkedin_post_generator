from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, field_validator
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import httpx
import re


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")


class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

class GeneratePostRequest(BaseModel):
    blog_url: str
    
    @field_validator('blog_url')
    @classmethod
    def validate_url(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError('Blog URL is required')
        
        v = v.strip()
        
        url_pattern = re.compile(
            r'^https?://'
            r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,6}\.?|'
            r'localhost|'
            r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})'
            r'(?::\d+)?'
            r'(?:/?|[/?]\S+)$', re.IGNORECASE)
        
        if not url_pattern.match(v):
            raise ValueError('Invalid URL format. Please provide a valid blog URL starting with http:// or https://')
        
        return v

class GeneratePostResponse(BaseModel):
    post_body: str
    hashtags: str
    full_post: str


@api_router.get("/")
async def root():
    return {"message": "LinkedIn Post Generator API"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    
    return status_checks

@api_router.post("/generate", response_model=GeneratePostResponse)
async def generate_linkedin_post(request: GeneratePostRequest):
    """
    Generate LinkedIn post from blog URL by calling n8n webhook
    n8n webhook URL is kept server-side for security
    """
    try:
        n8n_webhook_url = "https://n8n.srv1217218.hstgr.cloud/webhook/linkgen"
        
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                n8n_webhook_url,
                json={"blog_url": request.blog_url}
            )
            response.raise_for_status()
            
            # Log the response for debugging
            logger.info(f"n8n webhook response status: {response.status_code}")
            logger.info(f"n8n webhook response body: {response.text[:500]}")
            
            # Check if response has content
            if not response.text or not response.text.strip():
                raise HTTPException(
                    status_code=502, 
                    detail="n8n webhook returned empty response. Please configure your n8n workflow to return JSON data with fields: post_body, hashtags, full_post"
                )
            
            try:
                data = response.json()
            except ValueError as e:
                logger.error(f"Failed to parse n8n response as JSON: {response.text[:200]}")
                raise HTTPException(
                    status_code=502, 
                    detail=f"n8n webhook returned invalid JSON. Response: {response.text[:100]}"
                )
            
            # Handle if n8n returns a list (take first item) or dict
            if isinstance(data, list):
                if len(data) == 0:
                    raise HTTPException(
                        status_code=502, 
                        detail="n8n webhook returned an empty list"
                    )
                logger.info(f"n8n returned a list with {len(data)} items, using first item")
                data = data[0]
            
            # Extract the output field (n8n format)
            output_text = data.get('output', '')
            
            # Extract fields from the response
            post_body = data.get('post_body', data.get('body', data.get('text', '')))
            hashtags = data.get('hashtags', data.get('tags', ''))
            full_post = data.get('full_post', data.get('content', ''))
            
            # If we have output field (n8n format), use it
            if output_text:
                full_post = output_text
                # Try to extract hashtags from the output (lines starting with #)
                lines = output_text.split('\n')
                hashtag_lines = [line.strip() for line in lines if line.strip().startswith('#')]
                if hashtag_lines:
                    hashtags = ' '.join(hashtag_lines)
                    # Post body is everything except hashtag lines
                    post_body = '\n'.join([line for line in lines if not line.strip().startswith('#')]).strip()
                else:
                    post_body = output_text
            # If full_post is empty, combine post_body and hashtags
            elif post_body or hashtags:
                full_post = f"{post_body}\n\n{hashtags}" if hashtags else post_body
            # If still empty, check if data has any string values
            else:
                for key, value in data.items():
                    if isinstance(value, str) and len(value) > 10:
                        full_post = value
                        post_body = value
                        break
            
            if not full_post:
                raise HTTPException(
                    status_code=502,
                    detail=f"n8n webhook returned data but no recognizable content. Received fields: {list(data.keys())}"
                )
            
            return GeneratePostResponse(
                post_body=post_body,
                hashtags=hashtags,
                full_post=full_post
            )
            
    except httpx.TimeoutException:
        raise HTTPException(
            status_code=408, 
            detail="Request timed out. The blog might be too large or the service is slow. Please try again."
        )
    except httpx.HTTPStatusError as e:
        error_detail = "Unable to generate LinkedIn post"
        
        if e.response.status_code == 404:
            error_detail = "n8n webhook is not available. Please ensure the webhook is activated in n8n workflow (not in test mode)."
        elif e.response.status_code >= 500:
            error_detail = "n8n service is currently unavailable. Please try again later."
        else:
            try:
                error_data = e.response.json()
                error_detail = error_data.get('message', str(e))
            except:
                error_detail = str(e)
        
        raise HTTPException(status_code=502, detail=error_detail)
    except httpx.RequestError as e:
        raise HTTPException(
            status_code=503, 
            detail="Unable to connect to the post generation service. Please check your internet connection and try again."
        )
    except Exception as e:
        logger.error(f"Unexpected error in generate_linkedin_post: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail="An unexpected error occurred while generating the post. Please try again."
        )


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path
from pydantic import BaseModel, field_validator
import httpx
import re


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Initialize logging before it's used
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI()
api_router = APIRouter(prefix="/api")

class GeneratePostRequest(BaseModel):
    blog_url: str
    
    @field_validator('blog_url')
    @classmethod
    def validate_url(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError('Blog URL is required')
        
        v = v.strip()
        
        # URL pattern matches both http:// and https:// (the ? makes 's' optional)
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

@api_router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "LinkedIn Post Generator API"
    }

@api_router.post("/generate", response_model=GeneratePostResponse)
async def generate_linkedin_post(request: GeneratePostRequest):
    """
    Generate LinkedIn post from blog URL
    All processing is done server-side for security
    """
    logger.info(f"Received request to generate post for URL: {request.blog_url}")
    
    try:
        # Post generation service URL - kept server-side for security
        n8n_webhook_url = os.environ.get('N8N_WEBHOOK_URL', 'https://n8n.xshz.me/webhook/linkgen')
        logger.info("Calling post generation service")
        
        # Increased timeout to 180 seconds (3 minutes) for long-running workflows
        async with httpx.AsyncClient(timeout=180.0) as client:
            try:
                response = await client.post(
                    n8n_webhook_url,
                    json={"blog_url": request.blog_url}
                )
                response.raise_for_status()
            except httpx.ConnectError as e:
                logger.error(f"Failed to connect to post generation service: {str(e)}")
                raise HTTPException(
                    status_code=503,
                    detail="Unable to connect to the post generation service. Please check if the service is running."
                )
            except httpx.TimeoutException:
                logger.error("Timeout connecting to post generation service")
                raise
            except httpx.HTTPStatusError as e:
                logger.error(f"Post generation service returned error: {e.response.status_code} - {e.response.text[:200]}")
                raise
            
            # Log the response for debugging
            logger.info(f"Post generation service response status: {response.status_code}")
            logger.info(f"Post generation service response body: {response.text[:500]}")
            
            # Check if response has content
            if not response.text or not response.text.strip():
                raise HTTPException(
                    status_code=502, 
                    detail="Post generation service returned empty response. Please try again."
                )
            
            try:
                data = response.json()
            except ValueError as e:
                logger.error(f"Failed to parse response as JSON: {response.text[:200]}")
                raise HTTPException(
                    status_code=502, 
                    detail="Post generation service returned invalid response. Please try again."
                )
            
            # Handle if service returns a list (take first item) or dict
            if isinstance(data, list):
                if len(data) == 0:
                    raise HTTPException(
                        status_code=502, 
                        detail="Post generation service returned empty data. Please try again."
                    )
                logger.info(f"Service returned a list with {len(data)} items, using first item")
                data = data[0]
            
            # Extract the output field
            output_text = data.get('output', '')
            
            # Extract fields from the response
            post_body = data.get('post_body', data.get('body', data.get('text', '')))
            hashtags = data.get('hashtags', data.get('tags', ''))
            full_post = data.get('full_post', data.get('content', ''))
            
            # If we have output field, use it
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
                    detail="Post generation service returned data but no recognizable content. Please try again."
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
            error_detail = "Post generation service is not available. Please ensure the service is properly configured."
        elif e.response.status_code >= 500:
            error_detail = "Post generation service is currently unavailable. Please try again later."
        else:
            try:
                error_data = e.response.json()
                error_detail = error_data.get('message', str(e))
            except:
                error_detail = str(e)
        
        raise HTTPException(status_code=502, detail=error_detail)
    except httpx.RequestError as e:
        logger.error(f"Request error connecting to post generation service: {str(e)}")
        error_msg = f"Unable to connect to the post generation service. Error: {str(e)}"
        raise HTTPException(
            status_code=503, 
            detail=error_msg
        )
    except HTTPException:
        # Re-raise HTTPException instances so they propagate with their intended status codes
        raise
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
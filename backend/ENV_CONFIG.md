# Backend Environment Configuration

Copy this configuration to create your `.env` file in the `backend` directory.

## Quick Setup

```bash
cd backend
# Copy the sample file
cp .env.sample .env
# or on Windows: copy .env.sample .env

# Then edit .env with your values
```

## Complete .env Configuration

```env
# ============================================
# LinkedIn Post Generator - Backend Configuration
# ============================================

# ============================================
# n8n Webhook Configuration (REQUIRED)
# ============================================
# Your n8n webhook URL for post generation
# This is kept server-side for security
# Replace with your actual n8n webhook URL
N8N_WEBHOOK_URL=https://n8n.xshz.me/webhook/linkgen

# ============================================
# CORS Configuration
# ============================================
# Allowed origins for CORS (comma-separated, no spaces)
# 
# Development (multiple local ports):
# CORS_ORIGINS=http://localhost:3000,http://localhost:3001
#
# Production (your domain):
# CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
#
# Allow all origins (NOT recommended for production):
# CORS_ORIGINS=*
#
# Default: * (allows all origins)
CORS_ORIGINS=*

# ============================================
# Server Configuration (Optional)
# ============================================
# These are typically set via uvicorn command line arguments
# but can be set here if using a process manager
# 
# HOST=0.0.0.0
# PORT=8000
# RELOAD=true
```

## Configuration Details

### N8N_WEBHOOK_URL
- **Required**: Yes
- **Default**: `https://n8n.xshz.me/webhook/linkgen`
- **Description**: Your n8n webhook URL that processes blog URLs and generates LinkedIn posts
- **Security**: This URL is never exposed to the frontend - all calls are server-side

### CORS_ORIGINS
- **Required**: No
- **Default**: `*` (allows all origins)
- **Description**: Comma-separated list of allowed origins for CORS
- **Format**: `http://localhost:3000,http://localhost:3001,https://yourdomain.com`
- **Production**: Always specify exact domains, never use `*`

## Example Configurations

### Development
```env
N8N_WEBHOOK_URL=https://n8n.xshz.me/webhook/linkgen
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

### Production
```env
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/linkgen
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

## Security Notes

- Never commit `.env` file to version control
- Keep `N8N_WEBHOOK_URL` secret - it's only used server-side
- In production, always specify exact `CORS_ORIGINS` (never use `*`)
- Use HTTPS URLs in production


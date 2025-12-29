# Frontend Environment Configuration

Copy this configuration to create your `.env` file in the `frontend` directory.

## Quick Setup

```bash
cd frontend
# Copy the sample file (optional in dev, required in production)
cp .env.sample .env
# or on Windows: copy .env.sample .env

# Then edit .env with your values
# Note: Only needed for production builds
```

## Complete .env Configuration

```env
# ============================================
# LinkedIn Post Generator - Frontend Configuration
# ============================================

# ============================================
# Backend API URL
# ============================================
# Backend server URL (only needed for production builds)
# 
# In development mode:
# - This is NOT needed - proxy handles it automatically
# - API calls go through webpack dev server proxy
# - Network tab shows same-origin requests
#
# In production mode:
# - This IS required
# - Set to your production backend URL
# - Example: https://api.yourdomain.com
#
# Default: http://localhost:8000
REACT_APP_BACKEND_URL=http://localhost:8000

# ============================================
# Development Server Features (Optional)
# ============================================
# Enable health check endpoints in dev server
# Default: false (disabled)
# ENABLE_HEALTH_CHECK=false
```

## Configuration Details

### REACT_APP_BACKEND_URL
- **Required**: Only for production builds
- **Default**: `http://localhost:8000`
- **Description**: Backend API server URL
- **Development**: Not needed - proxy handles automatically
- **Production**: Must be set to your production backend URL
- **Note**: All React env vars must start with `REACT_APP_`

### ENABLE_HEALTH_CHECK
- **Required**: No
- **Default**: `false` (disabled)
- **Description**: Enable health check endpoints in webpack dev server
- **Usage**: Set to `true` to enable health monitoring in development

## Development vs Production

### Development Mode
```env
# .env file is optional
# Defaults to http://localhost:8000 if not set
REACT_APP_BACKEND_URL=http://localhost:8000
```

### Production Mode
```env
# .env file is REQUIRED in production
REACT_APP_BACKEND_URL=https://api.yourdomain.com
```

## Example Configurations

### Development (Optional)
```env
# Usually not needed - proxy handles it
# But you can set it if needed:
REACT_APP_BACKEND_URL=http://localhost:8000
```

### Production (Required)
```env
REACT_APP_BACKEND_URL=https://api.yourdomain.com
```

### Production with Custom Backend Port
```env
REACT_APP_BACKEND_URL=https://api.yourdomain.com:8443
```

## Important Notes

- **Development**: `.env` file is optional - defaults to `http://localhost:8000`
- **Production**: `.env` file is required - must set `REACT_APP_BACKEND_URL`
- All environment variables must start with `REACT_APP_` to be accessible in React
- Never commit `.env` file to version control
- Use HTTPS URLs in production
- Restart dev server after changing `.env` file

## How It Works

### Development
1. Frontend makes request to `http://localhost:8000/api/generate`
2. Direct connection to backend server
3. Network tab shows backend URL

### Production
1. Frontend makes request to `${REACT_APP_BACKEND_URL}/api/generate`
2. Direct request to backend server
3. Network tab shows actual backend URL


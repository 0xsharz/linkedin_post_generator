# 🔧 Troubleshooting Guide

## API Not Working / No Requests to Backend

### Step 1: Verify Backend is Running

**Check if backend is running:**
```bash
# In backend directory
cd backend
uvicorn server:app --host 0.0.0.0 --port 8000 --reload
```

**Test backend directly:**
```bash
# Open in browser or use curl
http://localhost:8000/api/health

# Should return: {"status":"healthy","service":"LinkedIn Post Generator API"}
```

### Step 2: Check Frontend Proxy Configuration

**In development mode:**
- Frontend uses webpack dev server proxy
- API calls go to `/api/generate` (relative URL)
- Proxy forwards to `http://localhost:8000/api/generate`

**Check browser console:**
- Open browser DevTools (F12)
- Go to Console tab
- Look for proxy logs: `[Proxy] POST /api/generate -> http://localhost:8000/api/generate`
- Look for errors: `[Proxy Error]`

**Check Network tab:**
- Should show: `http://localhost:3000/api/generate` (or 3001)
- NOT: `http://localhost:8000/api/generate` (if proxy is working)

### Step 3: Verify Proxy Configuration

**Check `frontend/craco.config.js`:**
- Proxy should be configured for `/api` path
- Backend URL should be `http://localhost:8000`

**Restart frontend after proxy changes:**
```bash
# Stop frontend (Ctrl+C)
# Restart
cd frontend
npm start
```

### Step 4: Check CORS Settings

**Backend `.env` file:**
```env
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

**If using `*` (all origins):**
- Should work, but less secure
- Make sure backend `.env` has: `CORS_ORIGINS=*`

### Step 5: Test Direct Connection

**Temporarily bypass proxy (for testing only):**

Edit `frontend/src/components/PostGenerator.js`:
```javascript
// Change this line temporarily:
const BACKEND_URL = 'http://localhost:8000'; // Force direct connection
```

**If direct connection works:**
- Proxy configuration issue
- Check `craco.config.js` proxy setup

**If direct connection doesn't work:**
- Backend not running
- CORS issue
- Backend not listening on port 8000

## Common Issues

### Issue: "Network Error" or "Cannot connect to server"

**Causes:**
1. Backend not running
2. Backend running on wrong port
3. Proxy not configured correctly
4. CORS blocking request

**Solutions:**
1. Start backend: `cd backend && uvicorn server:app --host 0.0.0.0 --port 8000 --reload`
2. Check backend logs for errors
3. Verify backend is listening: `netstat -an | findstr 8000` (Windows) or `lsof -i :8000` (Mac/Linux)
4. Check CORS settings in backend `.env`

### Issue: Proxy not forwarding requests

**Symptoms:**
- Network tab shows `http://localhost:3000/api/generate` but no response
- Console shows `[Proxy Error]` messages

**Solutions:**
1. Restart frontend dev server
2. Check `craco.config.js` proxy configuration
3. Verify backend URL in proxy config: `http://localhost:8000`
4. Check if visual-edits plugin is overwriting proxy config

### Issue: Backend receives request but returns error

**Check backend logs:**
- Look for: `Received request to generate post for URL: ...`
- Look for: `Calling post generation service`
- Look for error messages

**Common backend errors:**
- n8n webhook URL not configured
- n8n webhook not reachable
- Timeout errors

## Debugging Steps

### 1. Enable Debug Logging

**Frontend console:**
- Already enabled - check browser console

**Backend logs:**
- Check terminal where backend is running
- Should show request logs

### 2. Test Backend Health Endpoint

```bash
# Direct test
curl http://localhost:8000/api/health

# Should return: {"status":"healthy","service":"LinkedIn Post Generator API"}
```

### 3. Test Generate Endpoint Directly

```bash
curl -X POST http://localhost:8000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"blog_url":"https://example.com/blog"}'
```

### 4. Check Port Conflicts

**Windows:**
```powershell
netstat -ano | findstr :8000
netstat -ano | findstr :3000
```

**Mac/Linux:**
```bash
lsof -i :8000
lsof -i :3000
```

## Quick Fixes

### Fix 1: Restart Everything
```bash
# Terminal 1 - Backend
cd backend
uvicorn server:app --host 0.0.0.0 --port 8000 --reload

# Terminal 2 - Frontend
cd frontend
npm start
```

### Fix 2: Clear Browser Cache
- Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- Or clear browser cache completely

### Fix 3: Check Environment Variables
```bash
# Backend
cd backend
cat .env  # Check N8N_WEBHOOK_URL and CORS_ORIGINS

# Frontend
cd frontend
cat .env  # Check REACT_APP_BACKEND_URL (optional in dev)
```

### Fix 4: Disable Proxy Temporarily
Edit `frontend/src/components/PostGenerator.js`:
```javascript
// Force direct connection for testing
const BACKEND_URL = 'http://localhost:8000';
```

## Still Not Working?

1. Check browser console for detailed error messages
2. Check backend terminal for request logs
3. Verify both servers are running
4. Test backend directly with curl/Postman
5. Check firewall/antivirus blocking connections


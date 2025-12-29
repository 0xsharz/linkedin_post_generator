# 🚀 Quick Setup Guide

## Prerequisites
- **Node.js** 16+ and npm
- **Python** 3.9+
- **Git**

---

## 📦 Installation

### 1. Clone Repository
```bash
git clone <your-repo-url>
cd linkedin_post_generator
```

### 2. Backend Setup
```bash
cd backend
pip install -r requirements.txt
```

**Create `.env` file:**
```bash
cd backend
# Copy the sample file
cp .env.sample .env
# or on Windows: copy .env.sample .env

# Then edit .env with your values
# See backend/ENV_CONFIG.md for detailed documentation
```

**Backend `.env` file (minimum required):**
```env
# n8n Webhook URL (required)
N8N_WEBHOOK_URL=https://n8n.xshz.me/webhook/linkgen

# CORS Origins (comma-separated, use * for all in dev)
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

**See `backend/ENV_CONFIG.md` for complete configuration options.**

### 3. Frontend Setup
```bash
cd frontend
npm install --legacy-peer-deps
```

**Create `.env` file (optional for development, required for production):**
```bash
cd frontend
# Copy the sample file (optional in dev, required in production)
cp .env.sample .env
# or on Windows: copy .env.sample .env

# Then edit .env with your values
# See frontend/ENV_CONFIG.md for detailed documentation
```

**Frontend `.env` file (only needed for production):**
```env
# Backend API URL (only needed for production builds)
# In development, proxy handles this automatically
REACT_APP_BACKEND_URL=http://localhost:8000
```

**See `frontend/ENV_CONFIG.md` for complete configuration options.**

**Note:** 
- In development mode, `.env` file is optional - proxy handles API routing automatically
- In production mode, `.env` file is required - must set `REACT_APP_BACKEND_URL`

---

## ▶️ Run Application

### Terminal 1 - Backend
```bash
cd backend
uvicorn server:app --host 0.0.0.0 --port 8000 --reload
```

### Terminal 2 - Frontend
```bash
cd frontend
npm start
```

**Frontend runs on:** `http://localhost:3000` (or 3001 if 3000 is busy)  
**Backend runs on:** `http://localhost:8000`

---

## ✅ Verify Installation

1. Open `http://localhost:3000` in browser
2. Enter a blog URL (e.g., `https://example.com/blog-post`)
3. Click "Generate" - should create LinkedIn post

---

## 🔧 Troubleshooting

**API not working / No requests to backend:**
1. **Verify backend is running:**
   ```bash
   # Test backend directly
   curl http://localhost:8000/api/health
   # Should return: {"status":"healthy",...}
   ```

2. **Check browser console:**
   - Open DevTools (F12) → Console tab
   - Look for `[Proxy]` logs or errors
   - Look for connection errors

3. **Check Network tab:**
   - Should show requests to `http://localhost:3000/api/generate` (proxy working)
   - If shows `http://localhost:8000/api/generate` (proxy not working)

4. **Restart both servers:**
   ```bash
   # Stop both (Ctrl+C)
   # Restart backend first, then frontend
   ```

**See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for detailed debugging steps.**

**Frontend won't start:**
- Run `npm install --legacy-peer-deps` again
- Delete `node_modules` and reinstall

**Backend connection error:**
- Ensure backend is running on port 8000
- Check `REACT_APP_BACKEND_URL` in frontend `.env` (optional in dev)

**n8n webhook errors:**
- Verify n8n workflow is active (not in test mode)
- Check `N8N_WEBHOOK_URL` in backend `.env`

---

## 📝 Notes

- Backend must run before frontend
- Frontend connects directly to backend at `http://localhost:8000`
- n8n webhook URL is configured server-side (secure)
- All API calls go through `/api/generate` endpoint only
- See `backend/ENV_CONFIG.md` and `frontend/ENV_CONFIG.md` for detailed configuration


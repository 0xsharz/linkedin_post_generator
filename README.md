# 🚀 Free LinkedIn Post Generator (AI-Powered)

A modern, sleek web application that transforms any blog URL into a professional LinkedIn post using AI. Built with React, FastAPI, and n8n automation.

![LinkedIn Post Generator](https://img.shields.io/badge/Status-Production%20Ready-success)
![License](https://img.shields.io/badge/License-MIT-blue)
![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109.x-009688?logo=fastapi)

## ✨ Features

- 🎨 **Modern Dark UI** - Colorful, sleek design with animated backgrounds
- 🤖 **AI-Powered** - Generates professional LinkedIn posts from blog URLs
- ⚡ **Fast Processing** - 3-minute timeout for complex content analysis
- 📱 **Fully Responsive** - Works perfectly on mobile, tablet, and desktop
- 📋 **Copy-Paste Ready** - Unicode-formatted output, ready for LinkedIn
- 🎯 **No Formatting Needed** - Direct paste into LinkedIn with emojis and structure
- 🔒 **Secure** - Backend API endpoints, n8n webhook secured server-side
- ⏱️ **Real-time Progress** - Loading animations with status updates

## 📷 Screenshots

<img alt="alt_text" src="/Screenshots/frontend1.png" />
<img alt="alt_text" src="/Screenshots/frontend2.png" />
<img alt="alt_text" src="/Screenshots/n8n_workflow.png" />

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Axios** - HTTP client
- **Sonner** - Toast notifications
- **Lucide React** - Icons

### Backend
- **FastAPI** - Python web framework
- **httpx** - HTTP client for n8n integration
- **Pydantic** - Data validation

### Integration
- **n8n** - Workflow automation for AI processing

## 📋 Prerequisites

- Node.js 16+ and npm/yarn
- Python 3.9+
- n8n instance (for AI processing)

## 🚀 Quick Start

See [SETUP.md](./SETUP.md) for detailed installation guide.

**Configuration Files:**
- Backend: See [backend/ENV_CONFIG.md](./backend/ENV_CONFIG.md) for environment variables
- Frontend: See [frontend/ENV_CONFIG.md](./frontend/ENV_CONFIG.md) for environment variables

### Quick Install

```bash
# 1. Clone repository
git clone <your-repo-url>
cd linkedin_post_generator

# 2. Backend
cd backend
pip install -r requirements.txt

# 3. Frontend
cd ../frontend
npm install --legacy-peer-deps

# 4. Run (in separate terminals)
# Terminal 1: Backend
cd backend && uvicorn server:app --host 0.0.0.0 --port 8000 --reload

# Terminal 2: Frontend
cd frontend && npm start
```

Visit `http://localhost:3000` 🎉

## 🔧 n8n Configuration

The app requires an n8n workflow to process blog content into LinkedIn posts. See [`N8N_CONFIGURATION.md`](./N8N_CONFIGURATION.md) for detailed setup.

### Quick n8n Setup:

1. **Create n8n Workflow** with these nodes:
   - Webhook (POST) - Receives `blog_url`
   - HTTP Request - Fetches blog content
   - AI Node (OpenAI/Claude) - Generates LinkedIn post
   - Respond to Webhook - Returns formatted JSON

2. **Configure Webhook URL** in `backend/.env`:
   ```env
   N8N_WEBHOOK_URL=https://n8n.xshz.me/webhook/linkgen
   ```
   See [backend/ENV_CONFIG.md](./backend/ENV_CONFIG.md) for details.

3. **Expected n8n Response Format**:
   ```json
   [{
     "output": "📊 Post Title\n\nContent...\n\n• Point 1\n• Point 2\n\n─────\n\n#Tag1 #Tag2"
   }]
   ```

### Sample AI Prompt for n8n:

```
Generate a LinkedIn post from this blog content.

Format using Unicode characters ONLY (no markdown):
- Use emojis (📊 💡 🚀)
- Use bullet points (•)
- Use separators (─────)
- 3-5 hashtags at the end

Structure:
1. Eye-catching title with emoji
2. Hook (2-3 lines)
3. Main content with bullets
4. Separator
5. Call to action
6. Hashtags

Blog: {blog_content}
```

## 📡 API Documentation

### Generate LinkedIn Post

**Endpoint:** `POST /api/generate`

**Request:**
```json
{
  "blog_url": "https://example.com/blog-post"
}
```

**Response:**
```json
{
  "post_body": "Main content...",
  "hashtags": "#AI #LinkedIn #Content",
  "full_post": "Complete formatted post..."
}
```

**Status Codes:**
- `200` - Success
- `408` - Timeout (blog too large or n8n slow)
- `422` - Invalid URL format
- `502` - n8n service unavailable
- `503` - Connection error

## 🎨 Design Features

- **Colorful Dark Theme** - Modern aesthetic with gradient accents
- **Animated Background** - Glowing orbs with pulse effects
- **Glassmorphism** - Frosted glass effect on cards
- **Tracing Beam** - Input field glow animation on focus
- **Smooth Transitions** - Framer Motion powered animations
- **Loading States** - Progress bar with rotating icons
- **Toast Notifications** - User feedback for all actions

## 📱 Mobile Optimization

- Responsive breakpoints: 375px (mobile), 768px (tablet), 1920px (desktop)
- Touch-friendly buttons with larger tap targets
- Adaptive typography (16px mobile → 24px desktop)
- Optimized images with lazy loading
- Reduced motion for accessibility

## 🔐 Security Features

- **Server-side n8n calls** - Webhook URL not exposed to frontend
- **CORS configuration** - Restricted origins
- **URL validation** - Regex pattern matching
- **Input sanitization** - Pydantic models
- **Error handling** - Secure error messages (no stack traces)
- **Timeout protection** - 3-minute max processing time

## 📊 Project Structure

```
linkedin-post-generator/
├── backend/
│   ├── server.py              # FastAPI application
│   ├── requirements.txt       # Python dependencies
│   └── .env                   # Environment variables
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── PostGenerator.js   # Main component
│   │   ├── App.js             # Root component
│   │   ├── App.css            # Global styles
│   │   └── index.css          # Tailwind + custom CSS
│   ├── public/
│   │   └── index.html         # HTML template
│   ├── package.json           # Node dependencies
│   └── .env                   # Environment variables
├── N8N_CONFIGURATION.md       # n8n setup guide
└── README.md                  # This file
```

## 🚀 Deployment

### Backend (FastAPI)

**Option 1: Docker**
```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8001"]
```

**Option 2: Railway / Render / Fly.io**
- Deploy from GitHub
- Set environment variables
- Auto-deploy on push

### Frontend (React)

**Option 1: Vercel**
```bash
vercel --prod
```

**Option 2: Netlify**
```bash
netlify deploy --prod
```

**Option 3: Static Hosting**
```bash
yarn build
# Upload build/ to S3, Cloudflare Pages, etc.
```

### Environment Variables for Production

**Backend:**
```env
CORS_ORIGINS=https://yourdomain.com
```

**Frontend:**
```env
REACT_APP_BACKEND_URL=https://api.yourdomain.com
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest tests/
```

### Frontend Tests
```bash
cd frontend
yarn test
```

### API Testing
```bash
# Test generate endpoint
curl -X POST "http://localhost:8001/api/generate" \
  -H "Content-Type: application/json" \
  -d '{"blog_url":"https://example.com/blog"}'
```

## 🐛 Troubleshooting

### Issue: n8n returns empty response
**Solution:** Ensure n8n workflow has "Respond to Webhook" node configured

### Issue: CORS errors
**Solution:** Add frontend URL to `CORS_ORIGINS` in backend `.env`

### Issue: Timeout errors
**Solution:** n8n workflow taking >3 minutes. Optimize AI prompts or increase timeout

### Issue: Images not showing
**Solution:** n8n should output Unicode-formatted text, not markdown. See `N8N_CONFIGURATION.md`

## 📝 Usage Guide

1. **Enter Blog URL** - Paste any blog URL into the input field
2. **Click Generate** - AI processes the content (30s - 3min)
3. **Review Output** - See Unicode-formatted LinkedIn post preview
4. **Copy to LinkedIn** - Click "Copy for LinkedIn" button
5. **Paste & Post** - Paste directly into LinkedIn, add images if needed

**Pro Tips:**
- Use blogs with clear structure for best results
- Longer blogs may take 1-2 minutes to process
- Output includes emojis, bullets, and hashtags
- No manual formatting needed!

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Emergent.sh](https://emergent.sh) platform
- Inspired by the need for quick LinkedIn content creation
- Powered by AI language models (GPT/Claude)
- n8n for workflow automation

## 📧 Support

- **Issues:** [GitHub Issues](https://github.com/yourusername/linkedin-post-generator/issues)
- **Discussions:** [GitHub Discussions](https://github.com/yourusername/linkedin-post-generator/discussions)
- **Email:** support@yourdomain.com

## 🔮 Roadmap

- [ ] Multi-language support
- [ ] LinkedIn API integration for direct posting
- [ ] Post history and analytics
- [ ] Custom AI prompt templates
- [ ] Bulk blog processing
- [ ] Chrome extension
- [ ] WordPress plugin

---

Made with ❤️ by [Your Name](https://github.com/yourusername)

**Star ⭐ this repo if you find it helpful!**

# 🚀 Deployment Guide

This guide covers deploying the Volunteer Hub application to various platforms.

## Overview

The application consists of:
- **Frontend**: React + Vite application
- **Backend**: Node.js + Express API server
- **Data**: JSON file with volunteer events

## Environment Variables

Make sure to set these environment variables in production:

### Backend (.env)
```
GEMINI_API_KEY=AIzaSyDm0TqiDui3FB9xZ_0ftfbgMSTeEOGS1rw
PORT=3001
NODE_ENV=production
```

## Deployment Options

### Option 1: Vercel (Recommended for Frontend + Serverless API)

1. **Prepare for Vercel**
   ```bash
   npm install -g vercel
   ```

2. **Create vercel.json in root**
   ```json
   {
     "functions": {
       "backend/server.js": {
         "runtime": "@vercel/node"
       }
     },
     "routes": [
       {
         "src": "/api/(.*)",
         "dest": "/backend/server.js"
       },
       {
         "src": "/(.*)",
         "dest": "/frontend/dist/$1"
       }
     ],
     "build": {
       "env": {
         "NPM_FLAGS": "--prefix=frontend"
       }
     }
   }
   ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

### Option 2: Railway

1. **Connect GitHub repository to Railway**
2. **Set environment variables in Railway dashboard**
3. **Railway will auto-deploy on git push**

### Option 3: Render

1. **Create new Web Service on Render**
2. **Build Command**: `npm run install-all && npm run build`
3. **Start Command**: `npm start`
4. **Set environment variables in Render dashboard**

### Option 4: Heroku

1. **Create Heroku app**
   ```bash
   heroku create volunteer-hub-sece
   ```

2. **Set environment variables**
   ```bash
   heroku config:set GEMINI_API_KEY=your_api_key
   heroku config:set NODE_ENV=production
   ```

3. **Create Procfile in root**
   ```
   web: cd backend && npm start
   ```

4. **Deploy**
   ```bash
   git push heroku main
   ```

### Option 5: Self-Hosted (VPS/Cloud Server)

1. **Install Node.js on server**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

2. **Clone repository**
   ```bash
   git clone <your-repo-url>
   cd volunteer-hub
   ```

3. **Install dependencies and build**
   ```bash
   npm run install-all
   cd frontend && npm run build
   ```

4. **Install PM2 for process management**
   ```bash
   npm install -g pm2
   ```

5. **Create ecosystem.config.js**
   ```javascript
   module.exports = {
     apps: [{
       name: 'volunteer-hub-api',
       script: './backend/server.js',
       env: {
         NODE_ENV: 'production',
         PORT: 3001,
         GEMINI_API_KEY: 'your_api_key'
       }
     }]
   }
   ```

6. **Start with PM2**
   ```bash
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

7. **Setup Nginx (optional)**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       # Serve frontend static files
       location / {
           root /path/to/volunteer-hub/frontend/dist;
           try_files $uri $uri/ /index.html;
       }
       
       # Proxy API requests to Node.js
       location /api {
           proxy_pass http://localhost:3001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

## Build Scripts

### Frontend Build
```bash
cd frontend
npm run build
# Output: frontend/dist/
```

### Full Production Build
```bash
npm run install-all
cd frontend && npm run build
```

## Environment-Specific Configurations

### Production API URL
Update `frontend/src/store/index.js`:
```javascript
const API_BASE = import.meta.env.PROD 
  ? 'https://your-api-domain.com/api' 
  : 'http://localhost:3001/api';
```

### CORS Configuration
Update `backend/server.js` for production:
```javascript
app.use(cors({
  origin: [
    'https://your-frontend-domain.com',
    'https://volunteer-hub-sece.vercel.app'
  ],
  credentials: true
}));
```

## Performance Optimizations

### Frontend
- Enable gzip compression
- Use CDN for static assets
- Implement code splitting
- Optimize images

### Backend
- Enable response compression
- Implement caching for events data
- Use Redis for session storage in production
- Add request rate limiting

## Monitoring & Analytics

### Health Checks
- Backend: `GET /api/health`
- Frontend: Check if app loads without errors

### Logging
Consider adding structured logging:
```bash
npm install winston
```

### Error Tracking
Consider integrating Sentry or similar:
```bash
npm install @sentry/node @sentry/react
```

## Security Considerations

1. **API Key Protection**: Never expose Gemini API key in frontend
2. **CORS**: Configure properly for production domains
3. **Rate Limiting**: Already implemented in backend
4. **HTTPS**: Always use HTTPS in production
5. **Environment Variables**: Never commit .env files

## Testing Deployment

After deployment, test these endpoints:
- `GET /api/health` - Should return status: healthy
- `GET /api/events` - Should return volunteer events
- `POST /api/chat` - Should return AI responses
- Frontend should load and connect to API

## Troubleshooting

### Common Issues

1. **API not responding**
   - Check environment variables
   - Verify CORS configuration
   - Check server logs

2. **Frontend not loading**
   - Check build output
   - Verify static file serving
   - Check browser console for errors

3. **Gemini API errors**
   - Verify API key is correct
   - Check API quota/billing
   - Review error logs

### Debug Commands

```bash
# Check backend health
curl https://your-api-domain.com/api/health

# Test API locally
node test-api.js

# Check frontend build
cd frontend && npm run preview
```

## Scaling Considerations

For high traffic:
1. Use load balancer
2. Implement Redis for session storage
3. Use database instead of JSON file
4. Implement caching layers
5. Consider CDN for static assets

Happy deploying! 🚀
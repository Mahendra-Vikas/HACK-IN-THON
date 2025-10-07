# 📋 Development Setup Instructions

## Prerequisites

Make sure you have the following installed:
- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git** - [Download here](https://git-scm.com/)

## Quick Start

1. **Clone or download the repository**
   ```bash
   git clone <repository-url>
   cd volunteer-hub
   ```

2. **Install all dependencies**
   ```bash
   npm run install-all
   ```

3. **Start the development servers**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001

## Manual Setup (Alternative)

If the quick start doesn't work, try manual setup:

### Backend Setup
```bash
cd backend
npm install
npm run dev
```

### Frontend Setup (in a new terminal)
```bash
cd frontend
npm install
npm run dev
```

## Environment Configuration

The backend uses environment variables. The `.env` file is already configured with:
- `GEMINI_API_KEY=AIzaSyDm0TqiDui3FB9xZ_0ftfbgMSTeEOGS1rw`
- `PORT=3001`

## Troubleshooting

### Common Issues

1. **Port already in use**
   - Change the port in `backend/.env` or `frontend/vite.config.js`

2. **Gemini API errors**
   - Check your internet connection
   - Verify the API key is correct

3. **Dependencies not installing**
   - Delete `node_modules` folders and `package-lock.json` files
   - Run `npm install` again

4. **Frontend not connecting to backend**
   - Make sure backend is running on port 3001
   - Check proxy configuration in `frontend/vite.config.js`

### Development Commands

- `npm run dev` - Start both frontend and backend
- `npm run server` - Start only backend
- `npm run client` - Start only frontend
- `npm run build` - Build frontend for production

## File Structure

```
volunteer-hub/
├── frontend/              # React + Vite frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── store/         # Zustand state management
│   │   └── main.jsx       # App entry point
│   └── package.json
├── backend/               # Node.js + Express API
│   ├── server.js          # API server
│   ├── .env              # Environment variables
│   └── package.json
├── data.json             # Volunteer events data
└── package.json          # Root package.json
```

## Features to Test

1. **Chat Interface**
   - Type messages and get AI responses
   - Try voice input (click microphone)
   - Ask about specific events

2. **Sidebar**
   - Filter events by category
   - View upcoming events
   - Toggle filters

3. **Theme Toggle**
   - Switch between light and dark mode
   - Preference is saved automatically

4. **Responsive Design**
   - Test on mobile and desktop
   - Sidebar adapts to screen size

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/events` - Get all events (with filters)
- `GET /api/categories` - Get event categories
- `POST /api/chat` - Send message to AI
- `GET /api/chat/:sessionId` - Get chat history

Happy developing! 🚀
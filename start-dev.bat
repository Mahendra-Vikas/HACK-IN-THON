@echo off
echo 🚀 Starting Enhanced Volunteer Hub Development Environment...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js detected: 
node --version

echo.
echo 📦 Installing dependencies...
call npm run install-all

if errorlevel 1 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo ✅ Dependencies installed successfully!
echo.
echo 🗄️ Database Setup:
echo   - MongoDB Atlas (recommended): See MONGODB_SETUP.md
echo   - Local MongoDB: Install MongoDB locally
echo   - No database: App will use in-memory storage
echo.
echo 🚀 Starting development servers...
echo   - Frontend:     http://localhost:5173
echo   - Backend API:  http://localhost:3001
echo   - Health Check: http://localhost:3001/api/health
echo.
echo 💡 New Features Available:
echo   ✅ Claude-style chat history with localStorage JSON
echo   ✅ In-chat event registration 
echo   ✅ MongoDB persistence + localStorage fallback
echo   ✅ Enhanced error handling & scrolling fixes
echo   ✅ Real-time search & export/import functionality
echo.
echo Press Ctrl+C to stop the servers
echo.

call npm run dev
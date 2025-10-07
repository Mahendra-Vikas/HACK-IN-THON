@echo off
echo 🚀 Starting DORA Development Environment...
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
call npm install

if errorlevel 1 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo ✅ Dependencies installed successfully!
echo.
echo 🤖 DORA - Digital Outreach & Resource Assistant
echo   🏫 Campus Navigator: Find buildings, directions, facilities
echo   🙋‍♀️ Volunteer Hub: Discover events and opportunities
echo   🧠 Smart Context Switching: Auto-detects your intent
echo.
echo 🚀 Starting DORA development server...
echo   - Frontend UI:    http://localhost:5173
echo   - DORA Chat:      http://localhost:5173
echo   - Preview Build:  npm run preview
echo.
echo 💡 DORA Features:
echo   ✅ Smart context switching between campus & volunteer modes
echo   ✅ Persistent chat history with localStorage
echo   ✅ Voice input support
echo   ✅ Dark/Light theme toggle
echo   ✅ Mobile responsive design
echo   ✅ Gemini AI powered responses
echo.
echo 🔧 Available Commands:
echo   - npm run dev      (Start development)
echo   - npm run build    (Build for production)
echo   - npm run preview  (Preview production build)
echo.
echo Press Ctrl+C to stop the server
echo.

call npm run dev
# 🤖 DORA - Digital Outreach & Resource Assistant

<div align="center">

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Mahendra-Vikas/HACK-IN-THON)

**🚀 One-Click Deploy Available! Deploy DORA to Vercel in under 2 minutes!**

</div>

---

DORA is an intelligent AI assistant for Sri Eshwar College of Engineering that combines Campus Navigation and Volunteer Hub functionality with smart context switching.

## 🌟 Features

### 🤖 **Advanced AI Chat Interface**
- **Gemini 2.0 Flash Integration** - Natural conversation with Google's latest AI
- **Claude-style Chat History** - Persistent conversation management
- **Registration Flow** - Complete in-chat event registration with form validation
- **Voice Input Support** - Web Speech API integration
- **Smart Context Awareness** - Maintains conversation context across sessions

### 📊 **Persistent Data Storage**
- **MongoDB Integration** - Reliable cloud/local database storage
- **Chat Session Management** - Save and resume conversations anytime
- **Student Registration Database** - Complete registration tracking
- **Automatic Fallback** - Works with or without database connection

### 🎓 **Student Registration System**
- **In-Chat Registration** - Natural language registration process
- **Form Validation** - Department, year, contact validation
- **Duplicate Prevention** - Prevents multiple registrations for same event
- **Registration Confirmation** - Detailed confirmation with registration ID
- **Registration History** - Track all student registrations

### 🎨 **Modern UI/UX**
- **Claude-inspired Design** - Professional chat interface with history sidebar
- **Real-time Animations** - Smooth Framer Motion transitions
- **Dark/Light Theme** - Toggle with preference persistence
- **Mobile Responsive** - Adaptive design for all screen sizes
- **Glass Morphism** - Modern glass effect styling

### 📱 **Enhanced User Experience**
- **Typing Indicators** - Real-time "AI is thinking" feedback
- **Error Handling** - Graceful fallbacks for network issues
- **Session Management** - Multiple chat sessions like ChatGPT/Claude
- **Smart Suggestions** - Contextual quick-start prompts

## 🛠️ Tech Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Frontend** | React 18 + Vite | Modern SPA framework |
| **Styling** | Tailwind CSS + Custom Components | Responsive styling |
| **Animations** | Framer Motion | Smooth transitions |
| **State Management** | Zustand with persistence | Lightweight state management |
| **Backend** | Node.js + Express | RESTful API server |
| **Database** | MongoDB + Mongoose | Document-based storage |
| **AI Integration** | Google Gemini 2.0 Flash API | Conversational AI |
| **Icons** | Lucide React | Consistent iconography |
| **Date Handling** | date-fns | Date formatting and validation |
| **Notifications** | React Hot Toast | User feedback |

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v18 or higher)
- **MongoDB** (local or Atlas cloud)
- **Git**

### 1. Installation
```bash
# Clone the repository
git clone <repository-url>
cd volunteer-hub

# Install all dependencies
npm run install-all
```

### 2. Database Setup
Choose one option:

**Option A: MongoDB Atlas (Recommended)**
1. Create free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create cluster and get connection string
3. Update `backend/.env`:
```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/volunteer-hub
```

**Option B: Local MongoDB**
1. Install MongoDB locally
2. Start MongoDB service
3. Use default connection:
```bash
MONGODB_URI=mongodb://localhost:27017/volunteer-hub
```

**Option C: Docker**
```bash
docker run -d --name mongo -p 27017:27017 mongo:7.0
```

📋 See [MONGODB_SETUP.md](./MONGODB_SETUP.md) for detailed setup instructions.

### 3. Start Development
```bash
# Start both frontend and backend
npm run dev

# Or use the Windows batch file
start-dev.bat
```

### 4. Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **API Health Check**: http://localhost:3001/api/health

## 🎯 New Features Showcase

### 📝 **Smart Registration Flow**
Try these commands in the chat:
- "I want to register for the Tree Plantation Drive"
- "Register me for Blood Donation Camp"
- "I'm interested in environment volunteering"

The AI will guide you through:
1. Event selection (if not specified)
2. Personal information collection
3. Validation and confirmation
4. Registration ID generation

### 💬 **Claude-style Chat History**
- **Multiple Sessions**: Create and manage multiple chat conversations
- **Session Titles**: Auto-generated titles from first message
- **Search Functionality**: Find previous conversations quickly
- **Session Switching**: Resume any previous conversation
- **Delete Management**: Remove unwanted chat sessions

### 🔄 **Enhanced Error Handling**
- **Network Issues**: Automatic fallback responses when Gemini API is unavailable
- **Database Failures**: Graceful degradation to in-memory storage
- **Validation Errors**: Clear feedback for invalid registration data
- **Connection Monitoring**: Real-time connection status indicators

## 📡 API Endpoints

### Chat Management
- `POST /api/chat` - Send message to AI
- `GET /api/chat-sessions` - Get all chat sessions
- `GET /api/chat/:sessionId` - Get specific chat session
- `DELETE /api/chat/:sessionId` - Delete chat session

### Event Management
- `GET /api/events` - Get all events (with filters)
- `GET /api/categories` - Get event categories

### Registration Management
- `GET /api/registrations` - Get registration history
- `GET /api/registration-status/:eventTitle/:rollNumber` - Check registration status

### System
- `GET /api/health` - Health check with database status

## 🎓 Registration Features

### Supported Student Information
- **Name**: Full name validation
- **Roll Number**: Alphanumeric format
- **Department**: Pre-defined department list
- **Year**: 1st to 4th year validation
- **Email**: Email format validation
- **Phone**: Indian mobile number validation

### Registration Validation
- **Duplicate Prevention**: One registration per student per event
- **Data Validation**: Real-time field validation
- **Error Messages**: Clear feedback for invalid data
- **Confirmation**: Detailed registration confirmation

## 🤖 AI Assistant Capabilities

The enhanced AI can now:
- ✅ **Guide Registration**: Complete end-to-end registration process
- ✅ **Validate Data**: Check and validate student information
- ✅ **Prevent Duplicates**: Detect existing registrations
- ✅ **Provide Context**: Maintain conversation flow across sessions
- ✅ **Handle Errors**: Graceful error handling and recovery
- ✅ **Smart Suggestions**: Contextual recommendations

### Example Conversations

**Event Discovery:**
```
User: "What volunteer events are happening this month?"
AI: Lists events with dates, locations, and details
```

**Registration:**
```
User: "I want to register for the Blood Donation Camp"
AI: "Great! I'll help you register..."
AI: "What's your full name?"
User: "John Doe"
AI: "Thank you! Now, please provide your roll number:"
... (continues through all required fields)
```

**Status Check:**
```
User: "Am I registered for any events?"
AI: Shows registration history and status
```

## 🐛 Troubleshooting

### Common Issues

1. **Network Error (ENOTFOUND)**
   - **Cause**: No internet connection or DNS issues
   - **Solution**: Check internet connection, restart router/modem
   - **Fallback**: AI provides offline responses for basic queries

2. **MongoDB Connection Failed**
   - **Cause**: Database not running or wrong connection string
   - **Solution**: Verify MongoDB setup (see MONGODB_SETUP.md)
   - **Fallback**: App continues with in-memory storage

3. **Registration Fails**
   - **Cause**: Invalid data or duplicate registration
   - **Solution**: Follow AI prompts for data validation
   - **Check**: Use registration status API to verify

4. **Chat History Not Saving**
   - **Cause**: Database connection issues
   - **Solution**: Check MongoDB connection
   - **Temporary**: Chat works but history won't persist

### Debug Commands
```bash
# Test API connectivity
node test-api.js

# Check database connection
curl http://localhost:3001/api/health

# View MongoDB data (if using local MongoDB)
mongosh
use volunteer-hub
db.chatsessions.find()
db.eventregistrations.find()
```

## 📈 Performance Features

- **Lazy Loading**: Chat sessions loaded on demand
- **Memory Management**: Limited chat history per session
- **Error Recovery**: Automatic retry mechanisms
- **Fallback Modes**: Works offline with reduced functionality
- **Database Indexing**: Optimized queries for fast performance

## 🔐 Security Features

- **Input Validation**: Server-side validation for all inputs
- **Rate Limiting**: Prevents API abuse
- **CORS Protection**: Proper cross-origin request handling
- **Environment Variables**: Secure API key management
- **Data Sanitization**: Clean and validate user inputs

## 📚 Documentation

- [Setup Guide](./SETUP.md) - Development environment setup
- [MongoDB Setup](./MONGODB_SETUP.md) - Database configuration
- [Deployment Guide](./DEPLOYMENT.md) - Production deployment
- [API Documentation](./api-docs.md) - Complete API reference

## 🎉 What's New in v2.0

- 🗄️ **MongoDB Integration** - Persistent data storage
- 💬 **Claude-style UI** - Professional chat history management
- 📝 **Registration System** - Complete in-chat registration flow
- 🔄 **Session Management** - Multiple chat sessions support
- 🛡️ **Error Handling** - Robust fallback mechanisms
- 📱 **Enhanced Mobile** - Improved responsive design
- 🎨 **Modern UI** - Updated animations and styling

## 🤝 Contributing

We welcome contributions! Please feel free to submit pull requests or open issues for bugs and feature requests.

## 📄 License

MIT License - feel free to use this for educational purposes.

---

**Built with ❤️ for Sri Eshwar College of Engineering students**

*Empowering campus volunteering through AI technology* 🚀
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';
import fetch from 'node-fetch';
import connectDB from './config/database.js';
import ChatSession from './models/ChatSession.js';
import EventRegistration from './models/EventRegistration.js';
import RegistrationService from './services/RegistrationService.js';

// Configure environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_FLASH_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`;

// Connect to MongoDB
let isDBConnected = false;
connectDB().then(conn => {
  isDBConnected = !!conn;
}).catch(err => {
  console.error('Database connection failed:', err.message);
  isDBConnected = false;
});

// Fallback in-memory storage when DB is not available
const memoryStorage = {
  sessions: new Map(),
  registrations: new Map()
};

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://volunteer-hub-sece.vercel.app'] 
    : ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(limiter);

// Load events data
let eventsData = [];
try {
  const dataPath = join(__dirname, '..', 'data.json');
  const rawData = readFileSync(dataPath, 'utf8');
  eventsData = JSON.parse(rawData);
  console.log(`📅 Loaded ${eventsData.length} volunteer events`);
} catch (error) {
  console.error('❌ Error loading events data:', error.message);
  eventsData = [];
}

// Store chat sessions (in production, use Redis or database)
const chatSessions = new Map();

// Helper function to get or create chat session
async function getOrCreateChatSession(sessionId, userAgent = '', ipAddress = '') {
  if (isDBConnected) {
    try {
      let session = await ChatSession.findOne({ sessionId, isActive: true });
      if (!session) {
        session = new ChatSession({
          sessionId,
          title: 'New Chat',
          messages: [],
          userInfo: { userAgent, ipAddress }
        });
        await session.save();
      }
      return session;
    } catch (error) {
      console.error('Database session error:', error);
      // Fallback to memory storage
    }
  }
  
  // Memory fallback
  if (!memoryStorage.sessions.has(sessionId)) {
    memoryStorage.sessions.set(sessionId, {
      sessionId,
      title: 'New Chat',
      messages: [],
      lastActivity: new Date(),
      registrationState: null
    });
  }
  return memoryStorage.sessions.get(sessionId);
}

// Helper function to get current date context
function getDateContext() {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  return {
    today,
    weekFromNow,
    currentDate: now.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  };
}

// Helper function to filter events based on criteria
function filterEvents(criteria = {}) {
  let filtered = [...eventsData];
  
  if (criteria.category) {
    filtered = filtered.filter(event => 
      event.category.toLowerCase().includes(criteria.category.toLowerCase())
    );
  }
  
  if (criteria.upcoming) {
    const today = new Date().toISOString().split('T')[0];
    filtered = filtered.filter(event => event.date >= today);
  }
  
  if (criteria.thisWeek) {
    const today = new Date().toISOString().split('T')[0];
    const weekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    filtered = filtered.filter(event => event.date >= today && event.date <= weekFromNow);
  }
  
  return filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
}

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    eventsLoaded: eventsData.length,
    databaseConnected: isDBConnected
  });
});

// Get all events
app.get('/api/events', (req, res) => {
  try {
    const { category, upcoming, thisWeek } = req.query;
    const filtered = filterEvents({ 
      category, 
      upcoming: upcoming === 'true', 
      thisWeek: thisWeek === 'true' 
    });
    
    res.json({
      success: true,
      events: filtered,
      total: filtered.length
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch events' 
    });
  }
});

// Chat endpoint with Gemini Flash
app.post('/api/chat', async (req, res) => {
  try {
    const { message, sessionId = `session_${Date.now()}` } = req.body;
    const userAgent = req.headers['user-agent'] || '';
    const ipAddress = req.ip || req.connection.remoteAddress || '';
    
    if (!message) {
      return res.status(400).json({ 
        success: false, 
        error: 'Message is required' 
      });
    }

    // Get or create chat session
    const chatSession = await getOrCreateChatSession(sessionId, userAgent, ipAddress);
    
    // Check for registration flow first
    const registrationResponse = await RegistrationService.handleRegistrationFlow(
      chatSession, message, eventsData
    );
    
    if (registrationResponse) {
      // Add messages to session
      if (isDBConnected && chatSession.addMessage) {
        await chatSession.addMessage('user', message);
        await chatSession.addMessage('assistant', registrationResponse);
        
        // Generate title if it's the first interaction
        if (chatSession.messages.length === 2 && chatSession.title === 'New Chat') {
          await chatSession.generateTitle();
        }
      } else {
        // Memory fallback
        chatSession.messages.push(
          { role: 'user', content: message, timestamp: new Date() },
          { role: 'assistant', content: registrationResponse, timestamp: new Date() }
        );
        chatSession.lastActivity = new Date();
      }
      
      return res.json({
        success: true,
        response: registrationResponse,
        sessionId: sessionId,
        isRegistrationFlow: true
      });
    }

    // Regular AI chat flow
    // Add user message to session first
    if (isDBConnected && chatSession.addMessage) {
      await chatSession.addMessage('user', message);
    } else {
      chatSession.messages.push({ role: 'user', content: message, timestamp: new Date() });
      chatSession.lastActivity = new Date();
    }
    
    // Prepare context for Gemini
    const dateContext = getDateContext();
    const recentMessages = isDBConnected 
      ? chatSession.messages.slice(-6) // Last 6 messages for context
      : chatSession.messages.slice(-6);
    
    const conversationHistory = recentMessages
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n');
    
    const systemPrompt = `You are a helpful and friendly volunteer assistant for Sri Eshwar College of Engineering (SECE). 

Current date: ${dateContext.currentDate}
Today's date: ${dateContext.today}

Recent conversation:
${conversationHistory}

You have access to the following volunteer events dataset:
${JSON.stringify(eventsData, null, 2)}

Guidelines for responses:
1. Be conversational, helpful, and enthusiastic about volunteering
2. When users ask about events, provide relevant details from the dataset
3. If someone expresses interest in registration, guide them through the process
4. For general queries, be encouraging about volunteer participation
5. Always mention specific dates, locations, and organizers when discussing events
6. If asked about upcoming events, focus on events after today's date
7. Group similar events by category when helpful
8. Be specific about SECE (Sri Eshwar College of Engineering) context
9. If users want to register, tell them to say "I want to register for [event name]"

Current user query: ${message}

Respond naturally and conversationally. If recommending events, include relevant details like date, location, organizer, and contact information.`;

    // Prepare request for Gemini with better error handling
    const geminiRequest = {
      contents: [{
        parts: [{
          text: systemPrompt
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.8,
        maxOutputTokens: 1024,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
      ]
    };

    // Call Gemini Flash API with better error handling
    let aiResponse;
    try {
      const response = await fetch(GEMINI_FLASH_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(geminiRequest),
        timeout: 30000 // 30 second timeout
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Gemini API error:', response.status, errorText);
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        throw new Error('Invalid response from Gemini API');
      }

      aiResponse = data.candidates[0].content.parts[0].text;
      
    } catch (error) {
      console.error('Gemini API call failed:', error.message);
      
      // Fallback response based on message content
      aiResponse = generateFallbackResponse(message, eventsData, dateContext);
    }
    
    // Add AI response to session
    if (isDBConnected && chatSession.addMessage) {
      await chatSession.addMessage('assistant', aiResponse);
      
      // Generate title if it's the first interaction
      if (chatSession.messages.length === 2 && chatSession.title === 'New Chat') {
        await chatSession.generateTitle();
      }
    } else {
      chatSession.messages.push({ role: 'assistant', content: aiResponse, timestamp: new Date() });
      chatSession.lastActivity = new Date();
    }

    res.json({
      success: true,
      response: aiResponse,
      sessionId: sessionId,
      isRegistrationFlow: false
    });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to process chat message',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Helper function to generate fallback response when Gemini API fails
function generateFallbackResponse(message, eventsData, dateContext) {
  const lowerMessage = message.toLowerCase();
  
  // Check for common queries and provide relevant responses
  if (lowerMessage.includes('upcoming') || lowerMessage.includes('events')) {
    const upcomingEvents = eventsData.filter(event => event.date >= dateContext.today);
    if (upcomingEvents.length > 0) {
      return `Here are the upcoming volunteer events at SECE:\n\n` +
        upcomingEvents.slice(0, 3).map(event => 
          `📅 **${event.title}**\n` +
          `Date: ${event.date}\n` +
          `Location: ${event.location}\n` +
          `Organizer: ${event.organizer}\n` +
          `Contact: ${event.contact}\n`
        ).join('\n') +
        `\nFor registration or more details, contact the respective organizers!`;
    }
  }
  
  if (lowerMessage.includes('register') || lowerMessage.includes('join')) {
    return `I'd love to help you register for volunteer events! To register, please say "I want to register for [event name]" and I'll guide you through the process.\n\n` +
      `Available events:\n` +
      eventsData.slice(0, 3).map(event => `• ${event.title}`).join('\n');
  }
  
  // Default fallback
  return `I'm having trouble connecting to my AI service right now, but I'm still here to help! You can:\n\n` +
    `• Ask about upcoming volunteer events\n` +
    `• Register for events by saying "I want to register for [event name]"\n` +
    `• Get event details and contact information\n\n` +
    `Try asking me about specific events or categories like "environment", "health", or "education" volunteering opportunities.`;
}

// Get chat history for a specific session
app.get('/api/chat/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    if (isDBConnected) {
      const session = await ChatSession.findOne({ sessionId, isActive: true })
        .select('sessionId title messages lastActivity');
      
      if (session) {
        return res.json({
          success: true,
          session: {
            sessionId: session.sessionId,
            title: session.title,
            messages: session.messages,
            lastActivity: session.lastActivity
          }
        });
      }
    } else {
      // Memory fallback
      const session = memoryStorage.sessions.get(sessionId);
      if (session) {
        return res.json({
          success: true,
          session: {
            sessionId: session.sessionId,
            title: session.title,
            messages: session.messages,
            lastActivity: session.lastActivity
          }
        });
      }
    }
    
    res.status(404).json({
      success: false,
      error: 'Chat session not found'
    });
  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve chat history'
    });
  }
});

// Get all chat sessions (Claude-style chat history)
app.get('/api/chat-sessions', async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    
    if (isDBConnected) {
      const sessions = await ChatSession.getRecentSessions(parseInt(limit));
      return res.json({
        success: true,
        sessions: sessions.map(session => ({
          sessionId: session.sessionId,
          title: session.title,
          lastActivity: session.lastActivity,
          messageCount: session.messageCount
        }))
      });
    } else {
      // Memory fallback
      const sessions = Array.from(memoryStorage.sessions.values())
        .sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity))
        .slice(0, parseInt(limit))
        .map(session => ({
          sessionId: session.sessionId,
          title: session.title,
          lastActivity: session.lastActivity,
          messageCount: session.messages.length
        }));
      
      return res.json({
        success: true,
        sessions
      });
    }
  } catch (error) {
    console.error('Get chat sessions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve chat sessions'
    });
  }
});

// Delete/archive a chat session
app.delete('/api/chat/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    if (isDBConnected) {
      const session = await ChatSession.findOneAndUpdate(
        { sessionId },
        { isActive: false },
        { new: true }
      );
      
      if (session) {
        return res.json({
          success: true,
          message: 'Chat session archived'
        });
      }
    } else {
      // Memory fallback
      if (memoryStorage.sessions.has(sessionId)) {
        memoryStorage.sessions.delete(sessionId);
        return res.json({
          success: true,
          message: 'Chat session deleted'
        });
      }
    }
    
    res.status(404).json({
      success: false,
      error: 'Chat session not found'
    });
  } catch (error) {
    console.error('Delete chat session error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete chat session'
    });
  }
});

// Get registration status and history
app.get('/api/registrations', async (req, res) => {
  try {
    const { sessionId, rollNumber, eventTitle } = req.query;
    
    if (isDBConnected) {
      let query = { status: 'confirmed' };
      
      if (sessionId) query.chatSessionId = sessionId;
      if (rollNumber) query['studentInfo.rollNumber'] = rollNumber.toUpperCase();
      if (eventTitle) query.eventTitle = eventTitle;
      
      const registrations = await EventRegistration.find(query)
        .select('registrationId eventTitle eventDate studentInfo.name studentInfo.rollNumber registrationDate')
        .sort({ registrationDate: -1 });
      
      return res.json({
        success: true,
        registrations
      });
    } else {
      // Memory fallback - simplified
      const registrations = Array.from(memoryStorage.registrations.values())
        .filter(reg => {
          if (sessionId && reg.chatSessionId !== sessionId) return false;
          if (rollNumber && reg.studentInfo.rollNumber !== rollNumber.toUpperCase()) return false;
          if (eventTitle && reg.eventTitle !== eventTitle) return false;
          return true;
        });
      
      return res.json({
        success: true,
        registrations
      });
    }
  } catch (error) {
    console.error('Get registrations error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve registrations'
    });
  }
});

// Check registration status for a specific student and event
app.get('/api/registration-status/:eventTitle/:rollNumber', async (req, res) => {
  try {
    const { eventTitle, rollNumber } = req.params;
    
    if (isDBConnected) {
      const registration = await EventRegistration.isAlreadyRegistered(eventTitle, rollNumber);
      
      return res.json({
        success: true,
        isRegistered: !!registration,
        registration: registration ? {
          registrationId: registration.registrationId,
          eventTitle: registration.eventTitle,
          studentName: registration.studentInfo.name,
          registrationDate: registration.registrationDate
        } : null
      });
    } else {
      // Memory fallback
      const registration = Array.from(memoryStorage.registrations.values())
        .find(reg => 
          reg.eventTitle === eventTitle && 
          reg.studentInfo.rollNumber === rollNumber.toUpperCase()
        );
      
      return res.json({
        success: true,
        isRegistered: !!registration,
        registration
      });
    }
  } catch (error) {
    console.error('Check registration status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check registration status'
    });
  }
});

// Get event categories
app.get('/api/categories', (req, res) => {
  try {
    const categories = [...new Set(eventsData.map(event => event.category))];
    res.json({
      success: true,
      categories: categories.sort()
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch categories' 
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ 
    success: false, 
    error: 'Internal server error' 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    error: 'Route not found' 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Volunteer Hub Backend running on port ${PORT}`);
  console.log(`📊 API Health: http://localhost:${PORT}/api/health`);
  console.log(`💬 Chat API: http://localhost:${PORT}/api/chat`);
  console.log(`📅 Events API: http://localhost:${PORT}/api/events`);
});

export default app;
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  createChatSession, 
  saveChatSession, 
  getChatSession,
  addMessageToSession,
  getChatSessions,
  generateSessionId,
  deleteChatSession
} from '../utils/chatHistory';
import { doraEngine, detectUserIntent, getModeIcon, getModeLabel, getModeColor } from '../utils/doraEngine';
import { processEnhancedMessage, analyzeUserIntent } from '../utils/contextDetection';
import { campusNavigator } from '../utils/campusNavigator';

// API base URL (fallback for server integration)
const API_BASE = import.meta.env.PROD ? '/api' : 'http://localhost:3001/api';

// Gemini AI API Key - Read from environment variable with multiple fallbacks
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyDm0TqiDui3FB9xZ_0ftfbgMSTeEOGS1rw';

// Debug API key loading
console.log('🔧 Environment check:', {
  'VITE_GEMINI_API_KEY': import.meta.env.VITE_GEMINI_API_KEY ? 'Found' : 'Missing',
  'API_KEY_LENGTH': GEMINI_API_KEY ? GEMINI_API_KEY.length : 0,
  'NODE_ENV': import.meta.env.NODE_ENV,
  'MODE': import.meta.env.MODE
});

// Enhanced Chat Store with DORA Intelligence and localStorage JSON as primary storage
export const useChatStore = create(
  persist(
    (set, get) => ({
      // Current chat state
      messages: [],
      isLoading: false,
      currentSessionId: null,
      currentSession: null,
      currentMode: 'volunteer', // 'campus' or 'volunteer'
      
      // Initialize new session with DORA welcome message
      initSession: (firstMessage = null) => {
        const sessionId = generateSessionId();
        const welcomeMessage = {
          sender: 'ai',
          text: doraEngine.getWelcomeMessage(),
          timestamp: new Date().toISOString(),
          mode: 'welcome'
        };
        
        const newSession = firstMessage 
          ? createChatSession(firstMessage)
          : {
              id: sessionId,
              title: 'New DORA Chat',
              messages: [welcomeMessage],
              timestamp: new Date().toISOString(),
              lastActivity: new Date().toISOString()
            };
        
        const initialMessages = [{
          id: `${sessionId}_welcome`,
          role: 'assistant',
          content: welcomeMessage.text,
          timestamp: welcomeMessage.timestamp,
          mode: 'welcome'
        }];
        
        set({ 
          currentSessionId: sessionId,
          currentSession: newSession,
          messages: initialMessages,
          currentMode: 'volunteer'
        });
        
        // Save welcome session
        saveChatSession(newSession);
        
        return sessionId;
      },
      
      // Create new chat session
      createNewSession: () => {
        const sessionId = get().initSession();
        return sessionId;
      },
      
      // Load existing session with DORA mode support
      loadSession: (sessionId) => {
        try {
          const session = getChatSession(sessionId);
          if (session) {
            const messages = session.messages.map((msg, index) => ({
              id: `${sessionId}_${index}`,
              role: msg.sender === 'user' ? 'user' : 'assistant',
              content: msg.text,
              timestamp: msg.timestamp || new Date().toISOString(),
              mode: msg.mode || 'volunteer',
              confidence: msg.confidence || 0,
              source: msg.source || (msg.sender === 'user' ? 'User' : 'AI')
            }));
            
            // Detect last mode from recent messages
            const recentAiMessages = messages
              .filter(m => m.role === 'assistant')
              .slice(-3);
            const lastMode = recentAiMessages.length > 0 
              ? recentAiMessages[recentAiMessages.length - 1].mode 
              : 'volunteer';
            
            set({
              currentSessionId: sessionId,
              currentSession: session,
              messages: messages,
              currentMode: lastMode
            });
            
            return true;
          }
          return false;
        } catch (error) {
          console.error('Failed to load session:', error);
          return false;
        }
      },
      
      // Add message to current chat with DORA mode tracking
      addMessage: (message) => {
        const state = get();
        let { currentSessionId, currentSession } = state;
        
        // Create session if it doesn't exist
        if (!currentSessionId || !currentSession) {
          currentSessionId = get().initSession(message.role === 'user' ? message.content : null);
          currentSession = get().currentSession;
        }
        
        // Update title based on first user message
        if (message.role === 'user' && currentSession.title === 'New DORA Chat') {
          const updatedSession = {
            ...currentSession,
            title: message.content.length > 50 
              ? message.content.substring(0, 50) + '...' 
              : message.content
          };
          set({ currentSession: updatedSession });
          currentSession = updatedSession;
        }
        
        // Add message to local state with DORA enhancements
        const newMessage = {
          id: `${currentSessionId}_${Date.now()}`,
          timestamp: new Date().toISOString(),
          mode: message.mode || 'volunteer',
          confidence: message.confidence || 0,
          source: message.source || 'User',
          ...message
        };
        
        set(state => ({
          messages: [...state.messages, newMessage]
        }));
        
        // Save to localStorage with mode information
        const sender = message.role === 'user' ? 'user' : 'ai';
        const messageData = {
          sender,
          text: message.content,
          timestamp: newMessage.timestamp,
          mode: newMessage.mode,
          confidence: newMessage.confidence,
          source: newMessage.source
        };
        
        addMessageToSession(currentSessionId, sender, message.content, messageData);
        
        // Update session in localStorage
        const updatedSession = {
          ...currentSession,
          messages: [...currentSession.messages, messageData],
          lastActivity: new Date().toISOString()
        };
        
        saveChatSession(updatedSession);
        set({ currentSession: updatedSession });
      },
      
      // Enhanced Send message with AI-Powered Campus Navigation
      sendMessage: async (content) => {
        const { addMessage } = get();
        
        console.log('🚀 DORA Enhanced: Processing message:', content);
        
        // Enhanced context detection
        const enhancedResult = await processEnhancedMessage(content, { useAI: true });
        console.log('🧠 Enhanced analysis result:', enhancedResult);
        
        // Add user message with enhanced context
        addMessage({
          role: 'user',
          content,
          mode: enhancedResult.intent?.primaryContext || 'general',
          confidence: enhancedResult.intent?.confidence || 0
        });
        
        // Update current mode based on enhanced detection
        set({ 
          isLoading: true,
          currentMode: enhancedResult.intent?.primaryContext || 'general'
        });
        
        try {
          // Handle different response types from enhanced processing
          switch (enhancedResult.type) {
            case 'campus_local':
              // Local campus data found - immediate response
              console.log('🏫 Local campus response:', enhancedResult.message);
              addMessage({
                role: 'assistant',
                content: enhancedResult.message,
                mode: 'campus',
                confidence: enhancedResult.intent?.confidence || 0.8,
                source: 'local_campus_data'
              });
              set({ isLoading: false });
              return;
              
            case 'campus_ai_enhanced':
              // Use AI with campus context for enhanced response
              console.log('🤖 AI-enhanced campus response needed');
              await get().sendToGeminiAI(enhancedResult.prompt, 'campus', enhancedResult.intent, {
                isEnhanced: true,
                localMatches: enhancedResult.localMatches,
                fallback: enhancedResult.fallbackResponse
              });
              return;
              
            case 'campus_loading':
              // Campus data still loading
              addMessage({
                role: 'assistant',
                content: enhancedResult.message,
                mode: 'campus',
                isLoading: true
              });
              set({ isLoading: false });
              return;
              
            case 'volunteer':
              // Enhanced volunteer query
              await get().sendToGeminiAI(enhancedResult.enhancedPrompt, 'volunteer', enhancedResult.intent);
              return;
              
            case 'general':
              // General DORA query - try legacy system first
              const legacyIntent = detectUserIntent(content);
              const doraResponse = await doraEngine.generateResponse(content, legacyIntent);
              
              if (doraResponse.mode === 'campus' && doraResponse.response) {
                addMessage({
                  role: 'assistant',
                  content: doraResponse.response,
                  mode: 'campus',
                  confidence: doraResponse.confidence,
                  source: doraResponse.source
                });
                set({ isLoading: false });
                return;
              }
              
              // Use standard Gemini AI processing
              await get().sendToGeminiAI(content, legacyIntent.mode, legacyIntent);
              return;
              
            case 'error':
            default:
              // Error handling
              addMessage({
                role: 'assistant',
                content: enhancedResult.message || "🤖 I encountered an issue processing your request. Please try again.",
                mode: 'general',
                isError: true
              });
              set({ isLoading: false });
              return;
          }
          
        } catch (error) {
          console.error('🚨 Enhanced DORA processing error:', error);
          
          // Enhanced fallback response based on detected context
          let fallbackResponse;
          const context = enhancedResult.intent?.primaryContext || 'general';
          
          switch (context) {
            case 'campus':
              fallbackResponse = "🏫 I'm having trouble accessing campus navigation data right now. Here's what I can help with:\n\n• Building locations and directions\n• Department and facility information\n• Campus accessibility details\n\nPlease try asking about a specific location again, or check if you have an internet connection.";
              break;
            case 'volunteer':
              fallbackResponse = "🙋‍♀️ I'm experiencing connectivity issues with volunteer data. However, I can still help with:\n\n• General volunteer opportunities\n• Event planning guidance\n• Community service ideas\n\nPlease try your volunteer question again in a moment!";
              break;
            default:
              fallbackResponse = "🤖 I'm having technical difficulties but I'm still here to help! You can:\n\n🏫 Ask about campus locations and directions\n🙋‍♀️ Inquire about volunteer opportunities\n💡 Try rephrasing your question\n\nWhat would you like to know?";
          }
          
          addMessage({
            role: 'assistant',
            content: fallbackResponse,
            mode: context,
            isError: true,
          });
          
          set({ isLoading: false });
        }
      },
      
      // Enhanced Gemini AI integration with campus navigation and comprehensive debugging
      sendToGeminiAI: async (prompt, mode, intent, options = {}) => {
        const { addMessage } = get();
        
        try {
          console.log('🚀 DORA Enhanced: Starting sendToGeminiAI process');
          console.log('📝 Prompt content:', typeof prompt === 'string' ? prompt.substring(0, 200) + '...' : prompt);
          console.log('🎯 Mode:', mode);
          console.log('🧠 Intent:', intent);
          console.log('⚙️ Options:', options);
          
          // Determine if this is an enhanced prompt or regular content
          const isEnhancedPrompt = options.isEnhanced || typeof prompt === 'string' && prompt.includes('USER QUERY:');
          const actualContent = isEnhancedPrompt ? prompt : prompt;
          
          // Prepare context based on detected mode and enhancement status
          let systemPrompt = `You are DORA (Digital Outreach & Resource Assistant) for Sri Eshwar College of Engineering. `;
          
          if (isEnhancedPrompt) {
            // For enhanced prompts, the context is already included
            systemPrompt = '';
          } else if (mode === 'campus') {
            systemPrompt += `You are currently in Campus Navigator mode 🏫. Help users with campus locations, directions, and facilities. `;
            systemPrompt += `If you don't have specific campus data, provide general helpful guidance about navigating a college campus. `;
            systemPrompt += `Always include the 🏫 emoji and mention "Campus Navigator Mode" in your responses.`;
          } else {
            systemPrompt += `You are currently in Volunteer Hub mode 🙋‍♀️. Help users discover volunteer opportunities, events, and community service programs. `;
            systemPrompt += `Focus on volunteer activities, event registration, community engagement, and social causes. `;
            systemPrompt += `Always include the 🙋‍♀️ emoji and mention "Volunteer Hub Mode" in your responses.`;
          }
          
          if (!isEnhancedPrompt && intent) {
            systemPrompt += `\n\nUser's detected intent keywords: ${intent.keywords?.join(', ') || intent.specialPatterns?.join(', ') || 'general query'}`;
            systemPrompt += `\nConfidence level: ${intent.confidence || 'medium'}`;
          }
          
          systemPrompt += `\n\nProvide helpful, friendly, and informative responses. Keep responses concise but comprehensive.`;
          
          // Enhanced API key validation
          console.log('🔑 Validating Gemini API key...');
          console.log('🔑 API Key check:', GEMINI_API_KEY ? `Present (${GEMINI_API_KEY.substring(0, 10)}...)` : 'MISSING');
          console.log('🔑 API Key length:', GEMINI_API_KEY ? GEMINI_API_KEY.length : 0);
          console.log('🔑 API Key prefix check:', GEMINI_API_KEY ? GEMINI_API_KEY.startsWith('AIza') : false);
          
          if (!GEMINI_API_KEY) {
            throw new Error('Gemini API key is not configured. Please check your .env.local file.');
          }

          if (!GEMINI_API_KEY.startsWith('AIza')) {
            throw new Error('Invalid Gemini API key format. Key should start with "AIza".');
          }

          if (GEMINI_API_KEY.length < 30) {
            throw new Error('Gemini API key appears to be incomplete or invalid.');
          }

          console.log('✅ API key validation passed');
          
          // Test network connectivity first
          console.log('🌐 Testing network connectivity...');
          try {
            const connectivityTest = await fetch('https://www.google.com/robots.txt', {
              method: 'HEAD',
              mode: 'no-cors',
              cache: 'no-cache'
            });
            console.log('✅ Network connectivity test passed');
          } catch (connectError) {
            console.warn('⚠️ Network connectivity test failed:', connectError.message);
          }
          
          // Use the latest Gemini 2.0 Flash model
          const baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
          const apiUrl = `${baseUrl}?key=${GEMINI_API_KEY}`;
          console.log('🌐 API Base URL:', baseUrl);
          console.log('🌐 Full URL (with key):', `${baseUrl}?key=${GEMINI_API_KEY.substring(0, 10)}...`);
          
          const requestBody = {
            contents: [{
              parts: [{
                text: isEnhancedPrompt ? actualContent : `${systemPrompt}\n\nUser query: ${actualContent}`
              }]
            }],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
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
              },
              {
                category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              },
              {
                category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              }
            ]
          };
          
          console.log('📤 Request body size:', JSON.stringify(requestBody).length, 'bytes');
          console.log('📤 Request body:', JSON.stringify(requestBody, null, 2));
          
          // Make API request with detailed logging
          console.log('📡 Sending request to Gemini API...');
          const startTime = Date.now();
          
          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'User-Agent': 'DORA/1.0.0'
            },
            body: JSON.stringify(requestBody),
          });
          
          const responseTime = Date.now() - startTime;
          console.log(`📨 Response received in ${responseTime}ms`);
          console.log('� Response status:', response.status, response.statusText);
          console.log('� Response headers:', Object.fromEntries(response.headers.entries()));
          
          // Read response body
          const responseText = await response.text();
          console.log('📨 Raw response body:', responseText);
          
          if (!response.ok) {
            console.error('❌ API Error Response:', responseText);
            let errorDetail = '';
            try {
              const errorData = JSON.parse(responseText);
              errorDetail = errorData.error?.message || errorData.message || 'Unknown API error';
            } catch (e) {
              errorDetail = responseText;
            }
            throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorDetail}`);
          }
          
          // Parse response
          let data;
          try {
            data = JSON.parse(responseText);
            console.log('📥 Parsed API response:', JSON.stringify(data, null, 2));
          } catch (parseError) {
            console.error('❌ Failed to parse API response:', parseError);
            throw new Error(`Invalid JSON response from API: ${parseError.message}`);
          }
          
          // Validate response structure with detailed logging
          if (!data) {
            throw new Error('Empty response from Gemini API');
          }

          if (!data.candidates) {
            console.error('❌ No candidates in response:', data);
            throw new Error('No candidates in API response');
          }

          if (!Array.isArray(data.candidates) || data.candidates.length === 0) {
            console.error('❌ Invalid candidates array:', data.candidates);
            throw new Error('Invalid or empty candidates array');
          }

          const candidate = data.candidates[0];
          if (!candidate) {
            throw new Error('First candidate is null or undefined');
          }

          if (!candidate.content) {
            console.error('❌ No content in candidate:', candidate);
            if (candidate.finishReason) {
              throw new Error(`Content blocked by safety filter: ${candidate.finishReason}`);
            }
            throw new Error('No content in API response candidate');
          }

          if (!candidate.content.parts || !Array.isArray(candidate.content.parts) || candidate.content.parts.length === 0) {
            console.error('❌ Invalid content parts:', candidate.content);
            throw new Error('Invalid content parts in API response');
          }

          const part = candidate.content.parts[0];
          if (!part || !part.text) {
            console.error('❌ No text in content part:', part);
            throw new Error('No text in API response content part');
          }

          const aiResponse = part.text;
          console.log('🤖 AI Reply length:', aiResponse.length, 'characters');
          console.log('🤖 AI Reply:', aiResponse);
          
          if (aiResponse) {
            console.log('✅ Message processing complete');
            addMessage({
              role: 'assistant',
              content: aiResponse,
              mode: mode,
              confidence: intent.confidence,
              source: mode === 'campus' ? 'Campus Navigator (AI)' : 'Volunteer Hub (AI)',
              responseTime: responseTime
            });
          } else {
            throw new Error('No response from Gemini AI');
          }
          
        } catch (error) {
          console.error('❌ Gemini AI error:', error);
          console.error('❌ Error name:', error.name);
          console.error('❌ Error message:', error.message);
          console.error('❌ Error stack:', error.stack);
          
          // Enhanced error message based on error type
          let errorMessage = 'Connection is unstable. Please try again.';
          let technicalDetails = error.message;
          
          if (error.message.includes('API key')) {
            errorMessage = '🔑 API key configuration error. Please check your settings.';
          } else if (error.message.includes('fetch') || error.name === 'TypeError') {
            errorMessage = '🌐 Network connection error. Please check your internet connection.';
          } else if (error.message.includes('403')) {
            errorMessage = '🚫 API access denied. Please check your API key permissions.';
          } else if (error.message.includes('429')) {
            errorMessage = '⏱️ Rate limit exceeded. Please wait a moment and try again.';
          } else if (error.message.includes('500')) {
            errorMessage = '🔧 Server error. Please try again in a few moments.';
          } else if (error.message.includes('safety filter') || error.message.includes('blocked')) {
            errorMessage = '🛡️ Content was blocked by safety filters. Please rephrase your message.';
          } else if (error.message.includes('JSON')) {
            errorMessage = '📄 Invalid response format from API. Please try again.';
          }
          
          // Try server fallback
          try {
            console.log('🔄 Attempting server fallback...');
            const response = await fetch(`${API_BASE}/chat`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                message: content,
                sessionId: get().currentSessionId,
                mode: mode,
                intent: intent
              }),
            });
            
            if (response.ok) {
              const data = await response.json();
              if (data.success) {
                console.log('✅ Server fallback successful');
                addMessage({
                  role: 'assistant',
                  content: data.response,
                  mode: mode,
                  source: data.source || 'Server'
                });
                return;
              }
            }
          } catch (serverError) {
            console.error('❌ Server fallback failed:', serverError);
          }
          
          // Final fallback with enhanced error details
          const fallbackMessages = {
            campus: [
              "🏫 I'm having trouble accessing campus information right now. However, I can still help you navigate! Most buildings at SECE are well-marked, and you can ask security or reception for specific directions.",
              "🏫 Campus Navigator is temporarily offline, but here's a tip: The main buildings are typically labeled, and the reception at the main entrance can provide detailed directions to any department or facility.",
              "🏫 I'm experiencing connectivity issues with campus data. Try asking again in a moment, or you can visit the main reception for immediate assistance with campus navigation."
            ],
            volunteer: [
              "🙋‍♀️ I'm having network issues but I'm still here to help with volunteer opportunities! Check out the events panel for upcoming activities, or ask me about specific volunteer categories like environment, education, or health.",
              "🙋‍♀️ Connection is unstable, but I can still assist with volunteer programs! You can explore community service opportunities in the sidebar or ask about upcoming volunteer events at SECE.",
              "🙋‍♀️ I'm working in offline mode right now. While I reconnect, feel free to browse volunteer opportunities or ask me about specific volunteer programs like tree plantation, blood donation, or coding workshops."
            ]
          };
          
          const modeMessages = fallbackMessages[mode] || fallbackMessages.volunteer;
          const randomMessage = modeMessages[Math.floor(Math.random() * modeMessages.length)];
          
          addMessage({
            role: 'assistant',
            content: `${errorMessage}\n\n${randomMessage}\n\n**Technical Details:**\n${technicalDetails}\n\n**Debug Info:**\n- Time: ${new Date().toISOString()}\n- Mode: ${mode}\n- Browser: ${navigator.userAgent}`,
            mode: mode,
            isError: true,
          });
        } finally {
          set({ isLoading: false });
        }
      },
      
      // Clear current chat
      clearChat: () => {
        set({ messages: [] });
        // Keep session but clear messages
        const { currentSession } = get();
        if (currentSession) {
          const clearedSession = {
            ...currentSession,
            messages: [],
            lastActivity: new Date().toISOString()
          };
          saveChatSession(clearedSession);
          set({ currentSession: clearedSession });
        }
      },
      
      // Get all chat sessions
      getChatSessions: () => {
        try {
          return getChatSessions();
        } catch (error) {
          console.error('Failed to get chat sessions:', error);
          return [];
        }
      },
      
      // Delete session
      deleteSession: (sessionId) => {
        try {
          deleteChatSession(sessionId);
          
          // If current session was deleted, create new one
          if (get().currentSessionId === sessionId) {
            get().createNewSession();
          }
          
          return true;
        } catch (error) {
          console.error('Failed to delete session:', error);
          return false;
        }
      },
    }),
    {
      name: 'volunteer-hub-chat',
      partialize: (state) => ({
        currentSessionId: state.currentSessionId,
        currentSession: state.currentSession,
      }),
    }
  )
);

// Events store (keeping existing functionality)
export const useEventsStore = create((set, get) => ({
  events: [],
  categories: [],
  loading: false,
  error: null,
  filters: {
    category: '',
    upcoming: true,
    thisWeek: false,
  },
  
  // Fetch events
  fetchEvents: async (filters = {}) => {
    set({ loading: true, error: null });
    
    try {
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.upcoming) params.append('upcoming', 'true');
      if (filters.thisWeek) params.append('thisWeek', 'true');
      
      const response = await fetch(`${API_BASE}/events?${params}`);
      const data = await response.json();
      
      if (data.success) {
        set({ events: data.events, loading: false });
      } else {
        throw new Error(data.error || 'Failed to fetch events');
      }
    } catch (error) {
      console.error('Events fetch error:', error);
      set({ error: error.message, loading: false });
      
      // Load from local data.json as fallback
      try {
        const response = await fetch('/data.json');
        const localEvents = await response.json();
        set({ events: localEvents || [], loading: false, error: null });
      } catch (localError) {
        console.error('Failed to load local events:', localError);
        // Set some default events if everything fails
        set({ 
          events: [
            {
              title: "Sample Volunteer Event",
              organizer: "SECE Volunteer Hub",
              date: "2025-10-15",
              location: "Campus",
              description: "A sample volunteer opportunity",
              category: "Community Service",
              contact: "volunteers@sece.ac.in"
            }
          ], 
          loading: false, 
          error: null 
        });
      }
    }
  },
  
  // Fetch categories
  fetchCategories: async () => {
    try {
      const response = await fetch(`${API_BASE}/categories`);
      const data = await response.json();
      
      if (data.success) {
        set({ categories: data.categories });
      }
    } catch (error) {
      console.error('Categories fetch error:', error);
      // Set default categories
      set({ 
        categories: ['Environment', 'Education', 'Health', 'Technology', 'Community Service'] 
      });
    }
  },
  
  // Update filters
  updateFilters: (newFilters) => {
    const filters = { ...get().filters, ...newFilters };
    set({ filters });
    get().fetchEvents(filters);
  },
  
  // Get events by category
  getEventsByCategory: (category) => {
    const { events } = get();
    return events.filter(event => 
      event.category.toLowerCase().includes(category.toLowerCase())
    );
  },
  
  // Get upcoming events
  getUpcomingEvents: () => {
    const { events } = get();
    const today = new Date().toISOString().split('T')[0];
    return events.filter(event => event.date >= today);
  },
}));

// UI store (keeping existing functionality)
export const useUIStore = create(
  persist(
    (set) => ({
      isDarkMode: false,
      sidebarOpen: true,
      historyPanelOpen: false,
      
      // Toggle dark mode
      toggleDarkMode: () => {
        set(state => {
          const newMode = !state.isDarkMode;
          // Update document class
          if (newMode) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
          return { isDarkMode: newMode };
        });
      },
      
      // Set dark mode
      setDarkMode: (isDark) => {
        set({ isDarkMode: isDark });
        if (isDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },
      
      // Toggle sidebar
      toggleSidebar: () => {
        set(state => ({ sidebarOpen: !state.sidebarOpen }));
      },
      
      // Set sidebar state
      setSidebarOpen: (open) => {
        set({ sidebarOpen: open });
      },
      
      // Toggle history panel
      toggleHistoryPanel: () => {
        set(state => ({ historyPanelOpen: !state.historyPanelOpen }));
      },
      
      // Set history panel state
      setHistoryPanelOpen: (open) => {
        set({ historyPanelOpen: open });
      },
    }),
    {
      name: 'volunteer-hub-ui',
      onRehydrateStorage: () => (state) => {
        // Apply dark mode on load
        if (state?.isDarkMode) {
          document.documentElement.classList.add('dark');
        }
      },
    }
  )
);
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

// API base URL (fallback for server integration)
const API_BASE = import.meta.env.PROD ? '/api' : 'http://localhost:3001/api';

// Gemini AI API Key
const GEMINI_API_KEY = 'AIzaSyDjwsRlPhNh5gGhOE2NTMJ7TqhtqtyVb58';

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
      
      // Send message to DORA AI with smart context switching
      sendMessage: async (content) => {
        const { addMessage } = get();
        
        // Detect user intent and mode
        const intent = detectUserIntent(content);
        const detectedMode = intent.mode;
        
        // Add user message with detected mode
        addMessage({
          role: 'user',
          content,
          mode: detectedMode,
          confidence: intent.confidence
        });
        
        // Update current mode based on detection
        set({ 
          isLoading: true,
          currentMode: detectedMode 
        });
        
        try {
          // Check if DORA can handle this directly (campus queries)
          const doraResponse = await doraEngine.generateResponse(content, intent);
          
          if (doraResponse.mode === 'campus' && doraResponse.response) {
            // DORA handled the campus query directly
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
          
          // For volunteer queries or if campus data isn't available, use Gemini AI
          await get().sendToGeminiAI(content, detectedMode, intent);
          
        } catch (error) {
          console.error('DORA processing error:', error);
          
          // Fallback response
          const fallbackResponse = detectedMode === 'campus' 
            ? "🏫 I'm having trouble accessing campus information right now. Please try asking about buildings, departments, or facilities again in a moment!"
            : "🙋‍♀️ I'm having connectivity issues but I'm still here to help with volunteer opportunities! You can check the events panel or ask me about specific volunteer programs.";
          
          addMessage({
            role: 'assistant',
            content: fallbackResponse,
            mode: detectedMode,
            isError: true,
          });
          
          set({ isLoading: false });
        }
      },
      
      // Enhanced Gemini AI integration with DORA context
      sendToGeminiAI: async (content, mode, intent) => {
        const { addMessage } = get();
        
        try {
          // Prepare context based on detected mode
          let systemPrompt = `You are DORA (Digital Outreach & Resource Assistant) for Sri Eshwar College of Engineering. `;
          
          if (mode === 'campus') {
            systemPrompt += `You are currently in Campus Navigator mode 🏫. Help users with campus locations, directions, and facilities. `;
            systemPrompt += `If you don't have specific campus data, provide general helpful guidance about navigating a college campus. `;
            systemPrompt += `Always include the 🏫 emoji and mention "Campus Navigator Mode" in your responses.`;
          } else {
            systemPrompt += `You are currently in Volunteer Hub mode 🙋‍♀️. Help users discover volunteer opportunities, events, and community service programs. `;
            systemPrompt += `Focus on volunteer activities, event registration, community engagement, and social causes. `;
            systemPrompt += `Always include the 🙋‍♀️ emoji and mention "Volunteer Hub Mode" in your responses.`;
          }
          
          systemPrompt += `\n\nUser's detected intent keywords: ${intent.keywords.join(', ') || 'general query'}`;
          systemPrompt += `\nConfidence level: ${intent.confidence}/5`;
          systemPrompt += `\n\nProvide helpful, friendly, and informative responses. Keep responses concise but comprehensive.`;
          
          // Call Gemini AI
          const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: `${systemPrompt}\n\nUser query: ${content}`
                }]
              }],
              generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 1024,
              }
            }),
          });
          
          if (!response.ok) {
            throw new Error(`Gemini API error: ${response.status}`);
          }
          
          const data = await response.json();
          const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
          
          if (aiResponse) {
            addMessage({
              role: 'assistant',
              content: aiResponse,
              mode: mode,
              confidence: intent.confidence,
              source: mode === 'campus' ? 'Campus Navigator (AI)' : 'Volunteer Hub (AI)'
            });
          } else {
            throw new Error('No response from Gemini AI');
          }
          
        } catch (error) {
          console.error('Gemini AI error:', error);
          
          // Try server fallback
          try {
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
            console.error('Server fallback failed:', serverError);
          }
          
          // Final fallback
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
            content: randomMessage,
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
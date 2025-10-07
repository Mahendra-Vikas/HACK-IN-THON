import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';

// API base URL
const API_BASE = import.meta.env.PROD ? '/api' : 'http://localhost:3001/api';

// Local storage helper functions
const STORAGE_KEYS = {
  CHAT_SESSIONS: 'volunteerHubChats',
  CURRENT_SESSION: 'volunteerHubCurrentSession'
};

const saveToLocalStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.warn('Failed to save to localStorage:', error);
  }
};

const loadFromLocalStorage = (key, defaultValue = null) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (error) {
    console.warn('Failed to load from localStorage:', error);
    return defaultValue;
  }
};

// Chat store
export const useChatStore = create(
  persist(
    (set, get) => ({
      messages: [],
      isLoading: false,
      sessionId: null,
      chatSessions: [],
      currentSession: null,
      useLocalStorage: false,
      
      // Initialize session
      initSession: () => {
        const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        set({ sessionId, messages: [], currentSession: { sessionId, title: 'New Chat', lastActivity: new Date() } });
        return sessionId;
      },
      
      // Load chat sessions list (Claude-style) with localStorage fallback
      loadChatSessions: async () => {
        try {
          const response = await fetch(`${API_BASE}/chat-sessions`);
          const data = await response.json();
          
          if (data.success) {
            set({ chatSessions: data.sessions, useLocalStorage: false });
            // Also save to localStorage as backup
            saveToLocalStorage(STORAGE_KEYS.CHAT_SESSIONS, data.sessions);
          }
        } catch (error) {
          console.error('Failed to load chat sessions from server, using localStorage:', error);
          // Fallback to localStorage
          const localSessions = loadFromLocalStorage(STORAGE_KEYS.CHAT_SESSIONS, []);
          set({ chatSessions: localSessions, useLocalStorage: true });
        }
      },
      
      // Switch to a different chat session with localStorage fallback
      switchToSession: async (sessionId) => {
        set({ isLoading: true });
        
        try {
          const response = await fetch(`${API_BASE}/chat/${sessionId}`);
          const data = await response.json();
          
          if (data.success) {
            const { session } = data;
            const sessionData = {
              sessionId: session.sessionId,
              messages: session.messages.map((msg, index) => ({
                id: Date.now() + index,
                role: msg.role,
                content: msg.content,
                timestamp: msg.timestamp,
                isError: msg.isError
              })),
              currentSession: {
                sessionId: session.sessionId,
                title: session.title,
                lastActivity: session.lastActivity
              },
              isLoading: false 
            };
            set(sessionData);
            
            // Save current session to localStorage
            saveToLocalStorage(STORAGE_KEYS.CURRENT_SESSION, sessionData.currentSession);
          } else {
            throw new Error(data.error || 'Failed to load session');
          }
        } catch (error) {
          console.error('Failed to switch session from server, checking localStorage:', error);
          
          // Try to load from localStorage
          const localSessions = loadFromLocalStorage(STORAGE_KEYS.CHAT_SESSIONS, []);
          const session = localSessions.find(s => s.sessionId === sessionId);
          
          if (session) {
            set({ 
              sessionId: session.sessionId,
              messages: session.messages || [],
              currentSession: {
                sessionId: session.sessionId,
                title: session.title,
                lastActivity: session.lastActivity
              },
              isLoading: false,
              useLocalStorage: true
            });
          } else {
            set({ isLoading: false });
          }
        }
      },
      
      // Create new chat session
      createNewSession: () => {
        const sessionId = get().initSession();
        get().loadChatSessions(); // Refresh sessions list
        return sessionId;
      },
      
      // Delete chat session with localStorage support
      deleteSession: async (sessionId) => {
        try {
          const { useLocalStorage } = get();
          
          if (!useLocalStorage) {
            const response = await fetch(`${API_BASE}/chat/${sessionId}`, {
              method: 'DELETE'
            });
            
            if (!response.ok) {
              throw new Error('Failed to delete from server');
            }
          }
          
          // Remove from local sessions list (both server and localStorage mode)
          const sessions = get().chatSessions.filter(s => s.sessionId !== sessionId);
          set({ chatSessions: sessions });
          
          // Update localStorage
          saveToLocalStorage(STORAGE_KEYS.CHAT_SESSIONS, sessions);
          
          // If current session was deleted, create new one
          if (get().sessionId === sessionId) {
            get().createNewSession();
          }
        } catch (error) {
          console.error('Failed to delete session from server, removing locally:', error);
          
          // Fallback: remove from local storage only
          const sessions = get().chatSessions.filter(s => s.sessionId !== sessionId);
          set({ chatSessions: sessions, useLocalStorage: true });
          saveToLocalStorage(STORAGE_KEYS.CHAT_SESSIONS, sessions);
          
          if (get().sessionId === sessionId) {
            get().createNewSession();
          }
        }
      },
      
      // Add message
      addMessage: (message) => {
        set(state => ({
          messages: [...state.messages, {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            ...message
          }]
        }));
      },
      
      
      // Send message to AI (updated with better error handling and localStorage fallback)
      sendMessage: async (content) => {
        const { sessionId, addMessage, useLocalStorage } = get();
        const currentSessionId = sessionId || get().initSession();
        
        // Add user message
        addMessage({
          role: 'user',
          content,
        });
        
        set({ isLoading: true });
        
        try {
          const response = await fetch(`${API_BASE}/chat`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              message: content,
              sessionId: currentSessionId,
            }),
          });
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const data = await response.json();
          
          if (data.success) {
            // Add AI response
            addMessage({
              role: 'assistant',
              content: data.response,
              isRegistrationFlow: data.isRegistrationFlow
            });
            
            // Update current session title if it's a new session
            const currentSession = get().currentSession;
            if (currentSession && currentSession.title === 'New Chat') {
              // Generate a title from the first user message
              const title = content.length > 50 ? content.substring(0, 50) + '...' : content;
              const updatedSession = { 
                ...currentSession, 
                title,
                lastActivity: new Date().toISOString()
              };
              set({ currentSession: updatedSession });
              
              // Save to localStorage
              saveToLocalStorage(STORAGE_KEYS.CURRENT_SESSION, updatedSession);
            }
            
            // Refresh sessions list to show updated activity
            get().loadChatSessions();
          } else {
            throw new Error(data.error || 'Failed to get response');
          }
        } catch (error) {
          console.error('Chat error:', error);
          
          // Add error message
          addMessage({
            role: 'assistant',
            content: 'Sorry, I encountered an error while processing your message. This might be due to network connectivity issues. I\'m now working in offline mode - your chat history will be saved locally.',
            isError: true,
          });
          
          // Switch to localStorage mode if not already
          if (!useLocalStorage) {
            set({ useLocalStorage: true });
          }
        } finally {
          set({ isLoading: false });
          
          // Always save current session to localStorage
          const state = get();
          if (state.currentSession) {
            const sessionWithMessages = {
              ...state.currentSession,
              messages: state.messages,
              lastActivity: new Date().toISOString()
            };
            
            // Update sessions list in localStorage
            const localSessions = loadFromLocalStorage(STORAGE_KEYS.CHAT_SESSIONS, []);
            const existingIndex = localSessions.findIndex(s => s.sessionId === state.sessionId);
            
            if (existingIndex >= 0) {
              localSessions[existingIndex] = sessionWithMessages;
            } else {
              localSessions.unshift(sessionWithMessages);
            }
            
            saveToLocalStorage(STORAGE_KEYS.CHAT_SESSIONS, localSessions);
            saveToLocalStorage(STORAGE_KEYS.CURRENT_SESSION, state.currentSession);
          }
        }
      },
      
      
      // Clear current chat
      clearChat: () => {
        set({ messages: [] });
      },
      
      // Clear all data and create new session
      clearAllAndCreateNew: () => {
        set({ messages: [], sessionId: null, currentSession: null });
        get().createNewSession();
      },
      
      // Load chat history
      loadHistory: async (sessionId) => {
        try {
          const response = await fetch(`${API_BASE}/chat/${sessionId}`);
          const data = await response.json();
          
          if (data.success && data.history) {
            const messages = data.history.map((msg, index) => ({
              id: Date.now() + index,
              role: msg.role,
              content: msg.content,
              timestamp: new Date().toISOString(),
            }));
            set({ messages, sessionId });
          }
        } catch (error) {
          console.error('Failed to load chat history:', error);
        }
      },
    }),
    {
      name: 'volunteer-hub-chat',
      partialize: (state) => ({
        messages: state.messages,
        sessionId: state.sessionId,
      }),
    }
  )
);

// Events store
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

// UI store
export const useUIStore = create(
  persist(
    (set) => ({
      isDarkMode: false,
      sidebarOpen: true,
      
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
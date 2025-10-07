// 💾 Chat History Storage Utilities - localStorage JSON Implementation
// ================================================================

const STORAGE_KEY = "volunteerHubHistory";

/**
 * Helper functions for localStorage operations
 */
export const saveHistory = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Failed to save chat history:', error);
    return false;
  }
};

export const loadHistory = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load chat history:', error);
    return [];
  }
};

/**
 * Generate unique session ID
 */
export const generateSessionId = () => {
  return `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Generate session title from first user message
 */
export const generateSessionTitle = (firstMessage, timestamp) => {
  const date = new Date(timestamp);
  const dateStr = date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: '2-digit', 
    year: 'numeric' 
  });
  
  // Create title from first message (max 50 chars)
  const messagePreview = firstMessage.length > 50 
    ? firstMessage.substring(0, 50) + '...' 
    : firstMessage;
    
  return `${messagePreview} - ${dateStr}`;
};

/**
 * Create new chat session structure
 */
export const createChatSession = (firstUserMessage) => {
  const timestamp = new Date().toISOString();
  return {
    id: generateSessionId(),
    title: generateSessionTitle(firstUserMessage, timestamp),
    messages: [],
    timestamp: timestamp,
    lastActivity: timestamp
  };
};

/**
 * Add message to session
 */
export const addMessageToSession = (sessionId, sender, text) => {
  const history = loadHistory();
  const sessionIndex = history.findIndex(session => session.id === sessionId);
  
  if (sessionIndex === -1) {
    console.error('Session not found:', sessionId);
    return false;
  }
  
  // Add message
  history[sessionIndex].messages.push({
    sender,
    text,
    timestamp: new Date().toISOString()
  });
  
  // Update last activity
  history[sessionIndex].lastActivity = new Date().toISOString();
  
  return saveHistory(history);
};

/**
 * Save complete chat session
 */
export const saveChatSession = (session) => {
  const history = loadHistory();
  const existingIndex = history.findIndex(s => s.id === session.id);
  
  if (existingIndex >= 0) {
    // Update existing session
    history[existingIndex] = { ...session, lastActivity: new Date().toISOString() };
  } else {
    // Add new session at the beginning (latest first)
    history.unshift({ ...session, lastActivity: new Date().toISOString() });
  }
  
  return saveHistory(history);
};

/**
 * Get session by ID
 */
export const getChatSession = (sessionId) => {
  const history = loadHistory();
  return history.find(session => session.id === sessionId) || null;
};

/**
 * Delete session
 */
export const deleteChatSession = (sessionId) => {
  const history = loadHistory();
  const filteredHistory = history.filter(session => session.id !== sessionId);
  return saveHistory(filteredHistory);
};

/**
 * Clear all chat history
 */
export const clearAllHistory = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Failed to clear chat history:', error);
    return false;
  }
};

/**
 * Get chat sessions sorted by last activity (latest first)
 */
export const getChatSessions = () => {
  const history = loadHistory();
  return history.sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity));
};

/**
 * Search chat sessions by title or message content
 */
export const searchChatSessions = (query) => {
  const history = loadHistory();
  const lowercaseQuery = query.toLowerCase();
  
  return history.filter(session => {
    // Search in title
    if (session.title.toLowerCase().includes(lowercaseQuery)) return true;
    
    // Search in messages
    return session.messages.some(message => 
      message.text.toLowerCase().includes(lowercaseQuery)
    );
  }).sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity));
};

/**
 * Get total message count across all sessions
 */
export const getTotalMessageCount = () => {
  const history = loadHistory();
  return history.reduce((total, session) => total + session.messages.length, 0);
};

/**
 * Export chat history as JSON file
 */
export const exportChatHistory = () => {
  const history = loadHistory();
  const dataStr = JSON.stringify(history, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  
  const link = document.createElement('a');
  link.href = URL.createObjectURL(dataBlob);
  link.download = `volunteer-hub-chat-history-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  
  URL.revokeObjectURL(link.href);
};

/**
 * Import chat history from JSON file
 */
export const importChatHistory = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const importedHistory = JSON.parse(e.target.result);
        
        // Validate structure
        if (!Array.isArray(importedHistory)) {
          throw new Error('Invalid file format');
        }
        
        // Merge with existing history
        const currentHistory = loadHistory();
        const mergedHistory = [...importedHistory, ...currentHistory];
        
        // Remove duplicates by ID
        const uniqueHistory = mergedHistory.filter((session, index, self) => 
          index === self.findIndex(s => s.id === session.id)
        );
        
        saveHistory(uniqueHistory);
        resolve(uniqueHistory.length);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};
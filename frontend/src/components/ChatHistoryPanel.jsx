import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  Trash2, 
  Search, 
  Plus, 
  Download, 
  Upload,
  X,
  MessageSquare,
  Calendar,
  MoreVertical
} from 'lucide-react';
import { 
  loadHistory, 
  saveChatSession,
  deleteChatSession, 
  clearAllHistory,
  searchChatSessions,
  getChatSessions,
  exportChatHistory,
  importChatHistory,
  getTotalMessageCount
} from '../utils/chatHistory';

const ChatHistoryPanel = ({ 
  isOpen, 
  onClose, 
  onSelectSession, 
  onNewChat, 
  currentSessionId 
}) => {
  const [chatSessions, setChatSessions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [showMenu, setShowMenu] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load chat sessions on mount and when panel opens
  useEffect(() => {
    if (isOpen) {
      loadChatSessions();
    }
  }, [isOpen]);

  // Filter sessions based on search query
  useEffect(() => {
    if (searchQuery.trim()) {
      const results = searchChatSessions(searchQuery);
      setFilteredSessions(results);
    } else {
      setFilteredSessions(chatSessions);
    }
  }, [searchQuery, chatSessions]);

  const loadChatSessions = () => {
    try {
      const sessions = getChatSessions();
      setChatSessions(sessions);
      setFilteredSessions(sessions);
    } catch (error) {
      console.error('Failed to load chat sessions:', error);
    }
  };

  const handleSelectSession = (session) => {
    onSelectSession(session);
    onClose();
  };

  const handleDeleteSession = async (sessionId, e) => {
    e.stopPropagation();
    
    if (confirm('Are you sure you want to delete this chat session?')) {
      try {
        deleteChatSession(sessionId);
        loadChatSessions();
        
        // If current session was deleted, create new one
        if (sessionId === currentSessionId) {
          onNewChat();
        }
      } catch (error) {
        console.error('Failed to delete session:', error);
      }
    }
  };

  const handleClearAllHistory = () => {
    if (confirm('Are you sure you want to clear all chat history? This action cannot be undone.')) {
      try {
        clearAllHistory();
        setChatSessions([]);
        setFilteredSessions([]);
        onNewChat();
      } catch (error) {
        console.error('Failed to clear history:', error);
      }
    }
    setShowMenu(false);
  };

  const handleExportHistory = () => {
    try {
      exportChatHistory();
      setShowMenu(false);
    } catch (error) {
      console.error('Failed to export history:', error);
    }
  };

  const handleImportHistory = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    importChatHistory(file)
      .then((count) => {
        alert(`Successfully imported ${count} chat sessions!`);
        loadChatSessions();
      })
      .catch((error) => {
        alert(`Failed to import: ${error.message}`);
      })
      .finally(() => {
        setLoading(false);
        setShowMenu(false);
      });
  };

  const formatTimestamp = (timestamp) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffInHours = (now - date) / (1000 * 60 * 60);

      if (diffInHours < 1) {
        return 'Just now';
      } else if (diffInHours < 24) {
        return `${Math.floor(diffInHours)}h ago`;
      } else if (diffInHours < 168) { // 7 days
        return `${Math.floor(diffInHours / 24)}d ago`;
      } else {
        return date.toLocaleDateString();
      }
    } catch {
      return 'Recently';
    }
  };

  const totalMessages = getTotalMessageCount();

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay for mobile */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
      />

      {/* History Panel */}
      <motion.div
        initial={{ x: -320, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -320, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed left-0 top-0 h-full w-80 glass border-r border-gray-200 dark:border-gray-700 z-50 lg:relative lg:translate-x-0"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-primary-500" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Chat History
                </h2>
              </div>
              
              <div className="flex items-center space-x-2">
                {/* New Chat Button */}
                <button
                  onClick={() => { onNewChat(); onClose(); }}
                  className="p-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-white transition-colors"
                  title="New Chat"
                >
                  <Plus className="w-4 h-4" />
                </button>

                {/* Menu Button */}
                <div className="relative">
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors"
                    title="More options"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {showMenu && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        className="absolute right-0 top-full mt-2 w-48 glass rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg z-10"
                      >
                        <div className="p-2">
                          <button
                            onClick={handleExportHistory}
                            className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                          >
                            <Download className="w-4 h-4" />
                            <span>Export History</span>
                          </button>
                          
                          <label className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md cursor-pointer">
                            <Upload className="w-4 h-4" />
                            <span>Import History</span>
                            <input
                              type="file"
                              accept=".json"
                              onChange={handleImportHistory}
                              className="hidden"
                            />
                          </label>
                          
                          <hr className="my-2 border-gray-200 dark:border-gray-700" />
                          
                          <button
                            onClick={handleClearAllHistory}
                            className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Clear All History</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors lg:hidden"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              />
            </div>

            {/* Stats */}
            <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 flex items-center justify-between">
              <span>{filteredSessions.length} conversation{filteredSessions.length !== 1 ? 's' : ''}</span>
              <span>{totalMessages} total messages</span>
            </div>
          </div>

          {/* Sessions List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
              </div>
            ) : filteredSessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-6">
                <MessageSquare className="w-12 h-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  {searchQuery ? 'No matching conversations' : 'No chat history'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  {searchQuery 
                    ? 'Try adjusting your search terms'
                    : 'Start a conversation to see your chat history here'
                  }
                </p>
                {!searchQuery && (
                  <button
                    onClick={() => { onNewChat(); onClose(); }}
                    className="btn-primary text-sm"
                  >
                    Start New Chat
                  </button>
                )}
              </div>
            ) : (
              <div className="p-2 space-y-1">
                <AnimatePresence>
                  {filteredSessions.map((session, index) => (
                    <motion.div
                      key={session.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleSelectSession(session)}
                      className={`group relative p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                        currentSessionId === session.id
                          ? 'bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 border border-transparent'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm truncate mb-1">
                            {session.title}
                          </h4>
                          
                          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 space-x-2">
                            <Calendar className="w-3 h-3" />
                            <span>{formatTimestamp(session.lastActivity)}</span>
                            {session.messages.length > 0 && (
                              <>
                                <span>•</span>
                                <span>{session.messages.length} messages</span>
                              </>
                            )}
                          </div>

                          {/* Message Preview */}
                          {session.messages.length > 0 && (
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 truncate">
                              {session.messages[session.messages.length - 1]?.text}
                            </p>
                          )}
                        </div>

                        {/* Delete Button */}
                        <button
                          onClick={(e) => handleDeleteSession(session.id, e)}
                          className="p-1 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 opacity-0 group-hover:opacity-100"
                          title="Delete conversation"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Active Session Indicator */}
                      {currentSessionId === session.id && (
                        <motion.div
                          layoutId="activeSession"
                          className="absolute left-0 top-0 bottom-0 w-1 bg-primary-500 rounded-r"
                        />
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default ChatHistoryPanel;
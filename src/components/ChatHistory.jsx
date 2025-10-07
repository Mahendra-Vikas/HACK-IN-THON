import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  Plus, 
  Trash2, 
  Clock,
  ChevronRight,
  Search,
  Archive,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useChatStore } from '../store';
import { formatDistanceToNow, parseISO } from 'date-fns';

const ChatHistory = ({ isOpen, onClose }) => {
  const { 
    chatSessions, 
    currentSession, 
    useLocalStorage,
    loadChatSessions, 
    switchToSession, 
    createNewSession, 
    deleteSession 
  } = useChatStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredSession, setHoveredSession] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadChatSessions();
    }
  }, [isOpen, loadChatSessions]);

  const filteredSessions = chatSessions.filter(session =>
    session.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSessionClick = (sessionId) => {
    switchToSession(sessionId);
    onClose?.();
  };

  const handleDeleteSession = async (e, sessionId) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this chat?')) {
      await deleteSession(sessionId);
    }
  };

  const handleNewChat = () => {
    createNewSession();
    onClose?.();
  };

  const formatLastActivity = (dateString) => {
    try {
      return formatDistanceToNow(parseISO(dateString), { addSuffix: true });
    } catch {
      return 'Recently';
    }
  };

  const sidebarVariants = {
    open: { x: 0, opacity: 1 },
    closed: { x: -320, opacity: 0 },
  };

  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Chat History Sidebar */}
      <motion.div
        variants={sidebarVariants}
        animate={isOpen ? 'open' : 'closed'}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed left-0 top-0 h-full w-80 glass border-r border-gray-200 dark:border-gray-700 z-50 lg:relative lg:translate-x-0"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                <MessageSquare className="w-5 h-5 mr-2" />
                Chat History
                {useLocalStorage && (
                  <div className="ml-2 flex items-center text-xs text-amber-600 dark:text-amber-400">
                    <WifiOff className="w-3 h-3 mr-1" />
                    Offline
                  </div>
                )}
                {!useLocalStorage && (
                  <div className="ml-2 flex items-center text-xs text-green-600 dark:text-green-400">
                    <Wifi className="w-3 h-3 mr-1" />
                    Online
                  </div>
                )}
              </h2>
              <button
                onClick={handleNewChat}
                className="p-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-white transition-colors"
                title="New Chat"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              />
            </div>
          </div>

          {/* Chat Sessions List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {filteredSessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-6">
                <Archive className="w-12 h-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  {searchQuery ? 'No matching chats' : 'No chat history'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  {searchQuery 
                    ? 'Try adjusting your search terms'
                    : 'Start a conversation to see your chat history here'
                  }
                </p>
                {!searchQuery && (
                  <button
                    onClick={handleNewChat}
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
                      key={session.sessionId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                      onMouseEnter={() => setHoveredSession(session.sessionId)}
                      onMouseLeave={() => setHoveredSession(null)}
                      onClick={() => handleSessionClick(session.sessionId)}
                      className={`group relative p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                        currentSession?.sessionId === session.sessionId
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
                            <Clock className="w-3 h-3" />
                            <span>{formatLastActivity(session.lastActivity)}</span>
                            {session.messageCount > 0 && (
                              <>
                                <span>•</span>
                                <span>{session.messageCount} messages</span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-1">
                          {/* Delete Button */}
                          <button
                            onClick={(e) => handleDeleteSession(e, session.sessionId)}
                            className={`p-1 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 ${
                              hoveredSession === session.sessionId ? 'opacity-100' : 'opacity-0'
                            }`}
                            title="Delete chat"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>

                          {/* Arrow Indicator */}
                          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
                        </div>
                      </div>

                      {/* Active Session Indicator */}
                      {currentSession?.sessionId === session.sessionId && (
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

            {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
              {filteredSessions.length} chat{filteredSessions.length !== 1 ? 's' : ''}
              {useLocalStorage && (
                <div className="mt-1 text-amber-600 dark:text-amber-400">
                  💾 Stored locally
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default ChatHistory;
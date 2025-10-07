import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, X } from 'lucide-react';
import { useChatStore, useUIStore } from './store/chatStore';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import ChatHistoryPanel from './components/ChatHistoryPanel';
import toast from 'react-hot-toast';

function App() {
  const { 
    currentSessionId, 
    currentSession, 
    createNewSession, 
    loadSession 
  } = useChatStore();
  const { 
    sidebarOpen, 
    historyPanelOpen,
    setDarkMode, 
    toggleHistoryPanel,
    setHistoryPanelOpen
  } = useUIStore();
  const [isMobile, setIsMobile] = useState(false);

  // Check for mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // Check for saved theme preference or system preference
    const savedTheme = localStorage.getItem('volunteer-hub-ui');
    if (savedTheme) {
      try {
        const { state } = JSON.parse(savedTheme);
        setDarkMode(state.isDarkMode);
      } catch (error) {
        console.error('Error loading theme preference:', error);
      }
    } else {
      // Use system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(prefersDark);
    }

    // Initialize chat session if none exists
    if (!currentSessionId) {
      createNewSession();
    }

    // Welcome toast
    setTimeout(() => {
      toast.success('Welcome to DORA! 🤖 Your chats are automatically saved locally with smart context switching.', {
        duration: 6000,
        icon: '�',
      });
    }, 1000);
  }, []);

  const handleSelectSession = (session) => {
    loadSession(session.id);
  };

  const handleNewChat = () => {
    createNewSession();
  };

  const toggleChatHistory = () => {
    toggleHistoryPanel();
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <Header />
      
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat History Panel - Enhanced localStorage JSON */}
        <AnimatePresence>
          {historyPanelOpen && (
            <ChatHistoryPanel 
              isOpen={historyPanelOpen} 
              onClose={() => setHistoryPanelOpen(false)}
              onSelectSession={handleSelectSession}
              onNewChat={handleNewChat}
              currentSessionId={currentSessionId}
            />
          )}
        </AnimatePresence>

        {/* Events Sidebar */}
        <Sidebar />
        
        {/* Chat Area */}
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className={`flex-1 flex flex-col relative transition-all duration-300 ${
            sidebarOpen ? 'lg:ml-0' : ''
          }`}
        >
          {/* Chat History Toggle Button */}
          <div className="absolute top-4 left-4 z-10">
            <button
              onClick={toggleChatHistory}
              className={`p-2 rounded-lg glass border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 ${
                historyPanelOpen ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-700' : ''
              }`}
              title={historyPanelOpen ? 'Hide chat history' : 'Show chat history (localStorage)'}
            >
              {historyPanelOpen ? (
                <X className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              ) : (
                <History className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              )}
            </button>
          </div>

          {/* Current Session Info */}
          {currentSession && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-4 right-4 z-10"
            >
              <div className="glass px-3 py-1 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="text-xs text-gray-600 dark:text-gray-400 max-w-48 truncate">
                  💾 {currentSession.title}
                </div>
              </div>
            </motion.div>
          )}

          {/* Chat Interface with padding for buttons */}
          <div className="flex-1 flex flex-col pt-16 min-h-0">
            <ChatInterface />
          </div>
        </motion.main>
      </div>
      
      {/* Background Decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {/* Gradient Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-accent-500/10 rounded-full blur-2xl"></div>
        
        {/* Animated Particles */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary-500/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Mobile overlay for chat history */}
      <AnimatePresence>
        {historyPanelOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setHistoryPanelOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
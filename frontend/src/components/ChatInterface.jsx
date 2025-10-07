import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, MicOff, Sparkles, ChevronDown, MapPin, Heart, Brain } from 'lucide-react';
import { useChatStore } from '../store/chatStore';
import { getModeIcon, getModeLabel } from '../utils/doraEngine';
import ChatMessage from './ChatMessage';
import TypingIndicator from './TypingIndicator';

const ChatInterface = () => {
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);
  
  const { messages, isLoading, sendMessage, clearChat, currentMode } = useChatStore();

  // Check if user has scrolled up
  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      const isScrolledUp = container.scrollTop < container.scrollHeight - container.clientHeight - 100;
      setShowScrollButton(isScrolledUp && messages.length > 3);
    }
  };

  // Manual scroll to bottom
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
      });
    }
    setShowScrollButton(false);
  };

  // Enhanced auto-scroll to bottom with immediate and delayed scroll
  useEffect(() => {
    const autoScrollToBottom = () => {
      if (messagesContainerRef.current) {
        const container = messagesContainerRef.current;
        // Immediate scroll
        container.scrollTop = container.scrollHeight;
        
        // Force scroll with animation
        container.scrollTo({
          top: container.scrollHeight,
          behavior: 'smooth'
        });
      }
      // Additional fallback
      messagesEndRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      });
    };
    
    // Immediate scroll
    autoScrollToBottom();
    
    // Delayed scroll to ensure DOM is fully updated
    const timeoutId = setTimeout(autoScrollToBottom, 100);
    return () => clearTimeout(timeoutId);
  }, [messages, isLoading]);

  // Add scroll event listener
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const message = inputValue.trim();
    setInputValue('');
    await sendMessage(message);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Voice input (Web Speech API)
  const toggleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in your browser');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInputValue(transcript);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const suggestedQueries = [
    "🏫 Where is the AI & ML Block?",
    "🏫 How to get to the Main Block from parking?",
    "🙋‍♀️ Show me upcoming volunteer events",
    "🙋‍♀️ What health-related volunteer opportunities are available?",
    "🏫 Find the library and canteen locations",
    "🙋‍♀️ I'm interested in environment volunteering"
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="glass p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Brain className="w-6 h-6 text-purple-500" />
                <Sparkles className="w-3 h-3 text-yellow-400 absolute -top-1 -right-1" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  DORA
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 -mt-1">
                  Digital Outreach & Resource Assistant
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Online</span>
            </div>
          </div>
          
          {/* Current Mode Indicator */}
          <div className="flex items-center space-x-3">
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium border ${
              currentMode === 'campus' 
                ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300'
                : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700 text-green-700 dark:text-green-300'
            }`}>
              <span className="text-sm">{getModeIcon(currentMode)}</span>
              <span>{getModeLabel(currentMode)}</span>
            </div>
            
            <button
              onClick={clearChat}
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors px-2 py-1 rounded"
            >
              Clear Chat
            </button>
          </div>
        </div>
      </div>

      {/* Messages Container - Fixed scrolling */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar p-4 space-y-4 scroll-smooth relative"
        style={{ 
          maxHeight: '70vh',
          minHeight: '200px',
          scrollBehavior: 'smooth'
        }}
      >
        <AnimatePresence initial={false}>
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-8"
            >
              <div className="max-w-md mx-auto">
                <div className="relative mb-6">
                  <Brain className="w-16 h-16 text-purple-500 mx-auto" />
                  <Sparkles className="w-6 h-6 text-yellow-400 absolute top-0 right-1/2 transform translate-x-6" />
                </div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                  Welcome to DORA!
                </h3>
                <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Digital Outreach & Resource Assistant
                </h4>
                <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                  I'm your intelligent assistant for Sri Eshwar College of Engineering! 
                  I can help you navigate the campus 🏫 and discover volunteer opportunities 🙋‍♀️.
                  I automatically detect what you need and switch between modes!
                </p>
                
                {/* Capability Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700">
                    <MapPin className="w-6 h-6 text-blue-600" />
                    <div>
                      <h5 className="font-medium text-blue-800 dark:text-blue-300">Campus Navigator</h5>
                      <p className="text-xs text-blue-600 dark:text-blue-400">Find buildings, directions & facilities</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700">
                    <Heart className="w-6 h-6 text-green-600" />
                    <div>
                      <h5 className="font-medium text-green-800 dark:text-green-300">Volunteer Hub</h5>
                      <p className="text-xs text-green-600 dark:text-green-400">Discover events & opportunities</p>
                    </div>
                  </div>
                </div>
                
                {/* Suggested Queries */}
                <div className="space-y-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Try asking:</p>
                  {suggestedQueries.map((query, index) => (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => setInputValue(query)}
                      className="block w-full text-left p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 transition-colors text-sm"
                    >
                      {query}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {messages.map((message, index) => (
            <ChatMessage key={message.id} message={message} index={index} />
          ))}

          {isLoading && <TypingIndicator />}
        </AnimatePresence>
        
        {/* Scroll to bottom button */}
        <AnimatePresence>
          {showScrollButton && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={scrollToBottom}
              className="fixed bottom-24 right-6 p-3 bg-primary-500 hover:bg-primary-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-10"
              title="Scroll to bottom"
            >
              <ChevronDown className="w-5 h-5" />
            </motion.button>
          )}
        </AnimatePresence>
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Container - Fixed at bottom */}
      <div className="glass p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md">
        <form onSubmit={handleSubmit} className="flex items-end space-x-2">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me about campus locations or volunteer opportunities..."
              className="w-full resize-none rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 pr-12 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none input-glow max-h-32"
              rows={1}
              style={{
                minHeight: '48px',
                height: 'auto',
              }}
              onInput={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px';
              }}
            />
            
            {/* Voice Input Button */}
            <button
              type="button"
              onClick={toggleVoiceInput}
              className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-lg transition-all duration-200 ${
                isListening
                  ? 'bg-red-500 text-white shadow-glow'
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
            >
              {isListening ? (
                <MicOff className="w-4 h-4" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </button>
          </div>

          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className={`p-3 rounded-xl transition-all duration-200 ${
              inputValue.trim() && !isLoading
                ? 'bg-primary-500 hover:bg-primary-600 text-white shadow-sm hover:shadow-md'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </form>

        {isListening && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center mt-2 text-red-500"
          >
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm">Listening...</span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;
import React from 'react';
import { motion } from 'framer-motion';
import { User, Sparkles, AlertCircle, MapPin, Heart, Brain } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { format } from 'date-fns';
import { getModeIcon, getModeLabel, getModeColor } from '../utils/doraEngine';

const ChatMessage = ({ message, index }) => {
  const isUser = message.role === 'user';
  const isError = message.isError;
  const messageMode = message.mode || 'volunteer';

  const messageVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 30,
        delay: index * 0.05,
      }
    }
  };

  const formatTime = (timestamp) => {
    try {
      return format(new Date(timestamp), 'HH:mm');
    } catch {
      return format(new Date(), 'HH:mm');
    }
  };

  const getAvatarIcon = () => {
    if (isUser) return <User className="w-4 h-4" />;
    if (isError) return <AlertCircle className="w-4 h-4" />;
    if (messageMode === 'welcome') return <Brain className="w-4 h-4" />;
    if (messageMode === 'campus') return <MapPin className="w-4 h-4" />;
    if (messageMode === 'volunteer') return <Heart className="w-4 h-4" />;
    return <Sparkles className="w-4 h-4" />;
  };

  const getAvatarStyle = () => {
    if (isUser) return 'bg-primary-500 text-white';
    if (isError) return 'bg-red-500 text-white';
    if (messageMode === 'welcome') return 'bg-gradient-to-br from-purple-500 to-pink-500 text-white';
    if (messageMode === 'campus') return 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white';
    if (messageMode === 'volunteer') return 'bg-gradient-to-br from-green-500 to-emerald-500 text-white';
    return 'bg-gradient-to-br from-primary-500 to-secondary-500 text-white';
  };

  return (
    <motion.div
      variants={messageVariants}
      initial="hidden"
      animate="visible"
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} group`}
    >
      <div className={`flex items-start space-x-3 max-w-[85%] ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${getAvatarStyle()}`}>
          {getAvatarIcon()}
        </div>

        {/* Message Content */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          {/* Mode Indicator for AI messages */}
          {!isUser && messageMode !== 'welcome' && (
            <div className={`flex items-center space-x-1 mb-1 px-2 py-1 rounded-full text-xs font-medium ${getModeColor(messageMode)}`}>
              <span>{getModeIcon(messageMode)}</span>
              <span>{getModeLabel(messageMode)}</span>
              {message.confidence > 0 && (
                <span className="opacity-60">({message.confidence})</span>
              )}
            </div>
          )}
          
          <div className={`chat-bubble ${
            isUser 
              ? 'chat-bubble-user' 
              : isError
              ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-900 dark:text-red-100'
              : 'chat-bubble-assistant'
          }`}>
            {isUser ? (
              <p className="whitespace-pre-wrap">{message.content}</p>
            ) : (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown
                  components={{
                    p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                    ul: ({ children }) => <ul className="list-disc ml-4 mb-2">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal ml-4 mb-2">{children}</ol>,
                    li: ({ children }) => <li className="mb-1">{children}</li>,
                    strong: ({ children }) => <strong className="font-semibold text-primary-600 dark:text-primary-400">{children}</strong>,
                    code: ({ children }) => (
                      <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm font-mono">
                        {children}
                      </code>
                    ),
                    h1: ({ children }) => <h1 className="text-xl font-bold mb-2">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-lg font-semibold mb-2">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-base font-medium mb-1">{children}</h3>,
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            )}
          </div>
          
          {/* Timestamp and Source */}
          <div className={`flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity ${
            isUser ? 'text-right flex-row-reverse space-x-reverse' : 'text-left'
          }`}>
            <span>{formatTime(message.timestamp)}</span>
            {!isUser && message.source && (
              <>
                <span>•</span>
                <span className="italic">{message.source}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ChatMessage;
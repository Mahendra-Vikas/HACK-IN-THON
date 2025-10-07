import React from 'react';
import { motion } from 'framer-motion';
import { 
  Menu, 
  Sun, 
  Moon, 
  Brain,
  Sparkles,
  Github,
  ExternalLink,
  MapPin,
  Heart
} from 'lucide-react';
import { useUIStore } from '../store';

const Header = () => {
  const { isDarkMode, toggleDarkMode, sidebarOpen, toggleSidebar } = useUIStore();

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="glass border-b border-gray-200 dark:border-gray-700 px-4 py-3 z-30"
    >
      <div className="flex items-center justify-between">
        {/* Left Side */}
        <div className="flex items-center space-x-4">
          {/* Sidebar Toggle */}
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* DORA Logo and Title */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                <Sparkles className="w-2.5 h-2.5 text-white" />
              </div>
            </div>
            
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                DORA
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 -mt-1">
                Digital Outreach & Resource Assistant • SECE
              </p>
            </div>
          </div>
          
          {/* Mode Indicators */}
          <div className="hidden md:flex items-center space-x-3 pl-3 border-l border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-1 text-xs text-blue-600 dark:text-blue-400">
              <MapPin className="w-3 h-3" />
              <span>Campus Navigator</span>
            </div>
            <div className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
            <div className="flex items-center space-x-1 text-xs text-green-600 dark:text-green-400">
              <Heart className="w-3 h-3" />
              <span>Volunteer Hub</span>
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center space-x-2">
          {/* GitHub Link */}
          <a
            href="https://github.com/sece-dora"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            aria-label="View DORA on GitHub"
          >
            <Github className="w-5 h-5" />
          </a>

          {/* Documentation Link */}
          <a
            href="/docs"
            className="hidden sm:flex items-center space-x-1 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <span>Docs</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          {/* Theme Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle theme"
          >
            <motion.div
              initial={false}
              animate={{ rotate: isDarkMode ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 text-yellow-500" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600" />
              )}
            </motion.div>
          </button>

          {/* DORA Status Indicator */}
          <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
            <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-medium text-purple-700 dark:text-purple-400">
              DORA Online
            </span>
          </div>
        </div>
      </div>

      {/* Mobile Status Bar */}
      <div className="sm:hidden mt-2 flex items-center justify-center">
        <div className="flex items-center space-x-2 px-3 py-1 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-full border border-purple-200 dark:border-purple-700">
          <div className="w-1.5 h-1.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse"></div>
          <span className="text-xs font-medium text-purple-700 dark:text-purple-400">
            DORA AI is online • Smart context switching enabled
          </span>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
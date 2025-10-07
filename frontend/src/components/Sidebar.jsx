import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Users, 
  Filter, 
  X, 
  MapPin, 
  Clock, 
  Mail,
  ChevronRight,
  Heart,
  Leaf,
  GraduationCap,
  HeartHandshake,
  Megaphone,
  Laptop
} from 'lucide-react';
import { useEventsStore, useUIStore } from '../store';
import { format, isToday, isTomorrow, parseISO } from 'date-fns';

const Sidebar = () => {
  const { sidebarOpen, setSidebarOpen } = useUIStore();
  const { 
    events, 
    categories, 
    loading, 
    filters, 
    fetchEvents, 
    fetchCategories, 
    updateFilters,
    getUpcomingEvents 
  } = useEventsStore();

  useEffect(() => {
    fetchEvents();
    fetchCategories();
  }, []);

  const upcomingEvents = getUpcomingEvents();

  const getCategoryIcon = (category) => {
    const iconMap = {
      'Environment': Leaf,
      'Health': Heart,
      'Education': GraduationCap,
      'Community Service': HeartHandshake,
      'Awareness': Megaphone,
      'Social Awareness': Megaphone,
      'Technology Assistance': Laptop,
    };
    return iconMap[category] || Calendar;
  };

  const getCategoryColor = (category) => {
    const colorMap = {
      'Environment': 'text-green-600 bg-green-100 dark:bg-green-900/20',
      'Health': 'text-red-600 bg-red-100 dark:bg-red-900/20',
      'Education': 'text-blue-600 bg-blue-100 dark:bg-blue-900/20',
      'Community Service': 'text-purple-600 bg-purple-100 dark:bg-purple-900/20',
      'Awareness': 'text-orange-600 bg-orange-100 dark:bg-orange-900/20',
      'Social Awareness': 'text-pink-600 bg-pink-100 dark:bg-pink-900/20',
      'Technology Assistance': 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/20',
    };
    return colorMap[category] || 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
  };

  const formatEventDate = (dateString) => {
    try {
      const date = parseISO(dateString);
      if (isToday(date)) return 'Today';
      if (isTomorrow(date)) return 'Tomorrow';
      return format(date, 'MMM dd');
    } catch {
      return dateString;
    }
  };

  const sidebarVariants = {
    open: { x: 0, opacity: 1 },
    closed: { x: -320, opacity: 0 },
  };

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        variants={sidebarVariants}
        animate={sidebarOpen ? 'open' : 'closed'}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed left-0 top-0 h-full w-80 glass border-r border-gray-200 dark:border-gray-700 z-50 lg:relative lg:translate-x-0"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Events & Filters
              </h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
            {/* Filters Section */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <Filter className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <h3 className="font-medium text-gray-900 dark:text-gray-100">Filters</h3>
              </div>
              
              <div className="space-y-3">
                {/* Time Filters */}
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.upcoming}
                      onChange={(e) => updateFilters({ upcoming: e.target.checked })}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Upcoming events</span>
                  </label>
                  
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.thisWeek}
                      onChange={(e) => updateFilters({ thisWeek: e.target.checked })}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">This week</span>
                  </label>
                </div>

                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) => updateFilters({ category: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">All categories</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Categories Grid */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <Users className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <h3 className="font-medium text-gray-900 dark:text-gray-100">Categories</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                {categories.map((category) => {
                  const Icon = getCategoryIcon(category);
                  const colorClass = getCategoryColor(category);
                  const eventCount = events.filter(e => e.category === category).length;
                  
                  return (
                    <button
                      key={category}
                      onClick={() => updateFilters({ category: category })}
                      className={`p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left ${
                        filters.category === category ? 'ring-2 ring-primary-500 bg-primary-50 dark:bg-primary-900/20' : ''
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg ${colorClass} flex items-center justify-center mb-2`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="text-xs font-medium text-gray-900 dark:text-gray-100 mb-1">
                        {category}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {eventCount} event{eventCount !== 1 ? 's' : ''}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Upcoming Events */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <Calendar className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <h3 className="font-medium text-gray-900 dark:text-gray-100">Upcoming Events</h3>
                <span className="text-xs bg-primary-100 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 px-2 py-1 rounded-full">
                  {upcomingEvents.length}
                </span>
              </div>
              
              {loading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : upcomingEvents.length > 0 ? (
                <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar">
                  {upcomingEvents.slice(0, 10).map((event) => {
                    const Icon = getCategoryIcon(event.category);
                    const colorClass = getCategoryColor(event.category);
                    
                    return (
                      <motion.div
                        key={event.title}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer group"
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`w-8 h-8 rounded-lg ${colorClass} flex items-center justify-center flex-shrink-0`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate mb-1">
                              {event.title}
                            </h4>
                            
                            <div className="space-y-1">
                              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                                <Clock className="w-3 h-3 mr-1" />
                                {formatEventDate(event.date)}
                              </div>
                              
                              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                                <MapPin className="w-3 h-3 mr-1" />
                                <span className="truncate">{event.location}</span>
                              </div>
                              
                              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                                <Mail className="w-3 h-3 mr-1" />
                                <span className="truncate">{event.organizer}</span>
                              </div>
                            </div>
                          </div>
                          
                          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                  <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No upcoming events</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default Sidebar;
import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, User, Mail, Clock } from 'lucide-react';
import { format, parseISO } from 'date-fns';

const EventCard = ({ event, index = 0 }) => {
  const formatDate = (dateString) => {
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  const getCategoryColor = (category) => {
    const colorMap = {
      'Environment': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      'Health': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
      'Education': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      'Community Service': 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
      'Awareness': 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
      'Social Awareness': 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-400',
      'Technology Assistance': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400',
    };
    return colorMap[category] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm hover:shadow-md transition-all duration-200"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg leading-tight">
          {event.title}
        </h3>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(event.category)}`}>
          {event.category}
        </span>
      </div>

      {/* Description */}
      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
        {event.description}
      </p>

      {/* Details */}
      <div className="space-y-2">
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
          <Calendar className="w-4 h-4 mr-2 text-primary-500" />
          <span>{formatDate(event.date)}</span>
        </div>
        
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
          <MapPin className="w-4 h-4 mr-2 text-primary-500" />
          <span>{event.location}</span>
        </div>
        
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
          <User className="w-4 h-4 mr-2 text-primary-500" />
          <span>{event.organizer}</span>
        </div>
        
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
          <Mail className="w-4 h-4 mr-2 text-primary-500" />
          <a 
            href={`mailto:${event.contact}`}
            className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          >
            {event.contact}
          </a>
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button className="w-full bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm">
          Register Interest
        </button>
      </div>
    </motion.div>
  );
};

export default EventCard;
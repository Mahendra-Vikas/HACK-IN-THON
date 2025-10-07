import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getUserProfile, clearCurrentUser } from '../utils/userStorage';
import toast from 'react-hot-toast';

const UserProfileHeader = () => {
  const [showProfile, setShowProfile] = useState(false);
  const profile = getUserProfile();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearCurrentUser();
    toast.success('Logged out successfully!');
    navigate('/auth');
  };

  if (!profile) return null;

  return (
    <div className="relative">
      {/* Profile Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowProfile(!showProfile)}
        className="flex items-center space-x-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full px-4 py-2 text-white hover:bg-white/20 transition-all duration-300"
      >
        {/* Avatar */}
        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
          {profile.name.charAt(0).toUpperCase()}
        </div>
        
        {/* Name */}
        <span className="font-medium text-sm hidden sm:block">
          {profile.name.split(' ')[0]}
        </span>
        
        {/* Dropdown Arrow */}
        <motion.svg
          animate={{ rotate: showProfile ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </motion.svg>
      </motion.button>

      {/* Profile Dropdown */}
      <AnimatePresence>
        {showProfile && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full right-0 mt-2 w-80 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-2xl z-50"
          >
            {/* Profile Header */}
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {profile.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">{profile.name}</h3>
                  <p className="text-white/70 text-sm">{profile.email}</p>
                </div>
              </div>
            </div>

            {/* Profile Details */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="text-white/60 text-xs uppercase font-semibold tracking-wider">Department</label>
                  <p className="text-white font-medium">{profile.department}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-white/60 text-xs uppercase font-semibold tracking-wider">Roll Number</label>
                    <p className="text-white font-medium">{profile.rollNumber}</p>
                  </div>
                  <div>
                    <label className="text-white/60 text-xs uppercase font-semibold tracking-wider">Year</label>
                    <p className="text-white font-medium">{profile.year}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-white/60 text-xs uppercase font-semibold tracking-wider">Member Since</label>
                    <p className="text-white font-medium">{profile.memberSince}</p>
                  </div>
                  <div>
                    <label className="text-white/60 text-xs uppercase font-semibold tracking-wider">Last Login</label>
                    <p className="text-white font-medium">{profile.lastLogin}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 pt-0">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="w-full py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Sign Out
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay */}
      {showProfile && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={() => setShowProfile(false)}
        />
      )}
    </div>
  );
};

export default UserProfileHeader;
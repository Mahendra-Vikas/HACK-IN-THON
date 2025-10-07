import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getCurrentUser, getUserProfile } from '../utils/userStorage';
import toast from 'react-hot-toast';

const ProtectedRoute = ({ children }) => {
  const user = getCurrentUser();
  const profile = getUserProfile();

  useEffect(() => {
    if (user && profile) {
      // Welcome back message with user details
      const welcomeMessage = `Welcome back, ${profile.name}! 🎉\n${profile.department} • ${profile.year}`;
      toast.success(welcomeMessage, {
        duration: 4000,
        style: {
          background: 'rgba(16, 185, 129, 0.1)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          color: 'white',
          borderRadius: '15px',
          padding: '16px',
          fontSize: '14px',
          whiteSpace: 'pre-line'
        },
      });
    }
  }, [user, profile]);

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="h-screen"
    >
      {children}
    </motion.div>
  );
};

export default ProtectedRoute;
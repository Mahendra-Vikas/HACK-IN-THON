import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { addUser, validateUser, userExists } from '../utils/userStorage';

const AuthPage = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    department: '',
    rollNumber: '',
    year: ''
  });
  
  const navigate = useNavigate();

  const departments = [
    'Computer Science & Engineering',
    'Information Technology',
    'Electronics & Communication Engineering',
    'Electrical & Electronics Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Biotechnology',
    'Chemical Engineering'
  ];

  const years = ['First Year', 'Second Year', 'Third Year', 'Final Year'];

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate form
      if (!formData.name || !formData.email || !formData.password || 
          !formData.department || !formData.rollNumber || !formData.year) {
        toast.error('Please fill in all fields');
        setIsLoading(false);
        return;
      }

      // Check if user already exists
      if (await userExists(formData.email)) {
        toast.error('User already exists with this email');
        setIsLoading(false);
        return;
      }

      // Add user
      const newUser = await addUser(formData);
      toast.success('Account created successfully! Please sign in.');
      
      // Switch to sign in tab
      setIsSignUp(false);
      setFormData({ ...formData, name: '', department: '', rollNumber: '', year: '' });
      
    } catch (error) {
      toast.error('Failed to create account. Please try again.');
      console.error('Sign up error:', error);
    }

    setIsLoading(false);
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!formData.email || !formData.password) {
        toast.error('Please enter email and password');
        setIsLoading(false);
        return;
      }

      const user = await validateUser(formData.email, formData.password);
      
      if (user) {
        // Store user session
        localStorage.setItem('dora_current_user', JSON.stringify(user));
        toast.success(`Welcome back, ${user.name}!`);
        
        // Navigate to chat with a slight delay for better UX
        setTimeout(() => {
          navigate('/chat');
        }, 1000);
      } else {
        toast.error('Invalid email or password');
      }
    } catch (error) {
      toast.error('Failed to sign in. Please try again.');
      console.error('Sign in error:', error);
    }

    setIsLoading(false);
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  const formVariants = {
    hidden: { x: isSignUp ? 100 : -100, opacity: 0 },
    visible: { 
      x: 0, 
      opacity: 1,
      transition: { 
        duration: 0.6,
        ease: "easeOut"
      }
    },
    exit: { 
      x: isSignUp ? -100 : 100, 
      opacity: 0,
      transition: { 
        duration: 0.4
      }
    }
  };

  const glowVariants = {
    animate: {
      scale: [1, 1.2, 1],
      opacity: [0.3, 0.8, 0.3],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <motion.div 
          className="absolute top-20 left-20 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-30"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div 
          className="absolute top-40 right-20 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-30"
          animate={{
            x: [0, -100, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div 
          className="absolute bottom-20 left-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-30"
          animate={{
            x: [0, 50, -50, 0],
            y: [0, -30, 30, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      {/* Main Container */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-4xl"
      >
        {/* Glassmorphism Card */}
        <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl p-8 relative">
          {/* Glow Effect */}
          <motion.div
            variants={glowVariants}
            animate="animate"
            className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-3xl blur-2xl"
          />
          
          {/* Content */}
          <div className="relative z-10">
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="mb-4"
              >
                <h1 className="text-6xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                  DORA
                </h1>
                <p className="text-xl text-white/90 font-light">
                  Digital Outreach & Resource Assistant
                </p>
                <p className="text-white/70 mt-2">
                  Sri Eshwar College of Engineering
                </p>
              </motion.div>

              {/* Tab Switcher */}
              <div className="flex bg-white/5 backdrop-blur-xl rounded-full p-2 max-w-md mx-auto border border-white/10">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsSignUp(false)}
                  className={`flex-1 py-3 px-6 rounded-full font-medium transition-all duration-300 ${
                    !isSignUp
                      ? 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white shadow-lg'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  Sign In
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsSignUp(true)}
                  className={`flex-1 py-3 px-6 rounded-full font-medium transition-all duration-300 ${
                    isSignUp
                      ? 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white shadow-lg'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  Sign Up
                </motion.button>
              </div>
            </div>

            {/* Forms */}
            <div className="min-h-[500px] flex items-center justify-center">
              <AnimatePresence mode="wait">
                {isSignUp ? (
                  // Sign Up Form
                  <motion.form
                    key="signup"
                    variants={formVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    onSubmit={handleSignUp}
                    className="w-full max-w-2xl space-y-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Name */}
                      <div className="space-y-2">
                        <label className="text-white/90 font-medium">Full Name</label>
                        <motion.input
                          whileFocus={{ scale: 1.02, boxShadow: "0 0 20px rgba(139, 92, 246, 0.3)" }}
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-purple-400 transition-all"
                          placeholder="Enter your full name"
                          required
                        />
                      </div>

                      {/* Email */}
                      <div className="space-y-2">
                        <label className="text-white/90 font-medium">Email</label>
                        <motion.input
                          whileFocus={{ scale: 1.02, boxShadow: "0 0 20px rgba(139, 92, 246, 0.3)" }}
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-purple-400 transition-all"
                          placeholder="your.email@sece.edu"
                          required
                        />
                      </div>

                      {/* Password */}
                      <div className="space-y-2">
                        <label className="text-white/90 font-medium">Password</label>
                        <motion.input
                          whileFocus={{ scale: 1.02, boxShadow: "0 0 20px rgba(139, 92, 246, 0.3)" }}
                          type="password"
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-purple-400 transition-all"
                          placeholder="Create a password"
                          required
                        />
                      </div>

                      {/* Department */}
                      <div className="space-y-2">
                        <label className="text-white/90 font-medium">Department</label>
                        <motion.select
                          whileFocus={{ scale: 1.02, boxShadow: "0 0 20px rgba(139, 92, 246, 0.3)" }}
                          name="department"
                          value={formData.department}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-white focus:outline-none focus:border-purple-400 transition-all"
                          required
                        >
                          <option value="" className="bg-gray-800">Select Department</option>
                          {departments.map(dept => (
                            <option key={dept} value={dept} className="bg-gray-800">{dept}</option>
                          ))}
                        </motion.select>
                      </div>

                      {/* Roll Number */}
                      <div className="space-y-2">
                        <label className="text-white/90 font-medium">Roll Number</label>
                        <motion.input
                          whileFocus={{ scale: 1.02, boxShadow: "0 0 20px rgba(139, 92, 246, 0.3)" }}
                          type="text"
                          name="rollNumber"
                          value={formData.rollNumber}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-purple-400 transition-all"
                          placeholder="e.g., 21CS001"
                          required
                        />
                      </div>

                      {/* Year */}
                      <div className="space-y-2">
                        <label className="text-white/90 font-medium">Year</label>
                        <motion.select
                          whileFocus={{ scale: 1.02, boxShadow: "0 0 20px rgba(139, 92, 246, 0.3)" }}
                          name="year"
                          value={formData.year}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-white focus:outline-none focus:border-purple-400 transition-all"
                          required
                        >
                          <option value="" className="bg-gray-800">Select Year</option>
                          {years.map(year => (
                            <option key={year} value={year} className="bg-gray-800">{year}</option>
                          ))}
                        </motion.select>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <motion.button
                      whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(139, 92, 246, 0.4)" }}
                      whileTap={{ scale: 0.95 }}
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-4 bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-bold rounded-xl shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Creating Account...</span>
                        </div>
                      ) : (
                        'Create Account'
                      )}
                    </motion.button>
                  </motion.form>
                ) : (
                  // Sign In Form
                  <motion.form
                    key="signin"
                    variants={formVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    onSubmit={handleSignIn}
                    className="w-full max-w-md space-y-6"
                  >
                    {/* Email */}
                    <div className="space-y-2">
                      <label className="text-white/90 font-medium">Email</label>
                      <motion.input
                        whileFocus={{ scale: 1.02, boxShadow: "0 0 20px rgba(139, 92, 246, 0.3)" }}
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-purple-400 transition-all"
                        placeholder="your.email@sece.edu"
                        required
                      />
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                      <label className="text-white/90 font-medium">Password</label>
                      <motion.input
                        whileFocus={{ scale: 1.02, boxShadow: "0 0 20px rgba(139, 92, 246, 0.3)" }}
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-purple-400 transition-all"
                        placeholder="Enter your password"
                        required
                      />
                    </div>

                    {/* Demo Credentials */}
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
                      <p className="text-white/70 text-sm mb-2">Demo credentials:</p>
                      <p className="text-white/90 text-sm">Email: demo@sece.edu</p>
                      <p className="text-white/90 text-sm">Password: demo123</p>
                    </div>

                    {/* Submit Button */}
                    <motion.button
                      whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(139, 92, 246, 0.4)" }}
                      whileTap={{ scale: 0.95 }}
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-4 bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-bold rounded-xl shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Signing In...</span>
                        </div>
                      ) : (
                        'Sign In to DORA'
                      )}
                    </motion.button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: 'white',
          },
        }}
      />
    </div>
  );
};

export default AuthPage;
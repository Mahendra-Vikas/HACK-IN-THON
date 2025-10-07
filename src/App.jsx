import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AuthPage from './components/AuthPage';
import ProtectedRoute from './components/ProtectedRoute';
import { isLoggedIn } from './utils/userStorage';
import VolunteerHub from './VolunteerHub';

function App() {
  // Check if user is already logged in and redirect accordingly
  const userLoggedIn = isLoggedIn();

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Authentication Route */}
          <Route 
            path="/auth" 
            element={
              userLoggedIn ? <Navigate to="/chat" replace /> : <AuthPage />
            } 
          />
          
          {/* Protected Chat Route */}
          <Route 
            path="/chat" 
            element={
              <ProtectedRoute>
                <VolunteerHub />
              </ProtectedRoute>
            } 
          />
          
          {/* Default Route - Redirect based on login status */}
          <Route 
            path="/" 
            element={
              <Navigate to={userLoggedIn ? "/chat" : "/auth"} replace />
            } 
          />
          
          {/* Catch-all Route */}
          <Route 
            path="*" 
            element={
              <Navigate to={userLoggedIn ? "/chat" : "/auth"} replace />
            } 
          />
        </Routes>

        {/* Global Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: 'white',
              borderRadius: '15px',
              padding: '16px',
            },
            success: {
              iconTheme: {
                primary: '#10B981',
                secondary: 'white',
              },
            },
            error: {
              iconTheme: {
                primary: '#EF4444',
                secondary: 'white',
              },
            },
          }}
        />
      </div>
    </Router>
  );
}

export default App;
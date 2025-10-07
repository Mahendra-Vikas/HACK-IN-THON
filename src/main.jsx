import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { Toaster } from 'react-hot-toast'
import { useChatStore } from './store/chatStore'

// Initialize DORA session on app startup
const initializeDORA = () => {
  const { currentSessionId, createNewSession } = useChatStore.getState();
  
  if (!currentSessionId) {
    createNewSession();
  }
};

// Initialize DORA
initializeDORA();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#1f2937',
          color: '#f3f4f6',
          borderRadius: '12px',
          border: '1px solid #374151',
        },
        success: {
          duration: 4000,
          style: {
            background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
            color: '#ffffff',
          },
          iconTheme: {
            primary: '#ffffff',
            secondary: '#8b5cf6',
          },
        },
        error: {
          duration: 5000,
          style: {
            background: '#ef4444',
            color: '#ffffff',
          },
        },
      }}
    />
  </React.StrictMode>,
)
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Support external backend URL in production (e.g., Render backend deployed alongside Vercel)
const apiBase = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL;
if (apiBase && apiBase.startsWith('http') && typeof window !== 'undefined') {
  const originalFetch = window.fetch;
  window.fetch = function(input, init) {
    if (typeof input === 'string' && input.startsWith('/api/')) {
      return originalFetch(`${apiBase.replace(/\/$/, '')}${input}`, init);
    }
    return originalFetch(input, init);
  };
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

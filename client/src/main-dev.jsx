import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App-dev';
import './index.css';

// Development mode without Clerk authentication
console.warn('Running in development mode without authentication');

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

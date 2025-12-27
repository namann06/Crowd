import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

/**
 * Main Entry Point
 * ----------------
 * Renders the React application with:
 * - StrictMode for development warnings
 * - BrowserRouter is handled in App.jsx
 */
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

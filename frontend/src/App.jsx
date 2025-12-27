import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

// Layout
import Layout from './components/Layout'

// Pages
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Areas from './pages/Areas'
import Analytics from './pages/Analytics'
import ScanPage from './pages/ScanPage'

/**
 * App Component
 * -------------
 * Main application component with routing.
 * Handles authentication state and protected routes.
 */
function App() {
  // Simple auth state (stored in localStorage)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  // Check if user is logged in on app load
  useEffect(() => {
    const authStatus = localStorage.getItem('isAuthenticated')
    setIsAuthenticated(authStatus === 'true')
    setLoading(false)
  }, [])

  // Login handler
  const handleLogin = () => {
    localStorage.setItem('isAuthenticated', 'true')
    setIsAuthenticated(true)
  }

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated')
    setIsAuthenticated(false)
  }

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route - Login */}
        <Route 
          path="/login" 
          element={
            isAuthenticated ? 
              <Navigate to="/dashboard" replace /> : 
              <Login onLogin={handleLogin} />
          } 
        />

        {/* Public Route - QR Scan Page */}
        <Route path="/scan/:areaId/:type" element={<ScanPage />} />

        {/* Protected Routes - Wrapped in Layout */}
        <Route 
          path="/" 
          element={
            isAuthenticated ? 
              <Layout onLogout={handleLogout} /> : 
              <Navigate to="/login" replace />
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="areas" element={<Areas />} />
          <Route path="analytics" element={<Analytics />} />
        </Route>

        {/* Catch all - redirect to dashboard or login */}
        <Route 
          path="*" 
          element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} 
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App

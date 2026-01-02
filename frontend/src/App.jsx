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
  // Auth state (stored in localStorage)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Check if user is logged in on app load
  useEffect(() => {
    const authStatus = localStorage.getItem('isAuthenticated')
    const userEmail = localStorage.getItem('userEmail')
    const userName = localStorage.getItem('userName')
    const authProvider = localStorage.getItem('authProvider')
    
    if (authStatus === 'true') {
      setIsAuthenticated(true)
      setUser({
        email: userEmail,
        name: userName || userEmail || 'Admin',
        provider: authProvider || 'local'
      })
    }
    setLoading(false)
  }, [])

  // Login handler
  const handleLogin = () => {
    localStorage.setItem('isAuthenticated', 'true')
    setIsAuthenticated(true)
    
    // Force re-read user info from localStorage (set by Login page)
    const userEmail = localStorage.getItem('userEmail')
    const userName = localStorage.getItem('userName')
    const authProvider = localStorage.getItem('authProvider')
    
    console.log('handleLogin - User data from localStorage:', { userEmail, userName, authProvider })
    
    setUser({
      email: userEmail,
      name: userName || userEmail || 'Admin',
      provider: authProvider || 'local'
    })
  }

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated')
    localStorage.removeItem('userEmail')
    localStorage.removeItem('userName')
    localStorage.removeItem('authProvider')
    setIsAuthenticated(false)
    setUser(null)
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
          element={<Login onLogin={handleLogin} />} 
        />

        {/* Public Route - QR Scan Page */}
        <Route path="/scan/:areaId/:type" element={<ScanPage />} />

        {/* Protected Routes - Wrapped in Layout */}
        <Route 
          path="/" 
          element={
            isAuthenticated ? 
              <Layout onLogout={handleLogout} user={user} /> : 
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

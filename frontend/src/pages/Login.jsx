import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import authService from '../services/authService'

/**
 * Login Page
 * ----------
 * Apple-inspired minimalist login with Google authentication.
 */
function Login({ onLogin }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [googleLoading, setGoogleLoading] = useState(false)

  // Check if already logged in
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated')
    const hasOAuthParams = searchParams.get('success') || searchParams.get('error')
    
    if (isAuthenticated === 'true' && !hasOAuthParams) {
      navigate('/dashboard', { replace: true })
    }
  }, [navigate, searchParams])

  // Handle OAuth redirect
  useEffect(() => {
    const success = searchParams.get('success')
    const email = searchParams.get('email')
    const name = searchParams.get('name')
    const errorParam = searchParams.get('error')

    if (success === 'true' && email) {
      localStorage.removeItem('isAuthenticated')
      localStorage.removeItem('userEmail')
      localStorage.removeItem('userName')
      localStorage.removeItem('authProvider')
      
      setSearchParams({})
      
      const decodedName = name ? decodeURIComponent(name) : email
      handleGoogleCallback(email, decodedName)
    } else if (errorParam === 'true') {
      setError('Google login failed. Please try again.')
      setSearchParams({})
    }
  }, [searchParams])

  const handleGoogleCallback = async (email, name) => {
    setGoogleLoading(true)
    try {
      const result = await authService.validateGoogleLogin(email)
      
      if (result.success) {
        localStorage.setItem('userEmail', email)
        localStorage.setItem('userName', name)
        localStorage.setItem('authProvider', 'google')
        localStorage.setItem('isAuthenticated', 'true')
        
        onLogin()
        navigate('/dashboard', { replace: true })
      } else {
        setError(result.message || 'Google login failed')
      }
    } catch (err) {
      console.error('Google callback error:', err)
      setError('Failed to validate Google login')
    } finally {
      setGoogleLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setGoogleLoading(true)
    try {
      localStorage.removeItem('isAuthenticated')
      localStorage.removeItem('userEmail')
      localStorage.removeItem('userName')
      localStorage.removeItem('authProvider')
      
      const { url } = await authService.getGoogleAuthUrl()
      window.location.href = url
    } catch (err) {
      setError('Failed to initiate Google login')
      setGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl border border-neutral-200 p-8 w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-neutral-900 tracking-tight">Crowd Control</h1>
          <p className="text-sm text-neutral-500 mt-1">Sign in to continue</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-neutral-100 border border-neutral-200 text-neutral-700 px-4 py-3 rounded-xl text-sm mb-6">
            {error}
          </div>
        )}

        {/* Google Login Button */}
        <button
          onClick={handleGoogleLogin}
          disabled={googleLoading}
          className="w-full flex items-center justify-center gap-3 bg-white border border-neutral-300 rounded-xl px-4 py-3 text-neutral-700 font-medium hover:bg-neutral-50 hover:border-neutral-400 transition-all disabled:opacity-50"
        >
          {googleLoading ? (
            <div className="w-5 h-5 border-2 border-neutral-300 border-t-neutral-600 rounded-full animate-spin"></div>
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          )}
          {googleLoading ? 'Connecting...' : 'Continue with Google'}
        </button>

        {/* Footer */}
        <p className="text-xs text-neutral-400 text-center mt-6">
          Secure authentication powered by Google
        </p>
      </div>
    </div>
  )
}

export default Login

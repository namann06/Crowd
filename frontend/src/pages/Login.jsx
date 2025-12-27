import { useState } from 'react'
import authService from '../services/authService'

/**
 * Login Page
 * ----------
 * Simple admin login form.
 * Uses basic authentication (username/password).
 */
function Login({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await authService.login(username, password)
      if (result.success) {
        onLogin()
      } else {
        setError(result.message || 'Invalid credentials')
      }
    } catch (err) {
      setError('Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-700">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🎯</div>
          <h1 className="text-2xl font-bold text-gray-900">Crowd Control</h1>
          <p className="text-gray-600">Management System</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Username */}
          <div>
            <label className="label">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input"
              placeholder="Enter username"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              placeholder="Enter password"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full btn btn-primary py-3 text-lg disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {/* Demo Credentials */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
          <p className="font-medium mb-1">Demo Credentials:</p>
          <p>Username: <code className="bg-gray-200 px-1 rounded">admin</code></p>
          <p>Password: <code className="bg-gray-200 px-1 rounded">admin123</code></p>
        </div>
      </div>
    </div>
  )
}

export default Login

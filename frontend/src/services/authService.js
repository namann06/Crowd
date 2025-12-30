import api from './api'

/**
 * Auth Service
 * ------------
 * Handles admin authentication API calls.
 * Supports both traditional login and Google OAuth.
 */

const authService = {
  /**
   * Login admin user with username/password
   * @param {string} username - Admin username
   * @param {string} password - Admin password
   * @returns {Promise} - API response
   */
  login: async (username, password) => {
    const response = await api.post('/auth/login', { username, password })
    return response.data
  },

  /**
   * Get Google OAuth URL
   * @returns {Promise} - Object with OAuth URL
   */
  getGoogleAuthUrl: async () => {
    const response = await api.get('/auth/google/url')
    return response.data
  },

  /**
   * Validate Google login after OAuth redirect
   * @param {string} email - Email from Google OAuth
   * @returns {Promise} - API response
   */
  validateGoogleLogin: async (email) => {
    const response = await api.post('/auth/google/validate', { email })
    return response.data
  },

  /**
   * Validate current session
   * @returns {Promise} - API response
   */
  validateSession: async () => {
    const response = await api.get('/auth/validate')
    return response.data
  },

  /**
   * Logout user
   * @returns {Promise} - API response
   */
  logout: async () => {
    try {
      await api.post('/auth/logout')
    } catch (e) {
      // Ignore logout errors
    }
    localStorage.removeItem('userEmail')
    localStorage.removeItem('authProvider')
    localStorage.removeItem('isAuthenticated')
  },
}

export default authService

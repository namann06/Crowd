import api from './api'

/**
 * Auth Service
 * ------------
 * Handles admin authentication API calls.
 */

const authService = {
  /**
   * Login admin user
   * @param {string} username - Admin username
   * @param {string} password - Admin password
   * @returns {Promise} - API response
   */
  login: async (username, password) => {
    const response = await api.post('/auth/login', { username, password })
    return response.data
  },

  /**
   * Validate current session (for future JWT implementation)
   * @returns {Promise} - API response
   */
  validateSession: async () => {
    const response = await api.get('/auth/validate')
    return response.data
  },
}

export default authService

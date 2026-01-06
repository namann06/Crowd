import axios from 'axios'

/**
 * API Service
 * -----------
 * Centralized Axios instance for all API calls.
 * Base URL points to Spring Boot backend.
 */

// Determine API base URL based on environment
const getBaseUrl = () => {
  // In production, use the environment variable
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL
  }
  // In development, use the Vite proxy
  return '/api'
}

// Create axios instance with default config
const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 10000,   // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,  // Send cookies with requests for session auth
})

// Request interceptor (for adding auth headers if needed)
api.interceptors.request.use(
  (config) => {
    // Add user email header for multi-tenant API calls
    const userEmail = localStorage.getItem('userEmail')
    if (userEmail) {
      config.headers['X-User-Email'] = userEmail
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor (for handling errors globally)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common errors
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // Unauthorized - redirect to login
          localStorage.removeItem('isAuthenticated')
          window.location.href = '/login'
          break
        case 404:
          console.error('Resource not found')
          break
        case 500:
          console.error('Server error')
          break
        default:
          console.error('API error:', error.response.data)
      }
    }
    return Promise.reject(error)
  }
)

export default api

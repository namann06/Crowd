import axios from 'axios'

/**
 * API Service
 * -----------
 * Centralized Axios instance for all API calls.
 * Base URL points to Spring Boot backend.
 */

// Create axios instance with default config
const api = axios.create({
  baseURL: '/api',  // Proxied to http://localhost:8080/api
  timeout: 10000,   // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor (for adding auth headers if needed)
api.interceptors.request.use(
  (config) => {
    // You can add auth token here if implementing JWT
    // const token = localStorage.getItem('token')
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`
    // }
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

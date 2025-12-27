import api from './api'

/**
 * Analytics Service - Handles analytics and reporting API calls.
 */
const analyticsService = {
  getDashboardStats: async () => {
    const response = await api.get('/analytics/dashboard')
    return response.data
  },

  getHourlyTrend: async (areaId, date = null) => {
    const params = date ? `?date=${date}` : ''
    const response = await api.get(`/analytics/hourly/${areaId}${params}`)
    return response.data
  },

  getPrediction: async (areaId) => {
    const response = await api.get(`/analytics/prediction/${areaId}`)
    return response.data
  },

  getAreaComparison: async () => {
    const response = await api.get('/analytics/comparison')
    return response.data
  },

  getDailySummary: async (date) => {
    const response = await api.get(`/analytics/daily?date=${date}`)
    return response.data
  },
}

export default analyticsService

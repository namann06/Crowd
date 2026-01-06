import api from './api'

/**
 * Alert Service
 * -------------
 * API calls for alert management.
 */

const alertService = {
  /**
   * Get all alerts with optional filters
   * @param {Object} filters - { status, type, areaId, dateRange }
   */
  getAllAlerts: async (filters = {}) => {
    const params = new URLSearchParams()
    if (filters.status && filters.status !== 'all') params.append('status', filters.status)
    if (filters.type && filters.type !== 'all') params.append('type', filters.type)
    if (filters.areaId) params.append('areaId', filters.areaId)
    if (filters.dateRange) params.append('dateRange', filters.dateRange)
    
    const response = await api.get(`/alerts?${params.toString()}`)
    return response.data
  },

  /**
   * Get active (unresolved) alerts
   */
  getActiveAlerts: async () => {
    const response = await api.get('/alerts/active')
    return response.data
  },

  /**
   * Get unread alert count
   */
  getUnreadCount: async () => {
    const response = await api.get('/alerts/unread-count')
    return response.data.count
  },

  /**
   * Mark alert as read
   * @param {number} alertId
   */
  markAsRead: async (alertId) => {
    const response = await api.put(`/alerts/${alertId}/read`)
    return response.data
  },

  /**
   * Mark alert as resolved
   * @param {number} alertId
   */
  resolveAlert: async (alertId) => {
    const response = await api.put(`/alerts/${alertId}/resolve`)
    return response.data
  },

  /**
   * Mark all alerts as read
   */
  markAllAsRead: async () => {
    const response = await api.put('/alerts/mark-all-read')
    return response.data
  }
}

export default alertService

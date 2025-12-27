import api from './api'

/**
 * Scan Service
 * ------------
 * Handles QR scan operations and scan logs.
 */

const scanService = {
  /**
   * Process a QR code scan
   * @param {number} areaId - Area ID
   * @param {string} type - 'ENTRY' or 'EXIT'
   * @returns {Promise} - Scan result with updated count
   */
  processScan: async (areaId, type) => {
    const response = await api.post('/scans', { areaId, scanType: type })
    return response.data
  },

  /**
   * Get recent scan logs
   * @param {number} limit - Number of logs to fetch (default 50)
   * @returns {Promise} - List of recent scans
   */
  getRecentScans: async (limit = 50) => {
    const response = await api.get(`/scans/recent?limit=${limit}`)
    return response.data
  },

  /**
   * Get scan logs for a specific area
   * @param {number} areaId - Area ID
   * @returns {Promise} - List of scans for the area
   */
  getScansByArea: async (areaId) => {
    const response = await api.get(`/scans/area/${areaId}`)
    return response.data
  },

  /**
   * Get scan logs for today
   * @returns {Promise} - Today's scan logs
   */
  getTodayScans: async () => {
    const response = await api.get('/scans/today')
    return response.data
  },

  /**
   * Register a scan (alias for processScan)
   * @param {number} areaId - Area ID
   * @param {string} type - 'ENTRY' or 'EXIT'
   */
  registerScan: async function(areaId, type) {
    return this.processScan(areaId, type)
  },

  /**
   * Get hourly trend data for an area
   * @param {number} areaId - Area ID
   * @returns {Promise} - Hourly trend data
   */
  getHourlyTrend: async (areaId) => {
    try {
      const response = await api.get(`/scans/area/${areaId}/trend`)
      return response.data
    } catch (err) {
      // Return mock data if API not available
      return generateMockTrend()
    }
  },
}

// Helper function for mock trend data
function generateMockTrend() {
  const hours = []
  const now = new Date()
  for (let i = 12; i >= 0; i--) {
    const hour = new Date(now - i * 3600000)
    hours.push({
      hour: hour.getHours() + ':00',
      entries: Math.floor(Math.random() * 50) + 10,
      exits: Math.floor(Math.random() * 40) + 5,
      count: Math.floor(Math.random() * 100) + 20
    })
  }
  return hours
}

export default scanService

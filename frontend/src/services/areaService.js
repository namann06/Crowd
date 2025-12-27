import api from './api'

/**
 * Area Service
 * ------------
 * Handles all area-related API calls.
 */

const areaService = {
  /**
   * Get all areas
   * @returns {Promise} - List of all areas
   */
  getAll: async () => {
    const response = await api.get('/areas')
    return response.data
  },

  /**
   * Get area by ID
   * @param {number} id - Area ID
   * @returns {Promise} - Area details
   */
  getById: async (id) => {
    const response = await api.get(`/areas/${id}`)
    return response.data
  },

  /**
   * Create a new area
   * @param {Object} areaData - { name, capacity, threshold }
   * @returns {Promise} - Created area
   */
  create: async (areaData) => {
    const response = await api.post('/areas', areaData)
    return response.data
  },

  /**
   * Update an existing area
   * @param {number} id - Area ID
   * @param {Object} areaData - Updated data
   * @returns {Promise} - Updated area
   */
  update: async (id, areaData) => {
    const response = await api.put(`/areas/${id}`, areaData)
    return response.data
  },

  /**
   * Delete an area
   * @param {number} id - Area ID
   * @returns {Promise} - Deletion confirmation
   */
  delete: async (id) => {
    const response = await api.delete(`/areas/${id}`)
    return response.data
  },

  /**
   * Get QR code for an area
   * @param {number} id - Area ID
   * @param {string} type - 'entry' or 'exit'
   * @returns {Promise} - QR code image as base64
   */
  getQRCode: async (id, type) => {
    const response = await api.get(`/areas/${id}/qrcode/${type}`)
    return response.data
  },

  /**
   * Reset area count to zero
   * @param {number} id - Area ID
   * @returns {Promise} - Updated area
   */
  resetCount: async (id) => {
    const response = await api.post(`/areas/${id}/reset`)
    return response.data
  },

  /**
   * Get areas needing attention (yellow/red status)
   * @returns {Promise} - List of areas with high crowd levels
   */
  getAreasNeedingAttention: async () => {
    const response = await api.get('/areas/attention')
    return response.data
  },

  // Aliases for convenience (used by pages)
  getAllAreas: async function() { return this.getAll() },
  getAreaById: async function(id) { return this.getById(id) },
  createArea: async function(data) { return this.create(data) },
  updateArea: async function(id, data) { return this.update(id, data) },
  deleteArea: async function(id) { return this.delete(id) },
}

export default areaService

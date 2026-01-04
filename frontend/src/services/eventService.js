import api from './api'

/**
 * Event Service
 * -------------
 * API calls for event management.
 */

const eventService = {
  /**
   * Get all events
   */
  getAllEvents: async () => {
    const response = await api.get('/events')
    return response.data
  },

  /**
   * Get events grouped by status (live, upcoming, completed)
   */
  getEventsGrouped: async () => {
    const response = await api.get('/events/grouped')
    return response.data
  },

  /**
   * Get live events only
   */
  getLiveEvents: async () => {
    const response = await api.get('/events/live')
    return response.data
  },

  /**
   * Get upcoming events
   */
  getUpcomingEvents: async () => {
    const response = await api.get('/events/upcoming')
    return response.data
  },

  /**
   * Get completed events
   */
  getCompletedEvents: async () => {
    const response = await api.get('/events/completed')
    return response.data
  },

  /**
   * Get event by ID
   */
  getEventById: async (id) => {
    const response = await api.get(`/events/${id}`)
    return response.data
  },

  /**
   * Create a new event
   */
  createEvent: async (eventData) => {
    const response = await api.post('/events', eventData)
    return response.data
  },

  /**
   * Update an existing event
   */
  updateEvent: async (id, eventData) => {
    const response = await api.put(`/events/${id}`, eventData)
    return response.data
  },

  /**
   * Delete an event
   */
  deleteEvent: async (id) => {
    const response = await api.delete(`/events/${id}`)
    return response.data
  }
}

export default eventService

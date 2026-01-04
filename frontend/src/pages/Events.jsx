import { useState, useEffect, useCallback } from 'react'
import eventService from '../services/eventService'
import websocketService from '../services/websocketService'
import LoadingSpinner from '../components/LoadingSpinner'
import StatusBadge from '../components/StatusBadge'

/**
 * Events Page
 * -----------
 * Event management with Live, Upcoming, and Completed tabs.
 * Create events with nested areas.
 */
function Events() {
  const [events, setEvents] = useState({ live: [], upcoming: [], completed: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('live')
  const [wsConnected, setWsConnected] = useState(false)
  
  // Modal states
  const [showModal, setShowModal] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    venue: '',
    eventDate: '',
    eventTime: '',
    endDate: '',
    endTime: '',
    areas: [{ name: '', capacity: '', threshold: '', generateQr: true }]
  })

  // Fetch events
  const fetchEvents = async () => {
    try {
      const data = await eventService.getEventsGrouped()
      setEvents(data)
      setError(null)
    } catch (err) {
      setError('Failed to fetch events')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
    
    // Connect to WebSocket
    websocketService.connect(
      () => setWsConnected(true),
      () => setWsConnected(false)
    )
  }, [])

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      venue: '',
      eventDate: '',
      eventTime: '',
      endDate: '',
      endTime: '',
      areas: [{ name: '', capacity: '', threshold: '', generateQr: true }]
    })
    setFormError('')
    setSelectedEvent(null)
  }

  // Open create modal
  const handleCreate = () => {
    resetForm()
    setShowModal(true)
  }

  // Open edit modal
  const handleEdit = (event) => {
    const eventDate = event.eventDateTime ? event.eventDateTime.split('T')[0] : ''
    const eventTime = event.eventDateTime ? event.eventDateTime.split('T')[1]?.substring(0, 5) : ''
    const endDate = event.endDateTime ? event.endDateTime.split('T')[0] : ''
    const endTime = event.endDateTime ? event.endDateTime.split('T')[1]?.substring(0, 5) : ''

    setFormData({
      name: event.name || '',
      description: event.description || '',
      venue: event.venue || '',
      eventDate,
      eventTime,
      endDate,
      endTime,
      areas: event.areas?.length > 0 
        ? event.areas.map(a => ({
            name: a.name,
            capacity: a.capacity.toString(),
            threshold: a.threshold.toString(),
            generateQr: a.generateQr !== false
          }))
        : [{ name: '', capacity: '', threshold: '', generateQr: true }]
    })
    setSelectedEvent(event)
    setFormError('')
    setShowModal(true)
  }

  // Delete event
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event and all its areas?')) return
    
    try {
      await eventService.deleteEvent(id)
      await fetchEvents()
    } catch (err) {
      alert('Failed to delete event')
    }
  }

  // Add area to form
  const addArea = () => {
    setFormData(prev => ({
      ...prev,
      areas: [...prev.areas, { name: '', capacity: '', threshold: '', generateQr: true }]
    }))
  }

  // Remove area from form
  const removeArea = (index) => {
    if (formData.areas.length <= 1) return
    setFormData(prev => ({
      ...prev,
      areas: prev.areas.filter((_, i) => i !== index)
    }))
  }

  // Update area in form
  const updateArea = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      areas: prev.areas.map((area, i) => 
        i === index ? { ...area, [field]: value } : area
      )
    }))
  }

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')
    setSaving(true)

    // Validation
    if (!formData.name.trim()) {
      setFormError('Event name is required')
      setSaving(false)
      return
    }
    if (!formData.eventDate || !formData.eventTime) {
      setFormError('Event date and time are required')
      setSaving(false)
      return
    }

    // Validate areas
    for (let i = 0; i < formData.areas.length; i++) {
      const area = formData.areas[i]
      if (!area.name.trim()) {
        setFormError(`Area ${i + 1}: Name is required`)
        setSaving(false)
        return
      }
      if (!area.capacity || parseInt(area.capacity) < 1) {
        setFormError(`Area ${i + 1}: Capacity must be at least 1`)
        setSaving(false)
        return
      }
      if (!area.threshold || parseInt(area.threshold) < 1) {
        setFormError(`Area ${i + 1}: Threshold must be at least 1`)
        setSaving(false)
        return
      }
      if (parseInt(area.threshold) > parseInt(area.capacity)) {
        setFormError(`Area ${i + 1}: Threshold cannot exceed capacity`)
        setSaving(false)
        return
      }
    }

    try {
      const eventData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        venue: formData.venue.trim(),
        eventDateTime: `${formData.eventDate}T${formData.eventTime}:00`,
        endDateTime: formData.endDate && formData.endTime 
          ? `${formData.endDate}T${formData.endTime}:00` 
          : null,
        areas: formData.areas.map(area => ({
          name: area.name.trim(),
          capacity: parseInt(area.capacity),
          threshold: parseInt(area.threshold),
          generateQr: area.generateQr
        }))
      }

      if (selectedEvent) {
        await eventService.updateEvent(selectedEvent.id, eventData)
      } else {
        await eventService.createEvent(eventData)
      }

      setShowModal(false)
      resetForm()
      await fetchEvents()
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save event')
    } finally {
      setSaving(false)
    }
  }

  // Calculate totals for preview
  const totalAreas = formData.areas.filter(a => a.name.trim()).length
  const totalCapacity = formData.areas.reduce((sum, a) => sum + (parseInt(a.capacity) || 0), 0)

  // Get QR code URL
  const getQRCodeUrl = (areaId, type) => {
    const baseUrl = window.location.origin
    const scanUrl = `${baseUrl}/scan/${areaId}/${type}`
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(scanUrl)}`
  }

  // Format date for display
  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return ''
    const date = new Date(dateTimeStr)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  // Get status badge style
  const getStatusStyle = (status) => {
    switch (status) {
      case 'LIVE':
        return 'bg-green-100 text-green-700'
      case 'UPCOMING':
        return 'bg-blue-100 text-blue-700'
      case 'COMPLETED':
        return 'bg-neutral-100 text-neutral-600'
      default:
        return 'bg-neutral-100 text-neutral-600'
    }
  }

  if (loading) {
    return <LoadingSpinner text="Loading events..." />
  }

  const currentEvents = events[activeTab] || []

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 tracking-tight">Events</h1>
          <p className="text-sm text-neutral-500 mt-1">Manage events and their areas</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <span className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-green-500' : 'bg-neutral-400'}`}></span>
            {wsConnected ? 'Live' : 'Offline'}
          </div>
          <button onClick={handleCreate} className="btn btn-primary">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Create Event
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-neutral-100 rounded-xl w-fit">
        {[
          { key: 'live', label: 'Live', count: events.live?.length || 0 },
          { key: 'upcoming', label: 'Upcoming', count: events.upcoming?.length || 0 },
          { key: 'completed', label: 'Completed', count: events.completed?.length || 0 }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === tab.key
                ? 'bg-white text-neutral-900 shadow-sm'
                : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                activeTab === tab.key ? 'bg-neutral-100' : 'bg-neutral-200'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Events Grid */}
      {currentEvents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 card">
          <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
            </svg>
          </div>
          <p className="text-neutral-500 mb-4">No {activeTab} events</p>
          {activeTab !== 'completed' && (
            <button onClick={handleCreate} className="btn btn-primary">
              Create Event
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {currentEvents.map((event) => (
            <div key={event.id} className="card hover:shadow-lg transition-shadow">
              {/* Event Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-neutral-900">{event.name}</h3>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusStyle(event.status)}`}>
                      {event.status}
                    </span>
                  </div>
                  {event.venue && (
                    <p className="text-sm text-neutral-500 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                      </svg>
                      {event.venue}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(event)}
                    className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(event.id)}
                    className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Date/Time */}
              <div className="text-sm text-neutral-600 mb-4">
                <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                {formatDateTime(event.eventDateTime)}
                {event.endDateTime && (
                  <span className="text-neutral-400"> — {formatDateTime(event.endDateTime)}</span>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center p-3 bg-neutral-50 rounded-xl">
                  <p className="text-2xl font-semibold text-neutral-900">{event.totalAreas}</p>
                  <p className="text-xs text-neutral-500">Areas</p>
                </div>
                <div className="text-center p-3 bg-neutral-50 rounded-xl">
                  <p className="text-2xl font-semibold text-neutral-900">{event.totalCurrentCount}</p>
                  <p className="text-xs text-neutral-500">Current</p>
                </div>
                <div className="text-center p-3 bg-neutral-50 rounded-xl">
                  <p className="text-2xl font-semibold text-neutral-900">{event.totalCapacity}</p>
                  <p className="text-xs text-neutral-500">Capacity</p>
                </div>
              </div>

              {/* Occupancy Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-xs text-neutral-500 mb-1">
                  <span>Occupancy</span>
                  <span>{Math.round(event.occupancyPercentage || 0)}%</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className={`progress-bar-fill ${
                      event.occupancyPercentage >= 90 ? 'critical' : 
                      event.occupancyPercentage >= 70 ? 'warning' : ''
                    }`}
                    style={{ width: `${Math.min(event.occupancyPercentage || 0, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Areas List */}
              {event.areas?.length > 0 && (
                <div className="border-t border-neutral-100 pt-4">
                  <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2">Areas</p>
                  <div className="space-y-2">
                    {event.areas.slice(0, 3).map((area) => (
                      <div key={area.id} className="flex items-center justify-between text-sm">
                        <span className="text-neutral-700">{area.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-neutral-500">{area.currentCount}/{area.capacity}</span>
                          <StatusBadge status={area.status} />
                        </div>
                      </div>
                    ))}
                    {event.areas.length > 3 && (
                      <p className="text-xs text-neutral-400">+{event.areas.length - 3} more areas</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex">
            {/* Form Section */}
            <div className="flex-1 p-8 overflow-y-auto">
              <h2 className="text-xl font-semibold text-neutral-900 mb-6">
                {selectedEvent ? 'Edit Event' : 'Create New Event'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Event Name & Date/Time Row */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Event Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter event name..."
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Event Date & Time</label>
                    <div className="flex gap-2">
                      <input
                        type="date"
                        value={formData.eventDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, eventDate: e.target.value }))}
                        className="input flex-1"
                      />
                      <input
                        type="time"
                        value={formData.eventTime}
                        onChange={(e) => setFormData(prev => ({ ...prev, eventTime: e.target.value }))}
                        className="input w-32"
                      />
                    </div>
                  </div>
                </div>

                {/* Description & Venue Row */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Event Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Provide a detailed description..."
                      rows={3}
                      className="input resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Venue / Location</label>
                    <input
                      type="text"
                      value={formData.venue}
                      onChange={(e) => setFormData(prev => ({ ...prev, venue: e.target.value }))}
                      placeholder="Enter venue or location..."
                      className="input"
                    />
                    <div className="mt-3">
                      <label className="block text-sm font-medium text-neutral-700 mb-2">End Date & Time (Optional)</label>
                      <div className="flex gap-2">
                        <input
                          type="date"
                          value={formData.endDate}
                          onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                          className="input flex-1"
                        />
                        <input
                          type="time"
                          value={formData.endTime}
                          onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                          className="input w-32"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Total Areas & Capacity Display */}
                <div className="flex gap-6">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-neutral-600">Total Areas</span>
                    <div className="flex items-center bg-neutral-100 rounded-lg">
                      <span className="px-4 py-2 text-lg font-medium">{totalAreas}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-neutral-600">Event Capacity</span>
                    <div className="flex items-center bg-neutral-100 rounded-lg">
                      <span className="px-4 py-2 text-lg font-medium">{totalCapacity}</span>
                    </div>
                  </div>
                </div>

                {/* Areas Section */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                    </svg>
                    <span className="text-sm font-medium text-neutral-700">Add Areas</span>
                  </div>

                  {/* Areas Table */}
                  <div className="bg-neutral-50 rounded-xl p-4">
                    <div className="grid grid-cols-12 gap-3 text-xs font-medium text-neutral-500 uppercase tracking-wider mb-3 px-2">
                      <div className="col-span-4">Area Name</div>
                      <div className="col-span-2">Capacity</div>
                      <div className="col-span-2">Threshold (%)</div>
                      <div className="col-span-2">Generate QR</div>
                      <div className="col-span-2"></div>
                    </div>

                    {formData.areas.map((area, index) => (
                      <div key={index} className="grid grid-cols-12 gap-3 mb-3 items-center">
                        <div className="col-span-4">
                          <input
                            type="text"
                            value={area.name}
                            onChange={(e) => updateArea(index, 'name', e.target.value)}
                            placeholder="Area name"
                            className="input"
                          />
                        </div>
                        <div className="col-span-2">
                          <input
                            type="number"
                            value={area.capacity}
                            onChange={(e) => updateArea(index, 'capacity', e.target.value)}
                            placeholder="500"
                            min="1"
                            className="input"
                          />
                        </div>
                        <div className="col-span-2">
                          <input
                            type="number"
                            value={area.threshold}
                            onChange={(e) => updateArea(index, 'threshold', e.target.value)}
                            placeholder="85"
                            min="1"
                            className="input"
                          />
                        </div>
                        <div className="col-span-2 flex justify-center">
                          <button
                            type="button"
                            onClick={() => updateArea(index, 'generateQr', !area.generateQr)}
                            className={`w-12 h-6 rounded-full transition-colors ${
                              area.generateQr ? 'bg-indigo-500' : 'bg-neutral-300'
                            }`}
                          >
                            <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                              area.generateQr ? 'translate-x-6' : 'translate-x-0.5'
                            }`}></div>
                          </button>
                        </div>
                        <div className="col-span-2 flex justify-end">
                          {formData.areas.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeArea(index)}
                              className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={addArea}
                      className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium mt-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                      Add Another Area
                    </button>
                  </div>
                </div>

                {/* Error Message */}
                {formError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                    {formError}
                  </div>
                )}

                {/* Form Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="btn"
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : selectedEvent ? 'Update Event' : 'Create Event'}
                  </button>
                </div>
              </form>
            </div>

            {/* Preview Section */}
            <div className="w-80 bg-neutral-50 border-l border-neutral-200 p-6 overflow-y-auto">
              <h3 className="text-sm font-semibold text-neutral-900 mb-4">Preview</h3>
              
              {/* Event Summary */}
              <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
                <h4 className="text-xs font-semibold text-neutral-900 uppercase tracking-wider mb-3">Event Summary</h4>
                <div className="space-y-2 text-sm">
                  <p className="text-neutral-700">
                    <span className="text-neutral-500">Event:</span> {formData.name || 'Untitled Event'}
                  </p>
                  <p className="text-neutral-700">
                    <span className="text-neutral-500">Date:</span> {formData.eventDate || 'Not set'} | 
                    <span className="text-neutral-500"> Time:</span> {formData.eventTime || 'Not set'}
                  </p>
                  <p className="text-neutral-700">
                    <span className="text-neutral-500">Venue:</span> {formData.venue || 'Not set'}
                  </p>
                  <p className="text-neutral-700">
                    <span className="text-neutral-500">Areas:</span> {totalAreas}
                  </p>
                  <p className="text-neutral-700">
                    <span className="text-neutral-500">Capacity:</span> {totalCapacity}
                  </p>
                </div>
              </div>

              {/* Live Capacity */}
              <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-neutral-700">Live Capacity</span>
                  <span className="text-neutral-500">0% Filled</span>
                </div>
                <div className="progress-bar mb-2">
                  <div className="progress-bar-fill" style={{ width: '0%' }}></div>
                </div>
                <p className="text-xs text-neutral-400">0/{totalCapacity}</p>
              </div>

              {/* Sample QR Code */}
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <h4 className="text-xs font-semibold text-neutral-900 uppercase tracking-wider mb-3">Generated QR</h4>
                <div className="bg-neutral-100 rounded-lg p-4 flex flex-col items-center">
                  <img 
                    src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=sample"
                    alt="Sample QR Code"
                    className="mb-2"
                  />
                  <p className="text-xs text-neutral-500">Sample QR Code</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Events

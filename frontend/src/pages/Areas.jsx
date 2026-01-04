import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import eventService from '../services/eventService'
import websocketService from '../services/websocketService'
import AreaCard from '../components/AreaCard'
import Modal from '../components/Modal'
import LoadingSpinner from '../components/LoadingSpinner'
import StatusBadge from '../components/StatusBadge'

/**
 * Areas Page
 * ----------
 * Apple-inspired minimalist area management interface.
 * Features real-time WebSocket updates.
 * Areas are grouped by their parent events.
 */
function Areas() {
  const navigate = useNavigate()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [wsConnected, setWsConnected] = useState(false)
  
  // Modal states
  const [showQRModal, setShowQRModal] = useState(false)
  const [selectedArea, setSelectedArea] = useState(null)

  // Fetch all events with areas
  const fetchEvents = async () => {
    try {
      const data = await eventService.getAllEvents()
      setEvents(data)
      setError(null)
    } catch (err) {
      setError('Failed to fetch areas')
    } finally {
      setLoading(false)
    }
  }

  // Handle real-time area update from WebSocket
  const handleAreaUpdate = useCallback((updatedArea) => {
    setEvents(prevEvents => {
      return prevEvents.map(event => ({
        ...event,
        areas: (event.areas || []).map(area => 
          area.id === updatedArea.id ? updatedArea : area
        )
      }))
    })
  }, [])

  useEffect(() => {
    fetchEvents()
    
    let subId = null
    
    // Connect to WebSocket for real-time updates
    websocketService.connect(
      () => {
        setWsConnected(true)
        // Subscribe to area updates
        subId = websocketService.subscribeToAllAreas(handleAreaUpdate)
      },
      (error) => {
        console.error('WebSocket error:', error)
        setWsConnected(false)
      }
    )
    
    // Cleanup on unmount
    return () => {
      if (subId) {
        websocketService.unsubscribe(subId)
      }
    }
  }, [handleAreaUpdate])

  // View QR codes for area
  const handleViewQR = (area) => {
    setSelectedArea(area)
    setShowQRModal(true)
  }

  // Generate QR code URL
  const getQRCodeUrl = (areaId, type) => {
    const baseUrl = window.location.origin
    const scanUrl = `${baseUrl}/scan/${areaId}/${type}`
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(scanUrl)}`
  }

  // Get all areas flattened from events
  const getAllAreas = () => {
    return events.flatMap(event => 
      (event.areas || []).map(area => ({ ...area, eventName: event.name, eventStatus: event.status }))
    )
  }

  // Get event status badge color
  const getEventStatusColor = (status) => {
    switch (status) {
      case 'LIVE': return 'bg-green-100 text-green-700'
      case 'UPCOMING': return 'bg-blue-100 text-blue-700'
      case 'COMPLETED': return 'bg-neutral-100 text-neutral-600'
      default: return 'bg-neutral-100 text-neutral-600'
    }
  }

  if (loading) {
    return <LoadingSpinner text="Loading areas..." />
  }

  const allAreas = getAllAreas()

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 tracking-tight">Areas</h1>
          <p className="text-sm text-neutral-500 mt-1">
            All areas grouped by events • {allAreas.length} total areas
          </p>
        </div>
        <div className="flex items-center gap-3">
          {wsConnected && (
            <div className="flex items-center gap-1.5 text-xs text-green-600">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              Live
            </div>
          )}
          <button onClick={() => navigate('/events')} className="btn btn-primary">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Create Event
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-neutral-100 border border-neutral-200 text-neutral-700 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Events with Areas */}
      {events.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 card">
          <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
            </svg>
          </div>
          <p className="text-neutral-500 mb-4">No events created yet</p>
          <button onClick={() => navigate('/events')} className="btn btn-primary">
            Create First Event
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {events.map((event) => (
            <div key={event.id} className="card overflow-hidden">
              {/* Event Header */}
              <div className="flex items-center justify-between p-4 bg-neutral-50 border-b border-neutral-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-neutral-200 flex items-center justify-center">
                    <svg className="w-5 h-5 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-900">{event.name}</h3>
                    <p className="text-xs text-neutral-500">
                      {event.venue} • {new Date(event.eventDateTime).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={event.status} />
                  <span className="text-sm text-neutral-500">
                    {(event.areas || []).length} areas
                  </span>
                </div>
              </div>

              {/* Areas Grid */}
              {(!event.areas || event.areas.length === 0) ? (
                <div className="p-8 text-center">
                  <p className="text-sm text-neutral-400">No areas in this event</p>
                </div>
              ) : (
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {event.areas.map((area) => (
                      <AreaCard
                        key={area.id}
                        area={area}
                        onViewQR={handleViewQR}
                        compact
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* QR Codes Modal */}
      <Modal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        title={`QR Codes`}
        size="lg"
      >
        {selectedArea && (
          <div className="space-y-5">
            <div className="text-center">
              <p className="text-sm text-neutral-500">
                QR codes for <span className="font-medium text-neutral-900">{selectedArea.name}</span>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Entry QR */}
              <div className="text-center p-4 bg-neutral-50 rounded-xl">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <svg className="w-4 h-4 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 3.75H6.912a2.25 2.25 0 0 0-2.15 1.588L2.35 13.177a2.25 2.25 0 0 0-.1.661V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 0 0-2.15-1.588H15" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v8.25m0 0-3-3m3 3 3-3" />
                  </svg>
                  <span className="text-sm font-medium text-neutral-700">Entry</span>
                </div>
                <img
                  src={getQRCodeUrl(selectedArea.id, 'entry')}
                  alt="Entry QR Code"
                  className="mx-auto rounded-lg"
                />
                <p className="text-xs text-neutral-400 mt-2">Scan on arrival</p>
              </div>

              {/* Exit QR */}
              <div className="text-center p-4 bg-neutral-50 rounded-xl">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <svg className="w-4 h-4 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 8.25H7.5a2.25 2.25 0 0 0-2.25 2.25v9a2.25 2.25 0 0 0 2.25 2.25h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25H15m0-3-3-3m0 0-3 3m3-3v11.25" />
                  </svg>
                  <span className="text-sm font-medium text-neutral-700">Exit</span>
                </div>
                <img
                  src={getQRCodeUrl(selectedArea.id, 'exit')}
                  alt="Exit QR Code"
                  className="mx-auto rounded-lg"
                />
                <p className="text-xs text-neutral-400 mt-2">Scan on departure</p>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setShowQRModal(false)}
                className="w-full btn btn-secondary"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default Areas

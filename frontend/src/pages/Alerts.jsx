import { useState, useEffect, useCallback } from 'react'
import alertService from '../services/alertService'
import eventService from '../services/eventService'
import websocketService from '../services/websocketService'
import LoadingSpinner from '../components/LoadingSpinner'

/**
 * Alerts Page
 * -----------
 * Displays alerts and notifications when areas exceed thresholds.
 * Features filtering by area, alert type, date range, and status.
 * Real-time updates via WebSocket.
 */
function Alerts() {
  const [alerts, setAlerts] = useState([])
  const [activeAlerts, setActiveAlerts] = useState([])
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Filters
  const [selectedArea, setSelectedArea] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  const [selectedDateRange, setSelectedDateRange] = useState('24h')

  // Flatten all areas from events
  const areas = events.flatMap(event => 
    (event.areas || []).map(area => ({ ...area, eventName: event.name }))
  )

  // Fetch alerts and events
  const fetchData = useCallback(async () => {
    try {
      const [alertsData, activeAlertsData, eventsData] = await Promise.all([
        alertService.getAllAlerts({
          areaId: selectedArea !== 'all' ? selectedArea : null,
          type: selectedType !== 'all' ? selectedType : null,
          dateRange: selectedDateRange
        }),
        alertService.getActiveAlerts(),
        eventService.getAllEvents()
      ])
      setAlerts(alertsData)
      setActiveAlerts(activeAlertsData)
      setEvents(eventsData)
      setError(null)
    } catch (err) {
      setError('Failed to fetch alerts')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [selectedArea, selectedType, selectedDateRange])

  // Initial fetch
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // WebSocket subscription for real-time alerts
  useEffect(() => {
    let subId = null

    const connectWebSocket = async () => {
      try {
        await websocketService.connect()
        subId = websocketService.subscribeToAlerts((newAlert) => {
          setAlerts(prev => [newAlert, ...prev])
          setActiveAlerts(prev => [newAlert, ...prev.filter(a => a.id !== newAlert.id)])
        })
      } catch (err) {
        console.error('WebSocket connection failed:', err)
      }
    }

    connectWebSocket()

    return () => {
      if (subId) {
        websocketService.unsubscribe(subId)
      }
    }
  }, [])

  // Mark alert as read
  const handleMarkAsRead = async (alertId) => {
    try {
      const updated = await alertService.markAsRead(alertId)
      setAlerts(prev => prev.map(a => a.id === alertId ? updated : a))
      setActiveAlerts(prev => prev.map(a => a.id === alertId ? updated : a))
    } catch (err) {
      console.error('Failed to mark alert as read:', err)
    }
  }

  // Resolve alert
  const handleResolve = async (alertId) => {
    try {
      const updated = await alertService.resolveAlert(alertId)
      setAlerts(prev => prev.map(a => a.id === alertId ? updated : a))
      setActiveAlerts(prev => prev.filter(a => a.id !== alertId))
    } catch (err) {
      console.error('Failed to resolve alert:', err)
    }
  }

  // Mark all as read
  const handleMarkAllRead = async () => {
    try {
      await alertService.markAllAsRead()
      setAlerts(prev => prev.map(a => ({ ...a, status: a.status === 'UNREAD' ? 'READ' : a.status })))
      setActiveAlerts(prev => prev.map(a => ({ ...a, status: a.status === 'UNREAD' ? 'READ' : a.status })))
    } catch (err) {
      console.error('Failed to mark all as read:', err)
    }
  }

  // Format time
  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
  }

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  // Get alert type icon
  const getAlertIcon = (alertType, isCritical) => {
    if (isCritical) {
      return (
        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
      )
    }
    return (
      <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
        <svg className="w-4 h-4 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      </div>
    )
  }

  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'UNREAD':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
            Unread
          </span>
        )
      case 'READ':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-neutral-100 text-neutral-600">
            Read
          </span>
        )
      case 'RESOLVED':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
            Resolved
          </span>
        )
      default:
        return null
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 tracking-tight">
            Alerts & Notifications
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Monitor threshold breaches and capacity alerts
          </p>
        </div>
        <button
          onClick={handleMarkAllRead}
          className="px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
        >
          Mark all as read
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {/* Area Filter */}
        <div className="relative">
          <select
            value={selectedArea}
            onChange={(e) => setSelectedArea(e.target.value)}
            className="appearance-none bg-white border border-neutral-200 rounded-full px-4 py-2 pr-10 text-sm font-medium text-neutral-700 hover:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2 cursor-pointer"
          >
            <option value="all">Area: All Areas</option>
            {areas.map(area => (
              <option key={area.id} value={area.id}>
                {area.name} ({area.eventName})
              </option>
            ))}
          </select>
          <svg className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* Alert Type Filter */}
        <div className="relative">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="appearance-none bg-white border border-neutral-200 rounded-full px-4 py-2 pr-10 text-sm font-medium text-neutral-700 hover:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2 cursor-pointer"
          >
            <option value="all">Alert Type: All Types</option>
            <option value="OVERCROWDING">Overcrowding (Critical)</option>
            <option value="THRESHOLD_BREACH">Threshold Breach (Warning)</option>
            <option value="RAPID_INFLOW">Rapid Inflow (Critical)</option>
          </select>
          <svg className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* Date Range Filter */}
        <div className="relative">
          <select
            value={selectedDateRange}
            onChange={(e) => setSelectedDateRange(e.target.value)}
            className="appearance-none bg-white border border-neutral-200 rounded-full px-4 py-2 pr-10 text-sm font-medium text-neutral-700 hover:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2 cursor-pointer"
          >
            <option value="today">Date Range: Today</option>
            <option value="24h">Date Range: Last 24 Hours</option>
            <option value="7d">Date Range: Last 7 Days</option>
            <option value="30d">Date Range: Last 30 Days</option>
          </select>
          <svg className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alerts List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-4 gap-4 px-6 py-3 border-b border-neutral-100 bg-neutral-50/50">
              <div className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Time</div>
              <div className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Area</div>
              <div className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Alert Type</div>
              <div className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</div>
            </div>

            {/* Alert Rows */}
            <div className="divide-y divide-neutral-100">
              {alerts.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </div>
                  <p className="text-sm text-neutral-500">No alerts found</p>
                  <p className="text-xs text-neutral-400 mt-1">Alerts will appear here when areas exceed thresholds</p>
                </div>
              ) : (
                alerts.map((alert) => (
                  <div 
                    key={alert.id} 
                    className={`grid grid-cols-4 gap-4 px-6 py-4 hover:bg-neutral-50 transition-colors cursor-pointer ${
                      alert.status === 'UNREAD' ? 'bg-red-50/30' : ''
                    }`}
                    onClick={() => alert.status === 'UNREAD' && handleMarkAsRead(alert.id)}
                  >
                    <div className="text-sm text-neutral-600">
                      <div className="font-medium">{formatTime(alert.createdAt)}</div>
                      <div className="text-xs text-neutral-400">{formatDate(alert.createdAt)}</div>
                    </div>
                    <div className="text-sm font-medium text-neutral-900">{alert.areaName}</div>
                    <div className="flex items-center gap-2">
                      {getAlertIcon(alert.alertType, alert.critical)}
                      <div>
                        <div className="text-sm font-medium text-neutral-900">{alert.alertTypeDisplay}</div>
                        <div className="text-xs text-neutral-500">({alert.severity})</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      {getStatusBadge(alert.status)}
                      {alert.status !== 'RESOLVED' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleResolve(alert.id)
                          }}
                          className="text-xs font-medium text-neutral-500 hover:text-neutral-700 hover:underline"
                        >
                          Resolve
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Active Alerts Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6">
            <h2 className="text-sm font-semibold text-neutral-900 mb-4">Active Alerts Now</h2>
            
            {activeAlerts.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-sm text-neutral-500">All clear!</p>
                <p className="text-xs text-neutral-400 mt-1">No active alerts at the moment</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeAlerts.slice(0, 5).map((alert) => (
                  <div 
                    key={alert.id} 
                    className="flex items-start gap-3 p-3 rounded-xl bg-neutral-50 hover:bg-neutral-100 transition-colors"
                  >
                    {getAlertIcon(alert.alertType, alert.critical)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-neutral-900 truncate">
                          {alert.areaName}
                        </span>
                        {alert.critical ? (
                          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                        ) : (
                          <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-600 mt-0.5">
                        {alert.alertType === 'OVERCROWDING' && `Overcrowded (${Math.round(alert.occupancyPercentage)}% Capacity)`}
                        {alert.alertType === 'THRESHOLD_BREACH' && `Threshold Breach (${Math.round(alert.occupancyPercentage)}% Capacity)`}
                        {alert.alertType === 'RAPID_INFLOW' && 'Rapid Inflow Detected'}
                      </p>
                      <p className="text-xs text-neutral-400 mt-1">{formatTime(alert.createdAt)}</p>
                    </div>
                  </div>
                ))}
                
                {activeAlerts.length > 5 && (
                  <p className="text-xs text-neutral-500 text-center pt-2">
                    +{activeAlerts.length - 5} more active alerts
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="mt-4 bg-white rounded-2xl border border-neutral-200 shadow-sm p-6">
            <h2 className="text-sm font-semibold text-neutral-900 mb-4">Alert Summary</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-600">Critical Alerts</span>
                <span className="text-sm font-semibold text-red-600">
                  {alerts.filter(a => a.critical && a.status !== 'RESOLVED').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-600">Warning Alerts</span>
                <span className="text-sm font-semibold text-amber-600">
                  {alerts.filter(a => !a.critical && a.status !== 'RESOLVED').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-600">Resolved Today</span>
                <span className="text-sm font-semibold text-green-600">
                  {alerts.filter(a => a.status === 'RESOLVED').length}
                </span>
              </div>
              <div className="h-px bg-neutral-100 my-2"></div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-600">Total Alerts</span>
                <span className="text-sm font-semibold text-neutral-900">{alerts.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default Alerts

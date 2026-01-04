import SockJS from 'sockjs-client'
import { Client } from '@stomp/stompjs'

/**
 * WebSocket Service
 * -----------------
 * Real-time updates via WebSocket with STOMP protocol.
 * Falls back to SockJS for browsers without native WebSocket support.
 */

let stompClient = null
let connected = false
let subscriptions = {}
let reconnectAttempts = 0
const MAX_RECONNECT_ATTEMPTS = 5
const RECONNECT_DELAY = 3000

/**
 * Connect to WebSocket server
 * @param {Function} onConnect Callback when connected
 * @param {Function} onError Callback on error
 */
export const connect = (onConnect, onError) => {
  if (stompClient && connected) {
    console.log('WebSocket already connected')
    onConnect?.()
    return
  }

  // Use the backend WebSocket endpoint
  const wsUrl = '/ws'

  stompClient = new Client({
    webSocketFactory: () => new SockJS(wsUrl),
    reconnectDelay: RECONNECT_DELAY,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
    
    onConnect: () => {
      console.log('WebSocket connected')
      connected = true
      reconnectAttempts = 0
      onConnect?.()
    },
    
    onStompError: (frame) => {
      console.error('WebSocket STOMP error:', frame)
      onError?.(frame)
    },
    
    onWebSocketClose: () => {
      console.log('WebSocket closed')
      connected = false
      handleReconnect(onConnect, onError)
    },
    
    onWebSocketError: (event) => {
      console.error('WebSocket error:', event)
      connected = false
    }
  })

  stompClient.activate()
}

/**
 * Handle reconnection logic
 */
const handleReconnect = (onConnect, onError) => {
  if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
    reconnectAttempts++
    console.log(`Reconnecting... attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS}`)
    setTimeout(() => connect(onConnect, onError), RECONNECT_DELAY)
  } else {
    console.error('Max reconnection attempts reached')
    onError?.('Max reconnection attempts reached')
  }
}

/**
 * Disconnect from WebSocket server
 */
export const disconnect = () => {
  if (stompClient) {
    // Unsubscribe from all topics
    Object.values(subscriptions).forEach(sub => {
      try {
        sub.unsubscribe()
      } catch (e) {
        // Ignore errors during cleanup
      }
    })
    subscriptions = {}
    
    stompClient.deactivate()
    stompClient = null
    connected = false
    console.log('WebSocket disconnected')
  }
}

/**
 * Subscribe to area updates (single area)
 * @param {number} areaId Area ID
 * @param {Function} callback Callback with updated area data
 * @returns {string} Subscription ID for unsubscribing
 */
export const subscribeToArea = (areaId, callback) => {
  const topic = `/topic/area/${areaId}`
  return subscribe(topic, callback)
}

/**
 * Subscribe to all area updates
 * @param {Function} callback Callback with updated area data
 * @returns {string} Subscription ID for unsubscribing
 */
export const subscribeToAllAreas = (callback) => {
  return subscribe('/topic/areas', callback)
}

/**
 * Subscribe to full areas list updates
 * @param {Function} callback Callback with all areas data
 * @returns {string} Subscription ID for unsubscribing
 */
export const subscribeToAreasAll = (callback) => {
  return subscribe('/topic/areas/all', callback)
}

/**
 * Subscribe to scan events
 * @param {Function} callback Callback with scan event data
 * @returns {string} Subscription ID for unsubscribing
 */
export const subscribeToScans = (callback) => {
  return subscribe('/topic/scans', callback)
}

/**
 * Generic subscribe function
 * @param {string} topic Topic to subscribe to
 * @param {Function} callback Callback with message data
 * @returns {string} Subscription ID
 */
const subscribe = (topic, callback) => {
  if (!stompClient || !connected) {
    console.warn('WebSocket not connected, cannot subscribe to:', topic)
    return null
  }

  const subId = `sub-${topic}-${Date.now()}`
  
  subscriptions[subId] = stompClient.subscribe(topic, (message) => {
    try {
      const data = JSON.parse(message.body)
      callback(data)
    } catch (e) {
      console.error('Error parsing WebSocket message:', e)
    }
  })

  console.log('Subscribed to:', topic)
  return subId
}

/**
 * Unsubscribe from a topic
 * @param {string} subId Subscription ID from subscribe call
 */
export const unsubscribe = (subId) => {
  if (subscriptions[subId]) {
    subscriptions[subId].unsubscribe()
    delete subscriptions[subId]
    console.log('Unsubscribed:', subId)
  }
}

/**
 * Check if WebSocket is connected
 * @returns {boolean} Connection status
 */
export const isConnected = () => connected

export default {
  connect,
  disconnect,
  subscribeToArea,
  subscribeToAllAreas,
  subscribeToAreasAll,
  subscribeToScans,
  unsubscribe,
  isConnected
}

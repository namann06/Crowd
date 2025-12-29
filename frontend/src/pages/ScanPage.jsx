import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import scanService from '../services/scanService'
import areaService from '../services/areaService'

/**
 * ScanPage Component
 * ------------------
 * Public page for QR code scanning.
 * When a user scans a QR code, they are directed here.
 * The page automatically registers the entry/exit and shows confirmation.
 * 
 * URL format: /scan/:areaId/:type
 * - areaId: The area being entered/exited
 * - type: 'entry' or 'exit'
 */
function ScanPage() {
  const { areaId, type } = useParams()
  const navigate = useNavigate()
  
  const [status, setStatus] = useState('processing') // processing, success, error
  const [area, setArea] = useState(null)
  const [message, setMessage] = useState('')
  
  // Ref to prevent duplicate processing (React StrictMode runs useEffect twice)
  const hasProcessed = useRef(false)

  useEffect(() => {
    const processScan = async () => {
      // Prevent duplicate processing
      if (hasProcessed.current) {
        return
      }
      hasProcessed.current = true
      
      try {
        // Validate type
        if (type !== 'entry' && type !== 'exit') {
          setStatus('error')
          setMessage('Invalid scan type')
          return
        }

        // Fetch area info
        const areaData = await areaService.getAreaById(areaId)
        setArea(areaData)

        // Register the scan
        await scanService.registerScan(areaId, type.toUpperCase())

        setStatus('success')
        setMessage(
          type === 'entry' 
            ? 'Entry registered successfully!' 
            : 'Exit registered successfully!'
        )
      } catch (err) {
        setStatus('error')
        setMessage(err.response?.data?.message || 'Failed to register scan')
      }
    }

    processScan()
  }, [areaId, type])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-700 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center">
        {/* Processing State */}
        {status === 'processing' && (
          <>
            <div className="text-6xl mb-4 animate-bounce">
              {type === 'entry' ? '📥' : '📤'}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Processing...
            </h1>
            <p className="text-gray-600">
              Registering your {type}
            </p>
            <div className="mt-6">
              <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            </div>
          </>
        )}

        {/* Success State */}
        {status === 'success' && (
          <>
            <div className={`text-6xl mb-4 ${type === 'entry' ? 'text-green-500' : 'text-red-500'}`}>
              {type === 'entry' ? '✅' : '👋'}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {message}
            </h1>
            {area && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-600 mb-1">Area:</p>
                <p className="text-xl font-semibold text-gray-900">{area.name}</p>
                <p className="text-sm text-gray-500 mt-2">
                  Current count: {area.currentCount + (type === 'entry' ? 1 : -1)} / {area.capacity}
                </p>
              </div>
            )}
            <div className="mt-6 text-green-600 text-lg">
              {type === 'entry' ? 'Welcome! Enjoy your time.' : 'Thank you for visiting!'}
            </div>
          </>
        )}

        {/* Error State */}
        {status === 'error' && (
          <>
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-red-600 mb-2">
              Scan Failed
            </h1>
            <p className="text-gray-600">{message}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 btn btn-primary"
            >
              Try Again
            </button>
          </>
        )}

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-500">
            🎯 Crowd Control System
          </p>
        </div>
      </div>
    </div>
  )
}

export default ScanPage

import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import scanService from '../services/scanService'
import areaService from '../services/areaService'

/**
 * ScanPage Component
 * ------------------
 * Apple-inspired clean scan confirmation page.
 * Displays when users scan QR codes for entry/exit.
 */
function ScanPage() {
  const { areaId, type } = useParams()
  const navigate = useNavigate()
  
  const [status, setStatus] = useState('processing')
  const [area, setArea] = useState(null)
  const [message, setMessage] = useState('')
  
  const hasProcessed = useRef(false)

  useEffect(() => {
    const processScan = async () => {
      if (hasProcessed.current) {
        return
      }
      hasProcessed.current = true
      
      try {
        if (type !== 'entry' && type !== 'exit') {
          setStatus('error')
          setMessage('Invalid scan type')
          return
        }

        const areaData = await areaService.getAreaById(areaId)
        setArea(areaData)

        await scanService.registerScan(areaId, type.toUpperCase())

        setStatus('success')
        setMessage(
          type === 'entry' 
            ? 'Entry registered' 
            : 'Exit registered'
        )
      } catch (err) {
        setStatus('error')
        setMessage(err.response?.data?.message || 'Failed to register scan')
      }
    }

    processScan()
  }, [areaId, type])

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-6">
      <div className="bg-white rounded-2xl shadow-xl border border-neutral-200 p-8 w-full max-w-sm text-center">
        {/* Processing State */}
        {status === 'processing' && (
          <>
            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                {type === 'entry' ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 3.75H6.912a2.25 2.25 0 0 0-2.15 1.588L2.35 13.177a2.25 2.25 0 0 0-.1.661V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 0 0-2.15-1.588H15M12 3v8.25m0 0-3-3m3 3 3-3" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 8.25H7.5a2.25 2.25 0 0 0-2.25 2.25v9a2.25 2.25 0 0 0 2.25 2.25h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25H15m0-3-3-3m0 0-3 3m3-3v11.25" />
                )}
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-neutral-900 mb-2 tracking-tight">
              Processing
            </h1>
            <p className="text-sm text-neutral-500 mb-6">
              Registering your {type}...
            </p>
            <div className="w-8 h-8 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin mx-auto"></div>
          </>
        )}

        {/* Success State */}
        {status === 'success' && (
          <>
            <div className={`w-16 h-16 ${type === 'entry' ? 'bg-neutral-900' : 'bg-neutral-200'} rounded-full flex items-center justify-center mx-auto mb-6`}>
              <svg className={`w-8 h-8 ${type === 'entry' ? 'text-white' : 'text-neutral-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-neutral-900 mb-2 tracking-tight">
              {message}
            </h1>
            {area && (
              <div className="mt-4 p-4 bg-neutral-50 rounded-xl">
                <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">Area</p>
                <p className="text-lg font-medium text-neutral-900">{area.name}</p>
                <div className="mt-3 pt-3 border-t border-neutral-200">
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-2xl font-semibold text-neutral-900">
                      {area.currentCount + (type === 'entry' ? 1 : -1)}
                    </span>
                    <span className="text-neutral-400">/</span>
                    <span className="text-neutral-500">{area.capacity}</span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-1">Current occupancy</p>
                </div>
              </div>
            )}
            <p className="mt-6 text-sm text-neutral-500">
              {type === 'entry' ? 'Welcome!' : 'Thank you for visiting.'}
            </p>
          </>
        )}

        {/* Error State */}
        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-neutral-900 mb-2 tracking-tight">
              Scan Failed
            </h1>
            <p className="text-sm text-neutral-500 mb-6">{message}</p>
            <button
              onClick={() => window.location.reload()}
              className="btn btn-primary w-full"
            >
              Try Again
            </button>
          </>
        )}

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-neutral-100">
          <div className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 bg-black rounded flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
            </div>
            <span className="text-xs text-neutral-400">EventFlow</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ScanPage

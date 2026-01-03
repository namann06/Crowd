import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import areaService from '../services/areaService'
import AreaCard from '../components/AreaCard'
import Modal from '../components/Modal'
import LoadingSpinner from '../components/LoadingSpinner'

/**
 * Areas Page
 * ----------
 * Apple-inspired minimalist area management interface.
 */
function Areas() {
  const navigate = useNavigate()
  const [areas, setAreas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Modal states
  const [showFormModal, setShowFormModal] = useState(false)
  const [showQRModal, setShowQRModal] = useState(false)
  const [selectedArea, setSelectedArea] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    capacity: '',
    threshold: ''
  })
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

  // Fetch all areas
  const fetchAreas = async () => {
    try {
      const data = await areaService.getAllAreas()
      setAreas(data)
      setError(null)
    } catch (err) {
      setError('Failed to fetch areas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAreas()
  }, [])

  // Open form for creating new area
  const handleCreate = () => {
    setSelectedArea(null)
    setFormData({ name: '', capacity: '', threshold: '' })
    setFormError('')
    setShowFormModal(true)
  }

  // Open form for editing area
  const handleEdit = (area) => {
    setSelectedArea(area)
    setFormData({
      name: area.name,
      capacity: area.capacity.toString(),
      threshold: area.threshold.toString()
    })
    setFormError('')
    setShowFormModal(true)
  }

  // Delete area
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this area?')) return
    
    try {
      await areaService.deleteArea(id)
      await fetchAreas()
    } catch (err) {
      alert('Failed to delete area')
    }
  }

  // View QR codes for area
  const handleViewQR = (area) => {
    setSelectedArea(area)
    setShowQRModal(true)
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')
    setSaving(true)

    const capacity = parseInt(formData.capacity)
    const threshold = parseInt(formData.threshold)

    // Validation
    if (!formData.name.trim()) {
      setFormError('Area name is required')
      setSaving(false)
      return
    }
    if (threshold > capacity) {
      setFormError('Threshold cannot exceed capacity')
      setSaving(false)
      return
    }

    try {
      const areaData = {
        name: formData.name.trim(),
        capacity,
        threshold
      }

      if (selectedArea) {
        await areaService.updateArea(selectedArea.id, areaData)
      } else {
        await areaService.createArea(areaData)
      }

      setShowFormModal(false)
      await fetchAreas()
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save area')
    } finally {
      setSaving(false)
    }
  }

  // Generate QR code URL
  const getQRCodeUrl = (areaId, type) => {
    const baseUrl = window.location.origin
    const scanUrl = `${baseUrl}/scan/${areaId}/${type}`
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(scanUrl)}`
  }

  if (loading) {
    return <LoadingSpinner text="Loading areas..." />
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 tracking-tight">Areas</h1>
          <p className="text-sm text-neutral-500 mt-1">Manage monitored locations</p>
        </div>
        <button onClick={handleCreate} className="btn btn-primary">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Area
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-neutral-100 border border-neutral-200 text-neutral-700 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Areas Grid */}
      {areas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 card">
          <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z" />
            </svg>
          </div>
          <p className="text-neutral-500 mb-4">No areas configured yet</p>
          <button onClick={handleCreate} className="btn btn-primary">
            Create First Area
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {areas.map((area) => (
            <AreaCard
              key={area.id}
              area={area}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onViewQR={handleViewQR}
            />
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        title={selectedArea ? 'Edit Area' : 'New Area'}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {formError && (
            <div className="bg-neutral-100 border border-neutral-200 text-neutral-700 px-4 py-3 rounded-xl text-sm">
              {formError}
            </div>
          )}

          <div>
            <label className="label">Area Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input"
              placeholder="e.g., Main Entrance"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Capacity</label>
              <input
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                className="input"
                placeholder="100"
                min="1"
                required
              />
            </div>
            <div>
              <label className="label">Threshold</label>
              <input
                type="number"
                value={formData.threshold}
                onChange={(e) => setFormData({ ...formData, threshold: e.target.value })}
                className="input"
                placeholder="80"
                min="1"
                required
              />
              <p className="text-xs text-neutral-400 mt-1.5">Warning trigger level</p>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowFormModal(false)}
              className="flex-1 btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 btn btn-primary disabled:opacity-50"
            >
              {saving ? 'Saving...' : selectedArea ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

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

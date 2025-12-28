import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import areaService from '../services/areaService'
import AreaCard from '../components/AreaCard'
import Modal from '../components/Modal'
import LoadingSpinner from '../components/LoadingSpinner'

/**
 * Areas Page
 * ----------
 * Manage all monitored areas:
 * - View all areas with status
 * - Create new area
 * - Edit existing area
 * - Delete area
 * - View QR codes for entry/exit
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
        // Update existing area
        await areaService.updateArea(selectedArea.id, areaData)
      } else {
        // Create new area
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

  // Generate QR code URL (we'll use a simple service)
  // Use network IP so QR codes work when scanned from other devices
  const getQRCodeUrl = (areaId, type) => {
    // Use the current host - when accessed via IP, QR will have that IP
    const baseUrl = window.location.origin
    const scanUrl = `${baseUrl}/scan/${areaId}/${type}`
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(scanUrl)}`
  }

  if (loading) {
    return <LoadingSpinner text="Loading areas..." />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Areas Management</h1>
        <button onClick={handleCreate} className="btn btn-primary">
          + Add New Area
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Areas Grid */}
      {areas.length === 0 ? (
        <div className="text-center py-12 card">
          <p className="text-gray-500 mb-4">No areas configured yet.</p>
          <button onClick={handleCreate} className="btn btn-primary">
            Create First Area
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        title={selectedArea ? 'Edit Area' : 'Create New Area'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
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
                placeholder="e.g., 100"
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
                placeholder="e.g., 80"
                min="1"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Warning level</p>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
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
        title={`QR Codes - ${selectedArea?.name}`}
      >
        {selectedArea && (
          <div className="space-y-6">
            <p className="text-sm text-gray-600">
              Print these QR codes and place them at entry and exit points.
              Users scan these to register their entry/exit.
            </p>

            <div className="grid grid-cols-2 gap-6">
              {/* Entry QR */}
              <div className="text-center">
                <h4 className="font-semibold text-green-700 mb-2">📥 Entry</h4>
                <img
                  src={getQRCodeUrl(selectedArea.id, 'entry')}
                  alt="Entry QR Code"
                  className="mx-auto border-4 border-green-500 rounded-lg"
                />
                <p className="text-xs text-gray-500 mt-2">Scan on entry</p>
              </div>

              {/* Exit QR */}
              <div className="text-center">
                <h4 className="font-semibold text-red-700 mb-2">📤 Exit</h4>
                <img
                  src={getQRCodeUrl(selectedArea.id, 'exit')}
                  alt="Exit QR Code"
                  className="mx-auto border-4 border-red-500 rounded-lg"
                />
                <p className="text-xs text-gray-500 mt-2">Scan on exit</p>
              </div>
            </div>

            <div className="pt-4 border-t">
              <button
                onClick={() => setShowQRModal(false)}
                className="w-full btn btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default Areas

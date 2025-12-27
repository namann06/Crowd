/**
 * AreaCard Component
 * ------------------
 * Displays an area's status in a card format.
 * Shows: name, current count, capacity, status badge, and progress bar.
 */
import StatusBadge from './StatusBadge'

function AreaCard({ area, onEdit, onDelete, onViewQR }) {
  // Calculate occupancy percentage
  const occupancy = area.capacity > 0 
    ? Math.round((area.currentCount / area.capacity) * 100) 
    : 0

  // Determine progress bar color
  const getProgressColor = () => {
    if (area.currentCount >= area.capacity) return 'bg-red-500'
    if (area.currentCount >= area.threshold) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  return (
    <div className="card hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{area.name}</h3>
          <p className="text-sm text-gray-500">ID: {area.id}</p>
        </div>
        <StatusBadge status={area.status} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">{area.currentCount}</p>
          <p className="text-xs text-gray-500">Current</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-yellow-600">{area.threshold}</p>
          <p className="text-xs text-gray-500">Threshold</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-600">{area.capacity}</p>
          <p className="text-xs text-gray-500">Capacity</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600">Occupancy</span>
          <span className="font-medium">{occupancy}%</span>
        </div>
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full ${getProgressColor()} transition-all duration-500`}
            style={{ width: `${Math.min(occupancy, 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-4 border-t border-gray-100">
        <button
          onClick={() => onViewQR && onViewQR(area)}
          className="flex-1 btn btn-secondary text-sm"
        >
          📱 QR Codes
        </button>
        <button
          onClick={() => onEdit && onEdit(area)}
          className="flex-1 btn btn-primary text-sm"
        >
          ✏️ Edit
        </button>
        <button
          onClick={() => onDelete && onDelete(area.id)}
          className="btn btn-danger text-sm"
        >
          🗑️
        </button>
      </div>
    </div>
  )
}

export default AreaCard

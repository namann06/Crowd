/**
 * AreaCard Component
 * ------------------
 * Apple-inspired minimalist area card.
 * Clean typography, subtle borders, monochrome palette.
 */
import StatusBadge from './StatusBadge'

function AreaCard({ area, onEdit, onDelete, onViewQR }) {
  // Calculate occupancy percentage
  const occupancy = area.capacity > 0 
    ? Math.round((area.currentCount / area.capacity) * 100) 
    : 0

  // Determine progress bar class
  const getProgressClass = () => {
    if (area.currentCount >= area.capacity) return 'critical'
    if (area.currentCount >= area.threshold) return 'warning'
    return ''
  }

  return (
    <div className="card group">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="text-base font-semibold text-neutral-900 tracking-tight">{area.name}</h3>
          <p className="text-xs text-neutral-400 mt-0.5">ID: {area.id}</p>
        </div>
        <StatusBadge status={area.status} size="small" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="text-center py-3 bg-neutral-50 rounded-lg">
          <p className="text-xl font-semibold text-neutral-900 tracking-tight">{area.currentCount}</p>
          <p className="text-[10px] uppercase tracking-wider text-neutral-500 mt-0.5">Current</p>
        </div>
        <div className="text-center py-3 bg-neutral-50 rounded-lg">
          <p className="text-xl font-semibold text-neutral-600 tracking-tight">{area.threshold}</p>
          <p className="text-[10px] uppercase tracking-wider text-neutral-500 mt-0.5">Threshold</p>
        </div>
        <div className="text-center py-3 bg-neutral-50 rounded-lg">
          <p className="text-xl font-semibold text-neutral-400 tracking-tight">{area.capacity}</p>
          <p className="text-[10px] uppercase tracking-wider text-neutral-500 mt-0.5">Capacity</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-5">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-neutral-500">Occupancy</span>
          <span className="text-xs font-medium text-neutral-900">{occupancy}%</span>
        </div>
        <div className="progress-bar">
          <div
            className={`progress-bar-fill ${getProgressClass()}`}
            style={{ width: `${Math.min(occupancy, 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-4 border-t border-neutral-100">
        <button
          onClick={() => onViewQR && onViewQR(area)}
          className="flex-1 btn btn-secondary text-xs"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75ZM6.75 16.5h.75v.75h-.75v-.75ZM16.5 6.75h.75v.75h-.75v-.75ZM13.5 13.5h.75v.75h-.75v-.75ZM13.5 19.5h.75v.75h-.75v-.75ZM19.5 13.5h.75v.75h-.75v-.75ZM19.5 19.5h.75v.75h-.75v-.75ZM16.5 16.5h.75v.75h-.75v-.75Z" />
          </svg>
          QR
        </button>
        <button
          onClick={() => onEdit && onEdit(area)}
          className="flex-1 btn btn-primary text-xs"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
          </svg>
          Edit
        </button>
        <button
          onClick={() => onDelete && onDelete(area.id)}
          className="btn btn-ghost text-xs px-3"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default AreaCard

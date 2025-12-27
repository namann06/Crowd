/**
 * StatusBadge Component
 * ---------------------
 * Displays a colored badge based on crowd status.
 * GREEN: Safe (below threshold)
 * YELLOW: Warning (at/above threshold)
 * RED: Critical (at/above capacity)
 */
function StatusBadge({ status }) {
  const statusStyles = {
    GREEN: 'bg-green-100 text-green-800 border-green-500',
    YELLOW: 'bg-yellow-100 text-yellow-800 border-yellow-500',
    RED: 'bg-red-100 text-red-800 border-red-500 animate-pulse',
  }

  const statusLabels = {
    GREEN: 'Safe',
    YELLOW: 'Warning',
    RED: 'Critical',
  }

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${
        statusStyles[status] || statusStyles.GREEN
      }`}
    >
      <span className={`w-2 h-2 rounded-full mr-2 ${
        status === 'GREEN' ? 'bg-green-500' :
        status === 'YELLOW' ? 'bg-yellow-500' :
        'bg-red-500'
      }`}></span>
      {statusLabels[status] || 'Unknown'}
    </span>
  )
}

export default StatusBadge

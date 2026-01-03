/**
 * StatusBadge Component
 * ---------------------
 * Apple-inspired monochrome status badges.
 * Uses grayscale palette for clean, professional look.
 */
function StatusBadge({ status, size = 'default' }) {
  const statusStyles = {
    GREEN: 'bg-neutral-100 text-neutral-700',
    YELLOW: 'bg-neutral-200 text-neutral-800',
    RED: 'bg-neutral-900 text-white',
  }

  const statusLabels = {
    GREEN: 'Safe',
    YELLOW: 'Warning',
    RED: 'Critical',
  }

  const dotStyles = {
    GREEN: 'bg-neutral-400',
    YELLOW: 'bg-neutral-500',
    RED: 'bg-white',
  }

  const sizeClasses = size === 'small' 
    ? 'px-2 py-0.5 text-xs' 
    : 'px-2.5 py-1 text-xs'

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium tracking-tight ${
        sizeClasses
      } ${
        statusStyles[status] || statusStyles.GREEN
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${
        dotStyles[status] || dotStyles.GREEN
      }`}></span>
      {statusLabels[status] || 'Unknown'}
    </span>
  )
}

export default StatusBadge

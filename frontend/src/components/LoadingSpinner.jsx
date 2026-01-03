/**
 * LoadingSpinner Component
 * ------------------------
 * Minimalist Apple-style loading indicator.
 */
function LoadingSpinner({ size = 'md', text = 'Loading...' }) {
  const sizes = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-[3px]',
  }

  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div
        className={`${sizes[size]} border-neutral-200 border-t-neutral-900 rounded-full animate-spin`}
      ></div>
      {text && (
        <p className="mt-4 text-sm text-neutral-500 tracking-tight">{text}</p>
      )}
    </div>
  )
}

export default LoadingSpinner

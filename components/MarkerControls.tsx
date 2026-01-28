'use client'

interface MarkerControlsProps {
  hasEntry: boolean
  hasExit: boolean
  isPlacingEntry: boolean
  isPlacingExit: boolean
  onStartPlacingEntry: () => void
  onStartPlacingExit: () => void
  onCancelPlacing: () => void
  onClearAll: () => void
  disabled?: boolean
}

export default function MarkerControls({
  hasEntry,
  hasExit,
  isPlacingEntry,
  isPlacingExit,
  onStartPlacingEntry,
  onStartPlacingExit,
  onCancelPlacing,
  onClearAll,
  disabled = false,
}: MarkerControlsProps) {
  const handleEntryClick = () => {
    if (isPlacingEntry) {
      onCancelPlacing()
    } else if (hasEntry) {
      // If marker exists, clicking again could remove it or start replacing
      onStartPlacingEntry()
    } else {
      onStartPlacingEntry()
    }
  }

  const handleExitClick = () => {
    if (isPlacingExit) {
      onCancelPlacing()
    } else if (hasExit) {
      onStartPlacingExit()
    } else {
      onStartPlacingExit()
    }
  }

  return (
    <div className="flex items-center gap-2">
      {/* Mark Entry Button */}
      <button
        onClick={handleEntryClick}
        disabled={disabled}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg
          font-medium text-sm
          transition-all
          disabled:opacity-50 disabled:cursor-not-allowed
          ${isPlacingEntry
            ? 'bg-green-600 text-white animate-pulse'
            : hasEntry
              ? 'bg-green-600/20 text-green-400 border border-green-600'
              : 'bg-zinc-800 text-zinc-300 border border-zinc-700 hover:border-green-600 hover:text-green-400'
          }
        `}
        title={isPlacingEntry ? 'Click chart to place entry (or click to cancel)' : 'Mark Entry'}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
          <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clipRule="evenodd" />
        </svg>
        {isPlacingEntry ? 'Click Chart...' : hasEntry ? 'Entry Set' : 'Mark Entry'}
        {hasEntry && !isPlacingEntry && (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
          </svg>
        )}
      </button>

      {/* Mark Exit Button */}
      <button
        onClick={handleExitClick}
        disabled={disabled}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg
          font-medium text-sm
          transition-all
          disabled:opacity-50 disabled:cursor-not-allowed
          ${isPlacingExit
            ? 'bg-red-600 text-white animate-pulse'
            : hasExit
              ? 'bg-red-600/20 text-red-400 border border-red-600'
              : 'bg-zinc-800 text-zinc-300 border border-zinc-700 hover:border-red-600 hover:text-red-400'
          }
        `}
        title={isPlacingExit ? 'Click chart to place exit (or click to cancel)' : 'Mark Exit'}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
        </svg>
        {isPlacingExit ? 'Click Chart...' : hasExit ? 'Exit Set' : 'Mark Exit'}
        {hasExit && !isPlacingExit && (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
          </svg>
        )}
      </button>

      {/* Reset Button - only show when at least one marker is placed */}
      {(hasEntry || hasExit) && (
        <button
          onClick={onClearAll}
          disabled={disabled}
          className="
            flex items-center gap-2 px-3 py-2 rounded-lg
            bg-zinc-800 text-zinc-400
            hover:bg-zinc-700 hover:text-zinc-300
            font-medium text-sm
            transition-colors
            disabled:opacity-50 disabled:cursor-not-allowed
          "
          title="Reset Markers"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H3.989a.75.75 0 00-.75.75v4.242a.75.75 0 001.5 0v-2.43l.31.31a7 7 0 0011.712-3.138.75.75 0 00-1.449-.39zm1.23-3.723a.75.75 0 00.219-.53V2.929a.75.75 0 00-1.5 0V5.36l-.31-.31A7 7 0 003.239 8.188a.75.75 0 101.448.389A5.5 5.5 0 0113.89 6.11l.311.31h-2.432a.75.75 0 000 1.5h4.243a.75.75 0 00.53-.219z" clipRule="evenodd" />
          </svg>
          Reset
        </button>
      )}
    </div>
  )
}

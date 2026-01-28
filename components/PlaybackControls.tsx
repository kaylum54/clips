'use client'

interface PlaybackControlsProps {
  isPlaying: boolean
  onPlay: () => void
  onPause: () => void
  onStepForward: () => void
  onStepBackward: () => void
  onJumpToStart: () => void
  onJumpToEnd: () => void
  disabled?: boolean
  atStart: boolean
  atEnd: boolean
}

export default function PlaybackControls({
  isPlaying,
  onPlay,
  onPause,
  onStepForward,
  onStepBackward,
  onJumpToStart,
  onJumpToEnd,
  disabled = false,
  atStart,
  atEnd,
}: PlaybackControlsProps) {
  const buttonClass = `
    p-2 rounded-lg
    bg-zinc-800 hover:bg-zinc-700
    text-zinc-300 hover:text-white
    disabled:opacity-50 disabled:cursor-not-allowed
    transition-colors
  `

  return (
    <div className="flex items-center gap-1">
      {/* Jump to Start */}
      <button
        onClick={onJumpToStart}
        disabled={disabled || atStart}
        className={buttonClass}
        title="Jump to Start (Home)"
        aria-label="Jump to start"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path d="M9.195 18.44c1.25.713 2.805-.19 2.805-1.629v-2.34l6.945 3.968c1.25.714 2.805-.188 2.805-1.628V8.688c0-1.44-1.555-2.342-2.805-1.628L12 11.03v-2.34c0-1.44-1.555-2.343-2.805-1.629l-7.108 4.062c-1.26.72-1.26 2.536 0 3.256l7.108 4.061z" />
        </svg>
      </button>

      {/* Step Backward */}
      <button
        onClick={onStepBackward}
        disabled={disabled || atStart}
        className={buttonClass}
        title="Step Back (Left Arrow)"
        aria-label="Step backward"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path d="M9.195 18.44c1.25.713 2.805-.19 2.805-1.629V8.688c0-1.44-1.555-2.342-2.805-1.628l-7.108 4.061c-1.26.72-1.26 2.536 0 3.256l7.108 4.063zM21.75 8.688v6.624c0 1.44-1.555 2.342-2.805 1.628l-7.108-4.061c-1.26-.72-1.26-2.536 0-3.256l7.108-4.061c1.25-.714 2.805.188 2.805 1.626z" />
        </svg>
      </button>

      {/* Play/Pause */}
      <button
        onClick={isPlaying ? onPause : onPlay}
        disabled={disabled}
        className={`
          p-3 rounded-lg
          bg-green-600 hover:bg-green-700
          text-white
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors
        `}
        title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
            <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0A.75.75 0 0115 4.5h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75V5.25z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
            <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
          </svg>
        )}
      </button>

      {/* Step Forward */}
      <button
        onClick={onStepForward}
        disabled={disabled || atEnd}
        className={buttonClass}
        title="Step Forward (Right Arrow)"
        aria-label="Step forward"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path d="M5.055 7.06c-1.25-.714-2.805.189-2.805 1.628v6.624c0 1.44 1.555 2.342 2.805 1.628l7.108-4.061c1.26-.72 1.26-2.536 0-3.256L5.055 7.06zm9.195 0c-1.25-.714-2.805.189-2.805 1.628v6.624c0 1.44 1.555 2.342 2.805 1.628l7.108-4.061c1.26-.72 1.26-2.536 0-3.256l-7.108-4.063z" />
        </svg>
      </button>

      {/* Jump to End */}
      <button
        onClick={onJumpToEnd}
        disabled={disabled || atEnd}
        className={buttonClass}
        title="Jump to End (End)"
        aria-label="Jump to end"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path d="M5.055 7.06c-1.25-.714-2.805.189-2.805 1.628v6.624c0 1.44 1.555 2.342 2.805 1.628l7.108-4.061v2.34c0 1.44 1.555 2.342 2.805 1.628l7.108-4.061c1.26-.72 1.26-2.536 0-3.256l-7.108-4.062c-1.25-.714-2.805.189-2.805 1.628v2.34L5.055 7.06z" />
        </svg>
      </button>
    </div>
  )
}

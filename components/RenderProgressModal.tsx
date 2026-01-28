'use client'

import type { RenderStatus } from '@/hooks/useRenderJob'

interface RenderProgressModalProps {
  isOpen: boolean
  status: RenderStatus
  progress: number
  position: number | null
  estimatedWaitSeconds: number | null
  downloadReady: boolean
  error: string | null
  canRetry: boolean
  onClose: () => void
  onDownload: () => void
  onRetry: () => void
}

export function RenderProgressModal({
  isOpen,
  status,
  progress,
  position,
  estimatedWaitSeconds,
  downloadReady,
  error,
  canRetry,
  onClose,
  onDownload,
  onRetry,
}: RenderProgressModalProps) {
  if (!isOpen) return null

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds} seconds`
    const minutes = Math.ceil(seconds / 60)
    return `${minutes} minute${minutes > 1 ? 's' : ''}`
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={status === 'completed' || status === 'failed' ? onClose : undefined}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-gradient-to-b from-[#141414] to-[#111111] border border-[#1f1f1f] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] max-w-md w-full p-6">

          {/* Starting */}
          {status === 'starting' && (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/10 flex items-center justify-center">
                <svg className="w-8 h-8 text-green-500 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Starting Render</h3>
              <p className="text-[#71717a]">Adding your video to the queue...</p>
            </div>
          )}

          {/* Pending (Queued) */}
          {status === 'pending' && (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-500/10 flex items-center justify-center">
                <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Queued for Rendering</h3>
              {position && position > 0 ? (
                <p className="text-[#71717a] mb-2">
                  Your video is <span className="text-yellow-400 font-medium">#{position}</span> in the queue
                </p>
              ) : (
                <p className="text-[#71717a] mb-2">Starting soon...</p>
              )}
              {estimatedWaitSeconds && estimatedWaitSeconds > 0 && (
                <p className="text-sm text-[#52525b]">
                  Estimated wait: ~{formatTime(estimatedWaitSeconds)}
                </p>
              )}
              <p className="text-xs text-[#52525b] mt-4">
                You can close this and come back - your video will keep processing.
              </p>
            </div>
          )}

          {/* Processing */}
          {status === 'processing' && (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/10 flex items-center justify-center">
                <svg className="w-8 h-8 text-green-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Rendering Video</h3>

              {/* Progress bar */}
              <div className="w-full h-3 bg-[#1f1f1f] rounded-full overflow-hidden mb-2">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-lg font-semibold text-green-400">{progress}%</p>

              <p className="text-xs text-[#52525b] mt-4">
                This may take 30-60 seconds depending on video length.
              </p>
            </div>
          )}

          {/* Completed */}
          {status === 'completed' && (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/10 flex items-center justify-center">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Video Ready!</h3>
              <p className="text-[#71717a] mb-6">Your trade replay has been rendered successfully.</p>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-3 bg-[#1f1f1f] hover:bg-[#2a2a2a] text-white rounded-lg transition-colors"
                >
                  Close
                </button>
                {downloadReady && (
                  <button
                    onClick={onDownload}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-black font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Failed */}
          {status === 'failed' && (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Render Failed</h3>
              <p className="text-red-400 mb-6">{error || 'An unexpected error occurred.'}</p>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-3 bg-[#1f1f1f] hover:bg-[#2a2a2a] text-white rounded-lg transition-colors"
                >
                  Close
                </button>
                {canRetry && (
                  <button
                    onClick={onRetry}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-black font-semibold rounded-lg transition-all"
                  >
                    Try Again
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

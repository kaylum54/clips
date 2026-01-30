/**
 * Browser Mockup Component
 * Wraps content in a browser-style frame for hero images
 */

interface BrowserMockupProps {
  children: React.ReactNode
  url?: string
  animatedGlow?: boolean
}

export function BrowserMockup({ children, url = 'clips.app', animatedGlow = false }: BrowserMockupProps) {
  return (
    <div className="relative group">
      {/* Glow effect */}
      <div className={`absolute -inset-1 bg-gradient-to-r from-green-500/20 via-green-500/10 to-green-500/20 rounded-2xl blur-xl ${
        animatedGlow
          ? 'animate-glow-breathe'
          : 'opacity-50 group-hover:opacity-75 transition-opacity'
      }`} />

      {/* Browser frame */}
      <div className="relative bg-[#141414] border border-[#2a2a2a] rounded-xl overflow-hidden shadow-2xl shadow-black/50">
        {/* Browser chrome */}
        <div className="flex items-center gap-2 px-4 py-3 bg-[#1a1a1a] border-b border-[#2a2a2a]">
          {/* Traffic lights */}
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
            <div className="w-3 h-3 rounded-full bg-[#28c840]" />
          </div>

          {/* URL bar */}
          <div className="flex-1 flex justify-center">
            <div className="px-4 py-1 bg-[#0a0a0a] rounded-md text-sm text-gray-500 flex items-center gap-2">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              {url}
            </div>
          </div>

          {/* Spacer for symmetry */}
          <div className="w-[52px]" />
        </div>

        {/* Content area */}
        <div className="relative">
          {children}
        </div>
      </div>
    </div>
  )
}

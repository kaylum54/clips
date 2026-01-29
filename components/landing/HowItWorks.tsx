/**
 * How It Works Section
 * Simple 3-step guide showing how the product works
 */

const steps = [
  {
    number: 1,
    icon: '📋',
    title: 'Paste Your Hashes',
    description: 'Drop in your entry and exit transaction signatures from Phantom or Solscan.',
  },
  {
    number: 2,
    icon: '📍',
    title: 'Watch It Build',
    description: 'Clips pulls the on-chain data and reconstructs the chart with your exact trade marked.',
  },
  {
    number: 3,
    icon: '▶️',
    title: 'Render & Share',
    description: 'Generate a video replay and share it on Twitter, Discord, or anywhere.',
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            From Transaction to Video in Seconds
          </h2>
          <p className="text-[#a1a1aa] max-w-xl mx-auto">
            No screen recording. No video editing. Just paste, mark, and play.
          </p>
        </div>

        {/* Steps */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 max-w-4xl mx-auto">
          {steps.map((step, index) => (
            <div key={step.number} className="flex flex-col items-center">
              {/* Step card */}
              <div className="relative group w-full md:w-[280px]">
                <div className="bg-gradient-to-b from-[#111111] to-[#0a0a0a] border border-[#1f1f1f] rounded-2xl p-8 text-center transition-all duration-300 hover:border-green-500/30 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/30">
                  {/* Step number */}
                  <div className="w-10 h-10 bg-green-500/10 border border-green-500/30 rounded-full flex items-center justify-center text-green-500 font-semibold mx-auto mb-4">
                    {step.number}
                  </div>

                  {/* Icon */}
                  <div className="text-4xl mb-4">
                    {step.icon}
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-[#a1a1aa] leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>

              {/* Connector arrow (hidden on mobile, hidden after last item) */}
              {index < steps.length - 1 && (
                <div className="hidden md:flex items-center justify-center w-8 h-8 text-[#3a3a3a] absolute right-0 top-1/2 -translate-y-1/2 translate-x-full">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Connector arrows for desktop - positioned between cards */}
        <div className="hidden md:flex items-center justify-center gap-[232px] -mt-[140px] mb-[100px] pointer-events-none">
          <svg className="w-6 h-6 text-[#3a3a3a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <svg className="w-6 h-6 text-[#3a3a3a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </section>
  )
}

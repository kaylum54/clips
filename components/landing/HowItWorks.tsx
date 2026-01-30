'use client'

/**
 * How It Works Section
 * 3-step guide with glowing connections and animated entrance
 */

import { ClipboardCopy, LineChart, Play } from 'lucide-react'
import { motion } from 'motion/react'

interface StepCardProps {
  number: number
  icon: React.ReactNode
  title: string
  description: string
  delay: number
}

function StepCard({ number, icon, title, description, delay }: StepCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="relative group"
    >
      <div className="bg-gradient-to-b from-[#111111]/80 to-[#0a0a0a] border border-[#1f1f1f] rounded-2xl p-8 text-center transition-all duration-300 hover:border-green-500/30 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4),0_0_40px_rgba(34,197,94,0.1)]">
        {/* Step number */}
        <div className="w-8 h-8 rounded-full bg-green-500/10 border-2 border-green-500 text-green-500 font-bold text-sm flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(34,197,94,0.3)]">
          {number}
        </div>

        {/* Icon */}
        <div className="text-green-500 mb-4 flex justify-center">
          <div className="w-12 h-12">
            {icon}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-semibold text-white mb-3">{title}</h3>

        {/* Description */}
        <p className="text-[#a1a1aa] text-sm leading-relaxed">{description}</p>
      </div>
    </motion.div>
  )
}

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-[#0a0a0a] relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-green-500/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            From Transaction to Video in Seconds
          </h2>
          <p className="text-[#a1a1aa] text-lg max-w-xl mx-auto">
            No screen recording. No video editing. Just paste and go.
          </p>
        </motion.div>

        {/* Steps with connections */}
        <div className="relative max-w-5xl mx-auto">
          {/* Connection line (desktop only) */}
          <div className="absolute top-1/2 left-[16%] right-[16%] h-[2px] -translate-y-1/2 hidden md:block">
            <div
              className="w-full h-full animate-flow-line"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(34,197,94,0.5) 20%, #22c55e 50%, rgba(34,197,94,0.5) 80%, transparent 100%)',
                backgroundSize: '200% 100%',
              }}
            />
          </div>

          {/* Cards */}
          <div className="grid md:grid-cols-3 gap-8 relative z-10">
            <StepCard
              number={1}
              icon={<ClipboardCopy className="w-12 h-12" strokeWidth={1.5} />}
              title="Paste Your Hashes"
              description="Grab your buy and sell transaction signatures from Solscan or Phantom."
              delay={0.1}
            />
            <StepCard
              number={2}
              icon={<LineChart className="w-12 h-12" strokeWidth={1.5} />}
              title="Watch It Build"
              description="Clips pulls on-chain data and reconstructs the chart with your exact trade marked."
              delay={0.2}
            />
            <StepCard
              number={3}
              icon={<Play className="w-12 h-12" strokeWidth={1.5} />}
              title="Render & Share"
              description="Get a clean video of just candlesticks showing your trade. Post it anywhere."
              delay={0.3}
            />
          </div>

        </div>
      </div>
    </section>
  )
}

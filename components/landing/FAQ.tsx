'use client'

/**
 * FAQ Section
 * Frequently asked questions with accordion
 */

import { useState } from 'react'

const faqs = [
  {
    question: 'What tokens does Clips support?',
    answer:
      'Clips supports all SPL tokens on Solana. This includes memecoins, DeFi tokens, and any token traded on Raydium, Jupiter, or other Solana DEXs.',
  },
  {
    question: 'How do I find my transaction hashes?',
    answer:
      'You can find your transaction hashes on any Solana explorer like Solscan or Solana FM. Look for your wallet address, find the buy and sell transactions for your trade, and copy the transaction signatures.',
  },
  {
    question: 'How long does rendering take?',
    answer:
      'Most clips render in under a minute. Pro users get priority in the queue, so your clips render first.',
  },
  {
    question: 'Can I share my clips on Twitter/X?',
    answer:
      'Yes. After downloading your clip, you can share it anywhere -- Twitter, Discord, Telegram. The share button pre-fills a tweet with your P&L.',
  },
  {
    question: 'What happens when I hit my free limit?',
    answer:
      'Free users get 5 renders per month. Once you hit the limit, you can either wait for the next month or upgrade to Pro for unlimited renders.',
  },
  {
    question: 'Can I cancel my Pro subscription?',
    answer:
      "Absolutely. You can cancel anytime from your dashboard. You'll keep Pro access until the end of your billing period.",
  },
  {
    question: 'Is my data secure?',
    answer:
      'We only use your transaction hashes to fetch public on-chain data. We never access your wallet, private keys, or funds. Your data is encrypted and stored securely.',
  },
  {
    question: 'Do I need to be recording my screen during the trade?',
    answer:
      "No -- that's the whole point. Clips works retroactively. Trade first, paste your hashes after, and we reconstruct the chart replay from on-chain data. No setup, no recording software.",
  },
]

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section id="faq" className="py-24 bg-[#0a0a0a]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Questions? Answers.
          </h2>
          <p className="text-gray-400">
            Everything you need to know about Clips.
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-[#141414] border border-[#2a2a2a] rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-[#1a1a1a] transition-colors"
              >
                <span className="font-medium text-white pr-4">{faq.question}</span>
                <svg
                  className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index ? 'max-h-96' : 'max-h-0'
                }`}
              >
                <div className="px-6 pb-5 text-gray-400">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="mt-12 text-center">
          <p className="text-gray-400 mb-4">
            Still have questions?
          </p>
          <a
            href="mailto:support@clips.app"
            className="inline-flex items-center gap-2 text-green-400 hover:text-green-300 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Contact Support
          </a>
        </div>
      </div>
    </section>
  )
}

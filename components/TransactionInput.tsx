'use client'

import { useState, FormEvent } from 'react'
import LoadingSpinner from './LoadingSpinner'
import type { ParsedSwap } from '@/types'

interface TransactionInputProps {
  onSubmit: (entrySwap: ParsedSwap, exitSwap: ParsedSwap) => void
  isLoading: boolean
  error?: string
}

export default function TransactionInput({
  onSubmit,
  isLoading,
  error: externalError,
}: TransactionInputProps) {
  const [entryTx, setEntryTx] = useState('')
  const [exitTx, setExitTx] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showGuide, setShowGuide] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLocalError(null)

    const entry = entryTx.trim()
    const exit = exitTx.trim()

    if (!entry || !exit) {
      setLocalError('Please enter both entry and exit transaction hashes')
      return
    }

    if (entry.length < 80 || entry.length > 90) {
      setLocalError('Entry transaction hash looks invalid (should be ~88 characters)')
      return
    }

    if (exit.length < 80 || exit.length > 90) {
      setLocalError('Exit transaction hash looks invalid (should be ~88 characters)')
      return
    }

    setIsProcessing(true)

    try {
      // Fetch both transactions in parallel
      const [entryRes, exitRes] = await Promise.all([
        fetch(`/api/transaction?signature=${entry}`),
        fetch(`/api/transaction?signature=${exit}`),
      ])

      const entryData = await entryRes.json()
      const exitData = await exitRes.json()

      if (!entryData.success) {
        setLocalError(`Entry transaction error: ${entryData.error}`)
        return
      }

      if (!exitData.success) {
        setLocalError(`Exit transaction error: ${exitData.error}`)
        return
      }

      // Verify both transactions are for the same token
      if (entryData.data.tokenAddress !== exitData.data.tokenAddress) {
        setLocalError('Entry and exit transactions are for different tokens')
        return
      }

      // Verify entry is a buy and exit is a sell
      if (entryData.data.type !== 'buy') {
        setLocalError('Entry transaction should be a buy (you bought the token)')
        return
      }

      if (exitData.data.type !== 'sell') {
        setLocalError('Exit transaction should be a sell (you sold the token)')
        return
      }

      // Verify entry is before exit
      if (entryData.data.timestamp >= exitData.data.timestamp) {
        setLocalError('Entry transaction should be before exit transaction')
        return
      }

      onSubmit(entryData.data, exitData.data)
    } catch (err) {
      setLocalError('Failed to fetch transactions')
    } finally {
      setIsProcessing(false)
    }
  }

  const displayError = localError || externalError
  const loading = isLoading || isProcessing

  return (
    <div className="w-full space-y-4">
      {/* Guide Toggle */}
      <button
        type="button"
        onClick={() => setShowGuide(!showGuide)}
        className="text-sm text-[#71717a] hover:text-white flex items-center gap-2 transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-4 h-4"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.94 6.94a.75.75 0 11-1.061-1.061 3 3 0 112.871 5.026v.345a.75.75 0 01-1.5 0v-.5c0-.72.57-1.172 1.081-1.287A1.5 1.5 0 108.94 6.94zM10 15a1 1 0 100-2 1 1 0 000 2z"
            clipRule="evenodd"
          />
        </svg>
        {showGuide ? 'Hide guide' : 'How to find transaction hashes'}
      </button>

      {/* Guide Content */}
      {showGuide && (
        <div className="p-4 bg-[#0d0d0d] rounded-lg text-sm space-y-3 border border-[#1f1f1f]">
          <h3 className="font-semibold text-white">Finding your transaction hashes:</h3>

          <div className="space-y-2 text-[#a1a1aa]">
            <p><span className="text-green-400 font-medium">Entry (Buy):</span> The transaction where you bought the token</p>
            <p><span className="text-red-400 font-medium">Exit (Sell):</span> The transaction where you sold the token</p>
          </div>

          <div className="pt-2 border-t border-[#1f1f1f]">
            <p className="font-medium text-white mb-2">From Phantom Wallet:</p>
            <ol className="list-decimal list-inside space-y-1 text-[#71717a]">
              <li>Open Phantom → Click the clock icon (Activity)</li>
              <li>Find your swap transaction</li>
              <li>Click it → Click "View on Solscan"</li>
              <li>Copy the "Signature" from the top of the page</li>
            </ol>
          </div>

          <div className="pt-2 border-t border-[#1f1f1f]">
            <p className="font-medium text-white mb-2">From Solscan directly:</p>
            <ol className="list-decimal list-inside space-y-1 text-[#71717a]">
              <li>Go to solscan.io</li>
              <li>Search your wallet address</li>
              <li>Click "Transactions" tab</li>
              <li>Find your swap → Copy the signature</li>
            </ol>
          </div>

          <p className="text-xs text-[#52525b] pt-2">
            Transaction hashes are ~88 characters long and look like: 5UfDuX...3kVpJ
          </p>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Entry Transaction */}
        <div>
          <label className="block text-sm font-medium text-green-400 mb-2">
            Entry Transaction (Buy)
          </label>
          <input
            type="text"
            value={entryTx}
            onChange={(e) => {
              setEntryTx(e.target.value)
              setLocalError(null)
            }}
            placeholder="Paste buy transaction hash..."
            disabled={loading}
            className="
              w-full px-4 py-3
              bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg
              text-white placeholder-[#52525b]
              shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]
              focus:outline-none focus:border-green-500/50 focus:shadow-[inset_0_2px_4px_rgba(0,0,0,0.3),0_0_0_3px_rgba(34,197,94,0.1)]
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-200
            "
          />
        </div>

        {/* Exit Transaction */}
        <div>
          <label className="block text-sm font-medium text-red-400 mb-2">
            Exit Transaction (Sell)
          </label>
          <input
            type="text"
            value={exitTx}
            onChange={(e) => {
              setExitTx(e.target.value)
              setLocalError(null)
            }}
            placeholder="Paste sell transaction hash..."
            disabled={loading}
            className="
              w-full px-4 py-3
              bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg
              text-white placeholder-[#52525b]
              shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]
              focus:outline-none focus:border-red-500/50 focus:shadow-[inset_0_2px_4px_rgba(0,0,0,0.3),0_0_0_3px_rgba(239,68,68,0.1)]
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-200
            "
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !entryTx.trim() || !exitTx.trim()}
          className="
            w-full py-3 px-4 rounded-lg
            bg-gradient-to-r from-green-500 to-emerald-500
            hover:from-green-400 hover:to-emerald-400
            text-black font-semibold
            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-green-500 disabled:hover:to-emerald-500
            transition-all duration-200
            hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(34,197,94,0.4)]
            flex items-center justify-center gap-2
          "
        >
          {loading ? (
            <>
              <LoadingSpinner size="sm" />
              <span>Loading trade...</span>
            </>
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-5 h-5"
              >
                <path
                  fillRule="evenodd"
                  d="M2 10a8 8 0 1116 0 8 8 0 01-16 0zm6.39-2.908a.75.75 0 01.766.027l3.5 2.25a.75.75 0 010 1.262l-3.5 2.25A.75.75 0 018 12.25v-4.5a.75.75 0 01.39-.658z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Load Trade Replay</span>
            </>
          )}
        </button>
      </form>

      {/* Error Display */}
      {displayError && (
        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-lg">
          {displayError}
        </p>
      )}
    </div>
  )
}

'use client'

import { useState, useEffect, useRef, FormEvent, ChangeEvent } from 'react'
import { getAddressError, sanitizeAddress, isTransactionSignature } from '@/lib/validation'
import LoadingSpinner from './LoadingSpinner'
import type { ParsedSwap } from '@/types'

interface AddressInputProps {
  onSubmit: (address: string) => void
  onTransactionSubmit: (swap: ParsedSwap) => void
  isLoading: boolean
  error?: string
}

export default function AddressInput({
  onSubmit,
  onTransactionSubmit,
  isLoading,
  error: externalError
}: AddressInputProps) {
  const [value, setValue] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)
  const [isParsingTx, setIsParsingTx] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-focus on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Clear local error when typing
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value)
    setLocalError(null)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    const input = sanitizeAddress(value)

    // Check if it's a transaction signature
    if (isTransactionSignature(input)) {
      setIsParsingTx(true)
      setLocalError(null)

      try {
        const response = await fetch(`/api/transaction?signature=${input}`)
        const data = await response.json()

        if (!data.success) {
          setLocalError(data.error || 'Failed to parse transaction')
          return
        }

        onTransactionSubmit(data.data)
      } catch (err) {
        setLocalError('Failed to fetch transaction')
      } finally {
        setIsParsingTx(false)
      }
      return
    }

    // Otherwise treat as token address
    const validationError = getAddressError(input)

    if (validationError) {
      setLocalError(validationError)
      return
    }

    onSubmit(input)
  }

  const displayError = localError || externalError
  const loading = isLoading || isParsingTx

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleChange}
          placeholder="Paste token address or transaction signature..."
          disabled={loading}
          className={`
            w-full px-4 py-3 pr-12
            bg-zinc-900 border rounded-lg
            text-white placeholder-zinc-500
            focus:outline-none focus:ring-2 focus:border-transparent
            transition-colors
            disabled:opacity-50 disabled:cursor-not-allowed
            ${displayError
              ? 'border-red-500 focus:ring-red-500'
              : 'border-zinc-700 focus:ring-green-500'
            }
          `}
        />
        <button
          type="submit"
          disabled={loading || !value.trim()}
          className="
            absolute right-2 top-1/2 -translate-y-1/2
            p-2 rounded-md
            bg-zinc-800 hover:bg-zinc-700
            text-zinc-400 hover:text-white
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors
          "
          aria-label="Load chart"
        >
          {loading ? (
            <LoadingSpinner size="sm" />
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path
                fillRule="evenodd"
                d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </button>
      </div>
      {isParsingTx && (
        <p className="mt-2 text-sm text-zinc-400">Parsing transaction...</p>
      )}
      {displayError && (
        <p className="mt-2 text-sm text-red-500">{displayError}</p>
      )}
    </form>
  )
}

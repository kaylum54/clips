/**
 * Formats a price for display
 * Handles very small memecoin prices with many decimal places
 */
export function formatPrice(price: number): string {
  if (price === 0) return '$0'

  // For very small prices, show up to 10 decimal places
  if (price < 0.00001) {
    // Count leading zeros after decimal
    const str = price.toFixed(20)
    const match = str.match(/^0\.(0*)/)
    const leadingZeros = match ? match[1].length : 0
    const significantDigits = Math.min(4, 10 - leadingZeros)
    return '$' + price.toFixed(leadingZeros + significantDigits)
  }

  // For small prices
  if (price < 0.01) {
    return '$' + price.toFixed(8)
  }

  // For normal prices
  if (price < 1) {
    return '$' + price.toFixed(6)
  }

  // For larger prices
  if (price < 1000) {
    return '$' + price.toFixed(4)
  }

  // For very large prices
  return '$' + price.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

/**
 * Formats a percentage change
 */
export function formatPercent(percent: number): string {
  const sign = percent >= 0 ? '+' : ''
  return `${sign}${percent.toFixed(2)}%`
}

/**
 * Formats a timestamp for display
 */
export function formatTime(timestamp: number): string {
  const date = new Date(timestamp * 1000)
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Formats a timestamp with date and time
 */
export function formatDateTime(timestamp: number): string {
  const date = new Date(timestamp * 1000)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Formats volume for display
 */
export function formatVolume(volume: number): string {
  if (volume >= 1_000_000_000) {
    return (volume / 1_000_000_000).toFixed(2) + 'B'
  }
  if (volume >= 1_000_000) {
    return (volume / 1_000_000).toFixed(2) + 'M'
  }
  if (volume >= 1_000) {
    return (volume / 1_000).toFixed(2) + 'K'
  }
  return volume.toFixed(2)
}

/**
 * Shortens a Solana address for display
 */
export function shortenAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`
}

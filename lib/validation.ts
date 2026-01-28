// Base58 character set for Solana addresses
const BASE58_CHARS = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'

/**
 * Validates a Solana address format
 * - Must be base58 encoded
 * - Length between 32-44 characters
 * - No whitespace
 */
export function isValidSolanaAddress(address: string): boolean {
  // Remove any whitespace
  const trimmed = address.trim()

  // Check length (Solana addresses are typically 32-44 characters)
  if (trimmed.length < 32 || trimmed.length > 44) {
    return false
  }

  // Check for valid base58 characters
  for (const char of trimmed) {
    if (!BASE58_CHARS.includes(char)) {
      return false
    }
  }

  return true
}

/**
 * Sanitizes and trims an address input
 */
export function sanitizeAddress(address: string): string {
  return address.trim()
}

/**
 * Checks if the input looks like a Solana transaction signature
 * Transaction signatures are base58 encoded and typically 87-88 characters
 */
export function isTransactionSignature(input: string): boolean {
  const trimmed = input.trim()

  // Transaction signatures are typically 87-88 characters
  if (trimmed.length < 80 || trimmed.length > 90) {
    return false
  }

  // Check for valid base58 characters
  for (const char of trimmed) {
    if (!BASE58_CHARS.includes(char)) {
      return false
    }
  }

  return true
}

/**
 * Returns a validation error message or null if valid
 */
export function getAddressError(address: string): string | null {
  const trimmed = address.trim()

  if (trimmed.length === 0) {
    return 'Please enter a token address'
  }

  if (trimmed.length < 32) {
    return 'Address is too short'
  }

  if (trimmed.length > 44) {
    return 'Address is too long'
  }

  // Check for invalid characters
  for (const char of trimmed) {
    if (!BASE58_CHARS.includes(char)) {
      return 'Address contains invalid characters'
    }
  }

  return null
}

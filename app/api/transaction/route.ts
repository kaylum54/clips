import { NextRequest, NextResponse } from 'next/server'

interface HeliusTokenTransfer {
  fromUserAccount: string
  toUserAccount: string
  fromTokenAccount: string
  toTokenAccount: string
  tokenAmount: number
  mint: string
  tokenStandard: string
}

interface HeliusSwapEvent {
  nativeInput?: { account: string; amount: string }
  nativeOutput?: { account: string; amount: string }
  tokenInputs?: Array<{ userAccount: string; tokenAccount: string; mint: string; rawTokenAmount: { tokenAmount: string; decimals: number } }>
  tokenOutputs?: Array<{ userAccount: string; tokenAccount: string; mint: string; rawTokenAmount: { tokenAmount: string; decimals: number } }>
}

interface HeliusTransaction {
  signature: string
  timestamp: number
  type: string
  source: string
  feePayer: string
  tokenTransfers: HeliusTokenTransfer[]
  events?: {
    swap?: HeliusSwapEvent
  }
}

interface ParsedSwap {
  type: 'buy' | 'sell'
  tokenAddress: string
  tokenAmount: number
  solAmount: number
  price: number
  timestamp: number
  signature: string
}

// Known SOL-related mints to identify SOL side of swaps
const SOL_MINTS = [
  'So11111111111111111111111111111111111111112', // Wrapped SOL
]

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const signature = searchParams.get('signature')

  if (!signature) {
    return NextResponse.json(
      { success: false, error: 'Transaction signature is required' },
      { status: 400 }
    )
  }

  const apiKey = process.env.HELIUS_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { success: false, error: 'Helius API key not configured' },
      { status: 500 }
    )
  }

  try {
    // Fetch parsed transaction from Helius
    const response = await fetch(
      `https://api.helius.xyz/v0/transactions/?api-key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactions: [signature] }),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Helius API error:', errorText)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch transaction from Helius' },
        { status: response.status }
      )
    }

    const transactions: HeliusTransaction[] = await response.json()

    if (!transactions || transactions.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Transaction not found' },
        { status: 404 }
      )
    }

    const tx = transactions[0]

    // Parse the swap from the transaction
    const swap = parseSwapFromTransaction(tx)

    if (!swap) {
      return NextResponse.json(
        { success: false, error: 'Could not parse swap from transaction. Make sure this is a token swap transaction.' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      data: swap,
    })
  } catch (error) {
    console.error('Transaction parsing error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to parse transaction' },
      { status: 500 }
    )
  }
}

function parseSwapFromTransaction(tx: HeliusTransaction): ParsedSwap | null {
  // Check if this is a swap transaction
  if (tx.type !== 'SWAP') {
    // Try to parse from token transfers anyway
    return parseFromTokenTransfers(tx)
  }

  const swapEvent = tx.events?.swap
  if (!swapEvent) {
    return parseFromTokenTransfers(tx)
  }

  // Determine if this is a buy or sell based on SOL direction
  // Buy: SOL in, Token out
  // Sell: Token in, SOL out

  let tokenAddress: string | null = null
  let tokenAmount = 0
  let solAmount = 0
  let isBuy = false

  // Check native (SOL) input/output
  if (swapEvent.nativeInput) {
    // SOL went in, so this is a BUY
    isBuy = true
    solAmount = parseInt(swapEvent.nativeInput.amount) / 1e9 // Convert lamports to SOL
  }

  if (swapEvent.nativeOutput) {
    // SOL came out, so this is a SELL
    isBuy = false
    solAmount = parseInt(swapEvent.nativeOutput.amount) / 1e9
  }

  // Get the token from inputs/outputs
  if (swapEvent.tokenOutputs && swapEvent.tokenOutputs.length > 0) {
    // Token output - if we're buying, this is what we received
    const tokenOut = swapEvent.tokenOutputs.find(t => !SOL_MINTS.includes(t.mint))
    if (tokenOut) {
      tokenAddress = tokenOut.mint
      const decimals = tokenOut.rawTokenAmount.decimals
      tokenAmount = parseInt(tokenOut.rawTokenAmount.tokenAmount) / Math.pow(10, decimals)
    }
  }

  if (swapEvent.tokenInputs && swapEvent.tokenInputs.length > 0) {
    // Token input - if we're selling, this is what we sold
    const tokenIn = swapEvent.tokenInputs.find(t => !SOL_MINTS.includes(t.mint))
    if (tokenIn) {
      tokenAddress = tokenIn.mint
      const decimals = tokenIn.rawTokenAmount.decimals
      tokenAmount = parseInt(tokenIn.rawTokenAmount.tokenAmount) / Math.pow(10, decimals)
    }
  }

  if (!tokenAddress || tokenAmount === 0 || solAmount === 0) {
    return parseFromTokenTransfers(tx)
  }

  // Calculate price (SOL per token)
  const price = solAmount / tokenAmount

  return {
    type: isBuy ? 'buy' : 'sell',
    tokenAddress,
    tokenAmount,
    solAmount,
    price,
    timestamp: tx.timestamp,
    signature: tx.signature,
  }
}

function parseFromTokenTransfers(tx: HeliusTransaction): ParsedSwap | null {
  const transfers = tx.tokenTransfers
  if (!transfers || transfers.length < 2) {
    return null
  }

  // Find SOL transfer and token transfer
  const solTransfer = transfers.find(t => SOL_MINTS.includes(t.mint))
  const tokenTransfer = transfers.find(t => !SOL_MINTS.includes(t.mint))

  if (!solTransfer || !tokenTransfer) {
    // If no wrapped SOL, try to find two different tokens
    // and assume the non-SOL one is what we want
    const uniqueMints = [...new Set(transfers.map(t => t.mint))]
    const nonSolMint = uniqueMints.find(m => !SOL_MINTS.includes(m))

    if (!nonSolMint) return null

    const relevantTransfer = transfers.find(t => t.mint === nonSolMint)
    if (!relevantTransfer) return null

    // Can't determine price without SOL reference
    return {
      type: 'buy', // Default assumption
      tokenAddress: nonSolMint,
      tokenAmount: relevantTransfer.tokenAmount,
      solAmount: 0,
      price: 0,
      timestamp: tx.timestamp,
      signature: tx.signature,
    }
  }

  // Determine buy/sell based on who the fee payer is
  // If fee payer receives tokens, it's a buy
  // If fee payer sends tokens, it's a sell
  const isBuy = tokenTransfer.toUserAccount === tx.feePayer

  return {
    type: isBuy ? 'buy' : 'sell',
    tokenAddress: tokenTransfer.mint,
    tokenAmount: tokenTransfer.tokenAmount,
    solAmount: solTransfer.tokenAmount,
    price: solTransfer.tokenAmount / tokenTransfer.tokenAmount,
    timestamp: tx.timestamp,
    signature: tx.signature,
  }
}

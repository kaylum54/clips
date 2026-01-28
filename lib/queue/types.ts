import type { Candle } from '@/types'

export interface RenderMarker {
  candleIndex: number
  price: number
  time: number
}

export interface RenderJobInput {
  candles: Candle[]
  entryMarker: RenderMarker
  exitMarker: RenderMarker
  speed: number
  tokenSymbol?: string
  startIndex: number
  endIndex: number
  isPro: boolean
}

export interface RenderJobData {
  jobId: string
  userId: string
  inputData: RenderJobInput
}

export interface RenderJobResult {
  tempFilePath: string
  renderDurationMs: number
}

export type RenderJobStatus = 'pending' | 'processing' | 'completed' | 'failed'

export interface RenderJob {
  id: string
  user_id: string
  status: RenderJobStatus
  progress: number
  input_data: RenderJobInput
  temp_file_path: string | null
  error_message: string | null
  attempts: number
  created_at: string
  started_at: string | null
  completed_at: string | null
  expires_at: string
}

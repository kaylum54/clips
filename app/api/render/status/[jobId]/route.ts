/**
 * Render Job Status API
 *
 * Check the status of a render job.
 * Returns progress, status, and download ready flag.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getQueuePosition } from '@/lib/queue/render-queue'
import type { RenderJob } from '@/lib/queue/types'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Require authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch job from database (type assertion for render_jobs table)
    const { data: job, error: jobError } = await (supabase
      .from('render_jobs' as any) as any)
      .select('*')
      .eq('id', jobId)
      .single()

    if (jobError || !job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }

    const typedJob = job as RenderJob

    // Verify ownership
    if (typedJob.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Build response based on status
    const response: {
      jobId: string
      status: string
      progress: number
      createdAt: string
      position?: number
      estimatedWaitSeconds?: number
      downloadReady?: boolean
      error?: string
      canRetry?: boolean
    } = {
      jobId: typedJob.id,
      status: typedJob.status,
      progress: typedJob.progress,
      createdAt: typedJob.created_at,
    }

    // Add status-specific fields
    if (typedJob.status === 'pending') {
      const position = await getQueuePosition(jobId)
      response.position = position
      response.estimatedWaitSeconds = position * 45 // Rough estimate
    }

    if (typedJob.status === 'completed') {
      response.downloadReady = !!typedJob.temp_file_path
    }

    if (typedJob.status === 'failed') {
      response.error = typedJob.error_message || 'Render failed'
      response.canRetry = typedJob.attempts < 3
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Status check error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

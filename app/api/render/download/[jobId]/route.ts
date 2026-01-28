/**
 * Render Job Download API
 *
 * Stream the rendered video file to the user.
 * Deletes the temp file after successful download.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { RenderJob } from '@/lib/queue/types'
import fs from 'fs'

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
    const { data: jobData, error: jobError } = await (supabase
      .from('render_jobs' as any) as any)
      .select('*')
      .eq('id', jobId)
      .single()

    if (jobError || !jobData) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }

    const job = jobData as RenderJob

    // Verify ownership
    if (job.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Check job status
    if (job.status !== 'completed') {
      return NextResponse.json(
        { error: 'Video is not ready yet', status: job.status },
        { status: 400 }
      )
    }

    // Check file path
    if (!job.temp_file_path) {
      return NextResponse.json(
        { error: 'Video file not found' },
        { status: 404 }
      )
    }

    // Verify file exists
    if (!fs.existsSync(job.temp_file_path)) {
      // File was already cleaned up - mark job as expired
      const adminSupabase = createAdminClient()
      await (adminSupabase
        .from('render_jobs' as any) as any)
        .update({ status: 'failed', error_message: 'Video expired' })
        .eq('id', jobId)

      return NextResponse.json(
        { error: 'Video has expired. Please render again.' },
        { status: 410 }
      )
    }

    // Read file and create response
    const fileBuffer = fs.readFileSync(job.temp_file_path)
    const fileName = `clip-${jobId.slice(0, 8)}.mp4`

    // Get file size for content-length header
    const stats = fs.statSync(job.temp_file_path)

    // Delete temp file after reading (one-time download)
    try {
      fs.unlinkSync(job.temp_file_path)

      // Update job to mark file as downloaded
      const adminSupabase = createAdminClient()
      await (adminSupabase
        .from('render_jobs' as any) as any)
        .update({ temp_file_path: null })
        .eq('id', jobId)
    } catch (unlinkError) {
      console.warn('Failed to delete temp file:', unlinkError)
      // Don't fail the request, just log it
    }

    // Return video file
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': stats.size.toString(),
        'Cache-Control': 'no-store',
      },
    })

  } catch (error) {
    console.error('Download error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

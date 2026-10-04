import { NextRequest, NextResponse } from 'next/server'
import { privateDocumentHeaders, privateDocumentResponse } from '@/lib/private-document'
import { createClient } from '@/utils/supabase/server'
import { submissionAttachments, validSubmissionId } from '@/lib/submission-attachments'

export const dynamic = 'force-dynamic'
const privateHeaders = privateDocumentHeaders

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string; index: string }> }) {
    const { id, index } = await params
    const error = (message: string, status: number) => NextResponse.json({ error: message }, { status, headers: privateHeaders })
    if (!validSubmissionId(id) || !/^(0|[1-9]\d?)$/.test(index)) return error('File not found.', 404)
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return error('Please sign in.', 401)
    const { data: allowed, error: accessError } = await supabase.rpc('can_read_suvarnabhumi_requests')
    if (accessError) return error('Could not verify access. Please try again.', 503)
    if (!allowed) return error('Access denied.', 403)
    // The caller's RLS permissions apply to both the record and the file.
    const { data, error: readError } = await supabase.from('form_submissions').select('*').eq('id', id).maybeSingle()
    if (readError) return error('Could not load this file. Please try again.', 503)
    if (!data) return error('File not found.', 404)
    const attachment = submissionAttachments(data)[Number(index)]
    if (!attachment) return error('File not found.', 404)
    const { data: file, error: fileError } = await supabase.storage.from('evidence').download(attachment.path)
    if (fileError || !file) return error('Could not open this file. Please try again.', 503)
    return privateDocumentResponse(file, attachment.name, request.nextUrl.searchParams.get('download') === '1')
}

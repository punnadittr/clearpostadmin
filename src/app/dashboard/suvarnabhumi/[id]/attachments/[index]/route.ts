import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { SUVARNABHUMI_BUCKET, SUVARNABHUMI_TABLE, validRequestId } from '@/lib/suvarnabhumi'

export const dynamic = 'force-dynamic'
const privateHeaders = { 'Cache-Control': 'private, no-store', 'Referrer-Policy': 'no-referrer' }

export async function GET(request: NextRequest, { params }: {
    params: Promise<{ id: string; index: string }>
}) {
    const { id, index } = await params
    const error = (message: string, status: number) => NextResponse.json({ error: message }, { status, headers: privateHeaders })
    if (!validRequestId(id) || !/^[0-2]$/.test(index)) return error('File not found.', 404)
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return error('Please sign in.', 401)
    const { data: allowed, error: accessError } = await supabase.rpc('can_read_suvarnabhumi_requests')
    if (accessError) return error('Could not verify access. Please try again.', 503)
    if (!allowed) return error('Access denied.', 403)

    // Both the record and Storage reads use the signed-in user's RLS permissions.
    const { data, error: readError } = await supabase.from(SUVARNABHUMI_TABLE)
        .select('attachment_paths,attachment_names').eq('id', id).maybeSingle()
    if (readError) {
        console.error('Suvarnabhumi file lookup unavailable:', readError.code)
        return error('Could not load this file. Please try again.', 503)
    }
    if (!data) return error('File not found.', 404)
    const path: string | undefined = data.attachment_paths[Number(index)]
    if (!path) return error('File not found.', 404)
    const options = request.nextUrl.searchParams.get('download') === '1'
        ? { download: data.attachment_names[Number(index)] || `Attachment ${Number(index) + 1}` } : undefined
    const { data: file, error: fileError } = await supabase.storage.from(SUVARNABHUMI_BUCKET).createSignedUrl(path, 300, options)
    if (fileError || !file) return error('Could not open this file. Please try again.', 503)
    return NextResponse.redirect(file.signedUrl, { status: 307, headers: privateHeaders })
}

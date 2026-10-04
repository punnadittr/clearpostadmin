import type { FormSubmission } from '@/types'

// Legacy links are converted to paths; the public URL is never shown or fetched.
export function submissionAttachments(submission: Pick<FormSubmission, 'attachment_paths' | 'attachment_names' | 'evidence_url'>) {
    const names = submission.attachment_names || []
    if (submission.attachment_paths?.length) return submission.attachment_paths.map((storagePath, index) => ({ path: storagePath, name: names[index] || storagePath.split('/').pop() || 'Attachment' }))
    let raw: unknown = submission.evidence_url
    if (typeof raw === 'string') {
        const value = raw
        try { raw = JSON.parse(value) } catch { raw = value.split(',').map(url => url.trim()) }
    }
    if (typeof raw === 'string') raw = [raw]
    if (!Array.isArray(raw)) return []
    const base = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (!base) return []
    return raw.flatMap(value => {
        if (typeof value !== 'string') return []
        try {
            const url = new URL(value)
            const prefix = '/storage/v1/object/public/evidence/'
            if (url.origin !== new URL(base).origin || !url.pathname.startsWith(prefix)) return []
            const storagePath = decodeURIComponent(url.pathname.slice(prefix.length))
            if (!storagePath || storagePath.split('/').some(part => !part || part === '.' || part === '..') || /[\\\r\n\0]/.test(storagePath)) return []
            return [{ path: storagePath, name: storagePath.split('/').pop() || 'Attachment' }]
        } catch { return [] }
    })
}

export const validSubmissionId = (id: string) => /^[1-9]\d{0,18}$/.test(id) && BigInt(id) <= BigInt('9223372036854775807')

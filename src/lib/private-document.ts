import { NextResponse } from 'next/server'

export const privateDocumentHeaders = { 'Cache-Control': 'private, no-store', 'Referrer-Policy': 'no-referrer', 'X-Content-Type-Options': 'nosniff' }
const viewTypes = new Set(['image/jpeg','image/png','image/webp','image/gif','image/avif','application/pdf'])
export function privateDocumentResponse(file: Blob, originalName: string, download: boolean) {
    const name = originalName.replace(/[\r\n\0/\\]/g, '').slice(0, 200) || 'Attachment'
    const fallback = name.replace(/[^\x20-\x7e]|["\\]/g, '_')
    const encoded = encodeURIComponent(name).replace(/[!'()*]/g, char => '%' + char.charCodeAt(0).toString(16).toUpperCase())
    const inline = !download && viewTypes.has(file.type) && /\.(jpe?g|png|webp|gif|avif|pdf)$/i.test(name)
    // Stream under the admin session; never issue a bearer URL that can be shared.
    let offset = 0
    const body = new ReadableStream<Uint8Array>({
        async pull(controller) {
            if (offset >= file.size) { controller.close(); return }
            const end = Math.min(offset + 64 * 1024, file.size)
            const bytes = new Uint8Array(await file.slice(offset, end).arrayBuffer())
            offset = end
            controller.enqueue(bytes)
        },
    })
    return new NextResponse(body, { status: 200, headers: {
        ...privateDocumentHeaders, 'Content-Type': inline ? file.type : 'application/octet-stream',
        'Content-Disposition': (inline ? 'inline' : 'attachment') + '; filename="' + fallback + '"; filename*=UTF-8\'\'' + encoded,
        'Content-Security-Policy': "sandbox; default-src 'none'", 'Content-Length': String(file.size),
    } })
}

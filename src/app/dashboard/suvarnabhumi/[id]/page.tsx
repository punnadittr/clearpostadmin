import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ArrowLeft, Download, ExternalLink, FileText, Mail, MessageCircle, Package, User } from 'lucide-react'
import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { carriers, formatRequestDate, SUVARNABHUMI_COLUMNS, SUVARNABHUMI_TABLE, validRequestId, type SuvarnabhumiRequest } from '@/lib/suvarnabhumi'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Shipment request | Clearpost Admin', robots: { index: false, follow: false } }

export default async function SuvarnabhumiDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    if (!validRequestId(id)) notFound()
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')
    const { data: request, error } = await supabase.from(SUVARNABHUMI_TABLE)
        .select(SUVARNABHUMI_COLUMNS).eq('id', id).maybeSingle<SuvarnabhumiRequest>()
    if (error) {
        console.error('Suvarnabhumi detail unavailable:', error.code)
        return <div className="mx-auto max-w-5xl space-y-4"><Button variant="outline" asChild><Link href="/dashboard/suvarnabhumi"><ArrowLeft />Back to requests</Link></Button><p role="alert">Could not load this request. Please refresh or sign in again.</p></div>
    }
    if (!request) notFound()
    const whatsappDigits = request.whatsapp_number?.replace(/\D/g, '')
    // wa.me requires a country code; never guess it for a locally entered number.
    const whatsappUrl = request.whatsapp_number?.startsWith('+') && whatsappDigits ? `https://wa.me/${whatsappDigits}` : null

    return (
        <div className="mx-auto max-w-5xl space-y-6">
            <Button variant="ghost" className="-ml-3" asChild><Link href="/dashboard/suvarnabhumi"><ArrowLeft />Suvarnabhumi requests</Link></Button>
            <header className="space-y-3">
                <div className="flex flex-wrap items-center gap-3"><h1 className="break-words text-2xl font-bold tracking-tight text-[#32325d] md:text-3xl">{request.full_name}</h1><Badge variant="secondary">{carriers[request.carrier] || request.carrier}</Badge></div>
                <p className="text-sm text-[#6b7c93]">Received {formatRequestDate(request.created_at)} · Bangkok time</p>
                <p className="break-all font-mono text-xs text-[#6b7c93]">Reference: {request.id}</p>
            </header>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="stripe-card">
                    <CardHeader><CardTitle className="flex items-center gap-2 text-base text-[#32325d]"><User className="h-4 w-4 text-[#6b7c93]" />Customer</CardTitle></CardHeader>
                    <CardContent className="space-y-5">
                        <div><p className="mb-1 text-xs font-medium text-[#6b7c93]">Full name</p><p className="break-words font-medium text-[#32325d]">{request.full_name}</p></div>
                        <div><p className="mb-1 text-xs font-medium text-[#6b7c93]">Email</p>{request.email ? <a href={`mailto:${request.email}`} className="inline-flex max-w-full items-start gap-2 break-all text-sm text-[#635bff] hover:underline"><Mail className="mt-0.5 h-4 w-4 shrink-0" />{request.email}</a> : <p className="text-sm text-[#6b7c93]">Not provided</p>}</div>
                        <div><p className="mb-1 text-xs font-medium text-[#6b7c93]">WhatsApp</p>{whatsappUrl ? <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 break-all text-sm text-[#635bff] hover:underline"><MessageCircle className="h-4 w-4 shrink-0" />{request.whatsapp_number}</a> : <p className="text-sm text-[#32325d]">{request.whatsapp_number || 'Not provided'}</p>}</div>
                    </CardContent>
                </Card>
                <Card className="stripe-card">
                    <CardHeader><CardTitle className="flex items-center gap-2 text-base text-[#32325d]"><Package className="h-4 w-4 text-[#6b7c93]" />Shipment</CardTitle></CardHeader>
                    <CardContent className="space-y-5">
                        <div><p className="mb-1 text-xs font-medium text-[#6b7c93]">Carrier</p><p className="text-sm text-[#32325d]">{carriers[request.carrier] || request.carrier}</p></div>
                        <div><p className="mb-2 text-xs font-medium text-[#6b7c93]">Tracking / AWB</p><p className="w-fit max-w-full break-all rounded-md border bg-gray-50 px-3 py-2 font-mono text-sm text-[#32325d]">{request.tracking_number || 'Not provided'}</p></div>
                        <div><p className="mb-1 text-xs font-medium text-[#6b7c93]">Source</p><p className="text-sm text-[#32325d]">Suvarnabhumi customs clearance form</p></div>
                    </CardContent>
                </Card>
                <Card className="stripe-card md:col-span-2">
                    <CardHeader><CardTitle className="text-base text-[#32325d]">What’s in the shipment</CardTitle></CardHeader>
                    <CardContent><p className="whitespace-pre-wrap break-words text-sm leading-7 text-[#525f7f]">{request.item_description}</p></CardContent>
                </Card>
                <Card className="stripe-card md:col-span-2">
                    <CardHeader><CardTitle className="text-base text-[#32325d]">Courier’s message</CardTitle></CardHeader>
                    <CardContent><p className="whitespace-pre-wrap break-words text-sm leading-7 text-[#525f7f]">{request.courier_message || 'No courier message provided.'}</p></CardContent>
                </Card>
                <Card className="stripe-card md:col-span-2">
                    <CardHeader><CardTitle className="flex items-center gap-2 text-base text-[#32325d]"><FileText className="h-4 w-4 text-[#6b7c93]" />Attached documents <span className="font-normal text-[#6b7c93]">({request.attachment_paths.length})</span></CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                        {request.attachment_paths.length === 0 ? <p className="text-sm text-[#6b7c93]">No files attached.</p> : request.attachment_paths.map((_, index) => {
                            const name = request.attachment_names[index] || `Attachment ${index + 1}`
                            const url = `/dashboard/suvarnabhumi/${request.id}/attachments/${index}`
                            return <div key={index} className="flex flex-col gap-3 rounded-lg border border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex min-w-0 items-start gap-3"><FileText className="mt-0.5 h-5 w-5 shrink-0 text-[#635bff]" /><span className="break-all text-sm font-medium text-[#32325d]">{name}</span></div>
                                <div className="flex shrink-0 gap-2"><Button variant="outline" size="sm" asChild><a href={url} target="_blank" rel="noopener noreferrer" aria-label={`Open ${name}`}><ExternalLink />Open</a></Button><Button variant="ghost" size="sm" asChild><a href={`${url}?download=1`} aria-label={`Download ${name}`}><Download />Download</a></Button></div>
                            </div>
                        })}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowRight, Inbox, Paperclip, Search, RefreshCw } from 'lucide-react'
import { createClient } from '@/utils/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { carriers, formatRequestDate, parseRequestFilters, requestsUrl, SUVARNABHUMI_COLUMNS, SUVARNABHUMI_PAGE_SIZE, SUVARNABHUMI_TABLE, type SuvarnabhumiRequest } from '@/lib/suvarnabhumi'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Suvarnabhumi requests | Clearpost Admin' }

export default async function SuvarnabhumiPage({ searchParams }: {
    searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
    const { search, carrier, page } = parseRequestFilters(await searchParams)
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    let query = supabase.from(SUVARNABHUMI_TABLE).select(SUVARNABHUMI_COLUMNS, { count: 'exact' })
    if (carrier) query = query.eq('carrier', carrier)
    if (search) {
        const pattern = `%${search.replace(/_/g, '\\_')}%`
        query = query.or(`full_name.ilike.${pattern},email.ilike.${pattern},whatsapp_number.ilike.${pattern},tracking_number.ilike.${pattern},item_description.ilike.${pattern}`)
    }
    const { data, count, error } = await query.order('created_at', { ascending: false }).order('id', { ascending: false })
        .range((page - 1) * SUVARNABHUMI_PAGE_SIZE, page * SUVARNABHUMI_PAGE_SIZE - 1).returns<SuvarnabhumiRequest[]>()
    const requests = data || []
    const total = count || 0
    const pages = Math.max(1, Math.ceil(total / SUVARNABHUMI_PAGE_SIZE))
    if (!error && page > pages) redirect(requestsUrl(pages, search, carrier))
    if (error) console.error('Suvarnabhumi list unavailable:', error.code)

    return (
        <div className="mx-auto max-w-7xl space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-widest text-[#635bff]">Clearance requests</p>
                    <h1 className="text-3xl font-bold tracking-tight text-[#32325d]">Suvarnabhumi</h1>
                    <p className="text-sm text-[#6b7c93]">Shipment details and notices submitted through the Suvarnabhumi form.</p>
                </div>
                <Button variant="outline" asChild><a href={requestsUrl(page, search, carrier)}><RefreshCw />Refresh</a></Button>
            </div>

            <Card className="stripe-card gap-0 py-0">
                <form action="/dashboard/suvarnabhumi" className="flex flex-col gap-3 border-b border-gray-100 p-4 sm:flex-row sm:items-end md:p-6">
                    <div className="flex-1 space-y-2">
                        <label htmlFor="request-search" className="text-sm font-medium text-[#32325d]">Search requests</label>
                        <Input id="request-search" name="q" defaultValue={search} placeholder="Name, contact, tracking or goods" maxLength={120} />
                    </div>
                    <div className="space-y-2 sm:w-56">
                        <label htmlFor="request-carrier" className="text-sm font-medium text-[#32325d]">Carrier</label>
                        <select id="request-carrier" name="carrier" defaultValue={carrier} className="h-9 w-full rounded-md border bg-white px-3 text-sm">
                            <option value="">All carriers</option>
                            {Object.entries(carriers).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                        </select>
                    </div>
                    <Button type="submit"><Search />Search</Button>
                    {(search || carrier) && <Button variant="ghost" asChild><Link href="/dashboard/suvarnabhumi">Clear</Link></Button>}
                </form>
                <div className="flex items-center justify-between px-4 py-4 text-sm md:px-6">
                    <span className="font-semibold text-[#32325d]">{error ? 'Requests unavailable' : `${total} ${total === 1 ? 'request' : 'requests'}`}</span>
                    <span className="text-xs text-[#6b7c93]">Newest first · Bangkok time</span>
                </div>

                {error ? <div role="alert" className="px-6 pb-6 text-sm text-red-700">Could not load requests. Please refresh or sign in again.</div> : requests.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
                        <Inbox className="h-9 w-9 text-[#aab7c4]" />
                        <h2 className="font-semibold text-[#32325d]">{search || carrier ? 'No matching requests' : 'No Suvarnabhumi requests yet'}</h2>
                        <p className="max-w-sm text-sm text-[#6b7c93]">{search || carrier ? 'Try a different search or clear the carrier filter.' : 'New submissions will appear here when customers send their shipment details.'}</p>
                    </div>
                ) : <>
                    <div className="hidden md:block">
                        <Table>
                            <TableHeader><TableRow>
                                <TableHead className="pl-6">Received</TableHead><TableHead>Customer</TableHead><TableHead>Shipment</TableHead><TableHead>Goods</TableHead><TableHead>Files</TableHead><TableHead className="pr-6"><span className="sr-only">Details</span></TableHead>
                            </TableRow></TableHeader>
                            <TableBody>{requests.map(request => <TableRow key={request.id}>
                                <TableCell className="pl-6 align-top text-xs text-[#6b7c93]">{formatRequestDate(request.created_at)}<span className="mt-1 block font-mono text-[10px]">{request.id.slice(0, 8)}</span></TableCell>
                                <TableCell className="max-w-60 align-top"><Link href={`/dashboard/suvarnabhumi/${request.id}`} className="font-semibold text-[#635bff] hover:underline">{request.full_name}</Link><div className="mt-1 space-y-1 text-xs text-[#6b7c93]"><p className="break-all whitespace-normal">{request.email}</p><p>{request.whatsapp_number}</p></div></TableCell>
                                <TableCell className="align-top"><Badge variant="secondary">{carriers[request.carrier] || request.carrier}</Badge><p className="mt-2 font-mono text-xs text-[#525f7f]">{request.tracking_number || 'No tracking provided'}</p></TableCell>
                                <TableCell className="max-w-64 align-top whitespace-normal"><p className="line-clamp-2 text-sm text-[#525f7f]">{request.item_description}</p></TableCell>
                                <TableCell className="align-top text-sm text-[#6b7c93]">{request.attachment_paths.length ? <span className="inline-flex items-center gap-1"><Paperclip className="h-3 w-3" />{request.attachment_paths.length}</span> : '—'}</TableCell>
                                <TableCell className="pr-6 text-right align-top"><Button variant="ghost" size="sm" asChild><Link href={`/dashboard/suvarnabhumi/${request.id}`} aria-label={`View request from ${request.full_name}`}>View<ArrowRight /></Link></Button></TableCell>
                            </TableRow>)}</TableBody>
                        </Table>
                    </div>
                    <div className="divide-y divide-gray-100 md:hidden">{requests.map(request => (
                        <Link key={request.id} href={`/dashboard/suvarnabhumi/${request.id}`} className="block space-y-3 p-4 hover:bg-gray-50">
                            <div className="flex items-start justify-between gap-3"><span className="min-w-0 break-words font-semibold text-[#32325d]">{request.full_name}</span><ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-[#635bff]" /></div>
                            <div className="flex flex-wrap items-center gap-2"><Badge variant="secondary">{carriers[request.carrier] || request.carrier}</Badge>{request.tracking_number && <span className="break-all font-mono text-xs text-[#525f7f]">{request.tracking_number}</span>}</div>
                            <p className="line-clamp-2 text-sm text-[#525f7f]">{request.item_description}</p>
                            <p className="break-all text-xs text-[#6b7c93]">{[request.email, request.whatsapp_number].filter(Boolean).join(' · ')}</p>
                            <div className="flex justify-between gap-3 text-xs text-[#6b7c93]"><span>{formatRequestDate(request.created_at)}</span><span className="shrink-0">{request.attachment_paths.length} files</span></div>
                        </Link>
                    ))}</div>
                </>}
                {!error && total > SUVARNABHUMI_PAGE_SIZE && <CardContent className="flex items-center justify-between gap-3 border-t p-4 md:px-6">
                    {page > 1 ? <Button variant="outline" size="sm" asChild><Link href={requestsUrl(page - 1, search, carrier)}>Previous</Link></Button> : <Button variant="outline" size="sm" disabled>Previous</Button>}
                    <span className="text-xs text-[#6b7c93]">Page {page} of {pages}</span>
                    {page < pages ? <Button variant="outline" size="sm" asChild><Link href={requestsUrl(page + 1, search, carrier)}>Next</Link></Button> : <Button variant="outline" size="sm" disabled>Next</Button>}
                </CardContent>}
            </Card>
        </div>
    )
}

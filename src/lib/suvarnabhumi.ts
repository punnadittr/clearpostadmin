export const SUVARNABHUMI_TABLE = 'suvarnabhumi_clearance_requests'
export const SUVARNABHUMI_BUCKET = 'suvarnabhumi-notices'
export const SUVARNABHUMI_PAGE_SIZE = 25
export const SUVARNABHUMI_COLUMNS = 'id,created_at,full_name,carrier,whatsapp_number,email,tracking_number,item_description,courier_message,attachment_paths,attachment_names'

export type SuvarnabhumiRequest = {
    id: string
    created_at: string
    full_name: string
    carrier: string
    whatsapp_number: string | null
    email: string | null
    tracking_number: string | null
    item_description: string
    courier_message: string | null
    attachment_paths: string[]
    attachment_names: string[]
}

export const carriers: Record<string, string> = {
    fedex: 'FedEx', ups: 'UPS', dhl: 'DHL', tnt: 'TNT',
    air_cargo: 'Air cargo / freight forwarder', unknown: 'Other / not sure',
}

export function formatRequestDate(value: string) {
    return new Intl.DateTimeFormat('en-GB', {
        dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Bangkok',
    }).format(new Date(value))
}

export function validRequestId(value: string) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
}

export function parseRequestFilters(params: Record<string, string | string[] | undefined>) {
    const single = (key: string) => typeof params[key] === 'string' ? params[key] as string : ''
    const carrier = single('carrier')
    const page = Number(single('page'))
    // Keep user input out of PostgREST filter syntax; search matches literal text.
    const search = single('q').replace(/[^\p{L}\p{M}\p{N}@+ ._-]/gu, '').trim().slice(0, 120)
    return {
        search,
        carrier: Object.hasOwn(carriers, carrier) ? carrier : '',
        page: Number.isSafeInteger(page) && page > 0 ? Math.min(page, 100000) : 1,
    }
}

export function requestsUrl(page: number, search: string, carrier: string) {
    const params = new URLSearchParams()
    if (search) params.set('q', search)
    if (carrier) params.set('carrier', carrier)
    if (page > 1) params.set('page', String(page))
    return '/dashboard/suvarnabhumi' + (params.size ? `?${params}` : '')
}

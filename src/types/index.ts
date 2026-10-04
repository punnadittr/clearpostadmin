export type FormSubmission = {
    id: number
    created_at: string
    full_name: string | null
    whatsapp_number: string | null
    email: string | null
    shipping_carrier: string | null
    tracking_number: string | null
    item_description: string | null
    current_status: string | null
    license_status: string | null
    requested_service?: { id: string; title: string; feeTHB: number; isStartingPrice: boolean; currency: 'THB' } | null;
    request_reference?: string
    attachment_paths?: string[]
    attachment_names?: string[]
    evidence_url: string | string[] | null // Can be comma-separated URLs or JSON array
}

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
    evidence_url: string | null
}

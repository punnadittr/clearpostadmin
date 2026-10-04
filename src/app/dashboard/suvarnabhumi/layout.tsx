import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { Card, CardContent } from '@/components/ui/card'

export const metadata = { robots: { index: false, follow: false } }

export default async function SuvarnabhumiLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')
    const { data: allowed, error } = await supabase.rpc('can_read_suvarnabhumi_requests')
    if (error || !allowed) return <Card className="stripe-card mx-auto max-w-3xl"><CardContent className="space-y-3 pt-2"><h1 className="text-xl font-semibold">Suvarnabhumi requests</h1><p role="alert" className="text-sm text-[#6b7c93]">{error ? 'Could not verify access. Please refresh or sign in again.' : 'Access has not been enabled for this account. Contact a Clearpost administrator.'}</p></CardContent></Card>
    return children
}

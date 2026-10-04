import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { createClient } from "@/utils/supabase/server"
import { FileText, CheckCircle, Plane } from "lucide-react"

export default async function DashboardPage() {
    const supabase = await createClient()

    // Fetch total submissions
    const { count: totalCount, error: totalError } = await supabase
        .from('form_submissions')
        .select('*', { count: 'exact', head: true })

    if (totalError) {
        console.error('Error fetching total submissions:', totalError)
    }

    // Fetch completed/processed (example status)
    const { count: processedCount, error: processedError } = await supabase
        .from('form_submissions')
        .select('*', { count: 'exact', head: true })
        .eq('current_status', 'Completed') // Adjust status as needed

    if (processedError) {
        console.error('Error fetching processed submissions:', processedError)
    }

    const { count: suvarnabhumiCount, error: suvarnabhumiError } = await supabase
        .from('suvarnabhumi_clearance_requests')
        .select('id', { count: 'exact', head: true })

    return (
        <div className="space-y-4">
            <h2 className="text-3xl font-bold tracking-tight">Overview</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Link href="/dashboard/submissions" className="block">
                    <Card className="stripe-card hover:-translate-y-1 transition-transform duration-300 h-full cursor-pointer">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-[#6b7c93]">
                                Total Submissions
                            </CardTitle>
                            <FileText className="h-4 w-4 text-[#aab7c4]" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-[#32325d]">{totalCount || 0}</div>
                            <p className="text-xs text-[#6b7c93] mt-1">
                                View all submissions &rarr;
                            </p>
                        </CardContent>
                    </Card>
                </Link>
                <Card className="stripe-card hover:-translate-y-1 transition-transform duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-[#6b7c93]">
                            Completed
                        </CardTitle>
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-[#32325d]">{processedCount || 0}</div>
                        <p className="text-xs text-[#6b7c93] mt-1">
                            processed forms
                        </p>
                    </CardContent>
                </Card>
                <Link href="/dashboard/suvarnabhumi" className="block">
                    <Card className="stripe-card h-full cursor-pointer transition-transform duration-300 hover:-translate-y-1">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-[#6b7c93]">Suvarnabhumi Requests</CardTitle>
                            <Plane className="h-4 w-4 text-[#635bff]" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-[#32325d]">{suvarnabhumiError ? '—' : suvarnabhumiCount ?? 0}</div>
                            <p className="mt-1 text-xs text-[#6b7c93]">View clearance requests &rarr;</p>
                        </CardContent>
                    </Card>
                </Link>
            </div>
        </div>
    )
}

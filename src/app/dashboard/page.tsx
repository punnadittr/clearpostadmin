import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/utils/supabase/server"
import { FileText, Clock, CheckCircle } from "lucide-react"

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

    return (
        <div className="space-y-4">
            <h2 className="text-3xl font-bold tracking-tight">Overview</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="stripe-card hover:-translate-y-1 transition-transform duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-[#6b7c93]">
                            Total Submissions
                        </CardTitle>
                        <FileText className="h-4 w-4 text-[#aab7c4]" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-[#32325d]">{totalCount || 0}</div>
                        <p className="text-xs text-[#6b7c93] mt-1">
                            All time form submissions
                        </p>
                    </CardContent>
                </Card>
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
            </div>
        </div>
    )
}

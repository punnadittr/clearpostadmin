import Link from "next/link"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/utils/supabase/server"
import { FormSubmission } from "@/types"
import { Badge } from "@/components/ui/badge"

export default async function SubmissionsPage() {
    const supabase = await createClient()
    const { data: submissions, error } = await supabase
        .from('form_submissions')
        .select('*')
        .order('created_at', { ascending: false })
        .returns<FormSubmission[]>()

    if (error) {
        console.error('Error fetching submissions list:', error)
        return <div>Error loading submissions</div>
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Submissions</h2>
            </div>
            {/* Mobile View: Cards */}
            <div className="grid gap-4 md:hidden">
                {submissions?.map((submission) => (
                    <Link href={`/dashboard/submissions/${submission.id}`} key={submission.id}>
                        <Card className="stripe-card hover:bg-gray-50/50 transition-colors">
                            <CardContent className="p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="font-mono text-xs text-[#6b7c93]">#{submission.id}</span>
                                    <Badge variant="secondary" className={submission.current_status === 'Completed' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' : 'bg-gray-100 text-gray-700 hover:bg-gray-100'}>
                                        {submission.current_status || 'Pending'}
                                    </Badge>
                                </div>
                                <div>
                                    <div className="font-medium text-[#32325d]">{submission.full_name}</div>
                                    <div className="text-sm text-[#6b7c93] truncate">{submission.item_description}</div>
                                </div>
                                <div className="flex items-center justify-between text-xs text-[#9b9b9b]">
                                    <span>{new Date(submission.created_at).toLocaleDateString()}</span>
                                    {submission.tracking_number && (
                                        <div className="flex items-center gap-1">
                                            <span className="font-mono">{submission.tracking_number}</span>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>

            {/* Desktop View: Table */}
            <Card className="hidden md:block stripe-card overflow-hidden">
                <CardHeader className="border-b border-gray-100 bg-white px-6 py-4">
                    <CardTitle className="text-base font-semibold text-[#32325d]">All Submissions</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent border-gray-100">
                                <TableHead className="w-[80px] text-xs font-semibold text-[#6b7c93] uppercase tracking-wider pl-6">ID</TableHead>
                                <TableHead className="text-xs font-semibold text-[#6b7c93] uppercase tracking-wider">Date</TableHead>
                                <TableHead className="text-xs font-semibold text-[#6b7c93] uppercase tracking-wider">Name</TableHead>
                                <TableHead className="text-xs font-semibold text-[#6b7c93] uppercase tracking-wider">Contact</TableHead>
                                <TableHead className="text-xs font-semibold text-[#6b7c93] uppercase tracking-wider">Tracking</TableHead>
                                <TableHead className="text-xs font-semibold text-[#6b7c93] uppercase tracking-wider max-w-[200px]">Description</TableHead>
                                <TableHead className="text-xs font-semibold text-[#6b7c93] uppercase tracking-wider">License</TableHead>
                                <TableHead className="text-xs font-semibold text-[#6b7c93] uppercase tracking-wider">Evidence</TableHead>
                                <TableHead className="text-xs font-semibold text-[#6b7c93] uppercase tracking-wider pr-6 text-right">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {submissions?.map((submission) => (
                                <TableRow key={submission.id} className="border-gray-50 hover:bg-gray-50/50 transition-colors">
                                    <TableCell className="font-medium font-mono text-xs pl-6">
                                        <Link href={`/dashboard/submissions/${submission.id}`} className="text-[#635bff] hover:text-[#424770]">
                                            #{submission.id}
                                        </Link>
                                    </TableCell>
                                    <TableCell className="text-sm text-[#525f7f]">{new Date(submission.created_at).toLocaleDateString()}</TableCell>
                                    <TableCell className="text-sm font-medium text-[#32325d]">{submission.full_name}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="text-sm text-[#525f7f]">{submission.email}</span>
                                            <span className="text-xs text-[#9b9b9b]">{submission.whatsapp_number}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-mono text-xs font-medium text-[#32325d]">{submission.tracking_number}</span>
                                            <span className="text-[10px] uppercase text-[#9b9b9b]">{submission.shipping_carrier}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="max-w-[200px] truncate text-sm text-[#525f7f]" title={submission.item_description || ''}>
                                        {submission.item_description}
                                    </TableCell>
                                    <TableCell>
                                        {submission.license_status && (
                                            <Badge variant="outline" className="text-xs font-normal border-gray-200 text-[#525f7f]">{submission.license_status}</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {submission.evidence_url ? (
                                            <a
                                                href={submission.evidence_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-[#635bff] hover:text-[#424770] text-xs font-medium"
                                            >
                                                View
                                            </a>
                                        ) : (
                                            <span className="text-gray-300 text-xs">None</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right pr-6">
                                        <Badge variant="secondary" className={submission.current_status === 'Completed' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' : 'bg-gray-100 text-gray-700 hover:bg-gray-100'}>
                                            {submission.current_status || 'Pending'}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {(!submissions || submissions.length === 0) && (
                                <TableRow>
                                    <TableCell colSpan={9} className="text-center h-24 text-[#6b7c93]">
                                        No submissions found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}

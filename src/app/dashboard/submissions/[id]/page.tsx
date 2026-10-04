import { submissionAttachments, validSubmissionId } from "@/lib/submission-attachments"

import { createClient } from "@/utils/supabase/server"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Package, User, FileText, Activity } from "lucide-react"

export default async function SubmissionDetailPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    if (!validSubmissionId(id)) notFound()
    const supabase = await createClient()

    const { data: submission, error } = await supabase
        .from('form_submissions')
        .select('*')
        .eq('id', id)
        .single()

    if (error || !submission) {
        notFound()
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-0 md:space-x-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href="/dashboard/submissions">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Submission #{submission.id}</h2>
                <Badge variant={submission.current_status === 'Completed' ? 'default' : 'secondary'}>
                    {submission.current_status || 'Pending'}
                </Badge>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* User Information */}
                <Card className="stripe-card">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-[#32325d]">
                            <User className="h-5 w-5 text-[#6b7c93]" />
                            User Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-1">
                            <span className="text-sm font-medium text-[#6b7c93]">Full Name</span>
                            <span className="text-base text-[#32325d] font-medium">{submission.full_name}</span>
                        </div>
                        <div className="grid gap-1">
                            <span className="text-sm font-medium text-[#6b7c93]">Email</span>
                            <span className="text-base text-[#32325d]">{submission.email}</span>
                        </div>
                        <div className="grid gap-1">
                            <span className="text-sm font-medium text-[#6b7c93]">WhatsApp</span>
                            <span className="text-base text-[#32325d]">{submission.whatsapp_number || 'N/A'}</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Shipping Details */}
                <Card className="stripe-card">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-[#32325d]">
                            <Package className="h-5 w-5 text-[#6b7c93]" />
                            Shipping Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {submission.requested_service && <div className="grid gap-1 rounded-lg border border-gray-200 bg-gray-50 p-3"><span className="text-sm font-medium text-[#6b7c93]">Selected service</span><span className="text-base text-[#32325d]">{submission.requested_service.title}</span><span className="text-sm font-medium text-[#32325d]">{submission.requested_service.isStartingPrice ? 'From ' : ''}THB {Number(submission.requested_service.feeTHB).toLocaleString('en-US')}</span><span className="text-xs leading-relaxed text-[#6b7c93]">Service fee only. Duties, VAT and third-party charges are separate. Final scope and fee are confirmed after review.</span></div>}
                        <div className="grid gap-1">
                            <span className="text-sm font-medium text-[#6b7c93]">Tracking Number</span>
                            <span className="text-lg font-mono bg-gray-50 text-[#32325d] p-2 rounded w-fit border border-gray-100">
                                {submission.tracking_number || 'N/A'}
                            </span>
                        </div>
                        <div className="grid gap-1">
                            <span className="text-sm font-medium text-[#6b7c93]">Carrier</span>
                            <span className="text-base text-[#32325d]">{submission.shipping_carrier || 'N/A'}</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Item Details */}
                <Card className="md:col-span-2 stripe-card">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-[#32325d]">
                            <FileText className="h-5 w-5 text-[#6b7c93]" />
                            Item Description
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-base leading-relaxed text-[#525f7f]">
                            {submission.item_description || 'No description provided.'}
                        </p>
                    </CardContent>
                </Card>

                {/* Status & Evidence */}
                <Card className="md:col-span-2 stripe-card">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-[#32325d]">
                            <Activity className="h-5 w-5 text-[#6b7c93]" />
                            Status & Evidence
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-6 sm:grid-cols-2">
                        <div className="space-y-4">
                            <div className="grid gap-1">
                                <span className="text-sm font-medium text-[#6b7c93]">Current Status</span>
                                <Badge variant="secondary" className={submission.current_status === 'Completed' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100 w-fit' : 'bg-gray-100 text-gray-700 hover:bg-gray-100 w-fit'}>
                                    {submission.current_status || 'Pending'}
                                </Badge>
                            </div>
                            <div className="grid gap-1">
                                <span className="text-sm font-medium text-[#6b7c93]">License Status</span>
                                <Badge variant="outline" className="w-fit border-gray-200 text-[#525f7f] font-normal">{submission.license_status || 'Unknown'}</Badge>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="grid gap-1">
                                <span className="text-sm font-medium text-[#6b7c93]">Private documents</span>
                                {submissionAttachments(submission).length ? <ul className="space-y-3">{submissionAttachments(submission).map((file, index) => <li key={index} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3"><span className="min-w-0 break-all text-sm text-[#32325d]">{file.name}</span><div className="flex shrink-0 gap-4 text-sm text-[#635bff]"><a href={`/dashboard/submissions/${submission.id}/attachments/${index}`} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">Open</a><a href={`/dashboard/submissions/${submission.id}/attachments/${index}?download=1`} className="underline underline-offset-4">Download</a></div></li>)}</ul> : <span className="text-sm text-gray-400">No documents uploaded.</span>}
                            </div>
                            {submission.request_reference && <div className="grid gap-1"><span className="text-sm font-medium text-[#6b7c93]">Customer reference</span><span className="break-all font-mono text-xs text-[#32325d]">{submission.request_reference}</span></div>}
                            <div className="grid gap-1">
                                <span className="text-sm font-medium text-[#6b7c93]">Submission Date</span>
                                <span className="text-sm text-[#32325d] font-medium">
                                    {new Date(submission.created_at).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

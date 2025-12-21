
import { createClient } from "@/utils/supabase/server"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, ExternalLink, Package, User, FileText, Activity } from "lucide-react"

export default async function SubmissionDetailPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
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
            <div className="flex items-center space-x-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href="/dashboard/submissions">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <h2 className="text-3xl font-bold tracking-tight">Submission #{submission.id}</h2>
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
                                <span className="text-sm font-medium text-[#6b7c93]">Evidence URL</span>
                                {/* Evidence Parsing Logic */
                                    (() => {
                                        let evidenceUrls: string[] = [];
                                        const rawEvidence = submission.evidence_url;

                                        if (rawEvidence) {
                                            if (Array.isArray(rawEvidence)) {
                                                evidenceUrls = rawEvidence;
                                            } else if (typeof rawEvidence === 'string') {
                                                try {
                                                    // Try to parse as JSON array
                                                    const parsed = JSON.parse(rawEvidence);
                                                    if (Array.isArray(parsed)) {
                                                        evidenceUrls = parsed;
                                                    } else {
                                                        // If valid JSON but not array, treat as single string
                                                        evidenceUrls = [rawEvidence];
                                                    }
                                                } catch (e) {
                                                    // Check if it's comma separated
                                                    if (rawEvidence.includes(',')) {
                                                        evidenceUrls = rawEvidence.split(',').map(u => u.trim()).filter(Boolean);
                                                    } else {
                                                        evidenceUrls = [rawEvidence];
                                                    }
                                                }
                                            }
                                        }

                                        return evidenceUrls.length > 0 ? (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                                                {evidenceUrls.map((url, index) => (
                                                    <a
                                                        key={index}
                                                        href={url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="group relative block aspect-video overflow-hidden rounded-lg border border-gray-200 bg-gray-100 dark:border-gray-800"
                                                    >
                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                        <img
                                                            src={url}
                                                            alt={`Evidence ${index + 1}`}
                                                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                        />
                                                        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20">
                                                            <ExternalLink className="h-6 w-6 text-white opacity-0 drop-shadow-md transition-opacity group-hover:opacity-100" />
                                                        </div>
                                                    </a>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="text-sm text-gray-400">No evidence uploaded.</span>
                                        );
                                    })()}
                            </div>
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

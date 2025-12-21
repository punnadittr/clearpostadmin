import { createClient } from "@/utils/supabase/server"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Appointment } from "@/types"
import { Calendar, Video, MessageCircle, Clock } from "lucide-react"

export default async function AppointmentsPage() {
    const supabase = await createClient()

    const { data: appointments, error } = await supabase
        .from('appointments')
        .select('*')
        .order('appointment_time', { ascending: false })

    if (error) {
        console.error('Error fetching appointments:', error)
    }

    // Helper to check if two dates are the same day
    const isSameDay = (d1: Date, d2: Date) => {
        return d1.getFullYear() === d2.getFullYear() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getDate() === d2.getDate()
    }

    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const todayAppointments = appointments?.filter(a => {
        const appointmentDate = new Date(a.appointment_time)
        return isSameDay(appointmentDate, today) && appointmentDate > today
    }) || []

    const tomorrowAppointments = appointments?.filter(a => {
        const appointmentDate = new Date(a.appointment_time)
        return isSameDay(appointmentDate, tomorrow) && appointmentDate > today
    }) || []

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Appointments</h2>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Today's Appointments
                        </CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{todayAppointments.length}</div>
                        <p className="text-xs text-muted-foreground">
                            {today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Tomorrow's Appointments
                        </CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{tomorrowAppointments.length}</div>
                        <p className="text-xs text-muted-foreground">
                            {tomorrow.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Appointments</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Customer Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>WhatsApp</TableHead>
                                <TableHead>Date & Time</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Meeting Link</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {appointments?.map((appointment: Appointment) => (
                                <TableRow key={appointment.id}>
                                    <TableCell className="font-medium">
                                        {appointment.customer_name}
                                    </TableCell>
                                    <TableCell>
                                        {appointment.customer_email || '-'}
                                    </TableCell>
                                    <TableCell>
                                        {appointment.whatsapp ? (
                                            <a
                                                href={`https://wa.me/${appointment.whatsapp.replace(/[^0-9]/g, '')}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center text-green-600 hover:underline gap-1"
                                            >
                                                <MessageCircle className="h-4 w-4" />
                                                <span>{appointment.whatsapp}</span>
                                            </a>
                                        ) : '-'}
                                    </TableCell>
                                    <TableCell>
                                        {new Date(appointment.appointment_time).toLocaleString('en-US', {
                                            dateStyle: 'medium',
                                            timeStyle: 'short'
                                        })}
                                    </TableCell>
                                    <TableCell>
                                        <div className={`capitalize ${new Date(appointment.appointment_time) < new Date() ? 'text-muted-foreground' : 'text-green-600'
                                            }`}>
                                            {new Date(appointment.appointment_time) < new Date() ? 'completed' : 'upcoming'}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {appointment.meeting_link ? (
                                            <a
                                                href={appointment.meeting_link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center text-blue-600 hover:underline gap-1"
                                            >
                                                Join <Video className="h-4 w-4" />
                                            </a>
                                        ) : '-'}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {appointments?.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">
                                        No appointments found.
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

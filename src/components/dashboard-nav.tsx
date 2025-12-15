'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, FileText, Settings } from "lucide-react"

const items = [
    {
        title: "Overview",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Submissions",
        href: "/dashboard/submissions",
        icon: FileText,
    },
]

export function DashboardNav({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
    const pathname = usePathname()

    return (
        <nav className={cn("flex flex-col space-y-1", className)} {...props}>
            {items.map((item) => (
                <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                        "flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                        pathname === item.href ? "bg-accent text-accent-foreground" : "transparent"
                    )}
                >
                    <item.icon className="mr-2 h-4 w-4" />
                    <span>{item.title}</span>
                </Link>
            ))}
        </nav>
    )
}

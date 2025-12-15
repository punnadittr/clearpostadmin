import { DashboardNav } from "@/components/dashboard-nav"
import { UserNav } from "@/components/user-nav"
import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    return (
        <div className="flex min-h-screen flex-col">
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-14 items-center px-4 md:px-8">
                    <div className="mr-4 hidden md:flex">
                        <a className="mr-6 flex items-center space-x-2 font-bold" href="/">
                            Clearpost Admin
                        </a>
                        <DashboardNav className="flex-row space-x-2 space-y-0" />
                    </div>
                    {/* Mobile Menu */}
                    <div className="mr-2 flex md:hidden">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="mr-2">
                                    <Menu className="h-5 w-5" />
                                    <span className="sr-only">Toggle Menu</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="pr-0">
                                <SheetTitle className="sr-only">Mobile Menu</SheetTitle>
                                <a className="flex items-center space-x-2 font-bold" href="/">
                                    <span className="font-bold">Clearpost Admin</span>
                                </a>
                                <div className="my-4 pb-10 pl-6">
                                    <DashboardNav className="flex flex-col space-y-3" />
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                    <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                        <div className="w-full flex-1 md:w-auto md:flex-none">
                            {/* Search or other controls */}
                        </div>
                        <UserNav user={user} />
                    </div>
                </div>
            </header>
            <div className="flex-1 space-y-4 p-8 pt-6">
                {children}
            </div>
        </div>
    )
}

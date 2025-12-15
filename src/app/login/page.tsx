import { login } from './actions'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default async function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ error?: string }>
}) {
    const { error } = await searchParams


    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[#f7f9fc] dark:bg-zinc-950">
            {/* Diagonal stripe background effect */}
            <div className="absolute top-0 left-0 w-full h-[50vh] bg-[#f7f9fc] -skew-y-3 origin-top-left -z-10" />

            <Card className="w-full max-w-sm z-10 stripe-card border-none shadow-[0_15px_35px_-5px_rgba(50,50,93,0.25),0_8px_15px_-7px_rgba(0,0,0,0.3)]">
                <CardHeader className="space-y-2 text-left pb-6 pt-8 px-8">
                    <CardTitle className="text-2xl font-bold tracking-tight text-[#32325d] dark:text-white">
                        Sign in to your account
                    </CardTitle>
                    <CardDescription className="text-[#6b7c93] dark:text-zinc-400">
                        Clearpost Admin Dashboard
                    </CardDescription>
                </CardHeader>
                <form action={login}>
                    <CardContent className="space-y-5 px-8 pb-8">
                        {error && (
                            <div className="bg-[#fff1f2] border-l-4 border-red-500 text-red-700 text-sm p-3 font-medium animate-in fade-in">
                                {error}
                            </div>
                        )}
                        <div className="space-y-1">
                            <Label htmlFor="email" className="text-sm font-medium text-[#6b7c93] dark:text-zinc-400">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="name@example.com"
                                required
                                className="h-10 rounded-md border-gray-200 focus:border-[#635bff] focus:ring-[#635bff] bg-white dark:bg-zinc-900 transition-all shadow-sm"
                            />
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password" className="text-sm font-medium text-[#6b7c93] dark:text-zinc-400">Password</Label>
                                <a href="#" className="text-sm text-[#635bff] hover:text-[#424770] font-medium">Forgot password?</a>
                            </div>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="h-10 rounded-md border-gray-200 focus:border-[#635bff] focus:ring-[#635bff] bg-white dark:bg-zinc-900 transition-all shadow-sm"
                            />
                        </div>
                        <Button className="w-full bg-[#635bff] hover:bg-[#424770] text-white font-semibold h-10 shadow-sm transition-all" type="submit">
                            Sign In
                        </Button>
                    </CardContent>
                </form>
            </Card>
        </div>
    )
}

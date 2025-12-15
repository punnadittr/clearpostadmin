'use client'

import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

export function SubmitButton() {
    const { pending } = useFormStatus()

    return (
        <Button
            className="w-full bg-[#635bff] hover:bg-[#424770] text-white font-semibold h-10 shadow-sm transition-all flex items-center justify-center"
            type="submit"
            disabled={pending}
        >
            {pending ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing In...
                </>
            ) : (
                'Sign In'
            )}
        </Button>
    )
}

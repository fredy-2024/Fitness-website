"use client"

import { useEffect, useState } from "react"
import { getProviders, signIn } from "next-auth/react"
import { Loader2 } from "lucide-react"

export function GoogleSignInButton({ dividerLabel }: { dividerLabel: string }) {
    const [isAvailable, setIsAvailable] = useState<boolean | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")

    useEffect(() => {
        let isMounted = true

        getProviders()
            .then((providers) => {
                if (isMounted) {
                    setIsAvailable(Boolean(providers?.google))
                }
            })
            .catch(() => {
                if (isMounted) {
                    setIsAvailable(false)
                    setError("Google sign-in could not be loaded. Please refresh and try again.")
                }
            })

        return () => {
            isMounted = false
        }
    }, [])

    const handleGoogleSignIn = async () => {
        setIsLoading(true)
        setError("")

        try {
            const result = await signIn("google", {
                callbackUrl: "/dashboard",
                redirect: false,
            })

            if (result?.error || !result?.url) {
                setError("Google sign-in failed. Please try again or use your email and password.")
                setIsLoading(false)
                return
            }

            window.location.assign(result.url)
        } catch {
            setError("Google sign-in failed. Please try again or use your email and password.")
            setIsLoading(false)
        }
    }

    if (isAvailable === false && !error) {
        return null
    }

    return (
        <div className="space-y-6">
            {isAvailable && (
                <>
                    <button
                        type="button"
                        onClick={handleGoogleSignIn}
                        disabled={isLoading}
                        className="flex w-full items-center justify-center gap-3 rounded-md border border-violet-500/20 bg-white/[0.03] px-4 py-3 text-sm font-medium text-white transition hover:bg-violet-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isLoading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <span aria-hidden="true" className="text-lg font-bold text-[#4285F4]">G</span>
                        )}
                        Continue with Google
                    </button>
                    <div className="flex items-center gap-4 text-xs uppercase tracking-widest text-gray-500">
                        <span className="h-px flex-1 bg-white/10" />
                        <span>{dividerLabel}</span>
                        <span className="h-px flex-1 bg-white/10" />
                    </div>
                </>
            )}
            {error && <p role="status" className="text-center text-sm text-red-400">{error}</p>}
        </div>
    )
}

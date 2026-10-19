"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { CheckCircle2, Loader2 } from "lucide-react"

export default function ResetPasswordPage() {
    const params = useParams<{ token: string }>()
    const router = useRouter()
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [complete, setComplete] = useState(false)

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setError("")
        if (password !== confirmPassword) {
            setError("The passwords do not match.")
            return
        }

        setLoading(true)
        try {
            const response = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token: params.token, password }),
            })
            const data: unknown = await response.json()
            if (!response.ok) {
                throw new Error(
                    typeof data === "object" && data !== null && "error" in data && typeof data.error === "string"
                        ? data.error
                        : "Unable to reset your password.",
                )
            }
            setComplete(true)
            router.refresh()
        } catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : "Unable to reset your password.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="w-full max-w-md space-y-7">
            <div className="text-center">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
                    <CheckCircle2 className="h-6 w-6" />
                </span>
                <h1 className="mt-5 text-3xl font-bold tracking-tight">Set a new password</h1>
                <p className="mt-2 text-sm text-gray-400">Choose a new password with at least 8 characters.</p>
            </div>

            {complete ? (
                <div className="space-y-5 text-center">
                    <p role="status" className="rounded-lg border border-emerald-400/20 bg-emerald-400/10 p-3 text-sm text-emerald-200">
                        Your password was reset successfully.
                    </p>
                    <Link href="/login" className="inline-flex w-full items-center justify-center rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90">
                        Sign in with your new password
                    </Link>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="new-password" className="sr-only">New password</label>
                        <input
                            id="new-password"
                            name="password"
                            type="password"
                            autoComplete="new-password"
                            required
                            minLength={8}
                            maxLength={72}
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            placeholder="New password"
                            className="block w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-3 text-white placeholder:text-gray-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 sm:text-sm"
                        />
                    </div>
                    <div>
                        <label htmlFor="confirm-password" className="sr-only">Confirm new password</label>
                        <input
                            id="confirm-password"
                            name="confirmPassword"
                            type="password"
                            autoComplete="new-password"
                            required
                            minLength={8}
                            maxLength={72}
                            value={confirmPassword}
                            onChange={(event) => setConfirmPassword(event.target.value)}
                            placeholder="Confirm new password"
                            className="block w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-3 text-white placeholder:text-gray-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 sm:text-sm"
                        />
                    </div>

                    {error && <p role="alert" className="text-center text-sm text-red-300">{error}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading ? <><Loader2 className="h-5 w-5 animate-spin" /> Updating password...</> : "Reset password"}
                    </button>
                </form>
            )}
        </div>
    )
}

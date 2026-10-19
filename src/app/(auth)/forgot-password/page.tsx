"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Loader2, MailCheck } from "lucide-react"

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [message, setMessage] = useState("")

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setLoading(true)
        setError("")
        setMessage("")

        try {
            const response = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            })
            const data: unknown = await response.json()
            if (!response.ok) {
                throw new Error(
                    typeof data === "object" && data !== null && "error" in data && typeof data.error === "string"
                        ? data.error
                        : "Unable to request a password reset.",
                )
            }
            setMessage(
                typeof data === "object" && data !== null && "message" in data && typeof data.message === "string"
                    ? data.message
                    : "If an eligible account exists for that email, password reset instructions will be sent shortly.",
            )
        } catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : "Unable to request a password reset.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="w-full max-w-md space-y-7">
            <div className="text-center">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
                    <MailCheck className="h-6 w-6" />
                </span>
                <h1 className="mt-5 text-3xl font-bold tracking-tight">Forgot your password?</h1>
                <p className="mt-2 text-sm leading-6 text-gray-400">Enter the email linked to your account and we&apos;ll send a one-time reset link.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label htmlFor="reset-email" className="sr-only">Email address</label>
                    <input
                        id="reset-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        autoCapitalize="none"
                        spellCheck={false}
                        required
                        maxLength={254}
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="Email address"
                        className="block w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-3 text-white placeholder:text-gray-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 sm:text-sm"
                    />
                </div>

                {error && <p role="alert" className="text-center text-sm text-red-300">{error}</p>}
                {message && <p role="status" className="rounded-lg border border-emerald-400/20 bg-emerald-400/10 p-3 text-center text-sm text-emerald-200">{message}</p>}

                <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {loading ? <><Loader2 className="h-5 w-5 animate-spin" /> Sending link...</> : "Send reset link"}
                </button>
            </form>

            <div className="text-center">
                <Link href="/login" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80">
                    <ArrowLeft className="h-4 w-4" /> Back to sign in
                </Link>
            </div>
        </div>
    )
}

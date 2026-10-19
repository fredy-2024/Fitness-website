"use client"

import { useEffect, useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Loader2 } from "lucide-react"
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton"

export default function LoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [rememberEmail, setRememberEmail] = useState(true)

    useEffect(() => {
        try {
            const rememberedEmail = window.localStorage.getItem("zenfit.rememberedEmail")
            if (rememberedEmail) {
                setEmail(rememberedEmail)
                setRememberEmail(true)
            }
        } catch (storageError) {
            console.warn("Could not load the remembered email from this browser.", storageError)
        }
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")

        try {
            try {
                if (rememberEmail) {
                    window.localStorage.setItem("zenfit.rememberedEmail", email.trim())
                } else {
                    window.localStorage.removeItem("zenfit.rememberedEmail")
                }
            } catch (storageError) {
                console.warn("Could not save the remembered email in this browser.", storageError)
            }

            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            })

            if (result?.error) {
                setError("Invalid email or password")
            } else {
                router.push("/dashboard")
                router.refresh()
            }
        } catch {
            setError("Something went wrong")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="w-full max-w-md space-y-8">
            <div className="text-center">
                <h2 className="text-3xl font-bold tracking-tight">Welcome back</h2>
                <p className="mt-2 text-sm text-gray-400">
                    Sign in to your account to continue
                </p>
            </div>

            <GoogleSignInButton dividerLabel="or sign in with email" />

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                    <div>
                        <label htmlFor="email" className="sr-only">
                            Email address
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            autoCapitalize="none"
                            spellCheck={false}
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-700 bg-gray-900 placeholder-gray-500 text-white rounded-t-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                            placeholder="Email address"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="sr-only">
                            Password
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-700 bg-gray-900 placeholder-gray-500 text-white rounded-b-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                            placeholder="Password"
                        />
                    </div>
                    <label className="flex items-center gap-2 text-sm text-gray-400">
                        <input
                            type="checkbox"
                            checked={rememberEmail}
                            onChange={(event) => setRememberEmail(event.target.checked)}
                            className="h-4 w-4 rounded border-gray-600 bg-gray-900 text-primary focus:ring-primary"
                        />
                        Remember email on this device
                    </label>
                </div>

                {error && (
                    <div className="text-red-500 text-sm text-center">{error}</div>
                )}

                <div className="-mt-3 text-right text-sm">
                    <Link href="/forgot-password" className="font-medium text-primary hover:text-primary/80">
                        Forgot password?
                    </Link>
                </div>

                <div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <Loader2 className="animate-spin h-5 w-5" />
                        ) : (
                            "Sign in"
                        )}
                    </button>
                </div>
            </form>

            <div className="text-center text-sm">
                <span className="text-gray-400">Don&apos;t have an account? </span>
                <Link
                    href="/register"
                    className="font-medium text-primary hover:text-primary/80"
                >
                    Sign up
                </Link>
            </div>
        </div>
    )
}

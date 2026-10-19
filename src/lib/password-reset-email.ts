import nodemailer from "nodemailer"

export function createPasswordResetMailer() {
    const user = process.env.GMAIL_USER
    const pass = process.env.GMAIL_APP_PASSWORD
    const appUrl = process.env.NEXTAUTH_URL

    if (!user || !pass || !appUrl) {
        throw new Error("Gmail password reset email is not fully configured.")
    }

    return {
        user,
        resetUrl(token: string) {
            return new URL(`/reset-password/${encodeURIComponent(token)}`, appUrl).toString()
        },
        transporter: nodemailer.createTransport({
            service: "gmail",
            auth: { user, pass },
        }),
    }
}

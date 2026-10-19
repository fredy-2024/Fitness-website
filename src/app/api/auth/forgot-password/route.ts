import { createHash, randomBytes } from "node:crypto"
import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { createPasswordResetMailer } from "@/lib/password-reset-email"

const requestSchema = z.object({
    email: z.string().trim().email().max(254).transform((email) => email.toLowerCase()),
})

const genericResponse = {
    message: "If an eligible account exists for that email, password reset instructions will be sent shortly.",
}

export async function POST(request: Request) {
    let body: unknown
    try {
        body = await request.json()
    } catch {
        return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
    }

    const parsed = requestSchema.safeParse(body)
    if (!parsed.success) {
        return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 })
    }

    let mailer: ReturnType<typeof createPasswordResetMailer>
    try {
        mailer = createPasswordResetMailer()
    } catch (error) {
        console.error("Password reset email is not configured", error)
        return NextResponse.json({ error: "Password reset email is not configured. Please contact the site administrator." }, { status: 503 })
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email: parsed.data.email },
            select: { id: true, password: true },
        })
        if (!user?.password) {
            return NextResponse.json(genericResponse)
        }

        const token = randomBytes(32).toString("hex")
        const tokenHash = createHash("sha256").update(token).digest("hex")
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000)

        await prisma.$transaction([
            prisma.passwordResetToken.deleteMany({
                where: { OR: [{ userId: user.id }, { expiresAt: { lte: new Date() } }] },
            }),
            prisma.passwordResetToken.create({
                data: { tokenHash, userId: user.id, expiresAt },
            }),
        ])

        const resetUrl = mailer.resetUrl(token)
        try {
            await mailer.transporter.sendMail({
                from: mailer.user,
                to: parsed.data.email,
                subject: "Reset your ZenFit password",
                text: `Use this one-time link to reset your ZenFit password. It expires in one hour: ${resetUrl}`,
                html: `<p>We received a request to reset your ZenFit password.</p><p><a href="${resetUrl}">Reset your password</a></p><p>This one-time link expires in one hour. If you did not request a reset, you can ignore this email.</p>`,
            })
        } catch (error) {
            await prisma.passwordResetToken.deleteMany({ where: { tokenHash } })
            console.error("Failed to send a password reset email", error)
            return NextResponse.json({ error: "Unable to send the reset email right now. Please try again later." }, { status: 503 })
        }

        return NextResponse.json(genericResponse)
    } catch (error) {
        console.error("Password reset request failed", error)
        return NextResponse.json({ error: "Unable to process the password reset request right now." }, { status: 500 })
    }
}

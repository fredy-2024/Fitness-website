import { createHash } from "node:crypto"
import { NextResponse } from "next/server"
import { z } from "zod"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { passwordSchema } from "@/lib/auth-validation"

const requestSchema = z.object({
    token: z.string().regex(/^[a-f0-9]{64}$/),
    password: passwordSchema,
})

export async function POST(request: Request) {
    let body: unknown
    try {
        body = await request.json()
    } catch {
        return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
    }

    const parsed = requestSchema.safeParse(body)
    if (!parsed.success) {
        return NextResponse.json(
            { error: "Use a valid reset link and a password with at least 8 characters." },
            { status: 400 },
        )
    }

    const tokenHash = createHash("sha256").update(parsed.data.token).digest("hex")

    try {
        const resetToken = await prisma.passwordResetToken.findUnique({
            where: { tokenHash },
            select: { id: true, userId: true, expiresAt: true },
        })
        if (!resetToken || resetToken.expiresAt <= new Date()) {
            if (resetToken) {
                await prisma.passwordResetToken.delete({ where: { id: resetToken.id } })
            }
            return NextResponse.json({ error: "This password reset link is invalid or expired. Request a new one." }, { status: 400 })
        }

        const hashedPassword = await bcrypt.hash(parsed.data.password, 12)
        await prisma.$transaction(async (transaction) => {
            const deleted = await transaction.passwordResetToken.deleteMany({
                where: {
                    id: resetToken.id,
                    tokenHash,
                    expiresAt: { gt: new Date() },
                },
            })
            if (deleted.count !== 1) {
                throw new Error("Password reset link has already been used or expired.")
            }

            await transaction.user.update({
                where: { id: resetToken.userId },
                data: { password: hashedPassword },
            })
            await transaction.passwordResetToken.deleteMany({
                where: { userId: resetToken.userId },
            })
        })

        return NextResponse.json({ message: "Your password has been reset. You can now sign in." })
    } catch (error) {
        if (error instanceof Error && error.message === "Password reset link has already been used or expired.") {
            return NextResponse.json({ error: "This password reset link is invalid or expired. Request a new one." }, { status: 400 })
        }
        console.error("Password reset failed", error)
        return NextResponse.json({ error: "Unable to reset your password right now. Please try again." }, { status: 500 })
    }
}

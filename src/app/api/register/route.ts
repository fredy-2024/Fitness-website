import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { Prisma } from "@prisma/client"
import { registerSchema } from "@/lib/auth-validation"

export async function POST(req: Request) {
    let body: unknown
    try {
        body = await req.json()
    } catch (error) {
        if (error instanceof SyntaxError) {
            return NextResponse.json({ message: "Invalid request body" }, { status: 400 })
        }
        return NextResponse.json({ message: "Unable to process registration" }, { status: 400 })
    }

    const parsed = registerSchema.safeParse(body)
    if (!parsed.success) {
        return NextResponse.json(
            { message: "Enter a valid name and email, and a password with at least 8 characters." },
            { status: 400 }
        )
    }

    const { email, password, name } = parsed.data

    try {
        const existingUser = await prisma.user.findUnique({ where: { email } })
        if (existingUser) {
            return NextResponse.json(
                { message: "An account with this email already exists." },
                { status: 409 }
            )
        }

        const hashedPassword = await bcrypt.hash(password, 12)
        const newUser = await prisma.user.create({
            data: { email, name, password: hashedPassword }
        })

        return NextResponse.json(
            {
                user: {
                    id: newUser.id,
                    email: newUser.email,
                    name: newUser.name,
                    role: newUser.role,
                },
                message: "User created successfully",
            },
            { status: 201 }
        )
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
            return NextResponse.json(
                { message: "An account with this email already exists." },
                { status: 409 }
            )
        }
        console.error("Registration failed", error)
        return NextResponse.json({ message: "Unable to create your account right now." }, { status: 500 })
    }
}

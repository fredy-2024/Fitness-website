import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions)
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    if (!id || id.length > 100) {
        return NextResponse.json({ error: "Invalid workout ID." }, { status: 400 })
    }

    try {
        const workout = await prisma.workoutTemplate.findFirst({
            where: {
                id,
                OR: [{ authorId: session.user.id }, { isPublic: true }],
            },
            select: {
                id: true,
                name: true,
                _count: { select: { exercises: true } },
            },
        })

        if (!workout) {
            return NextResponse.json({ error: "Workout not found." }, { status: 404 })
        }
        if (workout._count.exercises === 0) {
            return NextResponse.json({ error: "A workout without exercises cannot be completed." }, { status: 400 })
        }

        const completedAt = new Date()
        const workoutLog = await prisma.workoutLog.create({
            data: {
                userId: session.user.id,
                workoutTemplateId: workout.id,
                name: workout.name,
                startedAt: completedAt,
                endedAt: completedAt,
            },
            select: { id: true, endedAt: true },
        })

        return NextResponse.json(workoutLog, { status: 201 })
    } catch (error) {
        console.error("Failed to save workout completion", error)
        return NextResponse.json({ error: "Failed to save workout completion." }, { status: 500 })
    }
}

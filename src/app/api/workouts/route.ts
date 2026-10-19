import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"
import { z, ZodError } from "zod"

const createWorkoutSchema = z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    exercises: z.array(z.object({
        id: z.string(),
        sets: z.number().min(1),
        reps: z.number().min(1),
    }))
})

export async function GET(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    try {
        const workouts = await prisma.workoutTemplate.findMany({
            where: {
                OR: [
                    { authorId: session.user.id },
                    { isPublic: true }
                ]
            },
            include: {
                exercises: {
                    include: {
                        exercise: true
                    },
                    orderBy: {
                        order: 'asc'
                    }
                },
                author: {
                    select: {
                        name: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return NextResponse.json(workouts)
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch workouts" }, { status: 500 })
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    try {
        const body = await req.json()
        const { name, description, exercises } = createWorkoutSchema.parse(body)

        const workout = await prisma.workoutTemplate.create({
            data: {
                name,
                description,
                authorId: session.user.id,
                exercises: {
                    create: exercises.map((ex, index) => ({
                        exerciseId: ex.id,
                        order: index,
                        sets: ex.sets,
                        reps: ex.reps,
                    }))
                }
            }
        })

        return NextResponse.json(workout)
    } catch (error) {
        if (error instanceof ZodError) {
            return NextResponse.json({ error: "Invalid workout payload" }, { status: 400 })
        }
        return NextResponse.json({ error: "Failed to create workout" }, { status: 500 })
    }
}

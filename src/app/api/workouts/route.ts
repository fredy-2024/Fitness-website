import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"
import { Prisma } from "@prisma/client"
import { z } from "zod"

const workoutExerciseSchema = z.object({
    id: z.string().min(1).max(100),
    name: z.string().trim().min(1).max(200).optional(),
    bodyPart: z.string().trim().min(1).max(100).optional(),
    target: z.string().trim().min(1).max(100).optional(),
    equipment: z.string().max(100).optional(),
    gifUrl: z.string().url().max(2048).optional(),
    instructions: z.array(z.string().max(2000)).max(100).optional().default([]),
    sets: z.number().int().min(1).max(99),
    reps: z.number().int().min(1).max(999),
}).refine((exercise) => {
    const snapshotFields = [exercise.name, exercise.bodyPart, exercise.target, exercise.equipment]
    return snapshotFields.every((field) => field === undefined)
        || snapshotFields.every((field) => field !== undefined)
}, "ExerciseDB exercise details must be provided together.")

const createWorkoutSchema = z.object({
    name: z.string().trim().min(1).max(100),
    description: z.string().trim().max(1000).optional(),
    exercises: z.array(workoutExerciseSchema).min(1).max(50)
        .refine((exercises) => new Set(exercises.map((exercise) => exercise.id)).size === exercises.length,
            "Exercises cannot be duplicated."),
})

export async function GET() {
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
        console.error("Failed to fetch workouts", error)
        return NextResponse.json({ error: "Failed to fetch workouts" }, { status: 500 })
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    try {
        let body: unknown
        try {
            body = await req.json()
        } catch {
            return NextResponse.json({ error: "Invalid JSON request body." }, { status: 400 })
        }
        const parsed = createWorkoutSchema.safeParse(body)
        if (!parsed.success) {
            return NextResponse.json({ error: "Invalid workout payload." }, { status: 400 })
        }
        const { name, description, exercises } = parsed.data

        const workout = await prisma.workoutTemplate.create({
            data: {
                name,
                description,
                authorId: session.user.id,
                exercises: {
                    create: exercises.map((ex, index) => {
                        const hasExerciseDbDetails = ex.name !== undefined
                        return {
                            ...(hasExerciseDbDetails
                                ? {
                                    externalExerciseId: ex.id,
                                    exerciseName: ex.name,
                                    bodyPart: ex.bodyPart,
                                    target: ex.target,
                                    equipment: ex.equipment,
                                    gifUrl: ex.gifUrl,
                                    instructions: JSON.stringify(ex.instructions),
                                }
                                : { exerciseId: ex.id }),
                            order: index,
                            sets: ex.sets,
                            reps: ex.reps,
                        }
                    })
                }
            }
        })

        return NextResponse.json(workout, { status: 201 })
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
            return NextResponse.json({ error: "One or more selected exercises are no longer available." }, { status: 400 })
        }
        console.error("Failed to create workout", error)
        return NextResponse.json({ error: "Failed to create workout" }, { status: 500 })
    }
}

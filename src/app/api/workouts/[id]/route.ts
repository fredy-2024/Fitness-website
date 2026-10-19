import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

function parseInstructions(value: string | null) {
    if (!value) return []

    try {
        const parsed: unknown = JSON.parse(value)
        return Array.isArray(parsed) && parsed.every((item) => typeof item === "string")
            ? parsed
            : [value]
    } catch {
        return [value]
    }
}

export async function GET(
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
            include: {
                exercises: {
                    include: { exercise: true },
                    orderBy: { order: "asc" },
                },
            },
        })

        if (!workout) {
            return NextResponse.json({ error: "Workout not found." }, { status: 404 })
        }

        return NextResponse.json({
            id: workout.id,
            name: workout.name,
            description: workout.description,
            exercises: workout.exercises.map((item) => ({
                id: item.id,
                exerciseId: item.externalExerciseId ?? item.exerciseId,
                name: item.exerciseName ?? item.exercise?.name ?? "Exercise",
                bodyPart: item.bodyPart ?? item.exercise?.muscleGroup ?? "",
                target: item.target ?? "",
                equipment: item.equipment ?? item.exercise?.equipment ?? "",
                imageSrc: item.externalExerciseId
                    ? `/api/exercise-image?id=${encodeURIComponent(item.externalExerciseId)}`
                    : item.exercise?.gifUrl ?? null,
                instructions: item.externalExerciseId
                    ? parseInstructions(item.instructions)
                    : item.exercise?.instructions
                        ? parseInstructions(item.exercise.instructions)
                        : [],
                sets: item.sets,
                reps: item.reps,
                restTime: item.restTime,
                order: item.order,
            })),
        })
    } catch (error) {
        console.error("Failed to fetch workout details", error)
        return NextResponse.json({ error: "Failed to load workout." }, { status: 500 })
    }
}

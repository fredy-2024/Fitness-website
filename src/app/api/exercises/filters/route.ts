import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { z } from "zod"
import { authOptions } from "@/lib/auth"
import { ExerciseDbError, fetchExerciseDb } from "@/lib/exercisedb"

const valuesSchema = z.array(z.string().min(1))

export async function GET() {
    const session = await getServerSession(authOptions)
    if (!session) {
        return NextResponse.json({ error: "You must be signed in to view exercises." }, { status: 401 })
    }

    try {
        const [bodyParts, targets, equipment] = await Promise.all([
            fetchExerciseDb<unknown>("/exercises/bodyPartList", 3600),
            fetchExerciseDb<unknown>("/exercises/targetList", 3600),
            fetchExerciseDb<unknown>("/exercises/equipmentList", 3600),
        ])
        const parsedBodyParts = valuesSchema.safeParse(bodyParts)
        const parsedTargets = valuesSchema.safeParse(targets)
        const parsedEquipment = valuesSchema.safeParse(equipment)

        if (!parsedBodyParts.success || !parsedTargets.success || !parsedEquipment.success) {
            return NextResponse.json({ error: "ExerciseDB returned invalid filter data." }, { status: 502 })
        }

        return NextResponse.json({
            bodyParts: parsedBodyParts.data,
            targets: parsedTargets.data,
            equipment: parsedEquipment.data,
        })
    } catch (error) {
        if (error instanceof ExerciseDbError) {
            const status = error.message === "ExerciseDB API is not configured." ? 503 : 502
            return NextResponse.json({ error: error.message }, { status })
        }
        console.error("Failed to fetch ExerciseDB filters", error)
        return NextResponse.json({ error: "Failed to fetch exercise filters." }, { status: 500 })
    }
}

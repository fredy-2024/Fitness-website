import { NextResponse } from "next/server"
import { ExerciseDbError, fetchExerciseDb } from "@/lib/exercisedb"
import { z } from "zod"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

const bodyPartsSchema = z.array(z.string().min(1))

export async function GET() {
    const session = await getServerSession(authOptions)
    if (!session) {
        return NextResponse.json({ error: "You must be signed in to view exercises." }, { status: 401 })
    }

    try {
        const result: unknown = await fetchExerciseDb<unknown>("/exercises/bodyPartList", 3600)
        const parsed = bodyPartsSchema.safeParse(result)
        if (!parsed.success) {
            return NextResponse.json(
                { error: "ExerciseDB returned an unexpected body part list." },
                { status: 502 }
            )
        }

        return NextResponse.json(parsed.data)
    } catch (error) {
        if (error instanceof ExerciseDbError) {
            const status = error.message === "ExerciseDB API is not configured." ? 503 : 502
            return NextResponse.json({ error: error.message }, { status })
        }
        console.error("Failed to fetch ExerciseDB body parts", error)
        return NextResponse.json({ error: "Failed to fetch body parts." }, { status: 500 })
    }
}

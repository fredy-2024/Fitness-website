import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"
import {
    ExerciseDbError,
    exerciseDbExerciseSchema,
    fetchExerciseDb,
} from "@/lib/exercisedb"

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions)
    if (!session) {
        return NextResponse.json({ error: "You must be signed in to view exercises." }, { status: 401 })
    }

    const { id } = await params
    if (!/^[a-zA-Z0-9_-]{1,80}$/.test(id)) {
        return NextResponse.json({ error: "Invalid exercise ID." }, { status: 400 })
    }

    try {
        const result: unknown = await fetchExerciseDb<unknown>(
            `/exercises/exercise/${encodeURIComponent(id)}`,
            3600
        )
        const parsed = exerciseDbExerciseSchema.safeParse(result)
        if (!parsed.success) {
            return NextResponse.json(
                { error: "ExerciseDB returned exercise details in an unexpected format." },
                { status: 502 }
            )
        }
        return NextResponse.json(parsed.data)
    } catch (error) {
        if (error instanceof ExerciseDbError) {
            const status = error.message === "ExerciseDB API is not configured." ? 503 : 502
            return NextResponse.json({ error: error.message }, { status })
        }
        console.error("Failed to fetch ExerciseDB exercise details", error)
        return NextResponse.json({ error: "Failed to fetch exercise details." }, { status: 500 })
    }
}

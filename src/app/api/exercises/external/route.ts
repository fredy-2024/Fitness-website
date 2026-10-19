import { NextResponse } from "next/server"
import {
    ExerciseDbError,
    exerciseDbExercisesSchema,
    fetchExerciseDb,
} from "@/lib/exercisedb"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: Request) {
    const session = await getServerSession(authOptions)
    if (!session) {
        return NextResponse.json({ error: "You must be signed in to view exercises." }, { status: 401 })
    }

    const url = new URL(request.url)
    const bodyPart = url.searchParams.get("bodyPart")?.trim()
    const target = url.searchParams.get("target")?.trim()
    const equipment = url.searchParams.get("equipment")?.trim()
    const search = url.searchParams.get("search")?.trim().toLowerCase() ?? ""
    const name = (url.searchParams.get("name")?.trim() || search).toLowerCase()
    const limitValue = url.searchParams.get("limit") ?? "10"
    const offsetValue = url.searchParams.get("offset") ?? "0"
    const sortMethod = url.searchParams.get("sortMethod") ?? "id"
    const sortOrder = url.searchParams.get("sortOrder") ?? "ascending"
    const limit = Number(limitValue)
    const offset = Number(offsetValue)
    const selectedFilter = name || bodyPart || target || equipment

    if (
        !/^\d+$/.test(limitValue)
        || !Number.isSafeInteger(limit)
        || limit < 1
        || limit > 50
        || !/^\d+$/.test(offsetValue)
        || !Number.isSafeInteger(offset)
        || offset > 10000
        || !["id", "name"].includes(sortMethod)
        || !["ascending", "descending"].includes(sortOrder)
    ) {
        return NextResponse.json(
            { error: "Use a limit from 1 to 50, an offset from 0 to 10000, sortMethod id or name, and sortOrder ascending or descending." },
            { status: 400 }
        )
    }

    if (!selectedFilter || selectedFilter.length > 100) {
        return NextResponse.json(
            { error: "Provide an exercise name, body part, target muscle, or equipment filter." },
            { status: 400 }
        )
    }

    const filterPath = equipment
        ? `/exercises/equipment/${encodeURIComponent(equipment)}`
        : bodyPart
            ? `/exercises/bodyPart/${encodeURIComponent(bodyPart)}`
            : target
                ? `/exercises/target/${encodeURIComponent(target)}`
                : `/exercises/name/${encodeURIComponent(name)}`

    if ([bodyPart, target, equipment, name].some((filter) => filter && filter.length > 100)) {
        return NextResponse.json({ error: "Exercise filters must be 100 characters or fewer." }, { status: 400 })
    }

    try {
        const apiUrl = new URLSearchParams({
            limit: String(limit),
            sortMethod,
            sortOrder,
            offset: String(offset),
        })
        const result: unknown = await fetchExerciseDb<unknown>(`${filterPath}?${apiUrl.toString()}`, 3600)
        const parsed = exerciseDbExercisesSchema.safeParse(result)
        if (!parsed.success) {
            return NextResponse.json(
                { error: "ExerciseDB returned exercises in an unexpected format." },
                { status: 502 }
            )
        }

        const filtered = parsed.data.filter((exercise) =>
            (!bodyPart || exercise.bodyPart.toLowerCase() === bodyPart.toLowerCase())
            && (!target || exercise.target.toLowerCase() === target.toLowerCase())
            && (!equipment || exercise.equipment.toLowerCase() === equipment.toLowerCase())
            && (!name || exercise.name.toLowerCase().includes(name))
        )

        return NextResponse.json({
            exercises: filtered,
            limit,
            offset,
            sortMethod,
            sortOrder,
            hasMore: parsed.data.length === limit,
        })
    } catch (error) {
        if (error instanceof ExerciseDbError) {
            const status = error.message === "ExerciseDB API is not configured." ? 503 : 502
            return NextResponse.json({ error: error.message }, { status })
        }
        console.error("Failed to fetch exercises from ExerciseDB", error)
        return NextResponse.json({ error: "Failed to fetch exercises." }, { status: 500 })
    }
}

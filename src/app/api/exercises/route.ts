import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { MuscleGroup } from "@prisma/client"

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)
    const muscleGroup = searchParams.get("muscleGroup")
    const search = searchParams.get("search")

    try {
        const exercises = await prisma.exercise.findMany({
            where: {
                muscleGroup: muscleGroup ? (muscleGroup as MuscleGroup) : undefined,
                name: search ? { contains: search } : undefined,
            },
            orderBy: {
                name: "asc",
            },
        })

        return NextResponse.json(exercises)
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch exercises" }, { status: 500 })
    }
}

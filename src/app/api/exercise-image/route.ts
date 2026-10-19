import { getServerSession } from "next-auth"
import { NextRequest, NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"

const apiHost = "exercisedb.p.rapidapi.com"

export async function GET(request: NextRequest) {
    const session = await getServerSession(authOptions)
    if (!session) {
        return NextResponse.json(
            { error: "You must be signed in to view exercise demonstrations." },
            { status: 401 }
        )
    }

    const exerciseId = request.nextUrl.searchParams.get("id")
    if (!exerciseId || !/^[a-zA-Z0-9_-]{1,80}$/.test(exerciseId)) {
        return NextResponse.json(
            { error: "A valid exercise ID is required." },
            { status: 400 }
        )
    }

    const apiKey = process.env.EXERCISEDB_API_KEY || process.env.EXERCISEDB_RAPIDAPI_KEY
    if (!apiKey) {
        return NextResponse.json(
            { error: "ExerciseDB API key is not configured." },
            { status: 503 }
        )
    }

    try {
        const apiUrl = new URL(`https://${apiHost}/image`)
        apiUrl.searchParams.set("exerciseId", exerciseId)
        apiUrl.searchParams.set("resolution", "180")

        const upstream = await fetch(apiUrl, {
            method: "GET",
            headers: {
                "x-rapidapi-key": apiKey,
                "x-rapidapi-host": apiHost,
            },
            signal: AbortSignal.timeout(10000),
            cache: "no-store",
        })

        if (!upstream.ok) {
            console.error(`ExerciseDB image request returned status ${upstream.status}`)
            return NextResponse.json(
                { error: "ExerciseDB could not provide this exercise demonstration." },
                { status: upstream.status === 404 ? 404 : 502 }
            )
        }

        const contentType = upstream.headers.get("content-type")?.split(";")[0].trim()
        if (!contentType || !/^image\/(gif|webp|png|jpeg)$/.test(contentType)) {
            console.error("ExerciseDB image endpoint returned a non-image response")
            return NextResponse.json(
                { error: "ExerciseDB returned an invalid exercise demonstration." },
                { status: 502 }
            )
        }

        if (!upstream.body) {
            return NextResponse.json(
                { error: "ExerciseDB returned an empty exercise demonstration." },
                { status: 502 }
            )
        }

        return new Response(upstream.body, {
            status: 200,
            headers: {
                "Content-Type": contentType,
                "Cache-Control": "private, max-age=86400",
                "X-Content-Type-Options": "nosniff",
            },
        })
    } catch (error) {
        console.error("ExerciseDB image request failed", error)
        return NextResponse.json(
            { error: "Failed to fetch the exercise demonstration." },
            { status: 502 }
        )
    }
}
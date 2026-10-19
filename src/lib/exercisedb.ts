import { z } from "zod"

const apiHost = "exercisedb.p.rapidapi.com"
const apiBaseUrl = `https://${apiHost}`

export const exerciseDbExerciseSchema = z.object({
    id: z.string(),
    name: z.string(),
    bodyPart: z.string(),
    equipment: z.string().optional().default(""),
    target: z.string().optional().default(""),
    secondaryMuscles: z.array(z.string()).optional().default([]),
    instructions: z.array(z.string()).optional().default([]),
    gifUrl: z.string().url().optional(),
}).passthrough()

export const exerciseDbExercisesSchema = z.array(exerciseDbExerciseSchema)
export type ExerciseDbExercise = z.infer<typeof exerciseDbExerciseSchema>

export class ExerciseDbError extends Error {
    constructor(message: string) {
        super(message)
        this.name = "ExerciseDbError"
    }
}

export async function fetchExerciseDb<T>(path: string, revalidate?: number): Promise<T> {
    const apiKey = process.env.EXERCISEDB_API_KEY || process.env.EXERCISEDB_RAPIDAPI_KEY
    if (!apiKey) {
        throw new ExerciseDbError("ExerciseDB API is not configured.")
    }

    let response: Response
    try {
        response = await fetch(`${apiBaseUrl}${path}`, {
            headers: {
                "x-rapidapi-key": apiKey,
                "x-rapidapi-host": apiHost,
            },
            signal: AbortSignal.timeout(10000),
            ...(revalidate ? { next: { revalidate } } : { cache: "no-store" }),
        })
    } catch (error) {
        throw new ExerciseDbError(
            error instanceof Error && error.name === "TimeoutError"
                ? "ExerciseDB request timed out."
                : "Unable to connect to ExerciseDB."
        )
    }

    if (!response.ok) {
        throw new ExerciseDbError(`ExerciseDB returned status ${response.status}.`)
    }

    try {
        return await response.json() as T
    } catch {
        throw new ExerciseDbError("ExerciseDB returned an invalid response.")
    }
}

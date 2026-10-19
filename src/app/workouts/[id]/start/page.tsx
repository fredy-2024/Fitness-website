"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, CheckCircle2, Circle, Dumbbell, Loader2 } from "lucide-react"
import { Navbar } from "@/components/Navbar"

type WorkoutExercise = {
    id: string
    name: string
    bodyPart: string
    target: string
    equipment: string
    imageSrc: string | null
    instructions: string[]
    sets: number | null
    reps: number | null
    restTime: number | null
    order: number
}

type Workout = {
    id: string
    name: string
    description: string | null
    exercises: WorkoutExercise[]
}

function getErrorMessage(data: unknown, fallback = "Unable to load this workout.") {
    if (typeof data === "object" && data !== null && "error" in data && typeof data.error === "string") {
        return data.error
    }
    return fallback
}

export default function StartWorkoutPage() {
    const params = useParams<{ id: string }>()
    const workoutId = params.id
    const [workout, setWorkout] = useState<Workout | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [completed, setCompleted] = useState<string[]>([])
    const [workoutCompleted, setWorkoutCompleted] = useState(false)
    const [completing, setCompleting] = useState(false)
    const [completionError, setCompletionError] = useState("")

    useEffect(() => {
        const controller = new AbortController()

        const loadWorkout = async () => {
            try {
                const response = await fetch(`/api/workouts/${encodeURIComponent(workoutId)}`, {
                    signal: controller.signal,
                })
                const data: unknown = await response.json()
                if (!response.ok) {
                    throw new Error(getErrorMessage(data))
                }
                if (
                    typeof data !== "object"
                    || data === null
                    || !("id" in data)
                    || !("name" in data)
                    || !("exercises" in data)
                    || typeof data.id !== "string"
                    || typeof data.name !== "string"
                    || !Array.isArray(data.exercises)
                ) {
                    throw new Error("The workout returned invalid data.")
                }
                setWorkout(data as Workout)
            } catch (error) {
                if (!controller.signal.aborted) {
                    setError(error instanceof Error ? error.message : "Unable to load this workout.")
                }
            } finally {
                if (!controller.signal.aborted) setLoading(false)
            }
        }

        void loadWorkout()
        return () => controller.abort()
    }, [workoutId])

    const toggleCompleted = (exerciseId: string) => {
        if (workoutCompleted) return
        setCompleted((current) =>
            current.includes(exerciseId)
                ? current.filter((id) => id !== exerciseId)
                : [...current, exerciseId]
        )
    }

    const completeWorkout = async () => {
        if (!workout || workout.exercises.length === 0 || completing || workoutCompleted) return

        setCompleting(true)
        setCompletionError("")
        try {
            const response = await fetch(`/api/workouts/${encodeURIComponent(workout.id)}/complete`, {
                method: "POST",
            })
            const data: unknown = await response.json()
            if (!response.ok) {
                throw new Error(getErrorMessage(data, "Failed to save workout completion."))
            }
            setCompleted(workout.exercises.map((exercise) => exercise.id))
            setWorkoutCompleted(true)
        } catch (error) {
            setCompletionError(error instanceof Error ? error.message : "Failed to save workout completion.")
        } finally {
            setCompleting(false)
        }
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navbar />
            <main className="section-shell py-12">
                <Link href="/workouts" className="mb-6 inline-flex items-center gap-2 text-sm text-gray-300 hover:text-primary">
                    <ArrowLeft className="h-4 w-4" />
                    Back to workouts
                </Link>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : error ? (
                    <div role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-red-200">
                        {error}
                    </div>
                ) : workout ? (
                    <>
                        <header className="mb-8 rounded-2xl border border-violet-500/20 bg-white/3 p-6 md:p-8">
                            <p className="text-sm uppercase tracking-[0.2em] text-primary">Workout in progress</p>
                            <h1 className="mt-2 text-4xl font-bold">{workout.name}</h1>
                            {workout.description && <p className="mt-3 text-gray-300">{workout.description}</p>}
                            <p className="mt-4 flex items-center gap-2 text-sm text-gray-400">
                                <Dumbbell className="h-4 w-4" />
                                {completed.length} of {workout.exercises.length} exercises completed
                            </p>
                            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                                <div
                                    className="h-full rounded-full bg-primary transition-all"
                                    style={{
                                        width: `${workout.exercises.length ? (completed.length / workout.exercises.length) * 100 : 0}%`,
                                    }}
                                />
                            </div>
                        </header>

                        {workout.exercises.length === 0 ? (
                            <p className="rounded-xl border border-white/10 p-8 text-center text-gray-400">
                                This workout has no exercises yet.
                            </p>
                        ) : (
                            <ol className="space-y-6">
                                {workout.exercises.map((exercise, index) => {
                                    const isCompleted = completed.includes(exercise.id)
                                    return (
                                        <li
                                            key={exercise.id}
                                            className={`overflow-hidden rounded-2xl border bg-zinc-950/80 transition-colors ${
                                                isCompleted ? "border-primary/50" : "border-white/10"
                                            }`}
                                        >
                                            <div className="grid md:grid-cols-[minmax(0,1fr)_minmax(0,3fr)]">
                                                <div className="flex min-h-44 items-center justify-center bg-black md:min-h-64">
                                                    {exercise.imageSrc ? (
                                                        // eslint-disable-next-line @next/next/no-img-element -- demonstrations use the binary API proxy or saved GIF URL.
                                                        <img
                                                            src={exercise.imageSrc}
                                                            alt={`${exercise.name} exercise demonstration`}
                                                            width={180}
                                                            height={180}
                                                            className="max-h-48 w-full object-contain md:max-h-56"
                                                            loading={index > 1 ? "lazy" : "eager"}
                                                        />
                                                    ) : (
                                                        <p className="px-6 text-center text-gray-500">No demonstration is available for this exercise.</p>
                                                    )}
                                                </div>

                                                <div className="p-5 md:p-6">
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div>
                                                            <p className="text-sm text-primary">Exercise {index + 1}</p>
                                                            <h2 className="mt-1 text-2xl font-semibold capitalize">{exercise.name}</h2>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => toggleCompleted(exercise.id)}
                                                            aria-pressed={isCompleted}
                                                            aria-label={`${isCompleted ? "Mark" : "Complete"} ${exercise.name}`}
                                                            className="shrink-0 rounded-full text-primary hover:text-violet-300"
                                                        >
                                                            {isCompleted
                                                                ? <CheckCircle2 className="h-7 w-7" />
                                                                : <Circle className="h-7 w-7" />}
                                                        </button>
                                                    </div>

                                                    <div className="mt-4 flex flex-wrap gap-2 text-sm">
                                                        {exercise.bodyPart && <span className="rounded-full bg-white/5 px-3 py-1 capitalize">{exercise.bodyPart}</span>}
                                                        {exercise.target && <span className="rounded-full bg-white/5 px-3 py-1 capitalize">Target: {exercise.target}</span>}
                                                        {exercise.equipment && <span className="rounded-full bg-white/5 px-3 py-1 capitalize">Equipment: {exercise.equipment}</span>}
                                                    </div>

                                                    <p className="mt-5 text-gray-200">
                                                        <span className="font-semibold">{exercise.sets ?? "—"} sets</span>
                                                        <span className="mx-2 text-gray-500">·</span>
                                                        <span className="font-semibold">{exercise.reps ?? "—"} reps</span>
                                                        {exercise.restTime && (
                                                            <>
                                                                <span className="mx-2 text-gray-500">·</span>
                                                                <span>{exercise.restTime}s rest</span>
                                                            </>
                                                        )}
                                                    </p>

                                                    {exercise.instructions.length > 0 && (
                                                        <div className="mt-6">
                                                            <h3 className="font-semibold">How to perform</h3>
                                                            <ol className="mt-3 list-inside list-decimal space-y-2 text-sm leading-relaxed text-gray-400">
                                                                {exercise.instructions.map((instruction, instructionIndex) => (
                                                                    <li key={`${exercise.id}-instruction-${instructionIndex}`}>{instruction}</li>
                                                                ))}
                                                            </ol>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </li>
                                    )
                                })}
                            </ol>
                        )}

                        {workout.exercises.length > 0 && !workoutCompleted && (
                            <div className="mt-8 flex justify-center">
                                <button
                                    type="button"
                                    onClick={() => void completeWorkout()}
                                    disabled={completing}
                                    className="rounded-full bg-primary px-8 py-3 font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                                >
                                    {completing ? "Saving completion..." : "Complete Workout"}
                                </button>
                            </div>
                        )}
                        {completionError && (
                            <p role="alert" className="mt-4 text-center text-sm text-red-300">{completionError}</p>
                        )}
                        {workoutCompleted && (
                            <div role="status" className="mt-8 rounded-2xl border border-primary/30 bg-linear-to-br from-primary/15 via-fuchsia-500/10 to-violet-500/15 p-8 text-center">
                                <p className="text-4xl" aria-hidden="true">🎉 💪 ✨</p>
                                <h2 className="mt-3 text-3xl font-bold text-primary">Congratulations!</h2>
                                <p className="mt-3 text-lg text-gray-200">You completed {workout.name}!</p>
                                <p className="mt-2 text-gray-300">
                                    You showed up, put in the work, and got stronger today. Keep stacking those wins! 🔥 🌟
                                </p>
                                <p className="mt-4 text-2xl" aria-hidden="true">🏆 🙌 💜</p>
                            </div>
                        )}
                    </>
                ) : null}
            </main>
        </div>
    )
}

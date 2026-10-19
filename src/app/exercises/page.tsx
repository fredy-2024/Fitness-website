"use client"

import { useState, useEffect, useRef } from "react"
import { Navbar } from "@/components/Navbar"
import { Search, X } from "lucide-react"

type Exercise = {
    id: string
    name: string
    bodyPart: string
    equipment: string
    target: string
    secondaryMuscles: string[]
    instructions: string[]
    gifUrl?: string
}

type ExerciseFilters = {
    bodyParts: string[]
    targets: string[]
    equipment: string[]
}

function isExercise(value: unknown): value is Exercise {
    if (typeof value !== "object" || value === null) return false
    const exercise = value as Record<string, unknown>
    return typeof exercise.id === "string"
        && typeof exercise.name === "string"
        && typeof exercise.bodyPart === "string"
        && typeof exercise.equipment === "string"
        && typeof exercise.target === "string"
        && Array.isArray(exercise.secondaryMuscles)
        && Array.isArray(exercise.instructions)
        && exercise.instructions.every((instruction) => typeof instruction === "string")
        && (exercise.gifUrl === undefined || typeof exercise.gifUrl === "string")
}

function getErrorMessage(data: unknown, fallback: string) {
    if (typeof data === "object" && data !== null && "error" in data && typeof data.error === "string") {
        return data.error
    }
    return fallback
}

function ExerciseDemonstration({ exercise }: { exercise: Exercise }) {
    const [imageFailed, setImageFailed] = useState(false)

    if (imageFailed) {
        return (
            <span className="px-6 text-center text-[#94A3B8]">
                Exercise demonstration unavailable
            </span>
        )
    }

    return (
        // eslint-disable-next-line @next/next/no-img-element -- use the local binary proxy directly and preserve GIF animation.
        <img
            src={`/api/exercise-image?id=${encodeURIComponent(exercise.id)}`}
            alt={`${exercise.name} demonstration`}
            width={180}
            height={180}
            className="h-full w-full object-contain"
            loading="lazy"
            onError={() => setImageFailed(true)}
        />
    )
}

export default function ExercisesPage() {
    const [exercises, setExercises] = useState<Exercise[]>([])
    const [filters, setFilters] = useState<ExerciseFilters>({ bodyParts: [], targets: [], equipment: [] })
    const [loading, setLoading] = useState(false)
    const [loadingFilters, setLoadingFilters] = useState(true)
    const [search, setSearch] = useState("")
    const [selectedBodyPart, setSelectedBodyPart] = useState("")
    const [selectedTarget, setSelectedTarget] = useState("")
    const [selectedEquipment, setSelectedEquipment] = useState("")
    const [limit, setLimit] = useState(10)
    const [offset, setOffset] = useState(0)
    const [hasMore, setHasMore] = useState(false)
    const [error, setError] = useState("")
    const [expandedExercise, setExpandedExercise] = useState("")
    const [exerciseDetails, setExerciseDetails] = useState<Exercise | null>(null)
    const [detailsLoading, setDetailsLoading] = useState(false)
    const [detailsError, setDetailsError] = useState("")
    const detailsController = useRef<AbortController | null>(null)

    useEffect(() => {
        let isActive = true

        const fetchBodyParts = async () => {
            try {
                const response = await fetch("/api/exercises/filters")
                const data: unknown = await response.json()
                if (!response.ok) {
                    throw new Error(getErrorMessage(data, "Failed to load exercise filters."))
                }
                if (
                    isActive
                    && typeof data === "object"
                    && data !== null
                    && "bodyParts" in data
                    && "targets" in data
                    && "equipment" in data
                    && Array.isArray(data.bodyParts)
                    && Array.isArray(data.targets)
                    && Array.isArray(data.equipment)
                ) {
                    const availableFilters = data as ExerciseFilters
                    setFilters(availableFilters)
                    setSelectedEquipment(
                        availableFilters.equipment.find((equipment) => equipment.toLowerCase() === "assisted") ?? ""
                    )
                }
            } catch (error) {
                if (isActive) {
                    setError(error instanceof Error ? error.message : "Failed to load exercise filters.")
                }
            } finally {
                if (isActive) setLoadingFilters(false)
            }
        }

        void fetchBodyParts()
        return () => {
            isActive = false
        }
    }, [])

    useEffect(() => {
        if (!selectedBodyPart && !selectedTarget && !selectedEquipment && !search.trim()) return

        const controller = new AbortController()
        const debounce = setTimeout(async () => {
            setLoading(true)
            setError("")
            const params = new URLSearchParams()
            if (selectedBodyPart) params.set("bodyPart", selectedBodyPart)
            if (selectedTarget) params.set("target", selectedTarget)
            if (selectedEquipment) params.set("equipment", selectedEquipment)
            if (search.trim()) params.set("name", search.trim())
            params.set("limit", String(limit))
            params.set("offset", String(offset))
            try {
                const response = await fetch(`/api/exercises/external?${params.toString()}`, {
                    signal: controller.signal,
                })
                const data: unknown = await response.json()
                if (!response.ok) {
                    throw new Error(getErrorMessage(data, "Failed to load exercises."))
                }
                if (
                    typeof data === "object"
                    && data !== null
                    && "exercises" in data
                    && "hasMore" in data
                    && Array.isArray(data.exercises)
                    && data.exercises.every(isExercise)
                    && typeof data.hasMore === "boolean"
                ) {
                    setExercises(data.exercises)
                    setHasMore(data.hasMore)
                } else {
                    throw new Error("ExerciseDB returned exercises in an unexpected format.")
                }
            } catch (error) {
                if (!controller.signal.aborted) {
                    setError(error instanceof Error ? error.message : "Failed to load exercises.")
                    setExercises([])
                    setHasMore(false)
                }
            } finally {
                if (!controller.signal.aborted) setLoading(false)
            }
        }, 300)

        return () => {
            clearTimeout(debounce)
            controller.abort()
        }
    }, [search, selectedBodyPart, selectedTarget, selectedEquipment, limit, offset])

    useEffect(() => {
        setOffset(0)
    }, [search, selectedBodyPart, selectedTarget, selectedEquipment, limit])

    const openDetails = async (exercise: Exercise) => {
        detailsController.current?.abort()
        const controller = new AbortController()
        detailsController.current = controller
        setExpandedExercise(exercise.id)
        setExerciseDetails(exercise)
        setDetailsError("")
        setDetailsLoading(true)
        try {
            const response = await fetch(`/api/exercises/external/${encodeURIComponent(exercise.id)}`, {
                signal: controller.signal,
            })
            const data: unknown = await response.json()
            if (!response.ok) {
                throw new Error(getErrorMessage(data, "Failed to load exercise details."))
            }
            if (!isExercise(data)) {
                throw new Error("ExerciseDB returned exercise details in an unexpected format.")
            }
            setExerciseDetails(data)
        } catch (error) {
            if (!controller.signal.aborted) {
                setDetailsError(error instanceof Error ? error.message : "Failed to load exercise details.")
            }
        } finally {
            if (!controller.signal.aborted) setDetailsLoading(false)
        }
    }

    const closeDetails = () => {
        detailsController.current?.abort()
        detailsController.current = null
        setExpandedExercise("")
        setExerciseDetails(null)
        setDetailsLoading(false)
        setDetailsError("")
    }

    useEffect(() => {
        if (!expandedExercise) return
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") closeDetails()
        }
        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [expandedExercise])

    return (
        <div className="relative min-h-screen overflow-hidden bg-[#080D18] text-[#F8FAFC]">
            <Navbar />
            <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#22D3EE]">Train with intent</p>
                        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Exercises library</h1>
                        <p className="mt-2 text-sm text-[#94A3B8]">Explore movement demonstrations and find the right exercise for your training.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
                            <input
                                type="text"
                                placeholder="Search exercises..."
                                className="w-full rounded-xl border border-[#303B4D] bg-[#171F2D] py-3 pl-10 pr-4 text-sm text-[#F8FAFC] placeholder:text-[#94A3B8] focus:border-[#22D3EE] focus:outline-none focus:ring-2 focus:ring-[#22D3EE]/15 sm:w-64"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        <select
                            aria-label="Filter exercises by body part"
                            className="cursor-pointer appearance-none rounded-xl border border-[#303B4D] bg-[#171F2D] px-4 py-3 text-sm text-[#F8FAFC] focus:border-[#22D3EE] focus:outline-none focus:ring-2 focus:ring-[#22D3EE]/15"
                            value={selectedBodyPart}
                            disabled={loadingFilters}
                            onChange={(e) => setSelectedBodyPart(e.target.value)}
                        >
                            <option value="">All body parts</option>
                            {filters.bodyParts.map((bodyPart) => (
                                <option key={bodyPart} value={bodyPart}>{bodyPart}</option>
                            ))}
                        </select>
                        <select
                            aria-label="Filter exercises by target muscle"
                            className="cursor-pointer appearance-none rounded-xl border border-[#303B4D] bg-[#171F2D] px-4 py-3 text-sm text-[#F8FAFC] focus:border-[#22D3EE] focus:outline-none focus:ring-2 focus:ring-[#22D3EE]/15"
                            value={selectedTarget}
                            disabled={loadingFilters}
                            onChange={(e) => setSelectedTarget(e.target.value)}
                        >
                            <option value="">All target muscles</option>
                            {filters.targets.map((target) => (
                                <option key={target} value={target}>{target}</option>
                            ))}
                        </select>
                        <select
                            aria-label="Filter exercises by equipment"
                            className="cursor-pointer appearance-none rounded-xl border border-[#303B4D] bg-[#171F2D] px-4 py-3 text-sm text-[#F8FAFC] focus:border-[#22D3EE] focus:outline-none focus:ring-2 focus:ring-[#22D3EE]/15"
                            value={selectedEquipment}
                            disabled={loadingFilters}
                            onChange={(e) => setSelectedEquipment(e.target.value)}
                        >
                            <option value="">All equipment</option>
                            {filters.equipment.map((equipment) => (
                                <option key={equipment} value={equipment}>{equipment}</option>
                            ))}
                        </select>
                        <select
                            aria-label="Results per page"
                            className="rounded-xl border border-[#303B4D] bg-[#171F2D] px-4 py-3 text-sm text-[#F8FAFC] focus:border-[#22D3EE] focus:outline-none focus:ring-2 focus:ring-[#22D3EE]/15"
                            value={limit}
                            onChange={(event) => setLimit(Number(event.target.value))}
                        >
                            {[10, 20, 50].map((pageSize) => (
                                <option key={pageSize} value={pageSize}>{pageSize} per page</option>
                            ))}
                        </select>
                    </div>
                </div>

                {error ? (
                    <div role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-center text-red-200">
                        {error}
                    </div>
                ) : loading || loadingFilters ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    </div>
                ) : !selectedBodyPart && !selectedTarget && !selectedEquipment && !search.trim() ? (
                    <p className="py-12 text-center text-[#94A3B8]">Search for an exercise or choose a filter to get started.</p>
                ) : exercises.length === 0 ? (
                    <div className="py-12 text-center text-[#94A3B8]">
                        <p>No exercises found on this page. Try another filter or page.</p>
                        {hasMore && (
                            <button
                                type="button"
                                onClick={() => setOffset((current) => current + limit)}
                                className="mt-4 rounded-lg border border-border bg-[#151D2B] px-4 py-2 text-white transition-colors hover:border-[#22D3EE]/60 hover:text-[#22D3EE]"
                            >
                                Next page
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {exercises.map((exercise) => (
                            <article
                                key={exercise.id}
                                role="button"
                                tabIndex={0}
                                aria-label={`View ${exercise.name} demonstration and instructions`}
                                onClick={() => void openDetails(exercise)}
                                onKeyDown={(event) => {
                                    if (event.key === "Enter" || event.key === " ") {
                                        event.preventDefault()
                                        void openDetails(exercise)
                                    }
                                }}
                                className="group cursor-pointer overflow-hidden rounded-2xl border border-border bg-[#151D2B]/90 shadow-[0_12px_40px_rgba(0,0,0,0.2)] transition-all duration-300 hover:-translate-y-1 hover:border-[#22D3EE]/70 hover:shadow-[0_0_28px_rgba(34,211,238,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#22D3EE]"
                            >
                                <div className="relative flex h-48 items-center justify-center bg-[#263D4D]">
                                    <ExerciseDemonstration exercise={exercise} />
                                    <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-[#151D2B] via-[#151D2B]/10 to-transparent" />
                                </div>

                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4 gap-3">
                                        <h3 className="text-xl font-semibold capitalize">{exercise.name}</h3>
                                        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium capitalize ${exercise.target.toLowerCase() === "abs" || exercise.bodyPart.toLowerCase() === "waist" ? "bg-[#9333EA]/15 text-[#D8B4FE]" : "bg-[#06D6E8]/10 text-[#67E8F9]"}`}>
                                            {exercise.target || exercise.bodyPart}
                                        </span>
                                    </div>
                                    <p className="text-sm text-[#94A3B8]">Equipment: {exercise.equipment || "None specified"}</p>
                                    {exercise.secondaryMuscles.length > 0 && (
                                        <p className="mt-2 text-xs text-[#94A3B8]/80">Also works: {exercise.secondaryMuscles.join(", ")}</p>
                                    )}
                                </div>
                            </article>
                        ))}
                    </div>
                    </>
                )}
                {expandedExercise && exerciseDetails && (
                    <div
                        className="fixed inset-0 z-60 flex items-center justify-center bg-[#020617]/85 p-4 backdrop-blur-sm sm:p-6"
                        role="presentation"
                        onClick={closeDetails}
                    >
                        <section
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="exercise-dialog-title"
                            className="relative max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-3xl border border-[#22D3EE]/30 bg-[#0B1220] shadow-[0_0_60px_rgba(34,211,238,0.12)]"
                            onClick={(event) => event.stopPropagation()}
                        >
                            <button
                                type="button"
                                onClick={closeDetails}
                                aria-label="Close exercise details"
                                className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-[#080D18]/80 text-slate-200 transition hover:border-[#22D3EE] hover:text-[#22D3EE]"
                            >
                                <X className="h-5 w-5" />
                            </button>
                            <div className="grid md:grid-cols-[minmax(240px,0.8fr)_1.2fr]">
                                <div className="flex min-h-64 items-center justify-center bg-[#263D4D] p-4 md:min-h-105">
                                    <ExerciseDemonstration exercise={exerciseDetails} />
                                </div>
                                <div className="p-6 sm:p-8">
                                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#22D3EE]">Exercise details</p>
                                    <h2 id="exercise-dialog-title" className="mt-2 pr-10 text-2xl font-bold capitalize sm:text-3xl">{exerciseDetails.name}</h2>
                                    <div className="mt-4 flex flex-wrap gap-2 text-sm">
                                        {[exerciseDetails.bodyPart, `Target: ${exerciseDetails.target}`, `Equipment: ${exerciseDetails.equipment || "None specified"}`].map((label) => (
                                            <span key={label} className="rounded-full border border-border bg-[#151D2B] px-3 py-1.5 capitalize text-slate-300">{label}</span>
                                        ))}
                                    </div>
                                    <div className="mt-7 border-t border-border pt-5">
                                        <h3 className="text-lg font-semibold">Description &amp; instructions</h3>
                                        {detailsLoading && <p className="mt-2 text-sm text-[#94A3B8]">Loading full exercise instructions...</p>}
                                        {detailsError && <p role="alert" className="mt-3 text-sm text-amber-200">{detailsError} Showing the available exercise information.</p>}
                                        {exerciseDetails.instructions.length > 0 ? (
                                            <ol className="mt-4 list-inside list-decimal space-y-3 text-sm leading-6 text-[#CBD5E1] marker:font-semibold marker:text-[#22D3EE]">
                                                {exerciseDetails.instructions.map((instruction, index) => (
                                                    <li key={`${exerciseDetails.id}-instruction-${index}`}>{instruction}</li>
                                                ))}
                                            </ol>
                                        ) : (
                                            <p className="mt-3 text-sm leading-6 text-[#94A3B8]">Detailed instructions are not available for this exercise.</p>
                                        )}
                                        {exerciseDetails.secondaryMuscles.length > 0 && (
                                            <p className="mt-5 text-sm text-[#94A3B8]">Also works: <span className="text-slate-200">{exerciseDetails.secondaryMuscles.join(", ")}</span></p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                )}
                {!error && exercises.length > 0 && (
                    <div className="mt-8 flex items-center justify-center gap-4">
                        <button
                            type="button"
                            disabled={offset === 0 || loading}
                            onClick={() => setOffset((current) => Math.max(0, current - limit))}
                            className="rounded-lg border border-border bg-[#151D2B] px-4 py-2 transition-colors hover:border-[#22D3EE]/60 hover:text-[#22D3EE] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            Previous
                        </button>
                        <span className="text-sm text-[#94A3B8]">
                            Showing {offset + 1}–{offset + exercises.length}
                        </span>
                        <button
                            type="button"
                            disabled={!hasMore || loading}
                            onClick={() => setOffset((current) => current + limit)}
                            className="rounded-lg border border-border bg-[#151D2B] px-4 py-2 transition-colors hover:border-[#22D3EE]/60 hover:text-[#22D3EE] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            Next
                        </button>
                    </div>
                )}
            </main>
        </div>
    )
}

"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Navbar } from "@/components/Navbar"
import { Search } from "lucide-react"
import img6 from "../../../img6.avif"

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
            <span className="px-6 text-center text-gray-500">
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
    const [sortMethod, setSortMethod] = useState<"id" | "name">("id")
    const [sortOrder, setSortOrder] = useState<"ascending" | "descending">("ascending")
    const [hasMore, setHasMore] = useState(false)
    const [error, setError] = useState("")
    const [expandedExercise, setExpandedExercise] = useState("")
    const [exerciseDetails, setExerciseDetails] = useState<Exercise | null>(null)
    const [detailsLoading, setDetailsLoading] = useState(false)
    const [detailsError, setDetailsError] = useState("")

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
            params.set("sortMethod", sortMethod)
            params.set("sortOrder", sortOrder)

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
    }, [search, selectedBodyPart, selectedTarget, selectedEquipment, limit, offset, sortMethod, sortOrder])

    useEffect(() => {
        setOffset(0)
    }, [search, selectedBodyPart, selectedTarget, selectedEquipment, limit, sortMethod, sortOrder])

    const toggleDetails = async (exercise: Exercise) => {
        if (expandedExercise === exercise.id) {
            setExpandedExercise("")
            setExerciseDetails(null)
            return
        }

        setExpandedExercise(exercise.id)
        setExerciseDetails(null)
        setDetailsError("")
        setDetailsLoading(true)
        try {
            const response = await fetch(`/api/exercises/external/${encodeURIComponent(exercise.id)}`)
            const data: unknown = await response.json()
            if (!response.ok) {
                throw new Error(getErrorMessage(data, "Failed to load exercise details."))
            }
            if (!isExercise(data)) {
                throw new Error("ExerciseDB returned exercise details in an unexpected format.")
            }
            setExerciseDetails(data)
        } catch (error) {
            setDetailsError(error instanceof Error ? error.message : "Failed to load exercise details.")
        } finally {
            setDetailsLoading(false)
        }
    }

    return (
        <div className="relative min-h-screen bg-black text-white overflow-hidden">
            <div className="absolute inset-0 z-0">
                <Image
                    src={img6}
                    alt="Exercises background"
                    fill
                    priority
                    className="object-cover opacity-20"
                    sizes="100vw"
                />
                <div className="absolute inset-0 bg-black/75" />
            </div>
            <Navbar />
            <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <h1 className="text-3xl font-bold">Exercises library</h1>

                    <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <input
                                type="text"
                                placeholder="Search exercises..."
                                className="pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg focus:outline-none focus:border-primary w-full sm:w-64"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        <select
                            aria-label="Filter exercises by body part"
                            className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg focus:outline-none focus:border-primary appearance-none cursor-pointer"
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
                            className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg focus:outline-none focus:border-primary appearance-none cursor-pointer"
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
                            className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg focus:outline-none focus:border-primary appearance-none cursor-pointer"
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
                            className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg focus:outline-none focus:border-primary"
                            value={limit}
                            onChange={(event) => setLimit(Number(event.target.value))}
                        >
                            {[10, 20, 50].map((pageSize) => (
                                <option key={pageSize} value={pageSize}>{pageSize} per page</option>
                            ))}
                        </select>
                        <select
                            aria-label="Sort exercises by"
                            className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg focus:outline-none focus:border-primary"
                            value={sortMethod}
                            onChange={(event) => setSortMethod(event.target.value as "id" | "name")}
                        >
                            <option value="id">Sort by ID</option>
                            <option value="name">Sort by name</option>
                        </select>
                        <select
                            aria-label="Sort direction"
                            className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg focus:outline-none focus:border-primary"
                            value={sortOrder}
                            onChange={(event) => setSortOrder(event.target.value as "ascending" | "descending")}
                        >
                            <option value="ascending">Ascending</option>
                            <option value="descending">Descending</option>
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
                    <p className="py-12 text-center text-gray-400">Search for an exercise or choose a filter to get started.</p>
                ) : exercises.length === 0 ? (
                    <div className="py-12 text-center text-gray-400">
                        <p>No exercises found on this page. Try another filter or page.</p>
                        {hasMore && (
                            <button
                                type="button"
                                onClick={() => setOffset((current) => current + limit)}
                                className="mt-4 rounded-lg border border-white/15 px-4 py-2 text-white"
                            >
                                Next page
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {exercises.map((exercise) => (
                            <div key={exercise.id} className="bg-zinc-900 rounded-xl border border-zinc-800 hover:border-primary/50 transition-colors overflow-hidden">
                                <div className="relative flex h-48 items-center justify-center bg-black">
                                    <ExerciseDemonstration exercise={exercise} />
                                    <div className="absolute inset-0 bg-linear-to-t from-zinc-900 via-zinc-900/20 to-transparent pointer-events-none" />
                                </div>

                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4 gap-3">
                                        <h3 className="text-xl font-semibold capitalize">{exercise.name}</h3>
                                        <span className="shrink-0 px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full capitalize">
                                            {exercise.target || exercise.bodyPart}
                                        </span>
                                    </div>
                                    <p className="text-gray-400 text-sm">Equipment: {exercise.equipment || "None specified"}</p>
                                    {exercise.secondaryMuscles.length > 0 && (
                                        <p className="mt-2 text-xs text-gray-500">Also works: {exercise.secondaryMuscles.join(", ")}</p>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => void toggleDetails(exercise)}
                                        className="mt-4 text-sm font-medium text-primary hover:text-violet-300"
                                    >
                                        {expandedExercise === exercise.id ? "Hide full instructions" : "View full exercise details"}
                                    </button>
                                    {expandedExercise === exercise.id && (
                                        <div className="mt-3 border-t border-white/10 pt-3">
                                            {detailsLoading && <p className="text-sm text-gray-400">Loading details...</p>}
                                            {detailsError && <p role="alert" className="text-sm text-red-300">{detailsError}</p>}
                                            {exerciseDetails && (
                                                <>
                                                    <p className="text-sm text-gray-300">
                                                        Body part: {exerciseDetails.bodyPart} · Target: {exerciseDetails.target}
                                                    </p>
                                                    {exerciseDetails.instructions.length > 0 && (
                                                        <ol className="mt-3 list-inside list-decimal space-y-2 text-sm text-gray-400">
                                                            {exerciseDetails.instructions.map((instruction, index) => (
                                                                <li key={`${exercise.id}-detail-${index}`}>{instruction}</li>
                                                            ))}
                                                        </ol>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    </>
                )}
                {!error && exercises.length > 0 && (
                    <div className="mt-8 flex items-center justify-center gap-4">
                        <button
                            type="button"
                            disabled={offset === 0 || loading}
                            onClick={() => setOffset((current) => Math.max(0, current - limit))}
                            className="rounded-lg border border-white/15 px-4 py-2 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            Previous
                        </button>
                        <span className="text-sm text-gray-400">
                            Showing {offset + 1}–{offset + exercises.length}
                        </span>
                        <button
                            type="button"
                            disabled={!hasMore || loading}
                            onClick={() => setOffset((current) => current + limit)}
                            className="rounded-lg border border-white/15 px-4 py-2 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            Next
                        </button>
                    </div>
                )}
            </main>
        </div>
    )
}

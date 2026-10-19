"use client"

import { useEffect, useState } from "react"
import { Navbar } from "@/components/Navbar"
import { useRouter } from "next/navigation"
import { Search, Trash2, Save, Loader2 } from "lucide-react"

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

type WorkoutExercise = Exercise & {
    sets: number
    reps: number
}

function getErrorMessage(data: unknown, fallback: string) {
    if (typeof data === "object" && data !== null && "error" in data && typeof data.error === "string") {
        return data.error
    }
    return fallback
}

export default function NewWorkoutPage() {
    const router = useRouter()
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [workoutExercises, setWorkoutExercises] = useState<WorkoutExercise[]>([])
    const [filters, setFilters] = useState<ExerciseFilters>({ bodyParts: [], targets: [], equipment: [] })
    const [selectedBodyPart, setSelectedBodyPart] = useState("")
    const [selectedTarget, setSelectedTarget] = useState("")
    const [selectedEquipment, setSelectedEquipment] = useState("")
    const [searchOffset, setSearchOffset] = useState(0)
    const [searchHasMore, setSearchHasMore] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [searchResults, setSearchResults] = useState<Exercise[]>([])
    const [loadingFilters, setLoadingFilters] = useState(true)
    const [searching, setSearching] = useState(false)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState("")

    useEffect(() => {
        let active = true
        const loadFilters = async () => {
            try {
                const response = await fetch("/api/exercises/filters")
                const data: unknown = await response.json()
                if (!response.ok) throw new Error(getErrorMessage(data, "Could not load exercise filters."))
                if (
                    typeof data === "object"
                    && data !== null
                    && "bodyParts" in data
                    && "targets" in data
                    && "equipment" in data
                    && Array.isArray(data.bodyParts)
                    && Array.isArray(data.targets)
                    && Array.isArray(data.equipment)
                    && data.bodyParts.every((value) => typeof value === "string")
                    && data.targets.every((value) => typeof value === "string")
                    && data.equipment.every((value) => typeof value === "string")
                ) {
                    const available = data as ExerciseFilters
                    if (active) {
                        setFilters(available)
                        setSelectedEquipment(
                            available.equipment.find((equipment) => equipment.toLowerCase() === "assisted") ?? ""
                        )
                    }
                } else {
                    throw new Error("ExerciseDB returned invalid filter data.")
                }
            } catch (error) {
                if (active) setError(error instanceof Error ? error.message : "Could not load exercise filters.")
            } finally {
                if (active) setLoadingFilters(false)
            }
        }
        void loadFilters()
        return () => { active = false }
    }, [])

    useEffect(() => {
        if (!searchTerm.trim() && (!selectedBodyPart && !selectedTarget && !selectedEquipment)) {
            setSearchResults([])
            setSearchHasMore(false)
            return
        }

        const controller = new AbortController()
        const timer = setTimeout(async () => {
            setSearching(true)
            setError("")
            const params = new URLSearchParams({
                limit: "10",
                offset: String(searchOffset),
                sortMethod: "id",
                sortOrder: "ascending",
            })
            if (searchTerm.trim()) params.set("name", searchTerm.trim())
            if (selectedBodyPart) params.set("bodyPart", selectedBodyPart)
            if (selectedTarget) params.set("target", selectedTarget)
            if (selectedEquipment) params.set("equipment", selectedEquipment)

            try {
                const response = await fetch(`/api/exercises/external?${params.toString()}`, {
                    signal: controller.signal,
                })
                const data: unknown = await response.json()
                if (!response.ok) throw new Error(getErrorMessage(data, "Exercise search failed."))
                if (
                    typeof data !== "object"
                    || data === null
                    || !("exercises" in data)
                    || !("hasMore" in data)
                    || !Array.isArray(data.exercises)
                    || typeof data.hasMore !== "boolean"
                ) {
                    throw new Error("ExerciseDB returned invalid search results.")
                }
                setSearchResults(data.exercises as Exercise[])
                setSearchHasMore(data.hasMore)
            } catch (error) {
                if (!controller.signal.aborted) {
                    setSearchResults([])
                    setSearchHasMore(false)
                    setError(error instanceof Error ? error.message : "Exercise search failed.")
                }
            } finally {
                if (!controller.signal.aborted) setSearching(false)
            }
        }, 300)

        return () => {
            clearTimeout(timer)
            controller.abort()
        }
    }, [searchTerm, selectedBodyPart, selectedTarget, selectedEquipment, searchOffset])

    useEffect(() => {
        setSearchOffset(0)
    }, [searchTerm, selectedBodyPart, selectedTarget, selectedEquipment])

    const addExercise = (exercise: Exercise) => {
        if (workoutExercises.some((selected) => selected.id === exercise.id)) return
        setWorkoutExercises((current) => [...current, { ...exercise, sets: 3, reps: 10 }])
        setSearchTerm("")
        setSearchResults([])
    }

    const removeExercise = (index: number) => {
        setWorkoutExercises((current) => current.filter((_, exerciseIndex) => exerciseIndex !== index))
    }

    const updateExercise = (index: number, field: "sets" | "reps", value: number) => {
        setWorkoutExercises((current) => current.map((exercise, exerciseIndex) =>
            exerciseIndex === index ? { ...exercise, [field]: value } : exercise
        ))
    }

    const saveWorkout = async () => {
        if (!name.trim() || workoutExercises.length === 0 || saving) return
        setSaving(true)
        setError("")
        try {
            const response = await fetch("/api/workouts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: name.trim(),
                    description: description.trim(),
                    exercises: workoutExercises,
                }),
            })
            const data: unknown = await response.json()
            if (!response.ok) throw new Error(getErrorMessage(data, "Failed to save workout."))
            router.push("/workouts")
        } catch (error) {
            setError(error instanceof Error ? error.message : "Failed to save workout.")
            setSaving(false)
        }
    }

    return (
        <div className="min-h-screen bg-black text-white">
            <Navbar />
            <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 md:p-8">
                    <h1 className="text-2xl font-bold mb-6">Create New Workout</h1>

                    <div className="space-y-6">
                        <div>
                            <label htmlFor="workout-name" className="block text-sm font-medium text-gray-400 mb-2">
                                Workout Name
                            </label>
                            <input
                                id="workout-name"
                                type="text"
                                maxLength={100}
                                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-primary text-white"
                                placeholder="e.g., Push Day"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>

                        <div>
                            <label htmlFor="workout-description" className="block text-sm font-medium text-gray-400 mb-2">
                                Description (Optional)
                            </label>
                            <textarea
                                id="workout-description"
                                maxLength={1000}
                                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-primary text-white h-24"
                                placeholder="Describe your workout..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>

                        <div className="border-t border-zinc-800 pt-6">
                            <h2 className="text-lg font-semibold mb-4">Add ExerciseDB exercises</h2>
                            <div className="mb-4 grid gap-3 sm:grid-cols-3">
                                <select aria-label="Filter by body part" value={selectedBodyPart} disabled={loadingFilters} onChange={(e) => setSelectedBodyPart(e.target.value)} className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg">
                                    <option value="">Any body part</option>
                                    {filters.bodyParts.map((part) => <option key={part} value={part}>{part}</option>)}
                                </select>
                                <select aria-label="Filter by target muscle" value={selectedTarget} disabled={loadingFilters} onChange={(e) => setSelectedTarget(e.target.value)} className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg">
                                    <option value="">Any target muscle</option>
                                    {filters.targets.map((target) => <option key={target} value={target}>{target}</option>)}
                                </select>
                                <select aria-label="Filter by equipment" value={selectedEquipment} disabled={loadingFilters} onChange={(e) => setSelectedEquipment(e.target.value)} className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg">
                                    <option value="">Any equipment</option>
                                    {filters.equipment.map((equipment) => <option key={equipment} value={equipment}>{equipment}</option>)}
                                </select>
                            </div>
                            <div className="relative mb-6">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <input
                                    type="search"
                                    className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-primary text-white"
                                    placeholder="Search exercises by name..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                {searchResults.length > 0 && (
                                    <div className="absolute z-10 w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl max-h-72 overflow-y-auto">
                                        {searchResults.map((exercise) => (
                                            <button
                                                key={exercise.id}
                                                type="button"
                                                className="w-full text-left px-4 py-3 hover:bg-zinc-700 flex flex-col items-start transition-colors"
                                                onClick={() => addExercise(exercise)}
                                            >
                                                <span className="font-medium">{exercise.name}</span>
                                                <span className="text-xs text-gray-400 capitalize">
                                                    {exercise.bodyPart} · {exercise.target} · {exercise.equipment || "no equipment"}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            {searching && <p className="mb-4 text-sm text-gray-400">Searching ExerciseDB...</p>}
                            {!searching && (searchTerm.trim() || selectedBodyPart || selectedTarget || selectedEquipment) && searchResults.length === 0 && !error && (
                                <p className="mb-4 text-sm text-gray-400">No matching exercises found for these filters.</p>
                            )}
                            {searchResults.length > 0 && (
                                <div className="mb-4 flex items-center justify-center gap-4">
                                    <button
                                        type="button"
                                        disabled={searchOffset === 0 || searching}
                                        onClick={() => setSearchOffset((current) => Math.max(0, current - 10))}
                                        className="rounded-lg border border-zinc-700 px-3 py-1 text-sm disabled:opacity-40"
                                    >
                                        Previous
                                    </button>
                                    <span className="text-xs text-gray-500">Results {searchOffset + 1}–{searchOffset + searchResults.length}</span>
                                    <button
                                        type="button"
                                        disabled={!searchHasMore || searching}
                                        onClick={() => setSearchOffset((current) => current + 10)}
                                        className="rounded-lg border border-zinc-700 px-3 py-1 text-sm disabled:opacity-40"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                            {error && <p role="alert" className="mb-4 text-sm text-red-300">{error}</p>}

                            <div className="space-y-4">
                                {workoutExercises.map((exercise, index) => (
                                    <div key={`${exercise.id}-${index}`} className="flex flex-wrap items-center gap-4 bg-black/40 p-4 rounded-lg border border-zinc-800">
                                        <div className="min-w-40 flex-1">
                                            <p className="font-medium">{exercise.name}</p>
                                            <p className="text-xs text-gray-500 capitalize">{exercise.bodyPart} · {exercise.target}</p>
                                        </div>
                                        <label className="flex items-center gap-2 text-sm text-gray-500">
                                            <input
                                                type="number"
                                                min={1}
                                                max={99}
                                                aria-label={`Sets for ${exercise.name}`}
                                                className="w-16 px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-center text-sm text-white"
                                                value={exercise.sets}
                                                onChange={(e) => updateExercise(index, "sets", parseInt(e.target.value, 10) || 1)}
                                            />
                                            sets
                                        </label>
                                        <label className="flex items-center gap-2 text-sm text-gray-500">
                                            <input
                                                type="number"
                                                min={1}
                                                max={999}
                                                aria-label={`Reps for ${exercise.name}`}
                                                className="w-16 px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-center text-sm text-white"
                                                value={exercise.reps}
                                                onChange={(e) => updateExercise(index, "reps", parseInt(e.target.value, 10) || 1)}
                                            />
                                            reps
                                        </label>
                                        <button type="button" aria-label={`Remove ${exercise.name}`} onClick={() => removeExercise(index)} className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                                {workoutExercises.length === 0 && (
                                    <div className="text-center py-8 text-gray-500 border-2 border-dashed border-zinc-800 rounded-lg">
                                        Choose filters and search to add exercises to your workout.
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="border-t border-zinc-800 pt-6 flex justify-end gap-4">
                            <button type="button" className="px-6 py-2 text-gray-400 hover:text-white transition-colors" onClick={() => router.back()}>
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={() => void saveWorkout()}
                                disabled={!name.trim() || workoutExercises.length === 0 || saving}
                            >
                                {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                                Save Workout
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

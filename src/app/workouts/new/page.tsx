"use client"

import { useState } from "react"
import { Navbar } from "@/components/Navbar"
import { useRouter } from "next/navigation"
import { Search, Trash2, Save } from "lucide-react"

type Exercise = {
    id: string
    name: string
    muscleGroup: string
}

type WorkoutExercise = {
    id: string
    name: string
    sets: number
    reps: number
}

export default function NewWorkoutPage() {
    const router = useRouter()
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [workoutExercises, setWorkoutExercises] = useState<WorkoutExercise[]>([])

    // Exercise search state
    const [searchTerm, setSearchTerm] = useState("")
    const [searchResults, setSearchResults] = useState<Exercise[]>([])
    const searchExercises = async (term: string) => {
        if (!term) {
            setSearchResults([])
            return
        }
        const response = await fetch(`/api/exercises?search=${term}`)
        const data = await response.json()
        setSearchResults(data)
    }

    const addExercise = (exercise: Exercise) => {
        setWorkoutExercises([
            ...workoutExercises,
            {
                id: exercise.id,
                name: exercise.name,
                sets: 3,
                reps: 10
            }
        ])
        setSearchTerm("")
        setSearchResults([])
    }

    const removeExercise = (index: number) => {
        const newExercises = [...workoutExercises]
        newExercises.splice(index, 1)
        setWorkoutExercises(newExercises)
    }

    const updateExercise = (index: number, field: "sets" | "reps", value: number) => {
        const newExercises = [...workoutExercises]
        newExercises[index][field] = value
        setWorkoutExercises(newExercises)
    }

    const saveWorkout = async () => {
        if (!name || workoutExercises.length === 0) return

        const response = await fetch("/api/workouts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name,
                description,
                exercises: workoutExercises
            })
        })

        if (response.ok) {
            router.push("/workouts")
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
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                Workout Name
                            </label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-primary text-white"
                                placeholder="e.g., Push Day"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                Description (Optional)
                            </label>
                            <textarea
                                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-primary text-white h-24"
                                placeholder="Describe your workout..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>

                        <div className="border-t border-zinc-800 pt-6">
                            <h2 className="text-lg font-semibold mb-4">Exercises</h2>

                            {/* Search */}
                            <div className="relative mb-6">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <input
                                    type="text"
                                    className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-primary text-white"
                                    placeholder="Search to add exercises..."
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value)
                                        searchExercises(e.target.value)
                                    }}
                                />
                                {searchResults.length > 0 && (
                                    <div className="absolute z-10 w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                                        {searchResults.map((ex) => (
                                            <button
                                                key={ex.id}
                                                className="w-full text-left px-4 py-3 hover:bg-zinc-700 flex justify-between items-center transition-colors"
                                                onClick={() => addExercise(ex)}
                                            >
                                                <span>{ex.name}</span>
                                                <span className="text-xs text-gray-400 uppercase">{ex.muscleGroup}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Selected Exercises List */}
                            <div className="space-y-4">
                                {workoutExercises.map((ex, index) => (
                                    <div key={`${ex.id}-${index}`} className="flex items-center gap-4 bg-black/40 p-4 rounded-lg border border-zinc-800">
                                        <div className="flex-1 font-medium">{ex.name}</div>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                className="w-16 px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-center text-sm"
                                                value={ex.sets}
                                                onChange={(e) => updateExercise(index, "sets", parseInt(e.target.value) || 0)}
                                            />
                                            <span className="text-gray-500 text-sm">sets</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                className="w-16 px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-center text-sm"
                                                value={ex.reps}
                                                onChange={(e) => updateExercise(index, "reps", parseInt(e.target.value) || 0)}
                                            />
                                            <span className="text-gray-500 text-sm">reps</span>
                                        </div>
                                        <button
                                            onClick={() => removeExercise(index)}
                                            className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}

                                {workoutExercises.length === 0 && (
                                    <div className="text-center py-8 text-gray-500 border-2 border-dashed border-zinc-800 rounded-lg">
                                        No exercises added yet. Search above to add.
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="border-t border-zinc-800 pt-6 flex justify-end gap-4">
                            <button
                                className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
                                onClick={() => router.back()}
                            >
                                Cancel
                            </button>
                            <button
                                className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={saveWorkout}
                                disabled={!name || workoutExercises.length === 0}
                            >
                                <Save className="h-5 w-5" />
                                Save Workout
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

"use client"

import { useState, useEffect } from "react"
import Image, { type StaticImageData } from "next/image"
import { Navbar } from "@/components/Navbar"
import Link from "next/link"
import { Plus, User as UserIcon } from "lucide-react"
import img1 from "../../../img1.avif"
import img2 from "../../../img2.avif"
import img3 from "../../../img3.avif"
import img5 from "../../../img5.avif"

type Workout = {
    id: string
    name: string
    description: string | null
    author: { name: string | null }
    exercises: {
        id: string
        sets: number | null
        reps: number | null
        exercise: {
            name: string
        }
    }[]
}

const workoutImages: StaticImageData[] = [img1, img2, img3]

export default function WorkoutsPage() {
    const [workouts, setWorkouts] = useState<Workout[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchWorkouts = async () => {
            const response = await fetch("/api/workouts")
            const data = await response.json()
            setWorkouts(data)
            setLoading(false)
        }
        fetchWorkouts()
    }, [])

    return (
        <div className="relative min-h-screen bg-black text-white overflow-hidden">
            <div className="absolute inset-0 z-0">
                <Image
                    src={img5}
                    alt="Workout background"
                    fill
                    priority
                    className="object-cover opacity-20"
                    sizes="100vw"
                />
                <div className="absolute inset-0 bg-black/75" />
            </div>
            <Navbar />
            <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">Your Workouts</h1>
                    <Link
                        href="/workouts/new"
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors"
                    >
                        <Plus className="h-5 w-5" />
                        Create Workout
                    </Link>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    </div>
                ) : workouts.length === 0 ? (
                    <div className="text-center py-12 bg-zinc-900 rounded-xl border border-zinc-800">
                        <h3 className="text-xl font-medium text-white mb-2">No workouts found</h3>
                        <p className="text-gray-400 mb-6">Create your first workout plan to get started.</p>
                        <Link
                            href="/workouts/new"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-800 text-white rounded-full hover:bg-zinc-700 transition-colors"
                        >
                            <Plus className="h-5 w-5" />
                            Create New Plan
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {workouts.map((workout, index) => (
                            <div key={workout.id} className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden hover:border-primary/50 transition-colors">
                                <div className="relative h-44">
                                    <Image
                                        src={workoutImages[index % workoutImages.length]}
                                        alt={`${workout.name} preview`}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/30 to-transparent" />
                                </div>

                                <div className="p-6">
                                    <h3 className="text-xl font-bold mb-2">{workout.name}</h3>
                                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                                        {workout.description || "No description provided."}
                                    </p>

                                    <div className="space-y-2 mb-6">
                                        {workout.exercises.slice(0, 3).map((ex) => (
                                            <div key={ex.id} className="text-sm text-gray-300 flex justify-between">
                                                <span>{ex.exercise.name}</span>
                                                <span className="text-gray-500">{ex.sets}x{ex.reps}</span>
                                            </div>
                                        ))}
                                        {workout.exercises.length > 3 && (
                                            <div className="text-xs text-primary font-medium">
                                                +{workout.exercises.length - 3} more exercises
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between text-xs text-gray-500 border-t border-zinc-800 pt-4">
                                        <div className="flex items-center gap-1">
                                            <UserIcon className="h-3 w-3" />
                                            {workout.author.name || "Unknown"}
                                        </div>
                                        <button className="text-primary hover:text-white transition-colors">
                                            Start Workout &rarr;
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}

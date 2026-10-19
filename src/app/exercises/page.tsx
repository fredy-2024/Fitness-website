"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Navbar } from "@/components/Navbar"
import { MuscleGroup } from "@prisma/client"
import { Search } from "lucide-react"
import img1 from "../../../img1.avif"
import img2 from "../../../img2.avif"
import img3 from "../../../img3.avif"
import img6 from "../../../img6.avif"

type Exercise = {
    id: string
    name: string
    description: string | null
    muscleGroup: MuscleGroup
}

function getExerciseImage(muscleGroup: MuscleGroup) {
    const group = muscleGroup.toLowerCase()

    if (group.includes("leg") || group.includes("glute")) return img2
    if (group.includes("back") || group.includes("shoulder")) return img3

    return img1
}

export default function ExercisesPage() {
    const [exercises, setExercises] = useState<Exercise[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup | "ALL">("ALL")

    useEffect(() => {
        const fetchExercises = async () => {
            setLoading(true)
            const params = new URLSearchParams()
            if (search) params.append("search", search)
            if (selectedMuscle !== "ALL") params.append("muscleGroup", selectedMuscle)

            const response = await fetch(`/api/exercises?${params.toString()}`)
            const data = await response.json()
            setExercises(data)
            setLoading(false)
        }

        const debounce = setTimeout(fetchExercises, 300)
        return () => clearTimeout(debounce)
    }, [search, selectedMuscle])

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
                            className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg focus:outline-none focus:border-primary appearance-none cursor-pointer"
                            value={selectedMuscle}
                            onChange={(e) => setSelectedMuscle(e.target.value as MuscleGroup | "ALL")}
                        >
                            <option value="ALL">All Muscles</option>
                            {Object.values(MuscleGroup).map((muscle) => (
                                <option key={muscle} value={muscle}>
                                    {muscle.replace("_", " ")}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {exercises.map((exercise) => (
                            <div key={exercise.id} className="bg-zinc-900 rounded-xl border border-zinc-800 hover:border-primary/50 transition-colors overflow-hidden">
                                <div className="relative h-40">
                                    <Image
                                        src={getExerciseImage(exercise.muscleGroup)}
                                        alt={`${exercise.name} demonstration`}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/40 to-transparent" />
                                </div>

                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="text-xl font-semibold">{exercise.name}</h3>
                                        <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
                                            {exercise.muscleGroup.replace("_", " ")}
                                        </span>
                                    </div>
                                    <p className="text-gray-400 text-sm">
                                        {exercise.description || "No description available."}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}

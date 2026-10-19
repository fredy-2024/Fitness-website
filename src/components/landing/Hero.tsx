
"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function Hero() {
    return (
        <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/30 z-10" />
                <img
                    src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop"
                    alt="Fitness Background"
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Content */}
            <div className="container relative z-20 px-4 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <span className="inline-block py-1 px-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#39FF14] text-sm font-semibold tracking-wide mb-6">
                        #1 FITNESS PLATFORM
                    </span>
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tight mb-6 uppercase italic">
                        Transform Your <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#39FF14] to-[#32E010]">
                            Body & Mind
                        </span>
                    </h1>
                    <p className="max-w-xl mx-auto text-gray-300 text-lg md:text-xl mb-10 leading-relaxed">
                        Join the elite community of athletes. Personalized training programs,
                        expert nutrition plans, and real-time progress tracking.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href="/register">
                            <Button variant="neon" size="xl" className="w-full sm:w-auto">
                                Start Free Trial
                            </Button>
                        </Link>
                        <Link href="/workouts">
                            <Button variant="outline" size="xl" className="w-full sm:w-auto border-white/20 text-white hover:bg-white/10 hover:text-white">
                                Explore Workouts
                            </Button>
                        </Link>
                    </div>
                </motion.div>
            </div>

            {/* Scroll Indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 1 }}
                className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20"
            >
                <div className="w-[30px] h-[50px] rounded-full border-2 border-white/20 flex justify-center p-2">
                    <motion.div
                        animate={{ y: [0, 12, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                        className="w-1.5 h-1.5 rounded-full bg-[#39FF14]"
                    />
                </div>
            </motion.div>
        </section>
    )
}

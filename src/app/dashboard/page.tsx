import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/Navbar";

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login");
    }

    return (
        <div className="min-h-screen bg-black text-white">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid gap-6">
                    <div className="bg-zinc-900 p-8 rounded-xl border border-zinc-800">
                        <h1 className="text-3xl font-bold mb-4">Welcome back, {session.user?.name}!</h1>
                        <p className="text-gray-400">
                            Here&apos;s your workout summary. Start tracking your progress today.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
                            <h3 className="text-xl font-semibold mb-2">Workouts</h3>
                            <p className="text-3xl font-bold text-primary">0</p>
                            <p className="text-sm text-gray-500">Completed this week</p>
                        </div>
                        <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
                            <h3 className="text-xl font-semibold mb-2">Volume</h3>
                            <p className="text-3xl font-bold text-primary">0 kg</p>
                            <p className="text-sm text-gray-500">Lifted this week</p>
                        </div>
                        <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
                            <h3 className="text-xl font-semibold mb-2">Streak</h3>
                            <p className="text-3xl font-bold text-primary">0</p>
                            <p className="text-sm text-gray-500">Days active</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

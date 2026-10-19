import { Activity, CalendarDays, Dumbbell, Flame } from "lucide-react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/Navbar";

function dateKey(date: Date) {
    return date.toISOString().slice(0, 10);
}

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login");
    }

    const now = new Date();
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const startOfWeek = new Date(today);
    const daysSinceMonday = (today.getUTCDay() + 6) % 7;
    startOfWeek.setUTCDate(startOfWeek.getUTCDate() - daysSinceMonday);
    const startOfNextWeek = new Date(startOfWeek);
    startOfNextWeek.setUTCDate(startOfNextWeek.getUTCDate() + 7);

    const startOfMonth = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1));
    const startOfNextMonth = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + 1, 1));

    const [weeklyLogs, monthLogs, activityLogs] = await Promise.all([
        prisma.workoutLog.findMany({
            where: {
                userId: session.user.id,
                endedAt: { gte: startOfWeek, lt: startOfNextWeek },
            },
            select: {
                endedAt: true,
                workoutTemplate: {
                    select: {
                        exercises: { select: { sets: true, reps: true } },
                    },
                },
            },
        }),
        prisma.workoutLog.findMany({
            where: {
                userId: session.user.id,
                endedAt: { gte: startOfMonth, lt: startOfNextMonth },
            },
            select: { endedAt: true },
        }),
        prisma.workoutLog.findMany({
            where: { userId: session.user.id, endedAt: { not: null, lt: startOfNextWeek } },
            orderBy: { endedAt: "desc" },
            select: { endedAt: true },
        }),
    ]);

    const weeklyVolume = weeklyLogs.reduce((total, log) => (
        total + (log.workoutTemplate?.exercises ?? []).reduce(
            (exerciseTotal, exercise) => exerciseTotal + (exercise.sets ?? 0) * (exercise.reps ?? 0),
            0,
        )
    ), 0);

    const activeDays = new Set(
        activityLogs.flatMap((log) => log.endedAt ? [dateKey(log.endedAt)] : []),
    );
    const todayKey = dateKey(today);
    const yesterday = new Date(today);
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    const yesterdayKey = dateKey(yesterday);
    let streak = 0;
    if (activeDays.has(todayKey) || activeDays.has(yesterdayKey)) {
        const streakDate = new Date(activeDays.has(todayKey) ? today : yesterday);
        while (activeDays.has(dateKey(streakDate))) {
            streak += 1;
            streakDate.setUTCDate(streakDate.getUTCDate() - 1);
        }
    }

    const completedDates = new Set(
        monthLogs.flatMap((log) => log.endedAt ? [dateKey(log.endedAt)] : []),
    );
    const firstCalendarDay = new Date(startOfMonth);
    firstCalendarDay.setUTCDate(firstCalendarDay.getUTCDate() - ((firstCalendarDay.getUTCDay() + 6) % 7));
    const daysInMonth = Math.round((startOfNextMonth.getTime() - startOfMonth.getTime()) / 86_400_000);
    const calendarCellCount = Math.ceil((((startOfMonth.getUTCDay() + 6) % 7) + daysInMonth) / 7) * 7;
    const calendarDays = Array.from({ length: calendarCellCount }, (_, index) => {
        const date = new Date(firstCalendarDay);
        date.setUTCDate(firstCalendarDay.getUTCDate() + index);
        return {
            key: dateKey(date),
            day: date.getUTCDate(),
            isCurrentMonth: date.getUTCMonth() === today.getUTCMonth(),
            isToday: dateKey(date) === todayKey,
            completed: completedDates.has(dateKey(date)),
        };
    });
    const monthLabel = new Intl.DateTimeFormat("en-US", {
        month: "long",
        year: "numeric",
        timeZone: "UTC",
    }).format(today);

    return (
        <div className="min-h-screen bg-[#080D18] text-[#F8FAFC]">
            <Navbar />
            <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="grid gap-6">
                    <div className="rounded-2xl border border-border bg-[#151D2B]/85 p-8">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#22D3EE]">Your training overview</p>
                        <h1 className="text-3xl font-bold">Welcome back, {session.user?.name}!</h1>
                        <p className="mt-3 text-[#94A3B8]">Here&apos;s how your training is progressing this week.</p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                        <div className="rounded-2xl border border-border bg-[#151D2B] p-6">
                            <div className="flex items-center gap-2 text-sm font-medium text-[#94A3B8]"><Dumbbell className="h-4 w-4 text-[#22D3EE]" /> Workouts</div>
                            <p className="mt-4 text-3xl font-bold text-[#F8FAFC]">{weeklyLogs.length}</p>
                            <p className="mt-1 text-sm text-[#94A3B8]">Completed this week</p>
                        </div>
                        <div className="rounded-2xl border border-border bg-[#151D2B] p-6">
                            <div className="flex items-center gap-2 text-sm font-medium text-[#94A3B8]"><Activity className="h-4 w-4 text-[#2DD4BF]" /> Volume</div>
                            <p className="mt-4 text-3xl font-bold text-[#F8FAFC]">{weeklyVolume.toLocaleString()} <span className="text-base font-medium text-[#94A3B8]">reps</span></p>
                            <p className="mt-1 text-sm text-[#94A3B8]">Prescribed reps completed this week</p>
                        </div>
                        <div className="rounded-2xl border border-border bg-[#151D2B] p-6">
                            <div className="flex items-center gap-2 text-sm font-medium text-[#94A3B8]"><Flame className="h-4 w-4 text-[#22D3EE]" /> Streak</div>
                            <p className="mt-4 text-3xl font-bold text-[#F8FAFC]">{streak} <span className="text-base font-medium text-[#94A3B8]">{streak === 1 ? "day" : "days"}</span></p>
                            <p className="mt-1 text-sm text-[#94A3B8]">Consecutive days with a completed workout</p>
                        </div>
                    </div>

                    <section aria-labelledby="activity-calendar-title" className="w-full max-w-md rounded-2xl border border-border bg-[#151D2B]/90 p-5 shadow-[0_16px_50px_rgba(0,0,0,0.2)]">
                        <div className="mb-5 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#22D3EE]">Consistency</p>
                                <h2 id="activity-calendar-title" className="mt-1 text-lg font-semibold">{monthLabel}</h2>
                            </div>
                            <CalendarDays className="h-5 w-5 text-[#22D3EE]" />
                        </div>
                        <div className="grid grid-cols-7 gap-1 text-center">
                            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                                <span key={day} className="pb-2 text-xs font-medium text-[#94A3B8]">{day}</span>
                            ))}
                            {calendarDays.map((day) => (
                                <span
                                    key={day.key}
                                    aria-label={`${day.key}${day.completed ? ", workout completed" : ""}${day.isToday ? ", today" : ""}`}
                                    className={`relative mx-auto flex h-9 w-9 items-center justify-center rounded-full text-sm transition-colors ${
                                        !day.isCurrentMonth ? "text-slate-600" : "text-slate-300"
                                    } ${
                                        day.completed ? "bg-[#22D3EE] font-bold text-[#080D18] shadow-[0_0_14px_rgba(34,211,238,0.45)]" : ""
                                    } ${day.isToday ? "outline-solid outline-1 outline-[#2DD4BF]" : ""}`}
                                >
                                    {day.day}
                                </span>
                            ))}
                        </div>
                        <p className="mt-4 flex items-center gap-2 text-xs text-[#94A3B8]">
                            <span className="h-2 w-2 rounded-full bg-[#22D3EE]" /> Completed workout
                        </p>
                    </section>
                </div>
            </main>
        </div>
    );
}

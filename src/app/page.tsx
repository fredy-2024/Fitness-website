import Link from "next/link";
import Image from "next/image";
import { Activity, ArrowRight, BookOpen, CheckCircle2, Dumbbell, ListChecks, Play, Timer } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import heroImage from "../../img6.avif";

const features = [
  {
    number: "01",
    title: "Find the right movement",
    detail: "Browse exercises by body part, target muscle, or equipment, with demonstrations and clear instructions.",
    icon: BookOpen,
  },
  {
    number: "02",
    title: "Build a workout that fits",
    detail: "Choose exercises, set your sets and reps, and keep your plan ready for your next session.",
    icon: ListChecks,
  },
  {
    number: "03",
    title: "See your consistency grow",
    detail: "Mark a workout complete and follow your weekly activity, volume, streak, and calendar from your dashboard.",
    icon: Activity,
  },
];

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />

      <section className="relative isolate min-h-185 overflow-hidden border-b border-border bg-[#080D18] pt-28 pb-16">
        <Image
          src={heroImage}
          alt="Athletes training in a gym"
          fill
          priority
          sizes="100vw"
          className="absolute inset-0 -z-20 object-cover object-[58%_center] opacity-40"
        />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,#080D18_0%,rgba(8,13,24,0.94)_38%,rgba(8,13,24,0.55)_78%,rgba(8,13,24,0.72)_100%),linear-gradient(0deg,#080D18_0%,transparent_55%)]" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_72%_45%,rgba(34,211,238,0.13),transparent_32%)]" />

        <div className="section-shell relative">
          <div className="grid min-h-122.5 items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="max-w-2xl">
              <p className="inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-[#0B1220]/75 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200">
                <Dumbbell className="h-4 w-4" /> Your training, made clearer
              </p>
              <h1 className="mt-6 max-w-3xl font-display text-5xl font-black uppercase leading-[0.98] tracking-tight text-white sm:text-6xl md:text-7xl xl:text-[5.5rem]">
                Training that keeps you{" "}
                <span className="bg-linear-to-r from-cyan-200 via-[#22D3EE] to-[#2DD4BF] bg-clip-text text-transparent">
                  moving.
                </span>
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-slate-200 sm:text-lg">
                Browse exercise demos, build a workout, and track each session—all in one straightforward fitness space.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/workouts">
                  <Button size="xl" className="w-full gap-2 bg-[#22D3EE] font-semibold text-[#080D18] shadow-[0_0_24px_rgba(34,211,238,0.2)] hover:bg-cyan-300 sm:w-auto">
                    Browse workouts <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/exercises">
                  <Button size="xl" variant="outline" className="w-full gap-2 border-white/25 bg-[#0B1220]/60 text-white hover:bg-white/10 hover:text-white sm:w-auto">
                    <Play className="h-4 w-4 fill-current" /> Explore exercises
                  </Button>
                </Link>
              </div>
              <p className="mt-5 text-sm text-slate-300">New to ZenFit? <Link href="/register" className="font-semibold text-cyan-200 underline decoration-cyan-200/40 underline-offset-4 hover:text-white">Create a free account</Link> to save your workouts and progress.</p>
            </div>

            <div className="relative mx-auto hidden h-107.5 w-full max-w-127.5 lg:block" aria-label="Preview of a guided workout">
              <div className="absolute right-3 top-8 w-[82%] rounded-3xl border border-cyan-200/25 bg-[#0B1220]/95 p-5 shadow-[0_24px_90px_rgba(0,0,0,0.55)] backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">Workout preview</p>
                    <h2 className="mt-1 text-xl font-bold text-white">Upper body strength</h2>
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">Example</span>
                </div>
                <div className="mt-5 rounded-2xl border border-white/10 bg-[#080D18]/80 p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-cyan-300/25 to-teal-300/10 text-cyan-200">
                      <Dumbbell className="h-8 w-8" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-white">Dumbbell bench press</p>
                      <p className="mt-1 text-sm text-slate-400">Chest · 3 sets · 12 reps</p>
                    </div>
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-300 text-[#080D18]"><Play className="h-4 w-4 fill-current" /></span>
                  </div>
                </div>
                <div className="mt-4 rounded-xl border border-white/10 bg-white/4 p-3">
                  <div className="flex items-center gap-2 text-slate-300"><Timer className="h-4 w-4 text-cyan-200" /><span className="text-sm">Follow exercise instructions and mark each movement as you go.</span></div>
                </div>
              </div>

              <div className="absolute bottom-4 left-0 w-[50%] -rotate-[4deg] rounded-2xl border border-white/15 bg-[#151D2B]/95 p-4 shadow-[0_20px_65px_rgba(0,0,0,0.55)] backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-300/10 text-teal-200"><CheckCircle2 className="h-5 w-5" /></span>
                  <div><p className="text-sm font-semibold text-white">Session complete</p><p className="mt-1 text-xs text-slate-400">Your dashboard tracks your activity</p></div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 grid gap-3 border-t border-white/10 pt-7 sm:grid-cols-3">
            {["Exercise demonstrations", "Custom workout plans", "Weekly activity tracking"].map((item, index) => (
              <div key={item} className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#0B1220]/55 px-4 py-3 text-sm text-slate-200">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cyan-300/10 text-xs font-bold text-cyan-200">{index + 1}</span>
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-24">
        <div className="section-shell">
          <div className="mb-10 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">A simple way to stay consistent</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-5xl">Everything you need to keep moving</h2>
            <p className="mt-4 leading-7 text-slate-300">From your first exercise search to your latest completed session, ZenFit keeps your training clear and organized.</p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {features.map((feature) => (
              <article key={feature.number} className="group rounded-2xl border border-border bg-[#151D2B]/75 p-6 transition-all hover:-translate-y-1 hover:border-[#22D3EE]/50 hover:bg-[#151D2B]">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold tracking-widest text-[#22D3EE]">{feature.number}</span>
                  <feature.icon className="h-5 w-5 text-[#2DD4BF] transition-transform group-hover:scale-110" />
                </div>
                <h3 className="mt-7 text-xl font-semibold">{feature.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-300">{feature.detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-20 md:pb-24">
        <div className="section-shell">
          <div className="relative overflow-hidden rounded-3xl border border-cyan-300/20 bg-linear-to-br from-[#10202D] via-[#0B1220] to-[#102923] p-8 md:flex md:items-center md:justify-between md:gap-8 md:p-12">
            <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-cyan-300/10 blur-3xl" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">Ready when you are</p>
              <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight md:text-4xl">Make your next workout count.</h2>
              <p className="mt-3 max-w-xl text-slate-300">Explore the library or create an account to save a plan and track your sessions.</p>
            </div>
            <div className="relative mt-6 flex shrink-0 flex-col gap-3 sm:flex-row md:mt-0">
              <Link href="/workouts"><Button size="xl" className="w-full gap-2 bg-[#22D3EE] font-semibold text-[#080D18] hover:bg-cyan-300 sm:w-auto">Browse workouts <ArrowRight className="h-4 w-4" /></Button></Link>
              <Link href="/register" className="inline-flex items-center justify-center rounded-lg border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:border-cyan-200/60 hover:bg-white/5">Create account</Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

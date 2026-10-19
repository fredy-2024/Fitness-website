import Link from "next/link";
import { ArrowRight, CheckCircle2, Dumbbell, Gauge, ShieldCheck, Sparkles } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";

const pillars = [
  {
    title: "Precision Programming",
    detail: "Adaptive plans tuned to your recovery, goals, and available equipment.",
    icon: Gauge,
  },
  {
    title: "Coach Accountability",
    detail: "Weekly review loops with elite coaches and performance checkpoints.",
    icon: ShieldCheck,
  },
  {
    title: "Luxury Experience",
    detail: "Concierge support, clear execution, and a system built for consistency.",
    icon: Sparkles,
  },
];

const metrics = [
  { value: "12k+", label: "Active members" },
  { value: "97%", label: "Program completion" },
  { value: "4.9/5", label: "Average rating" },
];

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />

      <section className="relative pt-28 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(242,182,109,0.25),transparent_35%),radial-gradient(circle_at_90%_10%,rgba(52,198,211,0.2),transparent_35%)]" />
        <div className="section-shell relative">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1 text-xs uppercase tracking-[0.2em] text-primary">
                <CheckCircle2 className="w-3.5 h-3.5" /> Elite Coaching Platform
              </p>
              <h1 className="mt-5 font-[var(--font-display)] text-6xl md:text-8xl leading-[0.9] tracking-wide">
                Train Like It Matters
              </h1>
              <p className="mt-5 max-w-xl text-slate-300">
                ZenFit Elite combines performance science with high-touch coaching to build a body and routine that lasts.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link href="/register">
                  <Button size="xl" className="bg-primary text-primary-foreground hover:bg-primary/90">
                    Join Elite
                  </Button>
                </Link>
                <Link href="/programs">
                  <Button size="xl" variant="outline" className="border-white/20 bg-transparent text-white hover:bg-white/10">
                    Explore Programs
                  </Button>
                </Link>
              </div>
            </div>

            <div className="premium-card p-5 md:p-7">
              <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#10243c] via-[#0d1626] to-[#1a2839] p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-primary">
                    <Dumbbell className="w-5 h-5" />
                    <span className="text-sm uppercase tracking-wider">Weekly Output</span>
                  </div>
                  <span className="rounded-full bg-emerald-400/15 px-2 py-1 text-xs text-emerald-300">+14%</span>
                </div>
                <div className="mt-5 h-36 rounded-xl bg-[linear-gradient(180deg,rgba(255,255,255,0.1),rgba(255,255,255,0.02))] p-4 flex items-end gap-2">
                  {[35, 60, 48, 75, 55, 82, 93].map((h) => (
                    <div key={h} className="w-full rounded-t-md bg-primary/80" style={{ height: `${h}%` }} />
                  ))}
                </div>
                <p className="mt-4 text-sm text-slate-300">Volume, compliance, and intensity all trending up this month.</p>
              </div>
            </div>
          </div>

          <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {metrics.map((m) => (
              <div key={m.label} className="premium-card p-5">
                <p className="font-[var(--font-display)] text-5xl leading-none text-primary">{m.value}</p>
                <p className="mt-2 text-sm text-slate-300">{m.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="section-shell">
          <div className="mb-8">
            <p className="text-primary uppercase tracking-[0.2em] text-xs">Why ZenFit</p>
            <h2 className="mt-2 text-3xl md:text-5xl font-semibold">Built for people who expect results</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {pillars.map((pillar) => (
              <article key={pillar.title} className="premium-card p-6">
                <pillar.icon className="w-6 h-6 text-primary" />
                <h3 className="mt-4 text-xl font-semibold">{pillar.title}</h3>
                <p className="mt-2 text-slate-300 text-sm leading-relaxed">{pillar.detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="section-shell">
          <div className="premium-card p-8 md:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-gradient-to-r from-[#0f2138] to-[#14263a]">
            <div>
              <p className="text-primary uppercase tracking-[0.2em] text-xs">Membership</p>
              <h3 className="mt-2 text-3xl md:text-4xl font-semibold">Start your premium fitness phase</h3>
              <p className="mt-2 text-slate-300">No generic templates. Get a system engineered for your lifestyle.</p>
            </div>
            <Link href="/register">
              <Button size="xl" className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
                Apply Now <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";

const programs = [
  { name: "Athlete Rebuild", weeks: 12, tier: "Flagship", focus: "Strength + body composition" },
  { name: "Executive Lean", weeks: 8, tier: "Premium", focus: "Time-efficient fat loss" },
  { name: "Performance Prime", weeks: 16, tier: "Elite", focus: "Athletic movement and power" },
];

export default function ProgramsPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <section className="pt-28 pb-16">
        <div className="section-shell">
          <p className="text-primary uppercase text-xs tracking-[0.2em]">Programs</p>
          <h1 className="mt-3 font-display text-6xl md:text-7xl leading-[0.95]">Premium Training Tracks</h1>
          <p className="mt-4 max-w-2xl text-slate-300">
            Structured, coach-led programs with clear progression and measurable outcomes.
          </p>

          <div className="mt-10 grid md:grid-cols-3 gap-5">
            {programs.map((program) => (
              <article key={program.name} className="premium-card p-6">
                <p className="text-xs uppercase tracking-wider text-primary">{program.tier}</p>
                <h2 className="mt-2 text-2xl font-semibold">{program.name}</h2>
                <p className="mt-2 text-sm text-slate-300">{program.focus}</p>
                <p className="mt-4 text-sm text-slate-400">{program.weeks} week plan</p>
                <Link href="/register" className="mt-5 inline-flex items-center gap-2 text-primary font-medium">
                  Apply for access <ArrowRight className="w-4 h-4" />
                </Link>
              </article>
            ))}
          </div>

          <div className="mt-12">
            <Link href="/register">
              <Button size="xl" className="bg-primary text-primary-foreground hover:bg-primary/90">
                Join Elite Membership
              </Button>
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}

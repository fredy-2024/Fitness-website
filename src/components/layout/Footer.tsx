import Link from "next/link";
import { Dumbbell, Instagram, Twitter, Youtube } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-violet-500/20 bg-[#09090f]/80">
      <div className="section-shell py-14">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="rounded-lg p-1.5 bg-primary text-primary-foreground">
                <Dumbbell className="w-5 h-5" />
              </div>
              <span className="font-[var(--font-display)] text-3xl leading-none">ZenFit</span>
            </Link>
            <p className="text-sm text-slate-300 leading-relaxed">
              Athlete-grade coaching platform for people who train with intent.
            </p>
            <div className="flex gap-2">
              {[Instagram, Twitter, Youtube].map((Icon, idx) => (
                <button key={idx} className="rounded-full border border-white/15 p-2 text-slate-200 hover:bg-white/10">
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-3 font-semibold text-white">Explore</h3>
            <ul className="space-y-2 text-sm text-slate-300">
              <li><Link href="/programs" className="hover:text-primary">Programs</Link></li>
              <li><Link href="/workouts" className="hover:text-primary">Workouts</Link></li>
              <li><Link href="/exercises" className="hover:text-primary">Exercises</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 font-semibold text-white">Company</h3>
            <ul className="space-y-2 text-sm text-slate-300">
              <li><Link href="/trainers" className="hover:text-primary">Trainers</Link></li>
              <li><Link href="/register" className="hover:text-primary">Membership</Link></li>
              <li><Link href="/login" className="hover:text-primary">Client Portal</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 font-semibold text-white">Newsletter</h3>
            <p className="mb-3 text-sm text-slate-300">Get one practical training tip per week.</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500"
              />
              <button className="rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
                Join
              </button>
            </div>
          </div>
        </div>
        <div className="mt-10 border-t border-white/10 pt-6 text-xs text-slate-400">
          <p>&copy; {new Date().getFullYear()} ZenFit Elite. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

import Image from "next/image";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import img1 from "../../../img1.avif";
import img2 from "../../../img2.avif";
import img3 from "../../../img3.avif";

const trainers = [
  { name: "Arjun Patel", role: "Head Strength Coach", specialty: "Powerlifting and athlete prep", image: img1 },
  { name: "Sofia Reed", role: "Body Recomp Specialist", specialty: "Sustainable fat-loss systems", image: img2 },
  { name: "Marcus Hale", role: "Performance Coach", specialty: "Mobility, speed, and longevity", image: img3 },
];

export default function TrainersPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <section className="pt-28 pb-16">
        <div className="section-shell">
          <p className="text-primary uppercase text-xs tracking-[0.2em]">Coaches</p>
          <h1 className="mt-3 font-display text-6xl md:text-7xl leading-[0.95]">Meet the Coaching Team</h1>
          <p className="mt-4 max-w-2xl text-slate-300">
            Certified professionals who focus on measurable performance and long-term adherence.
          </p>

          <div className="mt-10 grid md:grid-cols-3 gap-5">
            {trainers.map((trainer) => (
              <article key={trainer.name} className="premium-card p-6">
                <div className="relative h-44 rounded-xl overflow-hidden">
                  <Image
                    src={trainer.image}
                    alt={`${trainer.name} profile`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/55 to-transparent" />
                </div>
                <h2 className="mt-4 text-2xl font-semibold">{trainer.name}</h2>
                <p className="mt-1 text-primary text-sm">{trainer.role}</p>
                <p className="mt-2 text-sm text-slate-300">{trainer.specialty}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}

import Link from "next/link";
import StarField from "@/components/StarField";
import StatsBar from "@/components/StatsBar";
import Leaderboard from "@/components/Leaderboard";

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col">
      <StarField />

      {/* Hero */}
      <section className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pb-12 pt-20 text-center">
        <div className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm text-foreground/70 backdrop-blur-sm">
          <span className="inline-block h-2 w-2 rounded-full bg-temp-habitable animate-pulse" />
          6,000+ confirmed exoplanets
        </div>

        <h1 className="max-w-4xl text-5xl font-bold leading-[1.1] tracking-tight sm:text-7xl lg:text-8xl">
          Explore Worlds{" "}
          <span className="bg-gradient-to-r from-accent via-accent to-temp-habitable bg-clip-text text-transparent">
            Beyond Our Own
          </span>
        </h1>

        <p className="mt-8 max-w-2xl text-lg leading-relaxed text-foreground/50 sm:text-xl">
          Search NASA&apos;s Exoplanet Archive. Discover alien worlds from
          scorching hot Jupiters to Earth-like planets in the habitable zone.
          Save your favorites and build your personal catalog.
        </p>

        <div className="mt-12 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/explore"
            className="group rounded-full bg-accent px-10 py-3.5 text-sm font-semibold text-white transition-all hover:bg-accent/90 hover:shadow-[0_0_32px_rgba(59,130,246,0.4)]"
          >
            Start Exploring
            <span className="ml-2 inline-block transition-transform group-hover:translate-x-0.5">
              &rarr;
            </span>
          </Link>
          <Link
            href="/sign-up"
            className="rounded-full border border-white/15 px-10 py-3.5 text-sm font-semibold transition-all hover:border-white/30 hover:bg-white/5"
          >
            Create Account
          </Link>
        </div>
      </section>

      {/* Live stats */}
      <section className="relative z-10 mb-20 px-6">
        <StatsBar />
      </section>

      {/* Most Saved Leaderboard */}
      <section className="relative z-10 mx-auto mb-20 w-full max-w-xl px-6">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold">Community Favorites</h2>
          <p className="mt-2 text-sm text-foreground/40">
            Most saved planets across all users
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card/50 p-5 backdrop-blur-md">
          <Leaderboard />
        </div>
      </section>

      {/* Feature cards */}
      <section className="relative z-10 mx-auto grid max-w-5xl gap-5 px-6 pb-28 sm:grid-cols-3">
        <FeatureCard
          icon="&#128269;"
          title="Search the Archive"
          description="Filter by size, temperature, discovery method, and more. Find habitable zone planets with one click."
        />
        <FeatureCard
          icon="&#10084;&#65039;"
          title="Save Favorites"
          description="Build your personal collection of fascinating exoplanets. Track the ones that inspire you."
        />
        <FeatureCard
          icon="&#127760;"
          title="Discover Patterns"
          description="From TRAPPIST-1 to Proxima Centauri — explore planetary systems across the galaxy."
        />
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-8 text-center text-xs text-foreground/25">
        Built with Next.js, Clerk, and Supabase. Data from NASA Exoplanet Archive.
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card/50 p-7 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-border-hover hover:bg-card-hover">
      <div className="mb-4 text-3xl">{icon}</div>
      <h3 className="mb-2 text-base font-semibold">{title}</h3>
      <p className="text-sm leading-relaxed text-foreground/50">{description}</p>
    </div>
  );
}

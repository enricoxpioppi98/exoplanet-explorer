import Link from "next/link";
import StarField from "@/components/StarField";
import StatsBar from "@/components/StatsBar";
import Leaderboard from "@/components/Leaderboard";

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col">
      <StarField />

      {/* Hero */}
      <section className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-foreground/70">
          <span className="inline-block h-2 w-2 rounded-full bg-temp-habitable animate-pulse" />
          6,000+ confirmed exoplanets
        </div>

        <h1 className="max-w-3xl text-5xl font-bold leading-tight tracking-tight sm:text-7xl">
          Explore Worlds{" "}
          <span className="bg-gradient-to-r from-accent to-temp-habitable bg-clip-text text-transparent">
            Beyond Our Own
          </span>
        </h1>

        <p className="mt-6 max-w-xl text-lg text-foreground/60">
          Search NASA&apos;s Exoplanet Archive. Discover alien worlds from
          scorching hot Jupiters to Earth-like planets in the habitable zone.
          Save your favorites and build your personal catalog.
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/explore"
            className="rounded-full bg-accent px-8 py-3 text-sm font-medium text-white transition-all hover:bg-accent/80 hover:shadow-[0_0_24px_rgba(59,130,246,0.3)]"
          >
            Start Exploring
          </Link>
          <Link
            href="/sign-up"
            className="rounded-full border border-white/20 px-8 py-3 text-sm font-medium transition-colors hover:bg-white/10"
          >
            Create Account
          </Link>
        </div>
      </section>

      {/* Live stats */}
      <section className="relative z-10 mb-16">
        <StatsBar />
      </section>

      {/* Most Saved Leaderboard */}
      <section className="relative z-10 mx-auto mb-16 max-w-xl px-4">
        <h2 className="mb-4 text-center text-lg font-semibold">
          Most Saved Planets
        </h2>
        <div className="rounded-2xl border border-border bg-card p-4 backdrop-blur-md">
          <Leaderboard />
        </div>
      </section>

      {/* Feature cards */}
      <section className="relative z-10 mx-auto grid max-w-5xl gap-6 px-4 pb-24 sm:grid-cols-3">
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
    <div className="rounded-2xl border border-border bg-card p-6 backdrop-blur-md transition-all hover:-translate-y-1 hover:border-border-hover hover:bg-card-hover">
      <div className="mb-3 text-2xl">{icon}</div>
      <h3 className="mb-2 font-semibold">{title}</h3>
      <p className="text-sm text-foreground/60">{description}</p>
    </div>
  );
}

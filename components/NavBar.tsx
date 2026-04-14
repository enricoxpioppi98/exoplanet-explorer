"use client";

import Link from "next/link";
import { useAuth, SignInButton, UserButton } from "@clerk/nextjs";

export default function NavBar() {
  const { isSignedIn } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
          <span className="text-2xl">&#127759;</span>
          <span className="hidden sm:inline">Exoplanet Explorer</span>
        </Link>

        <div className="flex items-center gap-6">
          <Link
            href="/explore"
            className="text-sm text-foreground/70 transition-colors hover:text-foreground"
          >
            Explore
          </Link>
          {isSignedIn ? (
            <>
              <Link
                href="/favorites"
                className="text-sm text-foreground/70 transition-colors hover:text-foreground"
              >
                Favorites
              </Link>
              <UserButton />
            </>
          ) : (
            <SignInButton mode="modal">
              <button className="rounded-full border border-white/20 px-4 py-1.5 text-sm transition-colors hover:bg-white/10">
                Sign In
              </button>
            </SignInButton>
          )}
        </div>
      </div>
    </nav>
  );
}

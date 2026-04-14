"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth, SignInButton, UserButton } from "@clerk/nextjs";

export default function NavBar() {
  const { isSignedIn } = useAuth();
  const pathname = usePathname();
  const [favCount, setFavCount] = useState(0);

  useEffect(() => {
    if (!isSignedIn) return;
    fetch("/api/favorites")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setFavCount(data.length);
      })
      .catch(() => {});
  }, [isSignedIn, pathname]);

  function navLinkClass(path: string) {
    const isActive = pathname === path;
    return `text-sm transition-colors ${
      isActive
        ? "text-foreground font-medium"
        : "text-foreground/50 hover:text-foreground"
    }`;
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-semibold transition-opacity hover:opacity-80"
        >
          <span className="text-2xl">&#127759;</span>
          <span className="hidden sm:inline">Exoplanet Explorer</span>
        </Link>

        <div className="flex items-center gap-6">
          <Link href="/explore" className={navLinkClass("/explore")}>
            Explore
          </Link>
          {isSignedIn ? (
            <>
              <Link href="/favorites" className={navLinkClass("/favorites")}>
                Favorites
                {favCount > 0 && (
                  <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent/20 px-1.5 text-xs font-medium text-accent">
                    {favCount}
                  </span>
                )}
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

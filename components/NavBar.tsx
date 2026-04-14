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
    return `relative text-sm font-medium transition-colors ${
      isActive
        ? "text-foreground"
        : "text-foreground/40 hover:text-foreground/70"
    }`;
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06] bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-base font-bold tracking-tight transition-opacity hover:opacity-80"
        >
          <span className="text-xl">&#127759;</span>
          <span className="hidden sm:inline">Exoplanet Explorer</span>
        </Link>

        <div className="flex items-center gap-7">
          <Link href="/explore" className={navLinkClass("/explore")}>
            Explore
          </Link>
          <Link href="/builder" className={navLinkClass("/builder")}>
            Builder
          </Link>
          {isSignedIn ? (
            <>
              <Link href="/favorites" className={navLinkClass("/favorites")}>
                Favorites
                {favCount > 0 && (
                  <span className="ml-1.5 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-accent/20 px-1 text-[10px] font-bold tabular-nums text-accent">
                    {favCount}
                  </span>
                )}
              </Link>
              <UserButton />
            </>
          ) : (
            <SignInButton mode="modal">
              <button className="rounded-full bg-white/[0.06] px-5 py-1.5 text-sm font-medium transition-all hover:bg-white/10">
                Sign In
              </button>
            </SignInButton>
          )}
        </div>
      </div>
    </nav>
  );
}

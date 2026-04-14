"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function SaveButton({
  planetName,
  isSaved,
  onToggle,
}: {
  planetName: string;
  isSaved: boolean;
  onToggle: () => void;
}) {
  const { isSignedIn } = useAuth();
  const router = useRouter();

  function handleClick(e: React.MouseEvent) {
    e.stopPropagation();
    if (!isSignedIn) {
      router.push("/sign-in");
      return;
    }
    onToggle();
  }

  return (
    <button
      onClick={handleClick}
      className="group relative rounded-full p-2 transition-all hover:bg-white/10"
      aria-label={isSaved ? `Unsave ${planetName}` : `Save ${planetName}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        className={`h-5 w-5 transition-all ${
          isSaved
            ? "fill-temp-hot stroke-temp-hot scale-110"
            : "fill-none stroke-foreground/40 group-hover:stroke-foreground/70"
        }`}
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
        />
      </svg>
    </button>
  );
}

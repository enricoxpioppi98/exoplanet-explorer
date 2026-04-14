"use client";

import { useState, useEffect } from "react";
import { getTempColor } from "@/lib/utils";

interface LeaderboardEntry {
  pl_name: string;
  hostname: string | null;
  pl_rade: number | null;
  pl_eqt: number | null;
  saves: number;
}

export default function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setEntries(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton h-12 rounded-lg" />
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-foreground/40">
        No saved planets yet. Be the first to save one!
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {entries.map((entry, i) => {
        const color = getTempColor(entry.pl_eqt);
        return (
          <div
            key={entry.pl_name}
            className="flex items-center gap-3 rounded-lg bg-white/3 px-4 py-2.5 transition-colors hover:bg-white/5"
          >
            <span className="w-6 text-center font-mono text-sm font-bold text-foreground/30">
              {i + 1}
            </span>
            <div
              className="h-3 w-3 shrink-0 rounded-full"
              style={{ backgroundColor: color }}
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{entry.pl_name}</p>
              <p className="truncate text-xs text-foreground/40">
                {entry.hostname}
              </p>
            </div>
            <span className="text-sm font-mono font-semibold text-accent">
              {entry.saves} {entry.saves === 1 ? "save" : "saves"}
            </span>
          </div>
        );
      })}
    </div>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import type { Exoplanet } from "@/lib/types";
import { getPlanetColors, getTempColor } from "@/lib/utils";

export default function SystemView({
  hostname,
  currentPlanet,
  onSelect,
}: {
  hostname: string;
  currentPlanet: string;
  onSelect: (p: Exoplanet) => void;
}) {
  const [siblings, setSiblings] = useState<Exoplanet[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    fetch(`/api/exoplanets?search=${encodeURIComponent(hostname)}&limit=20`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const system = data
            .filter((p: Exoplanet) => p.hostname === hostname)
            .sort((a: Exoplanet, b: Exoplanet) => (a.pl_orbper ?? 999) - (b.pl_orbper ?? 999));
          if (system.length > 1) setSiblings(system);
        }
      })
      .catch(() => {});
  }, [hostname]);

  useEffect(() => {
    if (siblings.length < 2) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    const w = rect.width;
    const h = rect.height;
    const cx = w / 2;
    const cy = h / 2;

    const maxOrbitR = Math.min(cx, cy) * 0.85;
    const minOrbitR = 30;

    function draw(now: number) {
      ctx!.clearRect(0, 0, w, h);

      // Star
      const starGrad = ctx!.createRadialGradient(cx, cy, 0, cx, cy, 20);
      starGrad.addColorStop(0, "#fff4d0");
      starGrad.addColorStop(0.5, "#fff4d080");
      starGrad.addColorStop(1, "transparent");
      ctx!.beginPath();
      ctx!.arc(cx, cy, 20, 0, Math.PI * 2);
      ctx!.fillStyle = starGrad;
      ctx!.fill();
      ctx!.beginPath();
      ctx!.arc(cx, cy, 5, 0, Math.PI * 2);
      ctx!.fillStyle = "#fff4d0";
      ctx!.fill();

      // Planets
      siblings.forEach((planet, i) => {
        const orbitR = minOrbitR + ((maxOrbitR - minOrbitR) * (i + 1)) / (siblings.length + 1);
        const period = planet.pl_orbper ?? 10;
        const angle = (now / 1000 / Math.max(period * 0.3, 0.5)) * Math.PI * 2;
        const [c1] = getPlanetColors(planet.pl_name, planet.pl_eqt, planet.pl_rade);
        const isCurrent = planet.pl_name === currentPlanet;
        const size = Math.max(3, Math.min(8, (planet.pl_rade ?? 1) * 3));

        // Orbit path
        ctx!.beginPath();
        ctx!.arc(cx, cy, orbitR, 0, Math.PI * 2);
        ctx!.strokeStyle = isCurrent ? "rgba(59,130,246,0.2)" : "rgba(255,255,255,0.05)";
        ctx!.lineWidth = isCurrent ? 1.5 : 0.5;
        ctx!.stroke();

        // Planet
        const px = cx + Math.cos(angle) * orbitR;
        const py = cy + Math.sin(angle) * orbitR;

        const grad = ctx!.createRadialGradient(px - 1, py - 1, 0, px, py, size);
        grad.addColorStop(0, c1 + "ee");
        grad.addColorStop(1, c1 + "44");
        ctx!.beginPath();
        ctx!.arc(px, py, size, 0, Math.PI * 2);
        ctx!.fillStyle = grad;
        ctx!.fill();

        if (isCurrent) {
          ctx!.beginPath();
          ctx!.arc(px, py, size + 3, 0, Math.PI * 2);
          ctx!.strokeStyle = "rgba(59,130,246,0.4)";
          ctx!.lineWidth = 1;
          ctx!.stroke();
        }

        // Label
        ctx!.font = isCurrent ? "bold 10px system-ui" : "9px system-ui";
        ctx!.fillStyle = isCurrent ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.3)";
        const label = planet.pl_name.replace(hostname, "").trim();
        ctx!.fillText(label || planet.pl_name, px + size + 4, py + 3);
      });

      animRef.current = requestAnimationFrame(draw);
    }

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [siblings, currentPlanet, hostname]);

  if (siblings.length < 2) return null;

  return (
    <div className="rounded-2xl border border-border bg-white/[0.02] p-5">
      <h3 className="mb-1 text-xs font-semibold uppercase tracking-widest text-foreground/30">
        {hostname} System
      </h3>
      <p className="mb-3 text-[11px] text-foreground/20">
        {siblings.length} known planets
      </p>

      <canvas
        ref={canvasRef}
        className="h-48 w-full rounded-xl sm:h-56"
        style={{ background: "transparent" }}
      />

      <div className="mt-3 flex flex-wrap gap-1.5">
        {siblings.map((p) => {
          const [c1] = getPlanetColors(p.pl_name, p.pl_eqt, p.pl_rade);
          const isCurrent = p.pl_name === currentPlanet;
          return (
            <button
              key={p.pl_name}
              onClick={() => onSelect(p)}
              className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] transition-all ${
                isCurrent
                  ? "bg-accent/20 text-accent font-medium"
                  : "bg-white/[0.03] text-foreground/40 hover:bg-white/[0.06] hover:text-foreground/60"
              }`}
            >
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: c1 }}
              />
              {p.pl_name.replace(hostname, "").trim() || p.pl_name}
            </button>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import { useState, useRef, useEffect } from "react";
import type { Exoplanet } from "@/lib/types";
import { getTempColor, getPlanetColors } from "@/lib/utils";

export default function OrbitSimulator({ planet }: { planet: Exoplanet }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const [speed, setSpeed] = useState(1);
  const [time, setTime] = useState(0);
  const timeRef = useRef(0);
  const speedRef = useRef(1);
  speedRef.current = speed;

  const period = planet.pl_orbper ?? 10;
  const starTemp = planet.st_teff ?? 5778;
  const starRad = planet.st_rad ?? 1;
  const planetRad = planet.pl_rade ?? 1;
  const [c1] = getPlanetColors(planet.pl_name, planet.pl_eqt, planet.pl_rade);

  // Star color from temperature
  const starColor =
    starTemp < 3500 ? "#ff6030" :
    starTemp < 5000 ? "#ffa050" :
    starTemp < 6000 ? "#fff4d0" :
    starTemp < 7500 ? "#f0f0ff" : "#a0c0ff";

  // Habitable zone inner/outer (simplified, relative to orbit)
  const habInner = 0.56;
  const habOuter = 0.88;

  useEffect(() => {
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

    let lastTime = performance.now();

    function draw(now: number) {
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      timeRef.current += dt * speedRef.current;
      setTime(timeRef.current);

      ctx!.clearRect(0, 0, w, h);

      const orbitRadius = Math.min(cx, cy) * 0.7;

      // Habitable zone
      ctx!.beginPath();
      ctx!.arc(cx, cy, orbitRadius * habOuter * 1.3, 0, Math.PI * 2);
      ctx!.fillStyle = "rgba(52, 211, 153, 0.04)";
      ctx!.fill();
      ctx!.beginPath();
      ctx!.arc(cx, cy, orbitRadius * habInner * 1.3, 0, Math.PI * 2);
      ctx!.fillStyle = "#050510";
      ctx!.fill();

      // Habitable zone label
      ctx!.font = "10px system-ui";
      ctx!.fillStyle = "rgba(52, 211, 153, 0.3)";
      ctx!.fillText("Habitable Zone", cx + orbitRadius * habOuter * 1.3 * 0.6, cy - orbitRadius * habOuter * 1.3 * 0.7);

      // Orbit path
      ctx!.beginPath();
      ctx!.arc(cx, cy, orbitRadius, 0, Math.PI * 2);
      ctx!.strokeStyle = "rgba(255,255,255,0.08)";
      ctx!.lineWidth = 1;
      ctx!.stroke();

      // Star glow
      const gradient = ctx!.createRadialGradient(cx, cy, 0, cx, cy, 30 + starRad * 8);
      gradient.addColorStop(0, starColor);
      gradient.addColorStop(0.3, starColor + "80");
      gradient.addColorStop(1, "transparent");
      ctx!.beginPath();
      ctx!.arc(cx, cy, 30 + starRad * 8, 0, Math.PI * 2);
      ctx!.fillStyle = gradient;
      ctx!.fill();

      // Star body
      ctx!.beginPath();
      ctx!.arc(cx, cy, 6 + starRad * 4, 0, Math.PI * 2);
      ctx!.fillStyle = starColor;
      ctx!.fill();

      // Planet position
      const angle = (timeRef.current / Math.max(period, 0.01)) * Math.PI * 2;
      const px = cx + Math.cos(angle) * orbitRadius;
      const py = cy + Math.sin(angle) * orbitRadius;

      // Planet shadow (simple)
      const shadowGrad = ctx!.createRadialGradient(px - 1, py - 1, 0, px, py, 4 + planetRad * 2.5);
      shadowGrad.addColorStop(0, c1 + "dd");
      shadowGrad.addColorStop(1, c1 + "33");
      ctx!.beginPath();
      ctx!.arc(px, py, 4 + planetRad * 2.5, 0, Math.PI * 2);
      ctx!.fillStyle = shadowGrad;
      ctx!.fill();

      // Planet trail (faint)
      for (let i = 1; i <= 15; i++) {
        const trailAngle = angle - (i * 0.02);
        const tx = cx + Math.cos(trailAngle) * orbitRadius;
        const ty = cy + Math.sin(trailAngle) * orbitRadius;
        ctx!.beginPath();
        ctx!.arc(tx, ty, 1.5, 0, Math.PI * 2);
        ctx!.fillStyle = `${c1}${Math.round((1 - i / 15) * 30).toString(16).padStart(2, "0")}`;
        ctx!.fill();
      }

      animRef.current = requestAnimationFrame(draw);
    }

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [period, starTemp, starRad, planetRad, starColor, c1, habInner, habOuter]);

  const daysPassed = (time * speed > 0 ? timeRef.current : 0) * period;
  const orbitsCompleted = timeRef.current;

  return (
    <div className="rounded-2xl border border-border bg-white/[0.02] p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-foreground/30">
          Orbit Simulator
        </h3>
        <div className="flex items-center gap-2">
          {[0.25, 0.5, 1, 2, 5].map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={`rounded-full px-2 py-0.5 text-[10px] font-medium transition-all ${
                speed === s
                  ? "bg-accent/20 text-accent"
                  : "text-foreground/30 hover:text-foreground/50"
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      <canvas
        ref={canvasRef}
        className="h-52 w-full rounded-xl sm:h-64"
        style={{ background: "transparent" }}
      />

      <div className="mt-3 flex justify-between text-[11px] text-foreground/30">
        <span>{orbitsCompleted.toFixed(1)} orbits</span>
        <span>{daysPassed.toFixed(1)} days elapsed</span>
      </div>
    </div>
  );
}

"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { Exoplanet } from "@/lib/types";
import { getPlanetColors } from "@/lib/utils";

// Solve Kepler's equation M = E - e*sin(E) using Newton-Raphson
function solveKepler(M: number, e: number): number {
  let E = M;
  for (let i = 0; i < 20; i++) {
    const dE = (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
    E -= dE;
    if (Math.abs(dE) < 1e-8) break;
  }
  return E;
}

// True anomaly from eccentric anomaly
function trueAnomaly(E: number, e: number): number {
  return 2 * Math.atan2(
    Math.sqrt(1 + e) * Math.sin(E / 2),
    Math.sqrt(1 - e) * Math.cos(E / 2)
  );
}

// Radius at true anomaly for an elliptical orbit
function orbitRadius(a: number, e: number, theta: number): number {
  return (a * (1 - e * e)) / (1 + e * Math.cos(theta));
}

export default function OrbitSimulator({ planet }: { planet: Exoplanet }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const [speed, setSpeed] = useState(1);
  const timeRef = useRef(0);
  const speedRef = useRef(1);
  speedRef.current = speed;
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);
  pausedRef.current = paused;
  const [zoom, setZoom] = useState(1);
  const zoomRef = useRef(1);
  zoomRef.current = zoom;
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const panRef = useRef({ x: 0, y: 0 });
  panRef.current = panOffset;
  const isDragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });

  const [info, setInfo] = useState({ orbits: 0, days: 0, distAU: 0, atPeri: false });

  const period = planet.pl_orbper ?? 10; // days
  const ecc = planet.pl_orbeccen ?? 0.02; // eccentricity
  const sma = planet.pl_orbsmax ?? 1; // semi-major axis AU
  const starTemp = planet.st_teff ?? 5778;
  const starRad = planet.st_rad ?? 1;
  const planetRad = planet.pl_rade ?? 1;
  const [c1] = getPlanetColors(planet.pl_name, planet.pl_eqt, planet.pl_rade);

  const starColor =
    starTemp < 3500 ? "#ff6030" :
    starTemp < 5000 ? "#ffa050" :
    starTemp < 6000 ? "#fff4d0" :
    starTemp < 7500 ? "#f0f0ff" : "#a0c0ff";

  // Habitable zone bounds (simplified: sqrt(L) scaling)
  // L ~ (R_star)^2 * (T_star/5778)^4
  const luminosity = Math.pow(starRad, 2) * Math.pow(starTemp / 5778, 4);
  const habInnerAU = 0.75 * Math.sqrt(luminosity);
  const habOuterAU = 1.77 * Math.sqrt(luminosity);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const w = rect.width;
    const h = rect.height;

    // Determine scale: fit the orbit + some margin
    // aphelion = sma * (1 + ecc)
    const aphelion = sma * (1 + ecc);
    const maxExtent = Math.max(aphelion, habOuterAU) * 1.15;
    const baseScale = Math.min(w, h) * 0.42 / Math.max(maxExtent, 0.01);
    const scale = baseScale * zoomRef.current;

    // Star at focus with pan offset
    const ox = panRef.current.x;
    const oy = panRef.current.y;
    const focusOffsetPx = sma * ecc * scale;
    const cx = w / 2 + focusOffsetPx + ox;
    const cy = h / 2 + oy;
    const ellCx = w / 2 + ox;
    const ellCy = h / 2 + oy;

    ctx.clearRect(0, 0, w, h);

    // Habitable zone (centered on star)
    if (habOuterAU * scale > 10) {
      ctx.beginPath();
      ctx.arc(cx, cy, habOuterAU * scale, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(52, 211, 153, 0.04)";
      ctx.fill();

      ctx.beginPath();
      ctx.arc(cx, cy, habInnerAU * scale, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(5, 5, 16, 0.95)";
      ctx.fill();

      ctx.font = "9px system-ui";
      ctx.fillStyle = "rgba(52, 211, 153, 0.25)";
      const labelR = (habInnerAU + habOuterAU) / 2 * scale;
      ctx.fillText("Habitable Zone", cx + labelR * 0.55, cy - labelR * 0.75);
    }

    // Draw elliptical orbit path
    const a = sma * scale; // semi-major in px
    const b = a * Math.sqrt(1 - ecc * ecc); // semi-minor in px
    ctx.beginPath();
    ctx.ellipse(ellCx, ellCy, a, b, 0, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255,255,255,0.07)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Perihelion marker
    const periX = cx + sma * (1 - ecc) * scale;
    ctx.beginPath();
    ctx.arc(periX, cy, 2, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.15)";
    ctx.fill();
    ctx.font = "8px system-ui";
    ctx.fillStyle = "rgba(255,255,255,0.2)";
    ctx.fillText("perihelion", periX + 5, cy - 5);

    // Aphelion marker
    const apX = cx - sma * (1 + ecc) * scale;
    ctx.beginPath();
    ctx.arc(apX, cy, 2, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.1)";
    ctx.fill();
    ctx.font = "8px system-ui";
    ctx.fillStyle = "rgba(255,255,255,0.15)";
    ctx.fillText("aphelion", apX - 40, cy - 5);

    // Star glow
    const glowR = Math.max(15, starRad * 6);
    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
    gradient.addColorStop(0, starColor);
    gradient.addColorStop(0.3, starColor + "60");
    gradient.addColorStop(1, "transparent");
    ctx.beginPath();
    ctx.arc(cx, cy, glowR, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();

    // Star body
    const starBodyR = Math.max(4, starRad * 3.5);
    ctx.beginPath();
    ctx.arc(cx, cy, starBodyR, 0, Math.PI * 2);
    ctx.fillStyle = starColor;
    ctx.fill();

    // Planet position using Kepler's equation
    const meanAnomaly = (timeRef.current / Math.max(period, 0.001)) * Math.PI * 2;
    const E = solveKepler(meanAnomaly % (Math.PI * 2), ecc);
    const theta = trueAnomaly(E, ecc);
    const r = orbitRadius(sma, ecc, theta);
    const rPx = r * scale;

    // Planet position relative to star (focus)
    const px = cx + rPx * Math.cos(theta);
    const py = cy - rPx * Math.sin(theta); // canvas y is inverted

    // Planet trail
    const trailCount = 30;
    for (let i = 1; i <= trailCount; i++) {
      const tM = meanAnomaly - i * 0.015;
      const tE = solveKepler(((tM % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2), ecc);
      const tTheta = trueAnomaly(tE, ecc);
      const tR = orbitRadius(sma, ecc, tTheta) * scale;
      const tx = cx + tR * Math.cos(tTheta);
      const ty = cy - tR * Math.sin(tTheta);
      const alpha = Math.round((1 - i / trailCount) * 25);
      ctx.beginPath();
      ctx.arc(tx, ty, 1.2, 0, Math.PI * 2);
      ctx.fillStyle = `${c1}${alpha.toString(16).padStart(2, "0")}`;
      ctx.fill();
    }

    // Planet body
    const pSize = Math.max(3, Math.min(10, planetRad * 2.5));
    const pGrad = ctx.createRadialGradient(px - 1, py - 1, 0, px, py, pSize);
    pGrad.addColorStop(0, c1 + "ee");
    pGrad.addColorStop(1, c1 + "33");
    ctx.beginPath();
    ctx.arc(px, py, pSize, 0, Math.PI * 2);
    ctx.fillStyle = pGrad;
    ctx.fill();

    // Planet label
    ctx.font = "bold 10px system-ui";
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.fillText(planet.pl_name.split(" ").pop() ?? "", px + pSize + 4, py + 3);

    // Distance line from star to planet
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(px, py);
    ctx.strokeStyle = "rgba(255,255,255,0.04)";
    ctx.lineWidth = 0.5;
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Distance label
    const midX = (cx + px) / 2;
    const midY = (cy + py) / 2;
    ctx.font = "8px system-ui";
    ctx.fillStyle = "rgba(255,255,255,0.2)";
    ctx.fillText(`${r.toFixed(3)} AU`, midX + 5, midY - 5);

    // Update info
    const nearPeri = Math.abs(theta % (Math.PI * 2)) < 0.15 || Math.abs(theta % (Math.PI * 2) - Math.PI * 2) < 0.15;
    setInfo({
      orbits: timeRef.current / Math.max(period, 0.001),
      days: timeRef.current,
      distAU: r,
      atPeri: nearPeri,
    });
  }, [period, ecc, sma, starTemp, starRad, planetRad, starColor, c1, habInnerAU, habOuterAU, planet.pl_name]);

  useEffect(() => {
    let lastTime = performance.now();

    function loop(now: number) {
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      if (!pausedRef.current) {
        timeRef.current += dt * speedRef.current;
      }
      draw();
      animRef.current = requestAnimationFrame(loop);
    }

    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [draw]);

  // Zoom with mouse wheel
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    function handleWheel(e: WheelEvent) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      setZoom((z) => Math.max(0.2, Math.min(20, z * delta)));
    }

    function handleMouseDown(e: MouseEvent) {
      isDragging.current = true;
      lastMouse.current = { x: e.clientX, y: e.clientY };
    }

    function handleMouseMove(e: MouseEvent) {
      if (!isDragging.current) return;
      const dx = e.clientX - lastMouse.current.x;
      const dy = e.clientY - lastMouse.current.y;
      lastMouse.current = { x: e.clientX, y: e.clientY };
      setPanOffset((p) => ({ x: p.x + dx, y: p.y + dy }));
    }

    function handleMouseUp() {
      isDragging.current = false;
    }

    // Touch support
    let lastTouchDist = 0;
    function handleTouchStart(e: TouchEvent) {
      if (e.touches.length === 1) {
        isDragging.current = true;
        lastMouse.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      } else if (e.touches.length === 2) {
        lastTouchDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
      }
    }

    function handleTouchMove(e: TouchEvent) {
      e.preventDefault();
      if (e.touches.length === 1 && isDragging.current) {
        const dx = e.touches[0].clientX - lastMouse.current.x;
        const dy = e.touches[0].clientY - lastMouse.current.y;
        lastMouse.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        setPanOffset((p) => ({ x: p.x + dx, y: p.y + dy }));
      } else if (e.touches.length === 2) {
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        if (lastTouchDist > 0) {
          const delta = dist / lastTouchDist;
          setZoom((z) => Math.max(0.2, Math.min(20, z * delta)));
        }
        lastTouchDist = dist;
      }
    }

    function handleTouchEnd() {
      isDragging.current = false;
      lastTouchDist = 0;
    }

    canvas.addEventListener("wheel", handleWheel, { passive: false });
    canvas.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("touchstart", handleTouchStart, { passive: false });
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
    canvas.addEventListener("touchend", handleTouchEnd);

    return () => {
      canvas.removeEventListener("wheel", handleWheel);
      canvas.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("touchstart", handleTouchStart);
      canvas.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  function resetView() {
    setZoom(1);
    setPanOffset({ x: 0, y: 0 });
  }

  return (
    <div className="rounded-2xl border border-border bg-white/[0.02] p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-foreground/30">
          Orbit Simulator
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPaused(!paused)}
            className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium transition-all ${
              paused ? "bg-amber/20 text-amber" : "bg-white/5 text-foreground/40"
            }`}
          >
            {paused ? "Play" : "Pause"}
          </button>
          <button
            onClick={resetView}
            className="rounded-full bg-white/5 px-2.5 py-0.5 text-[10px] font-medium text-foreground/40 transition-all hover:text-foreground/60"
            title="Reset zoom and pan"
          >
            Reset
          </button>
          <div className="flex items-center rounded-full bg-white/[0.03] p-0.5">
            {[0.1, 0.5, 1, 3, 10, 50].map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`rounded-full px-2 py-0.5 text-[10px] font-medium transition-all ${
                  speed === s
                    ? "bg-accent/20 text-accent"
                    : "text-foreground/25 hover:text-foreground/50"
                }`}
              >
                {s >= 1 ? `${s}x` : `${s}x`}
              </button>
            ))}
          </div>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        className="h-56 w-full cursor-grab rounded-xl active:cursor-grabbing sm:h-72"
        style={{ background: "transparent" }}
      />
      <p className="mt-1 text-center text-[10px] text-foreground/20">
        Scroll to zoom · Drag to pan · {zoom.toFixed(1)}x
      </p>

      {/* Info bar */}
      <div className="mt-3 grid grid-cols-4 gap-2">
        <InfoChip label="Orbits" value={info.orbits.toFixed(2)} />
        <InfoChip label="Days" value={info.days.toFixed(1)} />
        <InfoChip
          label="Distance"
          value={`${info.distAU.toFixed(3)} AU`}
        />
        <InfoChip
          label="Position"
          value={info.atPeri ? "Perihelion" : "In orbit"}
          highlight={info.atPeri}
        />
      </div>

      {/* Orbit stats */}
      <div className="mt-3 flex flex-wrap gap-3 text-[10px] text-foreground/25">
        <span>Eccentricity: {ecc.toFixed(4)}</span>
        <span>Semi-major axis: {sma.toFixed(4)} AU</span>
        <span>Perihelion: {(sma * (1 - ecc)).toFixed(4)} AU</span>
        <span>Aphelion: {(sma * (1 + ecc)).toFixed(4)} AU</span>
      </div>
    </div>
  );
}

function InfoChip({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className={`rounded-lg px-2.5 py-1.5 ${highlight ? "bg-accent/10" : "bg-white/[0.02]"}`}>
      <p className="text-[9px] uppercase tracking-wider text-foreground/25">{label}</p>
      <p className={`font-mono text-[11px] font-medium ${highlight ? "text-accent" : ""}`}>
        {value}
      </p>
    </div>
  );
}

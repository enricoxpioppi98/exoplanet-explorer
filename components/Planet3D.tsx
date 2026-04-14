"use client";

import { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

// Deterministic hash from planet name
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

// FBM noise for terrain generation
function fbm(x: number, y: number, seed: number, octaves: number): number {
  let value = 0;
  let amp = 0.5;
  let freq = 1;
  for (let i = 0; i < octaves; i++) {
    value +=
      amp *
      (0.5 +
        0.5 *
          Math.sin(x * freq * 1.7 + seed * 13.37 + Math.cos(y * freq * 2.3 + seed * 7.13) * 3.0) *
          Math.cos(y * freq * 1.9 + seed * 9.81 + Math.sin(x * freq * 2.7 + seed * 5.67) * 2.5));
    amp *= 0.5;
    freq *= 2.0;
  }
  return value;
}

type PlanetType = "frozen" | "habitable" | "desert" | "lava" | "gas-warm" | "gas-cool" | "gas-ringed";

function classifyPlanet(temp: number, rad: number): PlanetType {
  if (rad > 6) return "gas-ringed";
  if (rad > 4) return temp > 400 ? "gas-warm" : "gas-cool";
  if (temp < 200) return "frozen";
  if (temp <= 320) return "habitable";
  if (temp <= 800) return "desert";
  return "lava";
}

// Load a real NASA texture, then paint unique per-planet modifications on top
function generateUniqueTexture(
  baseImage: HTMLImageElement,
  type: PlanetType,
  seed: number,
  temperature: number,
  radius: number
): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  // Draw real NASA texture as base
  ctx.drawImage(baseImage, 0, 0, size, size);

  // Get pixel data for manipulation
  const imageData = ctx.getImageData(0, 0, size, size);
  const data = imageData.data;

  const rng = seededRandom(seed);
  const hueShift = rng() * 360;
  const satShift = rng() * 0.4 - 0.2;
  const brightShift = rng() * 0.15 - 0.075;
  const noiseScale = 2 + rng() * 6;
  const noiseSeed = rng() * 1000;
  const blendAmount = type === "habitable" ? 0.35 : type.startsWith("gas") ? 0.25 : 0.4;

  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      const idx = (py * size + px) * 4;

      // Spherical coordinates for seamless noise
      const u = px / size;
      const v = py / size;
      const theta = u * Math.PI * 2;
      const phi = v * Math.PI;
      const nx = Math.sin(phi) * Math.cos(theta);
      const ny = Math.sin(phi) * Math.sin(theta);
      const nz = Math.cos(phi);

      // Per-planet procedural noise overlay
      const n = fbm(nx * noiseScale, ny * noiseScale + nz * noiseScale * 0.7, noiseSeed, 5);

      let r = data[idx];
      let g = data[idx + 1];
      let b = data[idx + 2];

      // Convert to HSL, shift, convert back
      const [h, s, l] = rgbToHsl(r, g, b);
      let newH = (h + hueShift / 360) % 1;
      let newS = Math.max(0, Math.min(1, s + satShift));
      let newL = Math.max(0, Math.min(1, l + brightShift));

      // Blend noise into lightness for terrain variation
      newL = newL * (1 - blendAmount) + (n * 0.8 + 0.1) * blendAmount;
      // Slight hue variation from noise
      newH = (newH + (n - 0.5) * 0.05) % 1;
      if (newH < 0) newH += 1;

      const [nr, ng, nb] = hslToRgb(newH, newS, newL);
      data[idx] = nr;
      data[idx + 1] = ng;
      data[idx + 2] = nb;
    }
  }

  ctx.putImageData(imageData, 0, 0);

  // For habitable planets, add procedural oceans and ice caps
  if (type === "habitable") {
    addOceansAndIce(ctx, size, noiseSeed, temperature, rng);
  }

  // For lava planets, add glowing cracks
  if (type === "lava") {
    addLavaCracks(ctx, size, noiseSeed);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function addOceansAndIce(
  ctx: CanvasRenderingContext2D,
  size: number,
  seed: number,
  temp: number,
  rng: () => number
) {
  const imageData = ctx.getImageData(0, 0, size, size);
  const data = imageData.data;
  const oceanLevel = 0.38 + rng() * 0.12;
  const oceanHue = 0.55 + rng() * 0.1;

  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      const u = px / size;
      const v = py / size;
      const theta = u * Math.PI * 2;
      const phi = v * Math.PI;
      const nx = Math.sin(phi) * Math.cos(theta);
      const ny = Math.sin(phi) * Math.sin(theta);
      const nz = Math.cos(phi);
      const latitude = Math.abs(v - 0.5) * 2;

      const elevation = fbm(nx * 4, ny * 4 + nz * 3, seed + 200, 6);

      const idx = (py * size + px) * 4;

      if (elevation < oceanLevel) {
        // Ocean
        const depth = (oceanLevel - elevation) / oceanLevel;
        const [or, og, ob] = hslToRgb(oceanHue, 0.6 + depth * 0.2, 0.15 + depth * 0.15);
        const blend = 0.7 + depth * 0.3;
        data[idx] = data[idx] * (1 - blend) + or * blend;
        data[idx + 1] = data[idx + 1] * (1 - blend) + og * blend;
        data[idx + 2] = data[idx + 2] * (1 - blend) + ob * blend;
      }

      // Ice caps
      const iceLine = temp < 260 ? 0.55 : 0.78;
      if (latitude > iceLine) {
        const iceBlend = Math.min((latitude - iceLine) / 0.18, 1) * 0.85;
        data[idx] = data[idx] * (1 - iceBlend) + 235 * iceBlend;
        data[idx + 1] = data[idx + 1] * (1 - iceBlend) + 240 * iceBlend;
        data[idx + 2] = data[idx + 2] * (1 - iceBlend) + 248 * iceBlend;
      }
    }
  }
  ctx.putImageData(imageData, 0, 0);
}

function addLavaCracks(ctx: CanvasRenderingContext2D, size: number, seed: number) {
  const imageData = ctx.getImageData(0, 0, size, size);
  const data = imageData.data;

  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      const u = px / size;
      const v = py / size;
      const theta = u * Math.PI * 2;
      const phi = v * Math.PI;
      const nx = Math.sin(phi) * Math.cos(theta);
      const ny = Math.sin(phi) * Math.sin(theta);
      const nz = Math.cos(phi);

      const crack = fbm(nx * 10, ny * 10 + nz * 7, seed + 600, 4);
      if (crack < 0.32) {
        const heat = (0.32 - crack) / 0.32;
        const idx = (py * size + px) * 4;
        data[idx] = Math.min(255, data[idx] + heat * 200);
        data[idx + 1] = Math.min(255, data[idx + 1] + heat * 80);
        data[idx + 2] = Math.min(255, data[idx + 2] + heat * 10);
      }
    }
  }
  ctx.putImageData(imageData, 0, 0);
}

function generateCloudTexture(seed: number, density: number): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const imageData = ctx.createImageData(size, size);
  const data = imageData.data;

  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      const u = px / size;
      const v = py / size;
      const theta = u * Math.PI * 2;
      const phi = v * Math.PI;
      const nx = Math.sin(phi) * Math.cos(theta);
      const ny = Math.sin(phi) * Math.sin(theta);
      const nz = Math.cos(phi);

      const cloud = fbm(nx * 5, ny * 5 + nz * 3, seed, 6);
      const threshold = 0.5 - density * 0.15;
      const alpha = Math.max(0, (cloud - threshold) / (1 - threshold)) * 220;

      const idx = (py * size + px) * 4;
      data[idx] = 255;
      data[idx + 1] = 255;
      data[idx + 2] = 255;
      data[idx + 3] = Math.min(255, alpha);
    }
  }
  ctx.putImageData(imageData, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  return tex;
}

// Color conversion helpers
function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return [h, s, l];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  if (s === 0) { const v = Math.round(l * 255); return [v, v, v]; }
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1; if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [
    Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
    Math.round(hue2rgb(p, q, h) * 255),
    Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
  ];
}

// Texture paths mapped to planet type
const BASE_TEXTURES: Record<PlanetType, string> = {
  frozen: "/textures/neptune.jpg",
  habitable: "/textures/earth.jpg",
  desert: "/textures/mars.jpg",
  lava: "/textures/venus.jpg",
  "gas-warm": "/textures/jupiter.jpg",
  "gas-cool": "/textures/neptune.jpg",
  "gas-ringed": "/textures/saturn.jpg",
};

function PlanetBody({
  temperature,
  radius,
  planetName,
}: {
  temperature: number | null;
  radius: number | null;
  planetName: string;
}) {
  const planetRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  const temp = temperature ?? 300;
  const rad = radius ?? 1;
  const seed = hashString(planetName);
  const type = useMemo(() => classifyPlanet(temp, rad), [temp, rad]);

  const [textures, setTextures] = useState<{
    surface: THREE.CanvasTexture;
    clouds: THREE.CanvasTexture | null;
    ring: THREE.Texture | null;
  } | null>(null);

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    const basePath = BASE_TEXTURES[type];

    // Load base texture image
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const surface = generateUniqueTexture(img, type, seed, temp, rad);

      const rng = seededRandom(seed + 999);
      const hasClouds = type === "habitable" || type === "frozen";
      const clouds = hasClouds
        ? generateCloudTexture(seed + 500, 0.5 + rng() * 0.5)
        : null;

      const hasRing = type === "gas-ringed";
      if (hasRing) {
        loader.load("/textures/saturn_ring.png", (ringTex) => {
          setTextures({ surface, clouds, ring: ringTex });
        });
      } else {
        setTextures({ surface, clouds, ring: null });
      }
    };
    img.src = basePath;

    return () => {
      // Cleanup
      if (textures?.surface) textures.surface.dispose();
      if (textures?.clouds) textures.clouds.dispose();
      if (textures?.ring) textures.ring.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, seed, temp, rad]);

  const displaySize = useMemo(() => {
    if (rad < 1) return 0.85;
    if (rad < 2) return 1.0;
    if (rad < 4) return 1.15;
    if (rad < 10) return 1.35;
    return 1.55;
  }, [rad]);

  const rng = useMemo(() => seededRandom(seed), [seed]);
  const tilt = useMemo(() => (rng() - 0.5) * 0.8, [rng]);
  const initialRotation = useMemo(() => rng() * Math.PI * 2, [rng]);

  const atmosphereColor = useMemo(() => {
    switch (type) {
      case "frozen": return "#80b8e8";
      case "habitable": return "#4da6ff";
      case "desert": return "#d09060";
      case "lava": return "#ff4020";
      case "gas-warm": return "#c0a070";
      case "gas-cool": return "#6080c0";
      case "gas-ringed": return "#d0c090";
    }
  }, [type]);

  const emissive = type === "lava" ? "#ff2000" : "#000000";
  const emissiveIntensity = type === "lava" ? 0.3 : 0;

  useFrame((_, delta) => {
    if (planetRef.current) planetRef.current.rotation.y += delta * 0.06;
    if (cloudsRef.current) cloudsRef.current.rotation.y += delta * 0.09;
    if (ringRef.current) ringRef.current.rotation.z += delta * 0.008;
  });

  if (!textures) {
    // Loading placeholder — spinning wireframe
    return (
      <mesh ref={planetRef}>
        <sphereGeometry args={[displaySize, 32, 32]} />
        <meshBasicMaterial color="#1a1a2e" wireframe />
      </mesh>
    );
  }

  return (
    <group rotation={[tilt, initialRotation, 0]}>
      {/* Planet surface */}
      <mesh ref={planetRef}>
        <sphereGeometry args={[displaySize, 128, 128]} />
        <meshStandardMaterial
          map={textures.surface}
          roughness={type.startsWith("gas") ? 0.95 : 0.8}
          metalness={0.05}
          emissive={emissive}
          emissiveIntensity={emissiveIntensity}
        />
      </mesh>

      {/* Clouds */}
      {textures.clouds && (
        <mesh ref={cloudsRef} scale={1.012}>
          <sphereGeometry args={[displaySize, 64, 64]} />
          <meshStandardMaterial
            map={textures.clouds}
            transparent
            opacity={0.45}
            depthWrite={false}
            alphaTest={0.05}
          />
        </mesh>
      )}

      {/* Atmosphere glow layers */}
      <mesh scale={1.025}>
        <sphereGeometry args={[displaySize, 64, 64]} />
        <meshBasicMaterial color={atmosphereColor} transparent opacity={0.12} side={THREE.BackSide} />
      </mesh>
      <mesh scale={1.06}>
        <sphereGeometry args={[displaySize, 32, 32]} />
        <meshBasicMaterial color={atmosphereColor} transparent opacity={0.06} side={THREE.BackSide} />
      </mesh>
      <mesh scale={1.12}>
        <sphereGeometry args={[displaySize, 32, 32]} />
        <meshBasicMaterial color={atmosphereColor} transparent opacity={0.02} side={THREE.BackSide} />
      </mesh>

      {/* Rings */}
      {textures.ring && (
        <mesh ref={ringRef} rotation={[Math.PI / 2.3, 0, 0]}>
          <ringGeometry args={[displaySize * 1.35, displaySize * 2.2, 128]} />
          <meshBasicMaterial
            map={textures.ring}
            transparent
            opacity={0.65}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  );
}

export default function Planet3D({
  temperature,
  radius,
  planetName,
  className,
}: {
  temperature: number | null;
  radius: number | null;
  planetName?: string;
  className?: string;
}) {
  const name = planetName ?? `planet-${temperature}-${radius}`;

  return (
    <div className={className ?? "h-48 w-48"}>
      <Canvas
        camera={{ position: [0, 0, 4], fov: 45 }}
        gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.15} />
        <directionalLight position={[5, 2, 4]} intensity={2.0} color="#fff8f0" />
        <directionalLight position={[-3, -1, -2]} intensity={0.08} color="#4060a0" />
        <PlanetBody temperature={temperature} radius={radius} planetName={name} />
        <OrbitControls
          enableZoom
          enablePan={false}
          minDistance={2.2}
          maxDistance={8}
          rotateSpeed={0.5}
        />
      </Canvas>
    </div>
  );
}

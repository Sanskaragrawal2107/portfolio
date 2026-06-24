"use client";

import React, {
  useRef,
  useEffect,
  useState,
  useMemo,
  Suspense,
  useCallback,
} from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { useGLTF, useAnimations, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { gsap } from "gsap";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface OpeningSceneProps {
  onComplete: (section?: "about" | "skills" | "experience" | "projects") => void;
}

interface SceneContentProps {
  onComplete: (section?: "about" | "skills" | "experience" | "projects") => void;
  isBooting: boolean;
  bootProgress: number;
  activeSection: "skills" | "experience" | "achievements" | "about" | "none";
  setActiveSection: (sec: "skills" | "experience" | "achievements" | "about" | "none") => void;
  exploredWalls: Set<string>;
  setExploredWalls: React.Dispatch<React.SetStateAction<Set<string>>>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants & SVGs
// ─────────────────────────────────────────────────────────────────────────────

const TERMINAL_LINES = [
  "> Initializing Sanskar_AI...",
  "> Loading RAG pipeline............. ✓",
  "> Connecting LangGraph workflow..... ✓",
  "> Querying Supabase vector store.... ✓",
  "> GitHub MCP linked................ ✓",
  "> LeetCode MCP linked.............. ✓",
  "> Streaming API ready.............. ✓",
  "> System ready.",
] as const;

const BOOT_LINES = [
  "> Initializing Sanskar_AI...",
  "> Loading RAG pipeline............. \u2713",
  "> Connecting LangGraph workflow..... \u2713",
  "> Querying Supabase vector store.... \u2713",
  "> GitHub MCP linked................ \u2713",
  "> LeetCode MCP linked.............. \u2713",
  "> Streaming API ready.............. \u2713",
  "> System ready.",
] as const;

const NODES = [
  { label: "User Query", y: 80 },
  { label: "RAG Retrieval", y: 190 },
  { label: "LangGraph", y: 300 },
  { label: "LLM Call", y: 410 },
  { label: "Response", y: 520 },
] as const;

const METRICS = [
  "⚡ Hackathons: 3",
  "🚀 Projects: 3",
  "💻 LeetCode: Active",
] as const;

const SVGS = {
  python: (
    <svg width="18" height="18" viewBox="0 0 110 110" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M54.1 2.3c-23.7 0-22.3 10.3-22.3 10.3l2.3 10c0 0 1.2-4.5 10-4.5h20.6c8.8 0 10.3 7 10.3 10.3V49c0 8.8-7 10.3-10.3 10.3H33.8c-8.8 0-20.6-2.5-20.6-22.3V21.4H2.9v15.6c0 23.7 19.3 22.3 19.3 22.3h7.7v7.7c0 23.7 22.3 22.3 22.3 22.3h10.3c23.7 0 22.3-10.3 22.3-10.3l-2.3-10c0 0-1.2 4.5-10 4.5H52.2c-8.8 0-10.3-7-10.3-10.3V52.2c0-8.8 7-10.3 10.3-10.3h30.9c8.8 0 20.6 2.5 20.6 22.3v15.6h10.3V64.2c0-23.7-19.3-22.3-19.3-22.3h-7.7v-7.7C87 10.5 64.7 12 64.7 12l-10.6-9.7z" fill="currentColor" />
    </svg>
  ),
  react: (
    <svg width="18" height="18" viewBox="-11.5 -10.232 23 20.463" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="0" cy="0" r="2.05" fill="currentColor" />
      <g stroke="currentColor" strokeWidth="1" fill="none">
        <ellipse rx="11" ry="4.2" />
        <ellipse rx="11" ry="4.2" transform="rotate(60)" />
        <ellipse rx="11" ry="4.2" transform="rotate(120)" />
      </g>
    </svg>
  ),
  fastapi: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="none" />
    </svg>
  ),
  docker: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M13.9 8.2h2.2v2.2h-2.2V8.2zm-2.7 0h2.2v2.2h-2.2V8.2zm-2.7 0h2.2v2.2H8.5V8.2zm-2.8 0h2.2v2.2H5.7V8.2zm8.2-2.7h2.2v2.2h-2.2V5.5zm-2.7 0h2.2v2.2h-2.2V5.5zm-2.7 0h2.2v2.2H8.5V5.5zm5.4-2.8h2.2v2.2h-2.2V2.7zm-6.2 11h14.8c.4-1.2.2-2.5-.5-3.6-.8-1.2-2-1.9-3.4-1.9H3.4c-.4 1.2-.2 2.5.5 3.6.8 1.2 2 1.9 3.4 1.9z" fill="currentColor" />
    </svg>
  ),
  aws: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
    </svg>
  ),
  livekit: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
      <path d="M19 10v1a7 7 0 0 1-14 0v-1M12 19v4M8 23h8" />
    </svg>
  ),
  github: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
    </svg>
  ),
  generic: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  )
};

// ─────────────────────────────────────────────────────────────────────────────
// Loading fallback
// ─────────────────────────────────────────────────────────────────────────────

function LoadingDot() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#0a0a0a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 60,
      }}
    >
      <div className="loading-pulse-dot" />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Canvas Helpers & Textures
// ─────────────────────────────────────────────────────────────────────────────

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  if (typeof ctx.roundRect === "function") {
    ctx.roundRect(x, y, width, height, radius);
    return;
  }
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
}

function seededNoise(seed: number) {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

function useWoodTexture() {
  return useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#8b5a2b";
      ctx.fillRect(0, 0, 512, 512);
      ctx.strokeStyle = "#5c3a21";
      ctx.lineWidth = 2;
      for (let i = 0; i < 40; i++) {
        ctx.beginPath();
        const y = seededNoise(i + 11) * 512;
        ctx.moveTo(0, y);
        ctx.bezierCurveTo(
          128, y + (seededNoise(i + 101) - 0.5) * 30,
          384, y + (seededNoise(i + 201) - 0.5) * 30,
          512, y
        );
        ctx.stroke();
      }
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }, []);
}

function useFabricTexture() {
  return useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#333333";
      ctx.fillRect(0, 0, 128, 128);
      ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
      for (let i = 0; i < 1500; i++) {
        const x = seededNoise(i + 31) * 128;
        const y = seededNoise(i + 131) * 128;
        ctx.fillRect(x, y, 1, 1);
      }
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }, []);
}

function useFloorTexture() {
  return useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#9f7148";
      ctx.fillRect(0, 0, 1024, 1024);

      const plankH = 86;
      for (let y = 0; y < 1024; y += plankH) {
        const shade = y / plankH % 2 === 0 ? "#b68457" : "#946640";
        ctx.fillStyle = shade;
        ctx.fillRect(0, y, 1024, plankH - 3);
        ctx.strokeStyle = "rgba(75, 45, 24, 0.45)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, y + plankH - 3);
        ctx.lineTo(1024, y + plankH - 3);
        ctx.stroke();

        for (let x = -160; x < 1024; x += 260) {
          const joint = x + ((y / plankH) % 3) * 84;
          ctx.strokeStyle = "rgba(72, 41, 20, 0.32)";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(joint, y + 8);
          ctx.lineTo(joint, y + plankH - 12);
          ctx.stroke();
        }

        for (let i = 0; i < 14; i++) {
          const seed = y * 31 + i;
          const gy = y + 12 + seededNoise(seed + 17) * (plankH - 26);
          ctx.strokeStyle = `rgba(64, 35, 16, ${0.12 + seededNoise(seed + 18) * 0.16})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(0, gy);
          ctx.bezierCurveTo(
            240,
            gy + seededNoise(seed + 19) * 20 - 10,
            640,
            gy + seededNoise(seed + 20) * 26 - 13,
            1024,
            gy + seededNoise(seed + 21) * 18 - 9
          );
          ctx.stroke();
        }
      }
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(3.5, 3.5);
    return tex;
  }, []);
}

function useWallTexture() {
  return useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#e5dbc8";
      ctx.fillRect(0, 0, 512, 512);
      for (let i = 0; i < 9000; i++) {
        const alpha = 0.025 + seededNoise(i + 41) * 0.05;
        ctx.fillStyle = seededNoise(i + 42) > 0.5 ? `rgba(255,255,255,${alpha})` : `rgba(93,76,56,${alpha})`;
        ctx.fillRect(seededNoise(i + 43) * 512, seededNoise(i + 44) * 512, 1, 1);
      }
      ctx.strokeStyle = "rgba(130, 104, 70, 0.08)";
      ctx.lineWidth = 1;
      for (let y = 0; y < 512; y += 18) {
        ctx.beginPath();
        ctx.moveTo(0, y + seededNoise(y + 51) * 4);
        ctx.lineTo(512, y + seededNoise(y + 52) * 4);
        ctx.stroke();
      }
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(2, 1.4);
    return tex;
  }, []);
}

function useRugTexture() {
  return useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#b63f35";
      ctx.fillRect(0, 0, 512, 512);
      ctx.fillStyle = "#263f62";
      ctx.fillRect(28, 28, 456, 456);
      ctx.fillStyle = "#dfc58b";
      ctx.fillRect(56, 56, 400, 400);
      ctx.fillStyle = "#8b2730";
      ctx.fillRect(86, 86, 340, 340);
      ctx.strokeStyle = "rgba(255,255,255,0.28)";
      ctx.lineWidth = 5;
      for (let i = 0; i < 7; i++) {
        ctx.strokeRect(42 + i * 18, 42 + i * 18, 428 - i * 36, 428 - i * 36);
      }
      for (let i = 0; i < 1800; i++) {
        ctx.fillStyle = `rgba(255,255,255,${seededNoise(i + 61) * 0.05})`;
        ctx.fillRect(seededNoise(i + 62) * 512, seededNoise(i + 63) * 512, 1, 2);
      }
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1.4, 1);
    return tex;
  }, []);
}

// Simple canvas-based screen — shows a nice tech display when idle, and boot logs when booting
function useScreenTexture(isBooting: boolean, _bootProgress: number) {
  const cursorVisible = useRef(true);
  const lastCursorBlink = useRef(0);
  const bootStartTime = useRef<number | null>(null);

  const screen = useMemo(() => {
    if (typeof document === "undefined") {
      return { canvas: null as unknown as HTMLCanvasElement, texture: null as unknown as THREE.CanvasTexture };
    }
    const c = document.createElement("canvas");
    c.width = 1024;
    c.height = 640;
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.minFilter = THREE.LinearFilter;
    t.magFilter = THREE.LinearFilter;
    return { canvas: c, texture: t };
  }, []);

  const { canvas, texture } = screen;

  const update = useCallback((elapsed: number) => {
    if (!canvas || !texture) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (isBooting) {
      if (bootStartTime.current === null) {
        bootStartTime.current = elapsed;
      }

      const bootElapsed = elapsed - bootStartTime.current;
      const progress = Math.min(100, Math.floor((bootElapsed / 2.0) * 100));

      // Dark console background
      ctx.fillStyle = "#020408";
      ctx.fillRect(0, 0, 1024, 640);

      // Subtle green scanlines
      ctx.fillStyle = "rgba(0, 242, 254, 0.02)";
      for (let y = 0; y < 640; y += 4) {
        ctx.fillRect(0, y, 1024, 2);
      }

      // Top Header
      ctx.fillStyle = "#00f2fe";
      ctx.font = "bold 20px 'Courier New', monospace";
      ctx.textAlign = "left";
      ctx.fillText("SANSKAR_AI BOOT SEQUENCE v1.0.4", 50, 60);

      ctx.strokeStyle = "rgba(0, 242, 254, 0.25)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(50, 80);
      ctx.lineTo(974, 80);
      ctx.stroke();

      const lines = [
        "> Initializing Sanskar_AI...",
        "> Loading RAG pipeline............. ✓",
        "> Connecting MCP servers........... ✓",
        "> GitHub linked.................... ✓",
        "> LeetCode linked.................. ✓",
        "> Ready.",
      ];

      const timings = [
        { start: 0.0, end: 0.3 },
        { start: 0.3, end: 0.7 },
        { start: 0.7, end: 1.1 },
        { start: 1.1, end: 1.4 },
        { start: 1.4, end: 1.7 },
        { start: 1.7, end: 2.0 },
      ];

      ctx.font = "24px 'Courier New', monospace";

      timings.forEach((timing, index) => {
        if (bootElapsed >= timing.start) {
          const line = lines[index];
          const duration = timing.end - timing.start;
          const pct = Math.min(1, (bootElapsed - timing.start) / duration);
          const chars = Math.floor(pct * line.length);
          const currentLine = line.slice(0, chars);

          if (currentLine.includes("✓")) {
            ctx.fillStyle = "#ffffff";
            const textWithoutTick = currentLine.replace("✓", "");
            ctx.fillText(textWithoutTick, 50, 140 + index * 50);
            ctx.fillStyle = "#10b981";
            ctx.fillText("✓", 50 + ctx.measureText(textWithoutTick).width, 140 + index * 50);
          } else if (currentLine.includes("Ready.")) {
            ctx.fillStyle = "#00f2fe";
            ctx.fillText(currentLine, 50, 140 + index * 50);
          } else {
            ctx.fillStyle = "#ffffff";
            ctx.fillText(currentLine, 50, 140 + index * 50);
          }
        }
      });

      // Blinking block cursor after the last active line
      let lastLineIdx = timings.findIndex(t => bootElapsed < t.end);
      if (lastLineIdx === -1) lastLineIdx = lines.length - 1;
      const currentTiming = timings[lastLineIdx];
      const currentLineText = lines[lastLineIdx];
      const currentPct = Math.min(1, (bootElapsed - currentTiming.start) / (currentTiming.end - currentTiming.start));
      const currentChars = Math.floor(currentPct * currentLineText.length);
      const activeTextWidth = ctx.measureText(currentLineText.slice(0, currentChars)).width;

      const blink = Math.floor(bootElapsed * 4) % 2 === 0;
      if (blink) {
        ctx.fillStyle = "#00f2fe";
        ctx.fillRect(55 + activeTextWidth, 140 + lastLineIdx * 50 - 20, 12, 24);
      }

      // Progress bar container
      const barY = 500;
      ctx.fillStyle = "rgba(0, 242, 254, 0.05)";
      ctx.fillRect(50, barY, 924, 32);
      ctx.strokeStyle = "rgba(0, 242, 254, 0.3)";
      ctx.lineWidth = 1;
      ctx.strokeRect(50, barY, 924, 32);

      // Gradient progress fill
      const grad = ctx.createLinearGradient(50, 0, 974, 0);
      grad.addColorStop(0, "#00f2fe");
      grad.addColorStop(1, "#10b981");
      ctx.fillStyle = grad;
      ctx.fillRect(54, barY + 4, Math.max(0, (916 * progress) / 100), 24);

      // Percentage Text overlay
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 16px 'Courier New', monospace";
      ctx.textAlign = "center";
      ctx.fillText(`${progress}% INITIALIZED`, 512, barY + 22);

      texture.needsUpdate = true;
      return;
    }

    // Reset boot state when inactive
    bootStartTime.current = null;

    const now = elapsed * 1000;
    if (now - lastCursorBlink.current > 500) {
      cursorVisible.current = !cursorVisible.current;
      lastCursorBlink.current = now;
    }

    // Dark background
    ctx.fillStyle = "#0a0d14";
    ctx.fillRect(0, 0, 1024, 640);

    // Subtle cyber grid
    ctx.strokeStyle = "rgba(0, 242, 254, 0.06)";
    ctx.lineWidth = 1;
    for (let x = 0; x < 1024; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 640); ctx.stroke();
    }
    for (let y = 0; y < 640; y += 40) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1024, y); ctx.stroke();
    }

    // Corner brackets
    ctx.strokeStyle = "rgba(0, 242, 254, 0.35)";
    ctx.lineWidth = 2;
    const brk = 40;
    [[80, 80], [944, 80], [80, 560], [944, 560]].forEach(([bx, by]) => {
      const dx = bx > 512 ? -1 : 1;
      const dy = by > 320 ? -1 : 1;
      ctx.beginPath();
      ctx.moveTo(bx, by + dy * brk); ctx.lineTo(bx, by); ctx.lineTo(bx + dx * brk, by);
      ctx.stroke();
    });

    // Main glowing title
    ctx.save();
    ctx.shadowColor = "#00f2fe";
    ctx.shadowBlur = 20;
    ctx.fillStyle = "#00f2fe";
    ctx.font = "bold 52px 'Inter', monospace";
    ctx.textAlign = "center";
    ctx.fillText("SANSKAR.DEV", 512, 280);
    ctx.restore();

    // Subtitle
    ctx.fillStyle = "rgba(255,255,255,0.45)";
    ctx.font = "18px 'Inter', monospace";
    ctx.textAlign = "center";
    ctx.fillText("AI ENGINEER  //  FULL STACK DEVELOPER", 512, 325);

    // Pulsing status indicator
    const pulse = 0.5 + 0.5 * Math.sin(elapsed * 2.2);
    ctx.save();
    ctx.globalAlpha = 0.6 + 0.4 * pulse;
    ctx.fillStyle = "#10b981";
    ctx.shadowColor = "#10b981";
    ctx.shadowBlur = 8 * pulse;
    ctx.font = "14px 'Inter', monospace";
    ctx.fillText("● SYSTEM ONLINE", 512, 375);
    ctx.restore();

    // Blinking cursor
    if (cursorVisible.current) {
      ctx.fillStyle = "#00f2fe";
      ctx.fillRect(492, 408, 8, 18);
    }

    texture.needsUpdate = true;
  }, [canvas, texture, isBooting]);

  return { texture: texture || new THREE.Texture(), update };
}

// ─────────────────────────────────────────────────────────────────────────────
// Inner 3D Scene
// ─────────────────────────────────────────────────────────────────────────────

function RoomShell({ activeSection }: { activeSection: string }) {
  const floorTexture = useFloorTexture();
  const wallTexture = useWallTexture();
  const rugTexture = useRugTexture();
  const woodTexture = useWoodTexture();
  const fabricTexture = useFabricTexture();

  const showDecorations = false;

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.035, 0]} receiveShadow>
        <planeGeometry args={[9.2, 8.6]} />
        <meshStandardMaterial map={floorTexture} roughness={0.72} metalness={0.02} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.1, -0.022, -0.15]} receiveShadow>
        <planeGeometry args={[3.7, 2.7]} />
        <meshStandardMaterial map={rugTexture} roughness={0.88} />
      </mesh>

      {/* Custom HTML walls will be rendered in SceneContent instead of static plaster planes */}
      {/*
      <mesh position={[0, 2, 3.85]} receiveShadow>
        <planeGeometry args={[9.2, 4.1]} />
        <meshStandardMaterial map={wallTexture} color="#f0e7d5" roughness={0.92} />
      </mesh>
      <mesh position={[4.6, 2, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[8.6, 4.1]} />
        <meshStandardMaterial map={wallTexture} color="#eadfc9" roughness={0.92} />
      </mesh>
      <mesh position={[-4.6, 2, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[8.6, 4.1]} />
        <meshStandardMaterial map={wallTexture} color="#eadfc9" roughness={0.92} />
      </mesh>
      <mesh position={[0, 2, -3.55]} rotation={[0, Math.PI, 0]} receiveShadow>
        <planeGeometry args={[9.2, 4.1]} />
        <meshStandardMaterial map={wallTexture} color="#efe2cd" roughness={0.92} />
      </mesh>
      */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 4.03, 0]} receiveShadow>
        <planeGeometry args={[9.2, 8.6]} />
        <meshStandardMaterial color="#f7efe0" roughness={0.96} />
      </mesh>

      {[
        { position: [0, 0.08, 3.79], scale: [9.2, 0.12, 0.1] },
        { position: [0, 3.95, 3.79], scale: [9.2, 0.08, 0.08] },
        { position: [4.54, 0.08, 0], scale: [0.1, 0.12, 8.6] },
        { position: [-4.54, 0.08, 0], scale: [0.1, 0.12, 8.6] },
        { position: [0, 0.08, -3.49], scale: [9.2, 0.12, 0.1] },
      ].map((trim, index) => (
        <mesh key={index} position={trim.position as [number, number, number]} castShadow receiveShadow>
          <boxGeometry args={trim.scale as [number, number, number]} />
          <meshStandardMaterial map={woodTexture} color="#7f5736" roughness={0.68} />
        </mesh>
      ))}

      <group position={[2.85, 2.25, 3.73]} visible={showDecorations}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.9, 0.1, 0.18]} />
          <meshStandardMaterial map={woodTexture} color="#6d452c" roughness={0.62} />
        </mesh>
        <mesh position={[-0.78, -0.27, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.24, 0.45, 0.22]} />
          <meshStandardMaterial color="#d8b15e" roughness={0.6} />
        </mesh>
        <mesh position={[-0.35, -0.22, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.42, 0.32, 0.2]} />
          <meshStandardMaterial color="#2f5d46" roughness={0.7} />
        </mesh>
        <mesh position={[0.2, -0.18, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.36, 0.24, 0.2]} />
          <meshStandardMaterial color="#7d2f2b" roughness={0.72} />
        </mesh>
        <mesh position={[0.74, -0.25, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.13, 0.11, 0.38, 24]} />
          <meshStandardMaterial color="#c6b39a" roughness={0.7} />
        </mesh>
      </group>

      <group position={[-3.1, 2.25, 3.72]} visible={showDecorations}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.55, 0.1, 0.18]} />
          <meshStandardMaterial map={woodTexture} color="#6d452c" roughness={0.62} />
        </mesh>
        <mesh position={[-0.52, -0.2, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.28, 0.3, 0.18]} />
          <meshStandardMaterial color="#315d83" roughness={0.67} />
        </mesh>
        <mesh position={[-0.16, -0.17, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.24, 0.24, 0.18]} />
          <meshStandardMaterial color="#d2a64e" roughness={0.67} />
        </mesh>
        <mesh position={[0.32, -0.22, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.16, 0.16, 0.28, 32]} />
          <meshStandardMaterial color="#284233" roughness={0.78} />
        </mesh>
      </group>

      <group position={[2.1, 0.01, 1.45]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.19, 0.14, 0.62, 28]} />
          <meshStandardMaterial color="#b67c49" roughness={0.78} />
        </mesh>
        <mesh position={[0, 0.42, 0]} castShadow>
          <sphereGeometry args={[0.34, 24, 16]} />
          <meshStandardMaterial map={fabricTexture} color="#2f7b4e" roughness={0.86} />
        </mesh>
        <mesh position={[0.22, 0.54, 0.05]} rotation={[0.4, 0.2, -0.7]} castShadow>
          <sphereGeometry args={[0.18, 18, 12]} />
          <meshStandardMaterial color="#3f9a61" roughness={0.86} />
        </mesh>
      </group>

      <mesh position={[-1.25, 1.74, 3.74]} castShadow receiveShadow visible={showDecorations}>
        <boxGeometry args={[1.05, 0.72, 0.06]} />
        <meshStandardMaterial color="#4b3429" roughness={0.66} />
      </mesh>
      <mesh position={[-1.25, 1.74, 3.705]} receiveShadow visible={showDecorations}>
        <planeGeometry args={[0.9, 0.58]} />
        <meshStandardMaterial color="#d9965b" roughness={0.82} />
      </mesh>
      <mesh position={[-1.25, 1.74, 3.701]} receiveShadow visible={showDecorations}>
        <circleGeometry args={[0.19, 32]} />
        <meshStandardMaterial color="#f4cf80" roughness={0.82} />
      </mesh>

      <pointLight position={[0, 3.45, 0.2]} color="#fff0d0" intensity={0.9} distance={8} castShadow />
      <mesh position={[0, 3.92, 0.2]} castShadow>
        <cylinderGeometry args={[0.55, 0.7, 0.18, 48]} />
        <meshStandardMaterial color="#fff4d6" emissive="#fff2c0" emissiveIntensity={0.35} roughness={0.45} />
      </mesh>
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Dynamic WallScreens (2D Canvas Textured Planes in 3D WebGL space)
// ─────────────────────────────────────────────────────────────────────────────

let aboutImage: HTMLImageElement | null = null;
let aboutImageLoaded = false;

function loadAboutImage(onLoad: () => void) {
  if (typeof window === "undefined") return;
  if (aboutImage) {
    if (aboutImageLoaded) onLoad();
    return;
  }
  aboutImage = new Image();
  aboutImage.src = "/photo.png";
  aboutImage.onload = () => {
    aboutImageLoaded = true;
    onLoad();
  };
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
): number {
  const words = text.split(" ");
  let line = "";
  let currentY = y;
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + " ";
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line, x, currentY);
      line = words[n] + " ";
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, currentY);
  return currentY + lineHeight;
}

function drawNeoBrutalistBg(ctx: CanvasRenderingContext2D, width: number, height: number) {
  // Cream background
  ctx.fillStyle = "#FFFDF5";
  ctx.fillRect(0, 0, width, height);

  // Halftone pattern (radial dots)
  ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
  const spacing = 22;
  for (let x = 0; x < width; x += spacing) {
    for (let y = 0; y < height; y += spacing) {
      ctx.beginPath();
      ctx.arc(x, y, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawActionButtons(ctx: CanvasRenderingContext2D) {
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "bold 32px 'Space Grotesk', -apple-system, sans-serif";

  // Back Button - Yellow
  ctx.fillStyle = "#FFD93D";
  ctx.shadowColor = "#000000";
  ctx.shadowOffsetX = 8;
  ctx.shadowOffsetY = 8;
  ctx.shadowBlur = 0;
  ctx.fillRect(1400, 900, 280, 80);

  ctx.shadowColor = "transparent";
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 4;
  ctx.strokeRect(1400, 900, 280, 80);

  ctx.fillStyle = "#000000";
  ctx.fillText("BACK", 1540, 940);

  // Enter Button - Hot Red
  ctx.fillStyle = "#FF6B6B";
  ctx.shadowColor = "#000000";
  ctx.shadowOffsetX = 8;
  ctx.shadowOffsetY = 8;
  ctx.shadowBlur = 0;
  ctx.fillRect(1720, 900, 280, 80);

  ctx.shadowColor = "transparent";
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 4;
  ctx.strokeRect(1720, 900, 280, 80);

  ctx.fillStyle = "#000000";
  ctx.fillText("ENTER", 1860, 940);

  ctx.restore();
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared TV-static screen drawn on unexplored walls
// ─────────────────────────────────────────────────────────────────────────────
function drawTVStatic(canvas: HTMLCanvasElement, label: string, seed: number) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const W = canvas.width;
  const H = canvas.height;

  // Pure black base
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, W, H);

  // TV noise — bright white/grey pixels of varying intensity
  for (let g = 0; g < 18000; g++) {
    const nx = seededNoise(g + seed) * W;
    const ny = seededNoise(g + seed + 7000) * H;
    const brightness = Math.floor(seededNoise(g + seed + 14000) * 255);
    const a = 0.25 + seededNoise(g + seed + 21000) * 0.65;
    ctx.fillStyle = `rgba(${brightness},${brightness},${brightness},${a})`;
    ctx.fillRect(nx, ny, seededNoise(g + seed + 28000) * 4 + 1, seededNoise(g + seed + 35000) * 2 + 1);
  }

  // CRT scanlines (dark bands every 5px)
  for (let sy = 0; sy < H; sy += 5) {
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.fillRect(0, sy, W, 2);
  }

  // Horizontal glitch bars (2 random static bars)
  const bar1Y = seededNoise(seed + 100) * (H - 80);
  const bar2Y = seededNoise(seed + 200) * (H - 80);
  ctx.fillStyle = "rgba(255,255,255,0.08)";
  ctx.fillRect(0, bar1Y, W, 22);
  ctx.fillStyle = "rgba(255,255,255,0.05)";
  ctx.fillRect(0, bar2Y, W, 10);

  // Vertical vignette
  const vign = ctx.createLinearGradient(0, 0, 0, H);
  vign.addColorStop(0, "rgba(0,0,0,0.55)");
  vign.addColorStop(0.15, "rgba(0,0,0,0)");
  vign.addColorStop(0.85, "rgba(0,0,0,0)");
  vign.addColorStop(1, "rgba(0,0,0,0.55)");
  ctx.fillStyle = vign;
  ctx.fillRect(0, 0, W, H);

  // Glow behind text
  const cx = W / 2;
  const cy = H / 2;
  const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 420);
  glow.addColorStop(0, "rgba(255,255,255,0.18)");
  glow.addColorStop(0.5, "rgba(255,255,255,0.06)");
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // Section label
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.font = "bold 96px 'Segoe UI', sans-serif";
  ctx.fillText(label, cx, cy - 36);

  // Blinking "click to reveal" hint (static — blink is driven by emissive flicker)
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.font = "38px 'Segoe UI', sans-serif";
  ctx.fillText("▶  click to reveal", cx, cy + 60);

  ctx.textAlign = "left";
  ctx.textBaseline = "top";
}

function drawAboutMeCanvas(canvas: HTMLCanvasElement, isActive: boolean, isExplored: boolean, onNeedsUpdate?: () => void) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Show TV static until the user explores this wall
  if (!isExplored && !isActive) {
    drawTVStatic(canvas, "EXPLORE ABOUT ME", 1000);
    return;
  }

  // Clear & Draw Neo-Brutalist background
  drawNeoBrutalistBg(ctx, canvas.width, canvas.height);

  ctx.textAlign = "left";
  ctx.textBaseline = "top";

  // Name (Massive, uppercase)
  ctx.fillStyle = "#000000";
  ctx.font = "900 110px 'Space Grotesk', sans-serif";
  ctx.fillText("SANSKAR AGRAWAL", 100, 100);

  // Subtitle (Violet badge)
  ctx.fillStyle = "#C4B5FD";
  ctx.shadowColor = "#000000";
  ctx.shadowOffsetX = 6;
  ctx.shadowOffsetY = 6;
  ctx.shadowBlur = 0;
  ctx.fillRect(100, 240, 500, 70);
  ctx.shadowColor = "transparent";
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 4;
  ctx.strokeRect(100, 240, 500, 70);

  ctx.fillStyle = "#000000";
  ctx.font = "bold 40px 'Space Grotesk', sans-serif";
  ctx.fillText("SOFTWARE ENGINEER", 140, 252);

  // Paragraphs
  ctx.fillStyle = "#000000";
  ctx.font = "bold 32px 'Space Grotesk', sans-serif";
  const p1 = "Passionate about building functional, high-quality software systems. Exploring the intersection of web development and AI.";
  const p2 = "I specialize in designing highly interactive, responsive, and aesthetically premium 3D graphics interfaces and robust AI-assisted developer tools. I am continuously exploring vector search databases, retrieval augmented generation systems, and custom LLM agent pipelines to automate candidate screening and workflow processes. Let's connect and build the future!";

  let nextY = wrapText(ctx, p1, 100, 370, 1300, 48);
  wrapText(ctx, p2, 100, nextY + 40, 1300, 48);

  // Meta info badge
  ctx.fillStyle = "#FFD93D";
  ctx.shadowColor = "#000000";
  ctx.shadowOffsetX = 6;
  ctx.shadowOffsetY = 6;
  ctx.shadowBlur = 0;
  ctx.fillRect(100, 800, 940, 60);
  ctx.shadowColor = "transparent";
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 4;
  ctx.strokeRect(100, 800, 940, 60);

  ctx.fillStyle = "#000000";
  ctx.font = "bold 28px 'Space Grotesk', sans-serif";
  ctx.fillText("📍 INDORE, INDIA   |   🎓 ACROPOLIS INSTITUTE OF TECHNOLOGY", 130, 812);

  // Photo Sticker
  ctx.save();
  ctx.translate(1700, 380);
  ctx.rotate(0.04); // Slight brutalist rotation

  // White card backing
  ctx.fillStyle = "#ffffff";
  ctx.shadowColor = "#000000";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 16;
  ctx.shadowOffsetY = 16;
  ctx.fillRect(-220, -220, 440, 440);

  ctx.shadowColor = "transparent"; // Reset shadow
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 6;
  ctx.strokeRect(-220, -220, 440, 440);

  // Image load & draw
  if (aboutImageLoaded && aboutImage) {
    ctx.drawImage(aboutImage, -200, -200, 400, 400);
  } else {
    // Show placeholder, load image
    ctx.fillStyle = "#FF6B6B";
    ctx.fillRect(-200, -200, 400, 400);
    ctx.fillStyle = "#000000";
    ctx.font = "bold 40px 'Space Grotesk', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("LOADING...", 0, 0);
    ctx.textAlign = "left";
    ctx.textBaseline = "top";

    loadAboutImage(() => {
      if (onNeedsUpdate) onNeedsUpdate();
    });
  }
  ctx.restore();

  // Draw Buttons if Active
  if (isActive) {
    drawActionButtons(ctx);
  }
}

function drawSkillLogo(ctx: CanvasRenderingContext2D, label: string, cx: number, cy: number) {
  ctx.save();
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = "#000000";

  if (label === "React") {
    ctx.translate(cx, cy);
    ctx.strokeStyle = "#00D5FF";
    ctx.lineWidth = 4;
    for (const angle of [0, Math.PI / 3, -Math.PI / 3]) {
      ctx.save();
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.ellipse(0, 0, 26, 9, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
    ctx.fillStyle = "#00D5FF";
    ctx.beginPath();
    ctx.arc(0, 0, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  else if (label === "TypeScript") {
    ctx.fillStyle = "#3178C6";
    ctx.fillRect(cx - 28, cy - 28, 56, 56);
    ctx.strokeRect(cx - 28, cy - 28, 56, 56);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 26px 'Space Grotesk', sans-serif";
    ctx.textAlign = "right";
    ctx.textBaseline = "bottom";
    ctx.fillText("TS", cx + 24, cy + 24);
  }
  else if (label === "Python") {
    // Blue snake
    ctx.fillStyle = "#3776AB";
    ctx.beginPath();
    ctx.arc(cx - 6, cy - 6, 11, Math.PI, Math.PI * 1.5);
    ctx.lineTo(cx + 6, cy - 17);
    ctx.arc(cx + 6, cy - 6, 11, Math.PI * 1.5, 0);
    ctx.lineTo(cx + 17, cy - 6);
    ctx.arc(cx + 6, cy + 5, 11, 0, Math.PI * 0.5);
    ctx.lineTo(cx - 6, cy + 16);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Yellow snake
    ctx.fillStyle = "#FFE873";
    ctx.beginPath();
    ctx.arc(cx + 6, cy + 6, 11, 0, Math.PI * 0.5);
    ctx.lineTo(cx - 6, cy + 17);
    ctx.arc(cx - 6, cy + 6, 11, Math.PI * 0.5, Math.PI);
    ctx.lineTo(cx - 17, cy + 6);
    ctx.arc(cx - 6, cy - 5, 11, Math.PI, Math.PI * 1.5);
    ctx.lineTo(cx + 6, cy - 16);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Eyes
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(cx - 3, cy - 11, 2, 0, Math.PI * 2);
    ctx.arc(cx + 3, cy + 11, 2, 0, Math.PI * 2);
    ctx.fill();
  }
  else if (label === "FastAPI") {
    ctx.fillStyle = "#009688";
    ctx.beginPath();
    ctx.arc(cx, cy, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#00E5FF";
    ctx.beginPath();
    ctx.moveTo(cx - 4, cy - 16);
    ctx.lineTo(cx + 12, cy - 4);
    ctx.lineTo(cx + 2, cy - 2);
    ctx.lineTo(cx + 10, cy + 16);
    ctx.lineTo(cx - 8, cy + 4);
    ctx.lineTo(cx - 2, cy + 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
  else if (label === "Next.js") {
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.arc(cx, cy, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(cx - 10, cy + 13);
    ctx.lineTo(cx - 10, cy - 13);
    ctx.lineTo(cx + 10, cy + 13);
    ctx.lineTo(cx + 10, cy - 13);
    ctx.stroke();
  }
  else if (label === "LangChain") {
    ctx.fillStyle = "#FFD93D";
    ctx.beginPath();
    ctx.arc(cx - 3, cy, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Beak
    ctx.fillStyle = "#FF6B6B";
    ctx.beginPath();
    ctx.moveTo(cx + 6, cy - 6);
    ctx.lineTo(cx + 22, cy + 3);
    ctx.lineTo(cx + 6, cy + 10);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Eye
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.arc(cx - 3, cy - 5, 3, 0, Math.PI * 2);
    ctx.fill();
    // Green wing
    ctx.fillStyle = "#3ECF8E";
    ctx.beginPath();
    ctx.ellipse(cx - 14, cy + 5, 9, 15, Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  else if (label === "LangGraph") {
    const nodes = [
      { x: cx, y: cy - 14 },
      { x: cx - 14, y: cy + 11 },
      { x: cx + 14, y: cy + 11 },
    ];
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(nodes[0].x, nodes[0].y);
    ctx.lineTo(nodes[1].x, nodes[1].y);
    ctx.lineTo(nodes[2].x, nodes[2].y);
    ctx.lineTo(nodes[0].x, nodes[0].y);
    ctx.stroke();

    const colors = ["#FF6B6B", "#C4B5FD", "#FFD93D"];
    for (let k = 0; k < 3; k++) {
      ctx.fillStyle = colors[k];
      ctx.beginPath();
      ctx.arc(nodes[k].x, nodes[k].y, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  }
  else if (label === "PostgreSQL") {
    ctx.fillStyle = "#336791";
    ctx.beginPath();
    ctx.arc(cx - 12, cy - 3, 14, 0, Math.PI * 2);
    ctx.arc(cx + 12, cy - 3, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy + 3, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(cx - 5, cy, 2.5, 0, Math.PI * 2);
    ctx.arc(cx + 5, cy, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }
  else if (label === "Supabase") {
    ctx.fillStyle = "#3ECF8E";
    ctx.beginPath();
    ctx.moveTo(cx - 11, cy - 18);
    ctx.lineTo(cx + 11, cy - 18);
    ctx.lineTo(cx - 4, cy - 2);
    ctx.lineTo(cx + 11, cy - 2);
    ctx.lineTo(cx - 11, cy + 20);
    ctx.lineTo(cx + 4, cy + 2);
    ctx.lineTo(cx - 11, cy + 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
  else if (label === "Docker") {
    ctx.fillStyle = "#2496ED";
    ctx.fillRect(cx - 18, cy - 5, 12, 12);
    ctx.strokeRect(cx - 18, cy - 5, 12, 12);
    ctx.fillRect(cx - 3, cy - 5, 12, 12);
    ctx.strokeRect(cx - 3, cy - 5, 12, 12);
    ctx.fillRect(cx + 12, cy - 5, 12, 12);
    ctx.strokeRect(cx + 12, cy - 5, 12, 12);

    ctx.fillRect(cx - 10, cy - 20, 12, 12);
    ctx.strokeRect(cx - 10, cy - 20, 12, 12);
    ctx.fillRect(cx + 5, cy - 20, 12, 12);
    ctx.strokeRect(cx + 5, cy - 20, 12, 12);
  }
  else if (label === "AWS") {
    ctx.fillStyle = "#FF9900";
    ctx.beginPath();
    ctx.arc(cx, cy, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, 12, Math.PI * 0.25, Math.PI * 0.75);
    ctx.stroke();
  }
  else if (label === "GitHub") {
    ctx.fillStyle = "#181717";
    ctx.beginPath();
    ctx.arc(cx, cy + 3, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - 14, cy - 8);
    ctx.lineTo(cx - 14, cy - 18);
    ctx.lineTo(cx - 5, cy - 11);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cx + 14, cy - 8);
    ctx.lineTo(cx + 14, cy - 18);
    ctx.lineTo(cx + 5, cy - 11);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  ctx.restore();
}

function drawSkillsCanvas(canvas: HTMLCanvasElement, isActive: boolean, isExplored: boolean) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Show TV static until the user explores this wall
  if (!isExplored && !isActive) {
    drawTVStatic(canvas, "EXPLORE SKILLS", 2000);
    return;
  }

  // Draw dark cyber-grid background
  ctx.fillStyle = "#0a0f1d";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw cybernetic grid lines
  ctx.strokeStyle = "rgba(0, 242, 254, 0.08)";
  ctx.lineWidth = 2;
  const gridSpacing = 40;
  for (let x = 0; x < canvas.width; x += gridSpacing) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y < canvas.height; y += gridSpacing) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  // Diagonal accent corner lines
  ctx.strokeStyle = "rgba(0, 242, 254, 0.2)";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(0, 0); ctx.lineTo(100, 0);
  ctx.moveTo(0, 0); ctx.lineTo(0, 100);
  ctx.moveTo(canvas.width, 0); ctx.lineTo(canvas.width - 100, 0);
  ctx.moveTo(canvas.width, 0); ctx.lineTo(canvas.width, 100);
  ctx.moveTo(0, canvas.height); ctx.lineTo(100, canvas.height);
  ctx.moveTo(0, canvas.height); ctx.lineTo(0, canvas.height - 100);
  ctx.moveTo(canvas.width, canvas.height); ctx.lineTo(canvas.width - 100, canvas.height);
  ctx.moveTo(canvas.width, canvas.height); ctx.lineTo(canvas.width, canvas.height - 100);
  ctx.stroke();

  // Draw Header Badge (High contrast Cyberpunk style)
  ctx.save();
  ctx.shadowColor = "#00f2fe";
  ctx.shadowBlur = 15;
  ctx.fillStyle = "#00f2fe";
  ctx.fillRect(100 + 10, 100 + 10, 520, 90);
  
  ctx.shadowBlur = 0;
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 5;
  ctx.strokeRect(100 + 10, 100 + 10, 520, 90);

  ctx.fillStyle = "#1e293b";
  ctx.fillRect(100, 100, 520, 90);
  ctx.strokeRect(100, 100, 520, 90);

  ctx.fillStyle = "#00f2fe";
  ctx.font = "900 44px 'Space Grotesk', sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText("SYSTEM CAPABILITIES", 130, 145);
  ctx.restore();

  // Status Indicator
  ctx.save();
  ctx.fillStyle = "#10b981";
  ctx.beginPath();
  ctx.arc(690, 145, 10, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.fillStyle = "#10b981";
  ctx.shadowColor = "#10b981";
  ctx.shadowBlur = 10;
  ctx.font = "bold 20px 'Space Grotesk', sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText("ONLINE // DIRECTORY LOADED", 715, 145);
  ctx.restore();

  // Grid setup
  const skills = [
    { label: "Python", category: "LANGUAGE", color: "#3776AB", glow: "#3776AB" },
    { label: "FastAPI", category: "BACKEND", color: "#009688", glow: "#00e5ff" },
    { label: "React", category: "FRONTEND", color: "#61DAFB", glow: "#00d5ff" },
    { label: "Next.js", category: "FRONTEND", color: "#000000", glow: "#ffffff" },
    { label: "TypeScript", category: "LANGUAGE", color: "#3178C6", glow: "#3178C6" },
    { label: "LangChain", category: "AI / AGENT", color: "#FFD93D", glow: "#ffd93d" },
    { label: "LangGraph", category: "AI / AGENT", color: "#EF4444", glow: "#ef4444" },
    { label: "PostgreSQL", category: "DATABASE", color: "#336791", glow: "#336791" },
    { label: "Supabase", category: "DATABASE", color: "#3ECF8E", glow: "#3ecf8e" },
    { label: "Docker", category: "DEVOPS", color: "#2496ED", glow: "#2496ed" },
    { label: "AWS", category: "CLOUD", color: "#FF9900", glow: "#ff9900" },
    { label: "GitHub", category: "DEV TOOLS", color: "#181717", glow: "#a855f7" },
  ];

  const cols = 4;
  const tileWidth = 420;
  const tileHeight = 160;
  const gapX = 60;
  const gapY = 50;
  const startX = 100;
  const startY = 260;

  for (let i = 0; i < skills.length; i++) {
    const skill = skills[i];
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = startX + col * (tileWidth + gapX);
    const y = startY + row * (tileHeight + gapY);

    // Draw stacked visual shadow card in neon color
    ctx.save();
    ctx.fillStyle = skill.glow;
    ctx.shadowColor = skill.glow;
    ctx.shadowBlur = 10;
    ctx.fillRect(x + 8, y + 8, tileWidth, tileHeight);
    
    // Main Card
    ctx.shadowBlur = 0; // reset shadow
    ctx.fillStyle = "#0f172a";
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 4;
    ctx.fillRect(x, y, tileWidth, tileHeight);
    ctx.strokeRect(x, y, tileWidth, tileHeight);

    // Card border accent line
    ctx.fillStyle = skill.glow;
    ctx.fillRect(x, y, 6, tileHeight);

    // Circle emblem frame for the logo
    ctx.fillStyle = "#1e293b";
    ctx.beginPath();
    ctx.arc(x + 65, y + 80, 42, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = skill.glow;
    ctx.stroke();

    // Draw the custom logo
    drawSkillLogo(ctx, skill.label, x + 65, y + 80);

    // Text details
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "900 34px 'Space Grotesk', sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(skill.label.toUpperCase(), x + 130, y + 32);

    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    ctx.font = "bold 20px 'Space Grotesk', sans-serif";
    ctx.fillText(`[ ${skill.category} ]`, x + 130, y + 82);

    // Mini status bar indicator
    ctx.fillStyle = "rgba(255,255,255,0.1)";
    ctx.fillRect(x + 130, y + 115, 240, 8);
    ctx.fillStyle = skill.glow;
    ctx.fillRect(x + 130, y + 115, 240 * 0.85, 8); // 85% full progress indicator

    ctx.restore();
  }

  if (isActive) {
    drawActionButtons(ctx);
  }
}

function drawProjectsCanvas(canvas: HTMLCanvasElement, isActive: boolean, isExplored: boolean) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Show TV static until the user explores this wall
  if (!isExplored && !isActive) {
    drawTVStatic(canvas, "EXPLORE PROJECTS", 3000);
    return;
  }

  drawNeoBrutalistBg(ctx, canvas.width, canvas.height);

  // Big Header
  ctx.fillStyle = "#C4B5FD";
  ctx.shadowColor = "#000000";
  ctx.shadowOffsetX = 8;
  ctx.shadowOffsetY = 8;
  ctx.shadowBlur = 0;
  ctx.fillRect(100, 100, 360, 100);
  ctx.shadowColor = "transparent";
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 4;
  ctx.strokeRect(100, 100, 360, 100);

  ctx.fillStyle = "#000000";
  ctx.font = "900 64px 'Space Grotesk', sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText("PROJECTS", 130, 115);

  // Draw 3 brutalist cards
  const projects = [
    { title: "HIRE A HUMAN", desc: "Autonomous AI Agent for candidate screening.", x: 400, y: 500, rot: -0.04, color: "#FF6B6B" },
    { title: "D2C ASSISTANT", desc: "AI agent tracking e-commerce sales.", x: 1024, y: 460, rot: 0.05, color: "#FFD93D" },
    { title: "MEDICAL RAG", desc: "Local LLM Q&A for medical textbooks.", x: 1650, y: 520, rot: -0.02, color: "#ffffff" },
  ];

  for (const proj of projects) {
    ctx.save();
    ctx.translate(proj.x, proj.y);
    ctx.rotate(proj.rot);

    const w = 500;
    const h = 600;

    // Card shadow & bg
    ctx.shadowColor = "#000000";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 16;
    ctx.shadowOffsetY = 16;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(-w / 2, -h / 2, w, h);
    ctx.shadowColor = "transparent";

    // Card Border
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 6;
    ctx.strokeRect(-w / 2, -h / 2, w, h);

    // Card Image Area (colored block)
    const imgW = 440;
    const imgH = 340;
    ctx.fillStyle = proj.color;
    ctx.fillRect(-imgW / 2, -h / 2 + 30, imgW, imgH);
    ctx.strokeRect(-imgW / 2, -h / 2 + 30, imgW, imgH);

    // Decorative geometric shapes inside
    ctx.fillStyle = "#000000";
    for (let k = 0; k < 5; k++) {
      ctx.fillRect(-imgW / 2 + 40 + k * 40, -h / 2 + 100 + k * 30, 20 + k * 10, 20 + k * 10);
    }

    // Text
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillStyle = "#000000";
    ctx.font = "900 42px 'Space Grotesk', sans-serif";
    ctx.fillText(proj.title, -w / 2 + 30, -h / 2 + 410);

    ctx.font = "bold 26px 'Space Grotesk', sans-serif";
    wrapText(ctx, proj.desc, -w / 2 + 30, -h / 2 + 470, w - 60, 36);

    ctx.restore();
  }

  if (isActive) {
    drawActionButtons(ctx);
  }
}

function drawBriefcaseIcon(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  ctx.save();
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // Handle
  ctx.beginPath();
  ctx.arc(cx, cy - 14, 10, Math.PI, 0);
  ctx.stroke();

  // Bag body
  ctx.fillStyle = "#FF9900";
  ctx.fillRect(cx - 24, cy - 10, 48, 34);
  ctx.strokeRect(cx - 24, cy - 10, 48, 34);

  // Lock
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(cx - 5, cy + 2, 10, 10);
  ctx.strokeRect(cx - 5, cy + 2, 10, 10);

  ctx.restore();
}

function drawGraduationCapIcon(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  ctx.save();
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // Cap base
  ctx.fillStyle = "#FFFFFF";
  ctx.beginPath();
  ctx.moveTo(cx - 16, cy + 4);
  ctx.lineTo(cx - 16, cy + 14);
  ctx.arc(cx, cy + 14, 16, 0, Math.PI, false);
  ctx.lineTo(cx + 16, cy + 4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Diamond top
  ctx.fillStyle = "#8B5CF6";
  ctx.beginPath();
  ctx.moveTo(cx, cy - 14);
  ctx.lineTo(cx + 28, cy - 2);
  ctx.lineTo(cx, cy + 10);
  ctx.lineTo(cx - 28, cy - 2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Tassel
  ctx.strokeStyle = "#000000";
  ctx.beginPath();
  ctx.moveTo(cx + 14, cy + 4);
  ctx.lineTo(cx + 22, cy + 16);
  ctx.stroke();

  ctx.restore();
}

function drawExperienceCanvas(canvas: HTMLCanvasElement, isActive: boolean, isExplored: boolean) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Show TV static until the user explores this wall
  if (!isExplored && !isActive) {
    drawTVStatic(canvas, "EXPLORE EXPERIENCE", 4000);
    return;
  }

  drawNeoBrutalistBg(ctx, canvas.width, canvas.height);

  // Header Badge (Neo-brutalist stacked layout)
  ctx.save();
  ctx.fillStyle = "#FFD93D";
  ctx.fillRect(100 + 10, 100 + 10, 850, 90);
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 4;
  ctx.strokeRect(100 + 10, 100 + 10, 850, 90);

  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(100, 100, 850, 90);
  ctx.strokeRect(100, 100, 850, 90);

  ctx.fillStyle = "#000000";
  ctx.font = "900 48px 'Space Grotesk', sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText("EXPERIENCE & EDUCATION", 140, 145);
  ctx.restore();

  // Draw 2 massive Neo-brutalist cards side-by-side
  const cards = [
    {
      title: "FULL STACK AI INTERN",
      subtitle: "MAURICE ENGINEERING WORKS",
      date: "MAR 2025 - MAY 2025",
      type: "INTERNSHIP",
      color: "#C4B5FD",
      x: 100,
      y: 240,
      w: 880,
      h: 640,
      icon: "work",
      bullets: [
        "Developed full-stack AI applications integrating LLM chains.",
        "Integrated Vector DBs (Supabase PgVector) for semantic search.",
        "Designed modular API endpoints using FastAPI for secure data transfer.",
        "Optimized query performance and streamlined data preprocessing.",
      ]
    },
    {
      title: "B.TECH IN COMPUTER SCIENCE",
      subtitle: "ACROPOLIS INSTITUTE OF TECHNOLOGY",
      date: "AUG 2023 - JUN 2027",
      type: "DEGREE",
      color: "#FFD93D",
      x: 1068,
      y: 240,
      w: 880,
      h: 640,
      icon: "education",
      bullets: [
        "Pursuing Bachelor of Technology in CS with strong AI focus.",
        "Maintained a strong CGPA of 7.53/10 throughout semesters.",
        "Core Coursework: Data Structures, Algorithms, DBMS, and OS.",
        "Active member of tech clubs, organizing hackathons & code jams.",
      ]
    }
  ];

  for (const card of cards) {
    // Card stacked shadow
    ctx.save();
    ctx.fillStyle = card.color;
    ctx.fillRect(card.x + 12, card.y + 12, card.w, card.h);
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 4;
    ctx.strokeRect(card.x + 12, card.y + 12, card.w, card.h);

    // Main Card
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(card.x, card.y, card.w, card.h);
    ctx.strokeRect(card.x, card.y, card.w, card.h);

    // Card Header Area
    // Draw badge tag
    ctx.fillStyle = "#1E293B";
    ctx.fillRect(card.x + 30, card.y + 30, 180, 44);
    ctx.strokeRect(card.x + 30, card.y + 30, 180, 44);

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 20px 'Space Grotesk', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(card.type, card.x + 120, card.y + 52);

    // Draw date badge
    ctx.fillStyle = "#F1F5F9";
    ctx.fillRect(card.x + card.w - 320, card.y + 30, 290, 44);
    ctx.strokeRect(card.x + card.w - 320, card.y + 30, 290, 44);
    ctx.fillStyle = "#1E293B";
    ctx.font = "bold 20px 'Space Grotesk', sans-serif";
    ctx.fillText(card.date, card.x + card.w - 175, card.y + 52);

    // Draw Icon Emblem
    ctx.fillStyle = "#F8FAFC";
    ctx.beginPath();
    ctx.arc(card.x + 80, card.y + 160, 44, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    if (card.icon === "work") {
      drawBriefcaseIcon(ctx, card.x + 80, card.y + 160);
    } else {
      drawGraduationCapIcon(ctx, card.x + 80, card.y + 160);
    }

    // Title & Subtitle
    ctx.fillStyle = "#1E293B";
    ctx.font = "900 38px 'Space Grotesk', sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(card.title, card.x + 150, card.y + 115);

    ctx.fillStyle = "#64748B";
    ctx.font = "bold 26px 'Space Grotesk', sans-serif";
    ctx.fillText(card.subtitle, card.x + 150, card.y + 170);

    // Divider line
    ctx.strokeStyle = "#E2E8F0";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(card.x + 30, card.y + 240);
    ctx.lineTo(card.x + card.w - 30, card.y + 240);
    ctx.stroke();

    // Bullet points
    let bulletY = card.y + 280;
    ctx.font = "bold 24px 'Space Grotesk', sans-serif";
    ctx.fillStyle = "#1E293B";

    for (const bullet of card.bullets) {
      // Draw a neat solid custom retro square bullet
      ctx.fillStyle = card.color;
      ctx.fillRect(card.x + 40, bulletY + 6, 14, 14);
      ctx.strokeRect(card.x + 40, bulletY + 6, 14, 14);

      // Text
      ctx.fillStyle = "#1E293B";
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      wrapText(ctx, bullet, card.x + 70, bulletY, card.w - 110, 36);
      bulletY += 80;
    }

    ctx.restore();
  }

  if (isActive) {
    drawActionButtons(ctx);
  }
}

interface WallScreenProps {
  position: [number, number, number];
  rotation: [number, number, number];
  width: number;
  height: number;
  drawFunction: (canvas: HTMLCanvasElement, isActive: boolean, isExplored: boolean, onNeedsUpdate?: () => void) => void;
  isActive: boolean;
  isExplored: boolean;
  onBackClick: () => void;
  onEnterClick: () => void;
  onActivate: () => void;
}

function WallScreen({
  position,
  rotation,
  width,
  height,
  drawFunction,
  isActive,
  isExplored,
  onBackClick,
  onEnterClick,
  onActivate,
}: WallScreenProps) {
  const { canvas, texture } = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 2048;
    c.height = 1024;
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return { canvas: c, texture: t };
  }, []);

  const materialRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const [updateTrigger, setUpdateTrigger] = useState(0);

  const forceUpdate = useCallback(() => {
    setUpdateTrigger((prev) => prev + 1);
  }, []);

  useEffect(() => {
    return () => texture.dispose();
  }, [texture]);

  // Update texture when active/explored state changes or internal updates trigger
  useEffect(() => {
    drawFunction(canvas, isActive, isExplored, forceUpdate);
    texture.needsUpdate = true;
  }, [isActive, isExplored, drawFunction, updateTrigger, forceUpdate, canvas, texture]);

  // Cinematic flicker: erratic film-projector effect on unexplored walls only
  useFrame(({ clock }) => {
    if (!materialRef.current) return;
    if (isActive || isExplored) {
      // Stable brightness once explored or active
      materialRef.current.emissiveIntensity = isActive ? 0.8 : 0.65;
    } else {
      const t = clock.getElapsedTime();
      // Layer multiple sine waves at different frequencies (film projector effect)
      const slow = 0.18 * Math.sin(t * 1.7 + position[0]);
      const mid = 0.12 * Math.sin(t * 9.3 + position[2] * 2.1);
      const fast = 0.08 * Math.sin(t * 31.0 + position[0] * 0.5);
      // Occasional sharp random spike (1-in-40 chance per frame ~ rare flash)
      const spike = Math.random() < 0.025 ? (Math.random() > 0.5 ? 0.35 : -0.25) : 0;
      materialRef.current.emissiveIntensity = Math.max(0.08, Math.min(1.1, 0.55 + slow + mid + fast + spike));
    }
  });

  const handleClick = (e: any) => {
    e.stopPropagation();
    if (!isActive) {
      onActivate();
      return;
    }

    const uv = e.uv;
    if (!uv) return;

    const xPixel = uv.x * 2048;
    const yPixel = (1 - uv.y) * 1024;

    // Check Back button (x in [1400, 1680], y in [900, 980])
    if (xPixel >= 1400 && xPixel <= 1680 && yPixel >= 900 && yPixel <= 980) {
      onBackClick();
    }
    // Check Enter button (x in [1720, 2000], y in [900, 980])
    else if (xPixel >= 1720 && xPixel <= 2000 && yPixel >= 900 && yPixel <= 980) {
      onEnterClick();
    }
  };

  return (
    <group position={position} rotation={rotation}>
      {/* Main Screen Mesh — no box frame */}
      <mesh onClick={handleClick} castShadow receiveShadow>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial
          ref={materialRef}
          map={texture}
          emissive={new THREE.Color("#ffffff")}
          emissiveMap={texture}
          emissiveIntensity={0.5}
          roughness={0.45}
          metalness={0.1}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

function SceneContent({
  onComplete,
  isBooting,
  bootProgress,
  activeSection,
  setActiveSection,
  exploredWalls,
  setExploredWalls,
}: SceneContentProps) {
  const group = useRef<THREE.Group>(null!);
  const { camera } = useThree();
  const { texture, update } = useScreenTexture(isBooting, bootProgress);
  const modelWoodTexture = useWoodTexture();
  const modelFabricTexture = useFabricTexture();

  const { scene: gltfScene, animations } = useGLTF(
    "/models/scene-compressed.glb",
    "https://www.gstatic.com/draco/versioned/decoders/1.5.6/"
  );

  const { actions } = useAnimations(animations, group);

  const clothingFabricTexture = useMemo(() => {
    const tex = modelFabricTexture.clone();
    tex.repeat.set(16, 16);
    return tex;
  }, [modelFabricTexture]);

  // Ref to the actual screen mesh so we can update it directly every frame
  const screenMeshRef = useRef<THREE.Mesh | null>(null);

  // Screen material created ONCE — never recreated to avoid GPU memory thrash / context loss
  const screenMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      emissive: new THREE.Color("#ffffff"),
      emissiveIntensity: 1.2,
      roughness: 0.18,
      metalness: 0,
      toneMapped: false,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Imperatively update screen material map whenever texture or boot state changes
  useEffect(() => {
    screenMaterial.map = texture;
    screenMaterial.emissiveMap = texture;
    screenMaterial.emissiveIntensity = isBooting ? 1.85 : 1.2;
    screenMaterial.needsUpdate = true;
  }, [texture, isBooting, screenMaterial]);

  const modelMaterials = useMemo(() => ({
    screen: screenMaterial,
    laptop: new THREE.MeshStandardMaterial({
      color: "#151923",
      roughness: 0.42,
      metalness: 0.55,
    }),
    desk: new THREE.MeshStandardMaterial({
      map: modelWoodTexture,
      color: "#8a5b35",
      roughness: 0.62,
      metalness: 0.02,
    }),
    chairFabric: new THREE.MeshStandardMaterial({
      map: modelFabricTexture,
      color: "#2e3946",
      roughness: 0.82,
      metalness: 0.02,
    }),
    chairMetal: new THREE.MeshStandardMaterial({
      color: "#20242b",
      roughness: 0.5,
      metalness: 0.45,
    }),
    hoodie: new THREE.MeshStandardMaterial({
      map: clothingFabricTexture,
      color: "#2a3d5e", // Smart textured navy blue
      roughness: 0.85,
      metalness: 0.02,
    }),
    pants: new THREE.MeshStandardMaterial({
      map: clothingFabricTexture,
      color: "#171e2a", // Smart dark denim blue
      roughness: 0.88,
    }),
    skin: new THREE.MeshStandardMaterial({
      color: "#d5a282", // Warm skin tone
      roughness: 0.62,
    }),
    hair: new THREE.MeshStandardMaterial({
      color: "#181412", // Dark rich brown-black hair
      roughness: 0.8,
    }),
    shoes: new THREE.MeshStandardMaterial({
      color: "#e6e5e0", // Off-white clean leather
      roughness: 0.38,
      metalness: 0.05,
    }),
    shelf: new THREE.MeshStandardMaterial({
      map: modelWoodTexture,
      color: "#755238",
      roughness: 0.66,
    }),
    lamp: new THREE.MeshStandardMaterial({
      color: "#d1a84f",
      roughness: 0.36,
      metalness: 0.45,
    }),
    frame: new THREE.MeshStandardMaterial({
      color: "#443128",
      roughness: 0.54,
      metalness: 0.12,
    }),
  }), [modelFabricTexture, clothingFabricTexture, modelWoodTexture]);

  // The source GLB uses one dark material for most objects, so restore readable colors by mesh name.
  useEffect(() => {
    gltfScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;

        const name = child.name;
        const materialName = child.material instanceof THREE.Material ? child.material.name : "";

        if (
          materialName === "Room_FloorMat" ||
          materialName === "Room_WallMat" ||
          materialName === "Room_FrameMat" ||
          name.includes("Poster_") ||
          name.includes("Skill_Node_") ||
          name.includes("Shelf") ||
          name.includes("Bookcase") ||
          name.includes("Book") ||
          materialName === "Room_ShelfMat"
        ) {
          child.visible = false;
          return;
        }

        child.visible = true;

        if (materialName === "pc_screen" || name === "Cube.001") {
          // Capture screen mesh directly for per-frame updates
          screenMeshRef.current = child;
          child.material = modelMaterials.screen;
        } else if (materialName === "pc" || name === "Cube") {
          child.material = modelMaterials.laptop;
        } else if (name.includes("Desk")) {
          child.material = modelMaterials.desk;
        } else if (name.includes("ChairBack") || name.includes("ChairSeat") || name.includes("Underside")) {
          child.material = modelMaterials.chairFabric;
        } else if (name.includes("Leg_") || name.includes("Wheel") || name.includes("Cylinder")) {
          child.material = modelMaterials.chairMetal;
        } else if (name.includes("Ch28_Hoody") || name.includes("Object_11")) {
          child.material = modelMaterials.hoodie;
        } else if (name.includes("Ch28_Pants") || name.includes("Object_10")) {
          child.material = modelMaterials.pants;
        } else if (name.includes("Ch28_Body") || name.includes("Object_7")) {
          child.material = modelMaterials.skin;
        } else if (name.includes("Ch28_Hair") || name.includes("Ch28_Eyelashes") || name.includes("Object_15") || name.includes("Object_13")) {
          child.material = modelMaterials.hair;
        } else if (name.includes("Ch28_Sneakers") || name.includes("Object_9")) {
          child.material = modelMaterials.shoes;
        } else if (materialName === "Room_ShelfMat") {
          child.material = modelMaterials.shelf;
        } else if (materialName === "Room_LampMat") {
          child.material = modelMaterials.lamp;
        }
      }
    });
  }, [gltfScene, modelMaterials]);

  // Directly update screen mesh whenever screenMaterial changes (covers canvas->video swap)
  useEffect(() => {
    if (screenMeshRef.current) {
      screenMeshRef.current.material = screenMaterial;
    }
  }, [screenMaterial]);

  // Character animation
  useEffect(() => {
    const idle = actions["mixamo.com"];
    if (idle) {
      idle.reset().fadeIn(0.5).play();
      idle.setLoop(THREE.LoopRepeat, Infinity);
    }
  }, [actions]);

  // Camera focuses & zoom transitions
  useEffect(() => {
    if (isBooting) {
      // Stage 1: swing slightly left to frame the screen (0.6s)
      gsap.to(camera.position, {
        x: -0.55,
        y: 0.92,
        z: -0.7,
        duration: 0.6,
        ease: "power1.in",
        onUpdate: () => camera.lookAt(0, 0.82, -0.1),
        onComplete: () => {
          // Stage 2: punch in very close — screen fills the viewport (1.8s)
          gsap.to(camera.position, {
            x: -0.32,
            y: 0.835,
            z: -0.28,
            duration: 1.8,
            ease: "power3.in",
            onUpdate: () => camera.lookAt(0.12, 0.835, -0.08),
          });
        },
      });
      return;
    }

    // Default standby camera
    let targetPos = { x: 0, y: 1.2, z: -1.8 };
    let targetLook = { x: 0, y: 0.95, z: 0 };

    if (activeSection === "skills") {
      // Zoom straight to skills wall (right wall at x=4.59) from a centered x=-0.5 offset
      targetPos = { x: -0.5, y: 2.0, z: 0 };
      targetLook = { x: 4.59, y: 2.0, z: 0 };
    } else if (activeSection === "achievements") {
      // Zoom straight to projects wall (left wall at x=-4.59) from a centered x=0.5 offset
      targetPos = { x: 0.5, y: 2.0, z: 0 };
      targetLook = { x: -4.59, y: 2.0, z: 0 };
    } else if (activeSection === "experience") {
      // Zoom straight to experience wall (back wall at z=-3.54) from a centered z=0.8 offset
      targetPos = { x: 0, y: 2.0, z: 0.8 };
      targetLook = { x: 0, y: 2.0, z: -3.54 };
    } else if (activeSection === "about") {
      // Zoom straight to about wall (front wall at z=3.84) from a centered z=-0.5 offset
      targetPos = { x: 0, y: 2.0, z: -0.5 };
      targetLook = { x: 0, y: 2.0, z: 3.84 };
    }

    const lookDummy = { x: 0, y: 0.95, z: 0 };
    const tl = gsap.timeline();

    tl.to(camera.position, {
      x: targetPos.x,
      y: targetPos.y,
      z: targetPos.z,
      duration: 1.5,
      ease: "power2.inOut",
    });

    tl.to(lookDummy, {
      x: targetLook.x,
      y: targetLook.y,
      z: targetLook.z,
      duration: 1.5,
      ease: "power2.inOut",
      onUpdate: () => {
        camera.lookAt(lookDummy.x, lookDummy.y, lookDummy.z);
      }
    }, 0);

  }, [activeSection, camera, isBooting]);

  // Synchronize window wheel scroll directly to the focused smart board element
  // This solves Chrome/Safari hit-testing bugs with CSS 3D matrix3d transformed elements.
  useEffect(() => {
    if (activeSection === "none") return;

    const handleWindowWheel = (e: WheelEvent) => {
      let selector = "";
      if (activeSection === "about") selector = ".about-board";
      else if (activeSection === "skills") selector = ".skills-wall";
      else if (activeSection === "achievements") selector = ".projects-board";
      else if (activeSection === "experience") selector = ".experience-board";

      if (!selector) return;

      const el = document.querySelector(selector);
      if (el) {
        // Prevent default window/body scrolling
        e.preventDefault();
        el.scrollTop += e.deltaY;
      }
    };

    window.addEventListener("wheel", handleWindowWheel, { passive: false });
    return () => {
      window.removeEventListener("wheel", handleWindowWheel);
    };
  }, [activeSection]);

  useFrame(({ clock }) => {
    update(clock.getElapsedTime());
    // Force video texture frame push directly on screen mesh every frame while booting
    if (isBooting && screenMeshRef.current) {
      const mat = screenMeshRef.current.material as THREE.MeshStandardMaterial;
      if (mat && mat.map) {
        mat.map.needsUpdate = true;
      }
    }
  });

  return (
    <>
      {/* Lights - Brighter and more natural room setup */}
      <ambientLight color="#fff7e8" intensity={0.35} />
      <hemisphereLight args={["#fff7e8", "#8b7258", 0.4]} />

      {/* Main room light (ceiling) */}
      <pointLight position={[0, 3.8, 0.6]} color="#fff0d0" intensity={0.5} distance={9} castShadow />

      {/* Desk Lamp / Face Light */}
      <spotLight
        position={[-0.8, 1.7, 0.55]}
        target-position={[0, 0.9, 0]}
        color="#ffeedd"
        intensity={0.8}
        distance={5}
        angle={Math.PI / 3}
        penumbra={0.8}
        castShadow
      />

      {/* Laptop Screen Glow */}
      <pointLight
        position={[0, 0.9, -0.2]}
        color={isBooting ? "#00ff88" : "#000000"}
        intensity={isBooting ? 1.6 : 0.0}
        distance={3}
      />

      {/* Gallery Spotlights for Walls */}
      <spotLight position={[0, 3.5, 2]} target-position={[0, 2, 3.84]} intensity={2} angle={0.6} penumbra={0.5} />
      <spotLight position={[2.75, 3.5, 0]} target-position={[4.59, 2, 0]} intensity={2} angle={0.6} penumbra={0.5} />
      <spotLight position={[-2.75, 3.5, 0]} target-position={[-4.59, 2, 0]} intensity={2} angle={0.6} penumbra={0.5} />
      <spotLight position={[0, 3.5, -1.7]} target-position={[0, 2, -3.54]} intensity={2} angle={0.6} penumbra={0.5} />

      <RoomShell activeSection={activeSection} />

      {/* Virtual 3D Walls using dynamic 2D canvas textures mapped to WebGL planes */}
      {!isBooting && (
        <>
          {/* FRONT WALL: ABOUT ME */}
          <WallScreen
            position={[0, 2.05, 3.84]}
            rotation={[0, Math.PI, 0]}
            width={6.5}
            height={3.2}
            drawFunction={drawAboutMeCanvas}
            isActive={activeSection === "about"}
            isExplored={exploredWalls.has("about")}
            onBackClick={() => setActiveSection("none")}
            onEnterClick={() => onComplete("about")}
            onActivate={() => {
              setActiveSection("about");
              setExploredWalls((prev) => new Set(prev).add("about"));
            }}
          />

          {/* RIGHT WALL: SKILLS */}
          <WallScreen
            position={[4.59, 2.05, 0]}
            rotation={[0, -Math.PI / 2, 0]}
            width={6.5}
            height={3.2}
            drawFunction={drawSkillsCanvas}
            isActive={activeSection === "skills"}
            isExplored={exploredWalls.has("skills")}
            onBackClick={() => setActiveSection("none")}
            onEnterClick={() => onComplete("skills")}
            onActivate={() => {
              setActiveSection("skills");
              setExploredWalls((prev) => new Set(prev).add("skills"));
            }}
          />

          {/* LEFT WALL: PROJECTS */}
          <WallScreen
            position={[-4.59, 2.05, 0]}
            rotation={[0, Math.PI / 2, 0]}
            width={6.5}
            height={3.2}
            drawFunction={drawProjectsCanvas}
            isActive={activeSection === "achievements"}
            isExplored={exploredWalls.has("achievements")}
            onBackClick={() => setActiveSection("none")}
            onEnterClick={() => onComplete("projects")}
            onActivate={() => {
              setActiveSection("achievements");
              setExploredWalls((prev) => new Set(prev).add("achievements"));
            }}
          />

          {/* BACK WALL: EXPERIENCE */}
          <WallScreen
            position={[0, 2.05, -3.54]}
            rotation={[0, 0, 0]}
            width={6.5}
            height={3.2}
            drawFunction={drawExperienceCanvas}
            isActive={activeSection === "experience"}
            isExplored={exploredWalls.has("experience")}
            onBackClick={() => setActiveSection("none")}
            onEnterClick={() => onComplete("experience")}
            onActivate={() => {
              setActiveSection("experience");
              setExploredWalls((prev) => new Set(prev).add("experience"));
            }}
          />
        </>
      )}

      <group ref={group}>
        <primitive object={gltfScene} />
      </group>
    </>
  );
}

useGLTF.preload("/models/scene-compressed.glb");

// ─────────────────────────────────────────────────────────────────────────────
// Mobile Fallback typewriter
// ─────────────────────────────────────────────────────────────────────────────

function MobileFallback({ onComplete }: { onComplete: () => void }) {
  const [isBooted, setIsBooted] = useState(false);
  const [bootProgress, setBootProgress] = useState(0);
  const [lines, setLines] = useState<string[]>([]);
  const [currentText, setCurrentText] = useState("");
  const [done, setDone] = useState(false);
  const [lastTap, setLastTap] = useState(0);

  const handleTouch = () => {
    if (isBooted) return;
    const now = Date.now();
    if (now - lastTap < 300) {
      setIsBooted(true);
    }
    setLastTap(now);
  };

  useEffect(() => {
    if (!isBooted) return;

    const interval = setInterval(() => {
      setBootProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1;
      });
    }, 45);

    return () => clearInterval(interval);
  }, [isBooted]);

  useEffect(() => {
    if (!isBooted) return;

    let lineIdx = 0;
    let charIdx = 0;
    let mounted = true;

    function tick() {
      if (!mounted) return;
      if (lineIdx >= BOOT_LINES.length) {
        setDone(true);
        setTimeout(() => mounted && onComplete(), 800);
        return;
      }

      const line = BOOT_LINES[lineIdx];
      charIdx += 1;

      if (charIdx > line.length) {
        setLines((prev) => [...prev, line]);
        setCurrentText("");
        lineIdx += 1;
        charIdx = 0;
        setTimeout(tick, 100);
      } else {
        setCurrentText(line.slice(0, charIdx));
        setTimeout(tick, 30);
      }
    }

    setTimeout(tick, 200);
    return () => {
      mounted = false;
    };
  }, [isBooted, onComplete]);

  return (
    <div
      onClick={handleTouch}
      style={{
        position: "fixed",
        inset: 0,
        background: "#0a0a0a",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
        padding: "2rem",
        boxSizing: "border-box"
      }}
    >
      {!isBooted ? (
        <div style={{ textAlign: "center", color: "#fff", fontFamily: "monospace" }}>
          [ Double Tap to Enter ]
        </div>
      ) : (
        <div style={{ color: "#00ff88", fontFamily: "monospace", maxWidth: "480px", width: "100%" }}>
          {lines.map((l, i) => <div key={i}>{l}</div>)}
          {currentText && <div>{currentText}|</div>}
          <div style={{ marginTop: "20px" }}>Loading: {bootProgress}%</div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HTML Boot Loading Screen Overlay
// ─────────────────────────────────────────────────────────────────────────────

interface HtmlBootScreenProps {
  onComplete: () => void;
}

function HtmlBootScreen({ onComplete }: HtmlBootScreenProps) {
  const [lines, setLines] = useState<string[]>([]);
  const [currentLine, setCurrentLine] = useState("");
  const [progress, setProgress] = useState(0);
  const [fadeClass, setFadeClass] = useState("fade-in");

  const bootLines = [
    "> Initializing Sanskar_AI...",
    "> Loading RAG pipeline............. ✓",
    "> Connecting MCP servers........... ✓",
    "> GitHub linked.................... ✓",
    "> LeetCode linked.................. ✓",
    "> Ready.",
  ];

  useEffect(() => {
    let mounted = true;
    let lineIdx = 0;
    let charIdx = 0;

    const progressMilestones = [15, 35, 55, 75, 90, 100];

    function typeNextChar() {
      if (!mounted) return;
      if (lineIdx >= bootLines.length) {
        setProgress(100);
        setTimeout(() => {
          if (mounted) {
            setFadeClass("fade-out");
            setTimeout(() => {
              onComplete();
            }, 600);
          }
        }, 800);
        return;
      }

      const line = bootLines[lineIdx];
      charIdx++;

      // Sync progress bar perfectly with typewriter characters
      const prevMilestone = lineIdx > 0 ? progressMilestones[lineIdx - 1] : 0;
      const targetMilestone = progressMilestones[lineIdx];
      const charPct = charIdx / line.length;
      const computedProgress = Math.min(100, Math.floor(prevMilestone + charPct * (targetMilestone - prevMilestone)));
      setProgress(computedProgress);

      if (charIdx > line.length) {
        setLines((prev) => [...prev, line]);
        setCurrentLine("");
        lineIdx++;
        charIdx = 0;
        setTimeout(typeNextChar, 100);
      } else {
        setCurrentLine(line.substring(0, charIdx));
        // Type dots super fast (4ms) so they zip by, and other characters at 12ms
        const isDot = line[charIdx - 1] === ".";
        setTimeout(typeNextChar, isDot ? 4 : 12);
      }
    }

    setTimeout(typeNextChar, 150);

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className={`html-boot-screen ${fadeClass}`}>
      <div className="crt-overlay" />
      <div className="terminal-container">
        <div className="terminal-header">
          <div className="terminal-dot red" />
          <div className="terminal-dot yellow" />
          <div className="terminal-dot green" />
          <span className="terminal-title">SANSKAR_AI // SYSTEM BOOT</span>
        </div>
        <div className="terminal-body">
          {lines.map((line, idx) => {
            const hasCheck = line.includes("✓");
            const text = hasCheck ? line.replace("✓", "") : line;
            return (
              <div key={idx} className="terminal-line">
                {text}
                {hasCheck && <span className="check-mark">✓</span>}
              </div>
            );
          })}
          {currentLine && (
            <div className="terminal-line current-typing">
              {currentLine}
              <span className="terminal-cursor" />
            </div>
          )}
        </div>
        <div className="progress-section">
          <div className="progress-bar-container">
            <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="progress-text">{progress}% INITIALIZED</div>
        </div>
      </div>

      <style jsx>{`
        .html-boot-screen {
          position: fixed;
          inset: 0;
          background: #020408;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Courier New', Courier, monospace;
          color: #ffffff;
          opacity: 0;
          transition: opacity 0.5s ease-in-out;
        }
        .html-boot-screen.fade-in {
          opacity: 1;
        }
        .html-boot-screen.fade-out {
          opacity: 0;
        }
        .crt-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), 
                      linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06));
          background-size: 100% 4px, 6px 100%;
          z-index: 1010;
          pointer-events: none;
        }
        .terminal-container {
          width: 90%;
          max-width: 800px;
          background: rgba(10, 15, 30, 0.85);
          border: 1px solid rgba(0, 242, 254, 0.25);
          border-radius: 12px;
          box-shadow: 0 0 40px rgba(0, 242, 254, 0.15);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          z-index: 1020;
        }
        .terminal-header {
          background: rgba(20, 25, 40, 0.9);
          padding: 12px 20px;
          display: flex;
          align-items: center;
          border-bottom: 1px solid rgba(0, 242, 254, 0.15);
        }
        .terminal-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          margin-right: 8px;
        }
        .terminal-dot.red { background: #ff5f56; }
        .terminal-dot.yellow { background: #ffbd2e; }
        .terminal-dot.green { background: #27c93f; }
        .terminal-title {
          margin-left: 12px;
          font-size: 14px;
          color: rgba(255, 255, 255, 0.5);
          letter-spacing: 1px;
        }
        .terminal-body {
          padding: 30px;
          min-height: 300px;
          font-size: 20px;
          line-height: 1.6;
        }
        .terminal-line {
          margin-bottom: 14px;
          display: flex;
          align-items: center;
        }
        .check-mark {
          color: #10b981;
          margin-left: 8px;
          text-shadow: 0 0 8px rgba(16, 185, 129, 0.5);
        }
        .terminal-cursor {
          display: inline-block;
          width: 10px;
          height: 20px;
          background: #00f2fe;
          margin-left: 6px;
          animation: blink 0.8s infinite;
        }
        .progress-section {
          padding: 20px 30px 40px 30px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .progress-bar-container {
          width: 100%;
          height: 12px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 6px;
          overflow: hidden;
          border: 1px solid rgba(0, 242, 254, 0.2);
        }
        .progress-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #00f2fe, #10b981);
          box-shadow: 0 0 12px rgba(0, 242, 254, 0.5);
          transition: width 0.1s ease-out;
        }
        .progress-text {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.7);
          text-align: right;
          letter-spacing: 1px;
        }
        @keyframes blink {
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export default function OpeningScene({ onComplete }: OpeningSceneProps) {
  const [isMobile] = useState(() => typeof window !== "undefined" && window.innerWidth < 768);
  const [isBooting, setIsBooting] = useState(false);
  const [bootProgress, setBootProgress] = useState(0);
  const [activeSection, setActiveSection] = useState<"skills" | "experience" | "achievements" | "about" | "none">("none");
  const [exploredWalls, setExploredWalls] = useState<Set<string>>(new Set());
  const [showDragHint, setShowDragHint] = useState(true);

  const [showOverlay, setShowOverlay] = useState(false);
  const [showHtmlBoot, setShowHtmlBoot] = useState(false);

  const triggerBoot = useCallback(() => {
    if (isBooting) return;
    setActiveSection("none");
    setIsBooting(true);

    // Zoom camera into screen, then fade in the HTML loading overlay page
    setTimeout(() => {
      setShowHtmlBoot(true);
    }, 1250); // transition to full screen boot overlay just as zoom completes
  }, [isBooting]);

  useEffect(() => {
    if (isMobile) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        triggerBoot();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobile, triggerBoot]);

  if (isMobile) {
    return <MobileFallback onComplete={() => onComplete()} />;
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        background: "#1e1e1e",
        zIndex: 50,
      }}
    >
      <style>{`
        .badge-btn {
          background: #ffffff;
          border: 1px solid #cccccc;
          color: #333333;
          padding: 8px 16px;
          border-radius: 4px;
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .badge-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(0,0,0,0.15);
        }

        .physical-frame {
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          font-family: 'Inter', sans-serif;
          position: relative;
        }

        /* Poster (About) */
        .about-poster {
          background: #ffffff;
          border: 16px solid #222222;
          border-radius: 4px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.4);
          padding: 40px;
          color: #333333;
          align-items: center;
          text-align: center;
        }
        .about-poster h2 { margin: 0; font-size: 32px; letter-spacing: 2px; }
        .about-poster h3 { margin: 10px 0 20px; color: #666666; font-weight: 400; }
        .about-photo { width: 160px; height: 160px; border-radius: 50%; object-fit: cover; margin-bottom: 20px; border: 4px solid #f0f0f0; }
        .about-poster p { font-size: 18px; line-height: 1.5; max-width: 600px; margin-bottom: 20px; }
        .about-poster .meta { font-size: 14px; color: #888888; }

        /* Whiteboard (Skills) */
        .whiteboard {
          background: #fcfcfc;
          border: 10px solid #d1d5db;
          border-radius: 6px;
          box-shadow: inset 0 0 20px rgba(0,0,0,0.05), 0 10px 30px rgba(0,0,0,0.3);
          padding: 30px;
          color: #222222;
        }
        .whiteboard-header { border-bottom: 2px dashed #cccccc; padding-bottom: 15px; margin-bottom: 20px; }
        .whiteboard h2 { margin: 0; font-family: 'Comic Sans MS', 'Marker Felt', sans-serif; color: #1e3a8a; font-size: 32px; }
        .skills-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
        .skill-section h3 { font-family: 'Comic Sans MS', sans-serif; color: #b91c1c; margin-bottom: 10px; }
        .tag-list { display: flex; flex-wrap: wrap; gap: 10px; }
        .tag { background: #ffffff; border: 1px solid #e5e7eb; padding: 6px 12px; border-radius: 20px; font-size: 14px; display: flex; align-items: center; gap: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }

        /* Corkboard (Projects) */
        .corkboard {
          background: #c19a6b;
          border: 16px solid #5c4033;
          box-shadow: inset 0 0 40px rgba(0,0,0,0.4), 0 10px 30px rgba(0,0,0,0.4);
          padding: 40px;
        }
        .corkboard-content { position: relative; height: 100%; width: 100%; }
        .polaroid {
          background: #fff9e6;
          padding: 15px 15px 30px 15px;
          box-shadow: 2px 4px 10px rgba(0,0,0,0.3);
          position: absolute;
          width: 220px;
        }
        .polaroid h4 { margin: 0 0 10px 0; font-size: 18px; color: #333; }
        .polaroid p { margin: 0; font-size: 14px; color: #555; }
        .p1 { top: 20px; left: 40px; transform: rotate(-5deg); }
        .p2 { top: 50px; left: 300px; transform: rotate(3deg); }
        .p3 { top: 180px; left: 100px; transform: rotate(-2deg); }

        /* Certificate (Experience) */
        .certificate {
          background: #f8fafc;
          border: 12px solid #8b5a2b;
          box-shadow: 0 10px 30px rgba(0,0,0,0.4), inset 0 0 0 2px #d4af37;
          padding: 40px;
          text-align: center;
          color: #1e293b;
        }
        .certificate h2 { font-family: 'Georgia', serif; font-size: 36px; border-bottom: 2px solid #d4af37; padding-bottom: 20px; margin-bottom: 40px; }
        .cert-body { display: flex; flex-direction: column; gap: 30px; align-items: center; }
        .cert-item h3 { margin: 0 0 5px 0; font-size: 24px; }
        .cert-item p { margin: 0 0 5px 0; font-size: 18px; color: #475569; }
        .cert-item small { color: #64748b; font-size: 14px; }

        /* Actions */
        .action-row {
          position: absolute;
          bottom: 50px;
          right: 80px;
          display: flex;
          gap: 24px;
        }
        .btn {
          padding: 16px 36px;
          font-family: 'Inter', sans-serif;
          font-size: 20px;
          border-radius: 8px;
          cursor: pointer;
          transition: 0.2s;
        }
        .btn.outline { background: transparent; border: 3px solid #333; color: #333; }
        .btn.outline:hover { background: rgba(0,0,0,0.05); }
        .btn.solid { background: #333; border: 3px solid #333; color: #fff; }
        .btn.solid:hover { background: #111; border-color: #111; }

        .btn.outline.dark { border-color: #fff; color: #fff; }
        .btn.outline.dark:hover { background: rgba(255,255,255,0.1); }
        .btn.solid.dark { background: #fff; border-color: #fff; color: #333; }
        .btn.solid.dark:hover { background: #f0f0f0; }

        /* Full wall custom styles (no bezel or inner drop shadows) */
        .smart-board {
          border: none;
          border-radius: 0;
          box-shadow: none;
          overflow: hidden;
          cursor: pointer;
          max-width: none !important;
          max-height: none !important;
        }

        .about-board {
          width: 1920px !important;
          height: 856px !important;
          background: linear-gradient(160deg, #f4f0e8 0%, #fdfcf9 100%);
          color: #172033;
          padding: 80px 100px;
          text-align: left;
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: #b0b8c8 transparent;
        }
        .about-board .poster-content {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 60px;
          align-items: start;
          min-height: 100%;
        }
        .about-board h2 { font-size: 88px; line-height: 0.96; letter-spacing: -2px; margin: 0 0 20px; font-weight: 900; }
        .about-board h3 { font-size: 36px; line-height: 1.2; margin: 0 0 32px; color: #31506e; font-weight: 700; }
        .about-board p { font-size: 26px; line-height: 1.55; max-width: 1200px; margin: 0 0 32px; color: #2c3a50; }
        .about-board .meta { display: flex; gap: 24px; font-size: 24px; color: #4b5d73; }
        .about-board .about-photo { width: 320px; height: 320px; border: 12px solid #ffffff; box-shadow: 0 24px 60px rgba(31,41,55,0.18); border-radius: 8px; }

        .skills-wall {
          width: 1920px !important;
          height: 916px !important;
          background: linear-gradient(160deg, #f1f5fb 0%, #e8eef8 100%);
          padding: 70px 100px;
          color: #182333;
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: #8ca0c0 transparent;
        }
        .skills-wall .whiteboard-header { margin-bottom: 40px; padding-bottom: 20px; border-bottom: 6px solid #dbe3ee; }
        .skills-wall h2 { font-size: 56px; color: #173b65; font-weight: 800; }
        .skill-tile-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 30px;
          height: calc(100% - 140px);
        }
        .skill-tile {
          border: 4px solid #d7e1ea;
          background: linear-gradient(180deg, #ffffff 0%, #edf4fb 100%);
          color: #172033;
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 20px;
          font-family: 'Inter', sans-serif;
          font-size: 28px;
          font-weight: 800;
          box-shadow: 0 16px 36px rgba(30, 58, 88, 0.08);
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .skill-tile:hover {
          transform: translateY(-4px);
          box-shadow: 0 24px 48px rgba(30, 58, 88, 0.14);
        }
        .skill-icon { color: #0f766e; transform: scale(2.6); margin-bottom: 12px; }

        .projects-board {
          width: 1920px;
          height: 916px;
          background: linear-gradient(160deg, #c19558 0%, #a8763c 100%);
          padding: 80px 100px;
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: #d4a66a transparent;
        }
        .projects-board .corkboard-content {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 40px;
          height: 100%;
          position: static;
        }
        .projects-board .polaroid {
          position: static;
          width: auto;
          padding: 48px;
          background: #fff7df;
          transform: none;
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          box-shadow: 0 20px 45px rgba(0,0,0,0.18);
        }
        .projects-board .polaroid h4 { font-size: 38px; line-height: 1.1; margin-bottom: 24px; font-weight: 800; color: #4a2d0b; }
        .projects-board .polaroid p { font-size: 24px; line-height: 1.45; color: #5c4223; }

        .experience-board {
          width: 1920px;
          height: 856px;
          background: linear-gradient(160deg, #fdf5e4 0%, #f0ddb8 100%);
          padding: 80px 100px;
          color: #172033;
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: #c8a060 transparent;
        }
        .experience-board h2 { font-size: 56px; margin: 0 0 36px; border-bottom: 6px solid #b88a3d; padding-bottom: 24px; font-weight: 800; }
        .experience-board .cert-body { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; align-items: stretch; }
        .experience-board .cert-item {
          border-left: 12px solid #9b6c32;
          background: rgba(255,255,255,0.78);
          padding: 36px;
          text-align: left;
          border-radius: 8px;
          box-shadow: 0 16px 36px rgba(75, 50, 25, 0.08);
        }
        .experience-board .cert-item h3 { font-size: 34px; font-weight: 800; margin-bottom: 12px; }
        .experience-board .cert-item p { font-size: 26px; margin-bottom: 12px; color: #475569; }
        .experience-board .cert-item small { font-size: 20px; color: #64748b; }

        .initialize-panel {
          position: absolute;
          bottom: 32px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          gap: 12px;
          pointer-events: auto;
        }
        .initialize-button {
          border: 1px solid rgba(255,255,255,0.42);
          background: rgba(18, 24, 31, 0.82);
          color: #fff;
          border-radius: 999px;
          padding: 12px 22px;
          font: 700 14px 'Inter', sans-serif;
          cursor: pointer;
          box-shadow: 0 10px 30px rgba(0,0,0,0.28);
        }
        .initialize-hint {
          background: rgba(255,255,255,0.82);
          color: #27313d;
          border-radius: 999px;
          padding: 10px 18px;
          font: 600 13px 'Inter', sans-serif;
          box-shadow: 0 8px 24px rgba(0,0,0,0.16);
        }

        .drag-hint-banner {
          position: absolute;
          top: 24px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(15, 23, 42, 0.9);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.35);
          border-radius: 999px;
          padding: 12px 28px;
          display: flex;
          align-items: center;
          gap: 16px;
          z-index: 100;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 15px;
          font-weight: 600;
          color: #ffffff;
          pointer-events: none;
        }
        
        .drag-animation {
          position: relative;
          width: 50px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .drag-mouse {
          width: 16px;
          height: 24px;
          border: 2px solid #00f2fe;
          border-radius: 8px;
          position: relative;
          animation: mouse-slide 2.2s infinite ease-in-out;
        }

        .mouse-wheel {
          width: 2px;
          height: 5px;
          background: #00f2fe;
          position: absolute;
          top: 4px;
          left: 50%;
          transform: translateX(-50%);
          border-radius: 1px;
          animation: wheel-scroll 1.1s infinite alternate ease-in-out;
        }

        .drag-hand {
          position: absolute;
          font-size: 16px;
          top: 6px;
          left: 8px;
          animation: hand-drag 2.2s infinite ease-in-out;
        }

        @keyframes mouse-slide {
          0%, 100% { transform: translateX(-12px); }
          50% { transform: translateX(12px); }
        }

        @keyframes hand-drag {
          0%, 100% { transform: translate(-12px, 0); opacity: 0.9; }
          50% { transform: translate(12px, 0); opacity: 0.9; }
        }

        @keyframes wheel-scroll {
          0% { transform: translateX(-50%) translateY(0); }
          100% { transform: translateX(-50%) translateY(3px); }
        }

        .zoom-overlay {
          position: absolute;
          inset: 0;
          background: #000000;
          z-index: 200;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.75s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .zoom-overlay.visible {
          opacity: 1;
        }

      `}</style>

      {showDragHint && !isBooting && activeSection === "none" && (
        <div className="drag-hint-banner">
          <div className="drag-animation">
            <div className="drag-mouse">
              <div className="mouse-wheel"></div>
            </div>
            <div className="drag-hand">👈</div>
          </div>
          <span>Drag to explore room | Scroll to zoom</span>
        </div>
      )}

      <Canvas
        camera={{ position: [0, 1.2, -1.8], fov: 45 }}
        style={{ width: "100%", height: "100%" }}
        shadows
        gl={{ antialias: true }}
        onPointerDown={() => {
          if (showDragHint) setShowDragHint(false);
        }}
      >
        <Suspense fallback={null}>
          <SceneContent
            onComplete={onComplete}
            isBooting={isBooting}
            bootProgress={bootProgress}
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            exploredWalls={exploredWalls}
            setExploredWalls={setExploredWalls}
          />
        </Suspense>

        {!isBooting && activeSection === "none" && (
          <OrbitControls
            enablePan={false}
            enableZoom={true}
            maxPolarAngle={Math.PI / 2 - 0.05}
            minDistance={0.5}
            maxDistance={5.0}
            target={[0, 0.95, 0]}
          />
        )}
      </Canvas>

      {!isBooting && activeSection === "none" && !isMobile && (
        <div className="initialize-panel">
          <button className="initialize-button" onClick={triggerBoot}>
            Initialize
          </button>
          <span className="initialize-hint">or press SPACE</span>
        </div>
      )}

      {/* Cinematic fade-to-black overlay on boot */}
      <div className={`zoom-overlay${showOverlay ? " visible" : ""}`} />

      {showHtmlBoot && (
        <HtmlBootScreen onComplete={onComplete} />
      )}
    </div>
  );
}

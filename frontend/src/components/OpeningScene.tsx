"use client";

import {
  useRef,
  useEffect,
  useState,
  useMemo,
  Suspense,
  useCallback,
} from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { useGLTF, useAnimations, OrbitControls, Html } from "@react-three/drei";
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

function useScreenTexture(isBooting: boolean, bootProgress: number) {
  const cursorVisible = useRef(true);
  const lastCursorBlink = useRef(0);
  const dashOffset = useRef(0);

  const screen = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 1024;
    c.height = 640;
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return { canvas: c, texture: t };
  }, []);

  const { canvas, texture } = screen;

  // Three.js textures require this imperative flag after drawing into the canvas.
  // eslint-disable-next-line react-hooks/immutability
  const update = useCallback((elapsed: number) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const now = elapsed * 1000;

    if (now - lastCursorBlink.current > 500) {
      cursorVisible.current = !cursorVisible.current;
      lastCursorBlink.current = now;
    }

    dashOffset.current -= 0.5;

    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, 1024, 640);

    if (!isBooting) {
      ctx.fillStyle = "#1e1e1e";
      ctx.fillRect(0, 0, 1024, 640);

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 30px 'Inter', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Sanskar's Setup", 512, 260);

      const pulse = 0.5 + 0.5 * Math.abs(Math.sin(elapsed * 2.5));
      ctx.globalAlpha = pulse;
      ctx.font = "16px 'Inter', sans-serif";
      ctx.fillText("System Online", 512, 330);
      ctx.globalAlpha = 1.0;

      // eslint-disable-next-line react-hooks/immutability
      texture.needsUpdate = true;
      return;
    }

    ctx.fillStyle = "#07110c";
    ctx.fillRect(0, 0, 1024, 640);
    const glow = ctx.createRadialGradient(780, 120, 20, 780, 120, 760);
    glow.addColorStop(0, "rgba(0, 255, 136, 0.15)");
    glow.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, 1024, 640);

    ctx.fillStyle = "rgba(0, 255, 136, 0.08)";
    ctx.fillRect(34, 36, 956, 568);
    ctx.strokeStyle = "rgba(0, 255, 136, 0.45)";
    ctx.lineWidth = 2;
    ctx.strokeRect(34, 36, 956, 568);

    ctx.fillStyle = "#00ff88";
    ctx.font = "bold 22px 'JetBrains Mono', monospace";
    ctx.textAlign = "left";
    ctx.fillText("SANSKAR_AI BOOT", 66, 82);

    ctx.font = "24px 'JetBrains Mono', monospace";
    ctx.textAlign = "left";

    const totalLines = BOOT_LINES.length;
    const currentProgressIdx = (bootProgress / 100) * totalLines;
    const completedLinesCount = Math.floor(currentProgressIdx);
    const partialLineProgress = currentProgressIdx - completedLinesCount;

    let y = 140;
    for (let i = 0; i < completedLinesCount; i++) {
      const isLast = i === totalLines - 1;
      if (isLast) {
        const pulse = 0.4 + 0.6 * Math.abs(Math.sin(elapsed * 2));
        ctx.globalAlpha = pulse;
      } else {
        ctx.globalAlpha = 1;
      }
      ctx.fillStyle = "#00ff88";
      ctx.fillText(BOOT_LINES[i], 66, y);
      y += 48;
    }

    ctx.globalAlpha = 1;

    if (completedLinesCount < totalLines) {
      const activeLine = BOOT_LINES[completedLinesCount];
      const charsToShow = Math.floor(activeLine.length * partialLineProgress);
      const currentTypingLine = activeLine.slice(0, charsToShow);

      ctx.fillStyle = "#00ff88";
      ctx.fillText(currentTypingLine, 66, y);
      if (cursorVisible.current) {
        const w = ctx.measureText(currentTypingLine).width;
        ctx.fillText("|", 66 + w + 5, y);
      }
    }

    ctx.fillStyle = "rgba(0,255,136,0.12)";
    ctx.fillRect(66, 548, 820, 18);
    ctx.fillStyle = "#00ff88";
    ctx.fillRect(66, 548, 820 * (bootProgress / 100), 18);
    ctx.font = "18px 'JetBrains Mono', monospace";
    ctx.fillText(`${Math.round(bootProgress)}%`, 902, 564);

    texture.needsUpdate = true;
  }, [canvas, texture, isBooting, bootProgress]);

  return { texture, update };
}

// ─────────────────────────────────────────────────────────────────────────────
// Inner 3D Scene
// ─────────────────────────────────────────────────────────────────────────────

function RoomShell() {
  const floorTexture = useFloorTexture();
  const wallTexture = useWallTexture();
  const rugTexture = useRugTexture();
  const woodTexture = useWoodTexture();
  const fabricTexture = useFabricTexture();

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

      <group position={[2.85, 2.25, 3.73]}>
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

      <group position={[-3.1, 2.25, 3.72]}>
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

      <mesh position={[-1.25, 1.74, 3.74]} castShadow receiveShadow>
        <boxGeometry args={[1.05, 0.72, 0.06]} />
        <meshStandardMaterial color="#4b3429" roughness={0.66} />
      </mesh>
      <mesh position={[-1.25, 1.74, 3.705]} receiveShadow>
        <planeGeometry args={[0.9, 0.58]} />
        <meshStandardMaterial color="#d9965b" roughness={0.82} />
      </mesh>
      <mesh position={[-1.25, 1.74, 3.701]} receiveShadow>
        <circleGeometry args={[0.19, 32]} />
        <meshStandardMaterial color="#f4cf80" roughness={0.82} />
      </mesh>

      <pointLight position={[0, 3.45, 0.2]} color="#fff0d0" intensity={3.2} distance={8} castShadow />
      <mesh position={[0, 3.92, 0.2]} castShadow>
        <cylinderGeometry args={[0.55, 0.7, 0.18, 48]} />
        <meshStandardMaterial color="#fff4d6" emissive="#fff2c0" emissiveIntensity={0.35} roughness={0.45} />
      </mesh>
    </group>
  );
}

function SceneContent({
  onComplete,
  isBooting,
  bootProgress,
  activeSection,
  setActiveSection
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

  const modelMaterials = useMemo(() => ({
    screen: new THREE.MeshStandardMaterial({
      map: texture,
      emissive: new THREE.Color("#dbeafe"),
      emissiveMap: texture,
      emissiveIntensity: 1.45,
      roughness: 0.18,
      metalness: 0,
    }),
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
      color: "#2f6f91",
      roughness: 0.76,
      metalness: 0.02,
    }),
    pants: new THREE.MeshStandardMaterial({
      color: "#273449",
      roughness: 0.78,
    }),
    skin: new THREE.MeshStandardMaterial({
      color: "#b98262",
      roughness: 0.62,
    }),
    hair: new THREE.MeshStandardMaterial({
      color: "#1b1714",
      roughness: 0.7,
    }),
    shoes: new THREE.MeshStandardMaterial({
      color: "#e7e2d8",
      roughness: 0.58,
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
  }), [modelFabricTexture, modelWoodTexture, texture]);

  // The source GLB uses one dark material for most objects, so restore readable colors by mesh name.
  useEffect(() => {
    gltfScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;

        const name = child.name;
        const materialName = child.material instanceof THREE.Material ? child.material.name : "";

        if (materialName === "Room_FloorMat" || materialName === "Room_WallMat") {
          child.visible = false;
          return;
        }

        child.visible = true;

        if (materialName === "pc_screen" || name === "Cube.002") {
          child.material = modelMaterials.screen;
        } else if (materialName === "pc" || name === "Cube.001") {
          child.material = modelMaterials.laptop;
        } else if (name.includes("Desk")) {
          child.material = modelMaterials.desk;
        } else if (name.includes("ChairBack") || name.includes("ChairSeat") || name.includes("Underside")) {
          child.material = modelMaterials.chairFabric;
        } else if (name.includes("Leg_") || name.includes("Wheel") || name.includes("Cylinder")) {
          child.material = modelMaterials.chairMetal;
        } else if (name.includes("Ch28_Hoody")) {
          child.material = modelMaterials.hoodie;
        } else if (name.includes("Ch28_Pants")) {
          child.material = modelMaterials.pants;
        } else if (name.includes("Ch28_Body")) {
          child.material = modelMaterials.skin;
        } else if (name.includes("Ch28_Hair") || name.includes("Ch28_Eyelashes")) {
          child.material = modelMaterials.hair;
        } else if (name.includes("Ch28_Sneakers")) {
          child.material = modelMaterials.shoes;
        } else if (materialName === "Room_ShelfMat") {
          child.material = modelMaterials.shelf;
        } else if (materialName === "Room_LampMat") {
          child.material = modelMaterials.lamp;
        } else if (materialName === "Room_FrameMat") {
          child.material = modelMaterials.frame;
        }
      }
    });
  }, [gltfScene, modelMaterials]);

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
      // Move from the room view toward the laptop side and face the laptop screen.
      gsap.to(camera.position, {
        x: 0,
        y: 0.92,
        z: -1.15,
        duration: 4.2,
        ease: "power2.inOut",
        onUpdate: () => camera.lookAt(0, 0.82, -0.12),
      });
      return;
    }

    // Default standby camera looks at character's face from the FRONT
    let targetPos = { x: 0, y: 1.2, z: -1.8 };
    let targetLook = { x: 0, y: 0.95, z: 0 };

    if (activeSection === "skills") {
      targetPos = { x: 1.7, y: 1.6, z: 0 };
      targetLook = { x: 3.8, y: 1.6, z: 0 };
    } else if (activeSection === "achievements") {
      targetPos = { x: -1.7, y: 1.6, z: 0 };
      targetLook = { x: -3.8, y: 1.6, z: 0 };
    } else if (activeSection === "experience") {
      targetPos = { x: -2.2, y: 1.4, z: -1.0 };
      targetLook = { x: -2.2, y: 1.4, z: -2.44 };
    } else if (activeSection === "about") {
      // Zoom close to About Me wall panel behind character (facing negative Z)
      targetPos = { x: 0, y: 1.4, z: 1.0 };
      targetLook = { x: 0, y: 1.4, z: 3.8 };
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

  useFrame(({ clock }) => {
    update(clock.getElapsedTime());
  });

  return (
    <>
      {/* Lights - Brighter and more natural room setup */}
      <ambientLight color="#fff7e8" intensity={0.85} />
      <hemisphereLight args={["#fff7e8", "#8b7258", 1.1]} />

      {/* Main room light (ceiling) */}
      <pointLight position={[0, 3.8, 0.6]} color="#fff0d0" intensity={1.8} distance={9} castShadow />

      {/* Desk Lamp / Face Light */}
      <spotLight
        position={[-0.8, 1.7, 0.55]}
        target-position={[0, 0.9, 0]}
        color="#ffeedd"
        intensity={2.8}
        distance={5}
        angle={Math.PI / 3}
        penumbra={0.8}
        castShadow
      />

      {/* Laptop Screen Glow */}
      <pointLight
        position={[0, 0.9, -0.2]}
        color="#e0f0ff"
        intensity={1.4}
        distance={3}
      />

      <RoomShell />

      {/* ─────────────────────────────────────────────────────────────
          Environment Fixes: Floor and Front Wall
          The GLB is missing walls on the front side and the floor might be too small.
          Adding a large floor and a front wall so there's no "vacant space".
          ───────────────────────────────────────────────────────────── */}
      {/* Floating 3D badges in standby mode */}
      {!isBooting && activeSection === "none" && (
        <>
          <Html position={[0, 1.6, 3.5]} center distanceFactor={4}>
            <div className="badge-btn" onClick={() => setActiveSection("about")}>
              About Me
            </div>
          </Html>
          <Html position={[-3.6, 1.6, 0]} center distanceFactor={4}>
            <div className="badge-btn" onClick={() => setActiveSection("achievements")}>
              Projects
            </div>
          </Html>
          <Html position={[-2.2, 1.4, -2.1]} center distanceFactor={4}>
            <div className="badge-btn" onClick={() => setActiveSection("experience")}>
              Experience
            </div>
          </Html>
        </>
      )}

      {/* Virtual 3D Walls using <Html transform> formatted as physical room objects */}
      {!isBooting && (
        <>
          {/* FRONT WALL: ABOUT ME (Framed Poster) - Placed on our new Front Wall at z=3.9 */}
          <Html
            transform
            position={[0, 2.05, 3.78]}
            rotation={[0, Math.PI, 0]}
            scale={0.24}
            distanceFactor={5}
          >
            <div className="physical-frame smart-board about-board" onClick={() => setActiveSection("about")}>
              <div className="poster-content">
                <h2>SANSKAR AGRAWAL</h2>
                <h3>Software Engineer</h3>
                <img src="/photo.png" alt="Sanskar Agrawal" className="about-photo" />
                <p>Passionate about building functional, high-quality software systems. Exploring the intersection of web development and AI.</p>
                <div className="meta">
                  <span>📍 Indore, India</span> | <span>🎓 Acropolis Institute</span>
                </div>
              </div>
              {activeSection === "about" && (
                <div className="action-row" onClick={(event) => event.stopPropagation()}>
                  <button className="btn outline" onClick={() => setActiveSection("none")}>Back</button>
                  <button className="btn solid" onClick={() => onComplete("about")}>Enter</button>
                </div>
              )}
            </div>
          </Html>

          {/* RIGHT WALL: SKILLS (Whiteboard) */}
          <Html
            transform
            position={[4.48, 2.05, 0]}
            rotation={[0, -Math.PI / 2, 0]}
            scale={0.22}
            distanceFactor={5}
          >
            <div className="physical-frame smart-board skills-wall" onClick={() => setActiveSection("skills")}>
              <div className="whiteboard-header">
                <h2>Skills Wall</h2>
              </div>
              <div className="skill-tile-grid">
                {[
                  { label: "Python", icon: SVGS.python },
                  { label: "FastAPI", icon: SVGS.fastapi },
                  { label: "React", icon: SVGS.react },
                  { label: "Next.js", icon: SVGS.react },
                  { label: "TypeScript", icon: SVGS.generic },
                  { label: "LangChain", icon: SVGS.generic },
                  { label: "LangGraph", icon: SVGS.generic },
                  { label: "PostgreSQL", icon: SVGS.generic },
                  { label: "Supabase", icon: SVGS.generic },
                  { label: "Docker", icon: SVGS.docker },
                  { label: "AWS", icon: SVGS.aws },
                  { label: "GitHub", icon: SVGS.github },
                ].map((skill) => (
                  <button
                    key={skill.label}
                    className="skill-tile"
                    onClick={(event) => {
                      event.stopPropagation();
                      setActiveSection("skills");
                    }}
                  >
                    <span className="skill-icon">{skill.icon}</span>
                    <span>{skill.label}</span>
                  </button>
                ))}
              </div>
              {activeSection === "skills" && (
                <div className="action-row" onClick={(event) => event.stopPropagation()}>
                  <button className="btn outline" onClick={() => setActiveSection("none")}>Back</button>
                  <button className="btn solid" onClick={() => onComplete("skills")}>Enter</button>
                </div>
              )}
            </div>
          </Html>

          {/* LEFT WALL: PROJECTS (Corkboard) */}
          <Html
            transform
            position={[-4.48, 2.05, 0]}
            rotation={[0, Math.PI / 2, 0]}
            scale={0.22}
            distanceFactor={5}
          >
            <div className="physical-frame smart-board projects-board" onClick={() => setActiveSection("achievements")}>
              <div className="corkboard-content">
                <div className="polaroid p1">
                  <h4>Hire a Human</h4>
                  <p>Autonomous AI Agent for candidate screening.</p>
                </div>
                <div className="polaroid p2">
                  <h4>D2C Assistant</h4>
                  <p>AI agent tracking e-commerce sales.</p>
                </div>
                <div className="polaroid p3">
                  <h4>Medical RAG</h4>
                  <p>Local LLM Q&A for medical textbooks.</p>
                </div>
              </div>
              {activeSection === "achievements" && (
                <div className="action-row" onClick={(event) => event.stopPropagation()}>
                  <button className="btn outline dark" onClick={() => setActiveSection("none")}>Back</button>
                  <button className="btn solid dark" onClick={() => onComplete("projects")}>Enter</button>
                </div>
              )}
            </div>
          </Html>

          {/* BACK-LEFT WALL: EXPERIENCE (Certificate Frame) */}
          <Html
            transform
            position={[-2.2, 2.02, -3.42]}
            rotation={[0, 0, 0]}
            scale={0.22}
            distanceFactor={5}
          >
            <div className="physical-frame smart-board experience-board" onClick={() => setActiveSection("experience")}>
              <h2>Experience & Education</h2>
              <div className="cert-body">
                <div className="cert-item">
                  <h3>Full Stack AI Intern</h3>
                  <p>Maurice Engineering Works</p>
                  <small>Mar 2025 – May 2025</small>
                </div>
                <div className="cert-item">
                  <h3>B.Tech in Computer Science</h3>
                  <p>Acropolis Institute of Technology</p>
                  <small>Aug 2023 – Jun 2027</small>
                </div>
              </div>
              {activeSection === "experience" && (
                <div className="action-row" onClick={(event) => event.stopPropagation()}>
                  <button className="btn outline" onClick={() => setActiveSection("none")}>Back</button>
                  <button className="btn solid" onClick={() => onComplete("experience")}>Enter</button>
                </div>
              )}
            </div>
          </Html>
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
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export default function OpeningScene({ onComplete }: OpeningSceneProps) {
  const [isMobile] = useState(() => typeof window !== "undefined" && window.innerWidth < 768);
  const [isBooting, setIsBooting] = useState(false);
  const [bootProgress, setBootProgress] = useState(0);
  const [activeSection, setActiveSection] = useState<"skills" | "experience" | "achievements" | "about" | "none">("none");

  const triggerBoot = useCallback(() => {
    if (isBooting) return;
    setActiveSection("none");
    setIsBooting(true);

    const interval = setInterval(() => {
      setBootProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            onComplete();
          }, 1200);
          return 100;
        }
        return prev + 1;
      });
    }, 45);
  }, [isBooting, onComplete]);

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
          width: 800px;
          height: 500px;
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
          bottom: 30px;
          right: 30px;
          display: flex;
          gap: 15px;
        }
        .btn {
          padding: 10px 20px;
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          border-radius: 4px;
          cursor: pointer;
          transition: 0.2s;
        }
        .btn.outline { background: transparent; border: 2px solid #333; color: #333; }
        .btn.outline:hover { background: rgba(0,0,0,0.05); }
        .btn.solid { background: #333; border: 2px solid #333; color: #fff; }
        .btn.solid:hover { background: #111; border-color: #111; }

        .btn.outline.dark { border-color: #fff; color: #fff; }
        .btn.outline.dark:hover { background: rgba(255,255,255,0.1); }
        .btn.solid.dark { background: #fff; border-color: #fff; color: #333; }
        .btn.solid.dark:hover { background: #f0f0f0; }

        .physical-frame {
          width: 1320px;
          height: 820px;
        }

        .smart-board {
          border: 18px solid #1f2933;
          border-radius: 10px;
          box-shadow: 0 24px 60px rgba(0,0,0,0.42), inset 0 0 0 2px rgba(255,255,255,0.18);
          overflow: hidden;
          cursor: pointer;
        }

        .about-board {
          background: linear-gradient(135deg, #f8f4eb 0%, #fffdfa 100%);
          color: #172033;
          padding: 64px;
          text-align: left;
          overflow-y: auto;
        }
        .about-board .poster-content {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 360px;
          gap: 48px;
          align-items: center;
          min-height: 100%;
        }
        .about-board h2 { font-size: 82px; line-height: 0.95; letter-spacing: 0; margin: 0 0 18px; }
        .about-board h3 { font-size: 34px; line-height: 1.2; margin: 0 0 32px; color: #31506e; }
        .about-board p { font-size: 28px; line-height: 1.45; max-width: 760px; margin: 0 0 32px; }
        .about-board .meta { display: grid; gap: 14px; font-size: 24px; color: #4b5d73; }
        .about-board .about-photo { width: 320px; height: 320px; border: 10px solid #ffffff; box-shadow: 0 18px 40px rgba(31,41,55,0.22); }

        .skills-wall {
          background: #f8fafc;
          border-color: #cbd5e1;
          padding: 42px;
          color: #182333;
        }
        .skills-wall .whiteboard-header { margin-bottom: 28px; padding-bottom: 18px; border-bottom: 4px solid #dbe3ee; }
        .skills-wall h2 { font-size: 58px; color: #173b65; }
        .skill-tile-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 22px;
          height: calc(100% - 118px);
        }
        .skill-tile {
          border: 3px solid #d7e1ea;
          background: linear-gradient(180deg, #ffffff 0%, #edf4fb 100%);
          color: #172033;
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
          font-family: 'Inter', sans-serif;
          font-size: 30px;
          font-weight: 800;
          box-shadow: 0 12px 24px rgba(30, 58, 88, 0.12);
          cursor: pointer;
        }
        .skill-icon { color: #0f766e; transform: scale(2.2); margin-bottom: 14px; }

        .projects-board {
          background: #b98352;
          border-color: #5b3826;
          padding: 56px;
        }
        .projects-board .corkboard-content {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 32px;
          height: 100%;
          position: static;
        }
        .projects-board .polaroid {
          position: static;
          width: auto;
          padding: 36px;
          background: #fff7df;
          transform: none;
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .projects-board .polaroid h4 { font-size: 42px; line-height: 1.05; margin-bottom: 22px; }
        .projects-board .polaroid p { font-size: 26px; line-height: 1.35; }

        .experience-board {
          background: linear-gradient(135deg, #fff9eb 0%, #f3e3c0 100%);
          border-color: #6f4a2e;
          padding: 52px;
          color: #172033;
        }
        .experience-board h2 { font-size: 56px; margin: 0 0 36px; border-bottom: 4px solid #b88a3d; padding-bottom: 20px; }
        .experience-board .cert-body { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; align-items: stretch; }
        .experience-board .cert-item {
          border-left: 8px solid #9b6c32;
          background: rgba(255,255,255,0.68);
          padding: 28px;
          text-align: left;
          box-shadow: 0 12px 24px rgba(75, 50, 25, 0.12);
        }
        .experience-board .cert-item h3 { font-size: 34px; }
        .experience-board .cert-item p { font-size: 25px; }
        .experience-board .cert-item small { font-size: 20px; }

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

      `}</style>

      <Canvas
        camera={{ position: [0, 1.2, -1.8], fov: 45 }}
        style={{ width: "100%", height: "100%" }}
        shadows
        gl={{ antialias: true }}
      >
        <Suspense fallback={null}>
          <SceneContent
            onComplete={onComplete}
            isBooting={isBooting}
            bootProgress={bootProgress}
            activeSection={activeSection}
            setActiveSection={setActiveSection}
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
    </div>
  );
}

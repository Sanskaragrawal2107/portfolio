"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function CustomCursor() {
  const [visible, setVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  // Smooth springs for tracking the cursor
  const springConfig = { stiffness: 450, damping: 25 };
  const x = useSpring(cursorX, springConfig);
  const y = useSpring(cursorY, springConfig);

  useEffect(() => {
    // Disable custom cursor on touch screens (tablet/mobile)
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    if (isTouch) return;

    setVisible(true);

    const moveCursor = (e: MouseEvent) => {
      // Offset slightly to center the block on the cursor hot spot
      cursorX.set(e.clientX - 6);
      cursorY.set(e.clientY - 10);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      // Determine if hovering over clickable/interactive elements
      const isClickable =
        target.tagName === "A" ||
        target.tagName === "BUTTON" ||
        target.closest("button") ||
        target.closest("a") ||
        target.closest(".interactive") ||
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA";

      setIsHovered(!!isClickable);
    };

    window.addEventListener("mousemove", moveCursor);
    window.addEventListener("mouseover", handleMouseOver);

    // Hide the default browser cursor
    document.body.style.cursor = "none";
    
    // Globally override the cursor style for interactive items
    const style = document.createElement("style");
    style.innerHTML = `
      a, button, input, textarea, [role="button"], .interactive {
        cursor: none !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      window.removeEventListener("mouseover", handleMouseOver);
      document.body.style.cursor = "auto";
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }
    };
  }, [cursorX, cursorY]);

  if (!visible) return null;

  return (
    <motion.div
      style={{
        position: "fixed",
        left: x,
        top: y,
        pointerEvents: "none",
        zIndex: 9999,
      }}
      animate={{
        width: isHovered ? 24 : 12,
        height: 20,
        backgroundColor: "#00ff88",
        boxShadow: isHovered
          ? "0 0 16px rgba(0, 255, 136, 0.9)"
          : "0 0 8px rgba(0, 255, 136, 0.4)",
      }}
      className="hidden md:block select-none pointer-events-none opacity-90 mix-blend-screen"
    />
  );
}

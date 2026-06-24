"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function CustomCursor() {
  const [visible, setVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isPlayful, setIsPlayful] = useState(false);
  
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

    // Observe changes on document.body's class list
    const checkPlayful = () => {
      setIsPlayful(document.body.classList.contains("playful-theme"));
    };
    checkPlayful();

    const observer = new MutationObserver(checkPlayful);
    observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });

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
      observer.disconnect();
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
        width: isHovered ? 28 : 16,
        height: isHovered ? 28 : 16,
        backgroundColor: isPlayful ? (isHovered ? "#8B5CF6" : "#1E293B") : "#00ff88",
        borderRadius: isPlayful ? (isHovered ? "4px" : "9999px") : "0px",
        boxShadow: isPlayful
          ? (isHovered ? "2px 2px 0px #1E293B" : "none")
          : (isHovered 
              ? "0 0 18px #00ff88, 0 0 6px #00ff88, 3px 3px 0px #000000" 
              : "0 0 12px #00ff88, 0 0 4px #00ff88, 2px 2px 0px #000000"),
      }}
      className={`hidden md:block select-none pointer-events-none opacity-100 mix-blend-normal border-2 border-black`}
    />
  );
}

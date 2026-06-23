"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";

export default function ScrollProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Check if we are on a client environment
    if (typeof window === "undefined") return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
    });

    lenisRef.current = lenis;

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Global listener for custom events to trigger smooth scrolls
    const handleScrollTo = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.target) {
        lenis.scrollTo(customEvent.detail.target, {
          duration: 1.5,
          offset: customEvent.detail.offset || 0,
        });
      }
    };

    window.addEventListener("scroll-to-element", handleScrollTo);

    return () => {
      window.removeEventListener("scroll-to-element", handleScrollTo);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}

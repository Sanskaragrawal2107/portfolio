"use client";

import { useEffect, useState } from "react";

export default function TerminalOverlay({ onComplete }: { onComplete: () => void }) {
  const [lines, setLines] = useState<string[]>([]);
  const [flash, setFlash] = useState(false);

  const terminalSequence = [
    "Initializing Sanskar_AI...",
    "Loading RAG pipeline............. ✓",
    "Connecting MCP servers........... ✓",
    "GitHub MCP linked................ ✓",
    "LeetCode MCP linked.............. ✓",
    "Knowledge base ready............. ✓",
    "Ready.",
  ];

  useEffect(() => {
    let currentLineIndex = 0;
    let currentCharIndex = 0;
    let currentText = "";

    const typeNextChar = () => {
      if (currentLineIndex >= terminalSequence.length) {
        // Typing finished! Trigger flash transition
        setTimeout(() => {
          setFlash(true);
          setTimeout(() => {
            onComplete();
          }, 300);
        }, 800);
        return;
      }

      const targetLine = terminalSequence[currentLineIndex];

      if (currentCharIndex < targetLine.length) {
        currentText += targetLine[currentCharIndex];
        setLines((prev) => {
          const updated = [...prev];
          updated[currentLineIndex] = currentText;
          return updated;
        });
        currentCharIndex++;

        // Faster typewriter for dots
        const delay = targetLine[currentCharIndex - 1] === "." ? 30 : 60;
        setTimeout(typeNextChar, delay);
      } else {
        currentLineIndex++;
        currentCharIndex = 0;
        currentText = "";
        setTimeout(typeNextChar, 100);
      }
    };

    const startTimeout = setTimeout(typeNextChar, 200);
    return () => clearTimeout(startTimeout);
  }, [onComplete]);

  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden flex items-center justify-center p-6 font-mono select-none">
      <div className="w-full max-w-md text-[#00ff88] text-xs sm:text-sm leading-relaxed tracking-wider font-mono">
        {lines.map((line, idx) => (
          <div key={idx} className="min-h-[20px] flex items-center">
            <span className="text-zinc-600 mr-2.5 select-none">&gt;</span>
            <span>{line}</span>
            {idx === lines.length - 1 && idx < terminalSequence.length - 1 && (
              <span className="ml-1 w-1.5 h-3.5 bg-[#00ff88] animate-pulse inline-block" />
            )}
          </div>
        ))}
        {lines.length === terminalSequence.length && (
          <div className="mt-4 text-[10px] text-zinc-500 animate-pulse">
            SYS_STATUS: BOOT_SEQUENCE_COMPLETE (MOBILE_FALLBACK)
          </div>
        )}
      </div>

      {/* Screen flash for transition */}
      {flash && (
        <div className="absolute inset-0 bg-[#00ff88] z-50 transition-opacity duration-300 opacity-100" />
      )}
    </div>
  );
}

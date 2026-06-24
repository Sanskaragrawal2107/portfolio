"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";

import ChatInterface from "@/components/ChatInterface";
import ProjectsSection from "@/components/ProjectsSection";
import CTASection from "@/components/CTASection";

// Dynamic import — no SSR (Three.js requires browser APIs)
const OpeningScene = dynamic(
  () => import("@/components/OpeningScene"),
  { ssr: false }
);

export default function Home() {
  const [booted, setBooted] = useState(false);

  useEffect(() => {
    if (booted) {
      document.body.classList.add("playful-theme");
      document.body.style.backgroundColor = "#FFFDF5";
      document.body.style.color = "#1E293B";
    } else {
      document.body.classList.remove("playful-theme");
      document.body.style.backgroundColor = "#000000";
      document.body.style.color = "#f0f0f0";
    }
  }, [booted]);

  const handleSceneComplete = (section?: "about" | "skills" | "experience" | "projects") => {
    setBooted(true);

    if (section) {
      setTimeout(() => {
        if (section === "projects") {
          // Find the projects section element and scroll smoothly to it
          const el = document.getElementById("projects-section");
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        } else if (section === "about") {
          // Dispatch custom event to trigger AI response about general profile
          window.dispatchEvent(
            new CustomEvent("prefill-chat", {
              detail: { message: "Tell me about Sanskar Agrawal and show his profile." },
            })
          );
        } else if (section === "skills") {
          // Trigger technical skills breakdown
          window.dispatchEvent(
            new CustomEvent("prefill-chat", {
              detail: { message: "What tech stack and technical skills does Sanskar work with?" },
            })
          );
        } else if (section === "experience") {
          // Trigger experience and history timeline
          window.dispatchEvent(
            new CustomEvent("prefill-chat", {
              detail: { message: "What is Sanskar's work experience and education background?" },
            })
          );
        }
      }, 1000); // Wait for the transition fade animation to complete
    }
  };

  return (
    <main className={`w-full min-h-screen transition-colors duration-500 ${booted ? "bg-[#FFFDF5] text-[#1E293B]" : "bg-black text-white"}`}>
      <AnimatePresence mode="wait">
        {!booted ? (
          <motion.div
            key="opening"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.6 } }}
            style={{ position: "fixed", inset: 0, zIndex: 50 }}
          >
            <OpeningScene onComplete={handleSceneComplete} />
          </motion.div>
        ) : (
          <motion.div
            key="portfolio"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="w-full flex flex-col"
          >
            <ChatInterface />
            <div id="projects-section">
              <ProjectsSection />
            </div>
            <CTASection />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

"use client";

import { motion } from "framer-motion";
import { Mail, Terminal } from "lucide-react";
import GithubIcon from "./GithubIcon";

export default function CTASection() {
  const line1 = "You've been talking to my AI.";
  const line2 = "Imagine what I could build for you.";

  const words1 = line1.split(" ");
  const words2 = line2.split(" ");

  // Container variants to stagger word appearances
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const wordVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 150,
        damping: 15,
      },
    },
  };

  return (
    <section className="min-h-screen bg-black flex flex-col justify-between items-center py-20 px-6 relative overflow-hidden text-center select-none border-t border-[#1f1f1f]">
      {/* Glow background accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#00ff88] rounded-full blur-3xl opacity-5 pointer-events-none" />

      {/* spacer to push center content down */}
      <div className="h-10" />

      {/* Main CTA Typography */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="max-w-3xl space-y-6"
      >
        <div className="flex flex-wrap justify-center gap-x-3 gap-y-1">
          {words1.map((word, idx) => (
            <motion.span
              key={idx}
              variants={wordVariants}
              className="text-2xl sm:text-4xl md:text-5xl font-heading font-medium tracking-tight text-zinc-400"
            >
              {word}
            </motion.span>
          ))}
        </div>

        <div className="flex flex-wrap justify-center gap-x-3 gap-y-1">
          {words2.map((word, idx) => (
            <motion.span
              key={idx}
              variants={wordVariants}
              className="text-3xl sm:text-5xl md:text-6xl font-heading font-extrabold tracking-tight text-zinc-100"
            >
              {word === "build" ? (
                <span className="text-[#00ff88] relative">
                  build
                  <span className="absolute -bottom-1.5 left-0 right-0 h-1 bg-[#00ff88]/30 rounded-full" />
                </span>
              ) : (
                word
              )}
            </motion.span>
          ))}
        </div>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 100, damping: 15, delay: 1 }}
          className="flex flex-col sm:flex-row justify-center gap-4 pt-10"
        >
          <a
            href="mailto:sanskar.agrawal@example.com" // [FILL IN: Your contact email]
            className="flex items-center justify-center gap-2 px-6 py-3.5 rounded bg-[#00ff88] hover:bg-[#02e67c] text-black text-sm font-bold shadow-[0_0_15px_rgba(0,255,136,0.35)] hover:shadow-[0_0_25px_rgba(0,255,136,0.55)] transition-all duration-300 cursor-none interactive"
          >
            <Mail className="w-4 h-4" />
            <span>Let's Connect</span>
          </a>
          <a
            href="https://github.com/sanskaragrawal" // [FILL IN: Your Github link]
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-6 py-3.5 rounded bg-[#111111] hover:bg-[#1a1a1a] border border-[#1f1f1f] hover:border-[#00ff88]/40 text-sm text-zinc-300 hover:text-zinc-100 transition-all duration-300 cursor-none interactive"
          >
            <GithubIcon className="w-4 h-4" />
            <span>View GitHub</span>
          </a>
        </motion.div>
      </motion.div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 1.2 }}
        className="w-full max-w-lg space-y-3 font-mono text-[10px] text-zinc-600 mt-20"
      >
        <div className="flex justify-center items-center gap-2">
          <Terminal className="w-3 h-3 text-[#00ff88]" />
          <span>Built with RAG + LangGraph + MCP</span>
        </div>
        <p>
          &copy; {new Date().getFullYear()} Sanskar. All Rights Reserved. Production v1.0
        </p>
      </motion.div>
    </section>
  );
}

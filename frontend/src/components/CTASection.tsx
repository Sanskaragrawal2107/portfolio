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
    <section className="min-h-screen bg-[#FFFDF5] bg-dot-grid flex flex-col justify-between items-center py-20 px-6 relative overflow-hidden text-center select-none border-t-2 border-[#1E293B]">
      {/* Decorative floating shapes in background */}
      <div className="absolute top-12 left-12 w-16 h-16 rounded-full bg-[#F472B6] border-2 border-[#1E293B] shadow-pop-sm pointer-events-none opacity-20 hidden md:block" />
      <div className="absolute bottom-24 right-16 w-20 h-20 bg-[#FBBF24] border-2 border-[#1E293B] shadow-pop pointer-events-none opacity-20 hidden md:block rotate-12" />

      {/* spacer to push center content down */}
      <div className="h-10" />

      {/* Main CTA Typography */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="max-w-3xl space-y-6 z-10"
      >
        <div className="flex flex-wrap justify-center gap-x-3 gap-y-1">
          {words1.map((word, idx) => (
            <motion.span
              key={idx}
              variants={wordVariants}
              className="text-2xl sm:text-4xl md:text-5xl font-heading font-medium tracking-tight text-[#64748B]"
            >
              {word}
            </motion.span>
          ))}
        </div>

        <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 pb-4">
          {words2.map((word, idx) => (
            <motion.span
              key={idx}
              variants={wordVariants}
              className="text-3xl sm:text-5xl md:text-6xl font-heading font-extrabold tracking-tight text-[#1E293B]"
            >
              {word === "build" ? (
                <span className="text-[#8B5CF6] relative inline-block">
                  build
                  <span className="absolute -bottom-1 left-0 right-0 h-2 bg-[#F472B6] rounded-full" />
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
            href="mailto:sanskar.agrawal@example.com"
            className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#8B5CF6] hover:bg-[#7c3aed] border-2 border-[#1E293B] text-white text-sm font-bold shadow-pop hover:shadow-pop-lg transition-bounce active:translate-x-[1px] active:translate-y-[1px] active:shadow-pop cursor-none interactive"
          >
            <Mail className="w-4 h-4" />
            <span>Let's Connect</span>
          </a>
          <a
            href="https://github.com/sanskaragrawal"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-[#FBBF24] border-2 border-[#1E293B] shadow-pop-sm hover:shadow-pop text-sm font-bold text-[#1E293B] transition-bounce cursor-none interactive"
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
        className="w-full max-w-lg space-y-4 font-mono text-[10px] text-[#64748B] mt-20"
      >
        <div className="flex justify-center items-center">
          <div className="flex items-center gap-2 px-3 py-1 rounded bg-[#34D399] border-2 border-[#1E293B] text-[#1E293B] font-bold shadow-pop-sm">
            <Terminal className="w-3.5 h-3.5 text-[#1E293B]" />
            <span>Built with RAG + LangGraph + MCP</span>
          </div>
        </div>
        <p className="font-semibold">
          &copy; {new Date().getFullYear()} Sanskar. All Rights Reserved. Production v1.0
        </p>
      </motion.div>
    </section>
  );
}

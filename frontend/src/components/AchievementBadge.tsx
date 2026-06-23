"use client";

import { motion } from "framer-motion";
import { Trophy, Star, Award } from "lucide-react";

export default function AchievementBadge() {
  const achievements = [
    {
      title: "1st Place Winner - AI Hackathon 2025",
      desc: "Built a collaborative LangGraph system with custom MCP integration.",
      badge: "Champion",
    },
    {
      title: "Winner - Global GenAI Hackfest 2024",
      desc: "Created a real-time web scraping and reasoning tool utilizing ZenRows.",
      badge: "Best AI Tool",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 50, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className="w-full md:w-[320px] bg-[#111111] border border-[#1f1f1f] rounded-lg p-5 font-sans relative overflow-hidden group shadow-[0_4px_24px_rgba(0,0,0,0.4)]"
    >
      {/* Decorative top green glow */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#00ff88] opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="absolute -top-12 -right-12 w-24 h-24 bg-[#00ff88] rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none" />

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#00ff88]/10 flex items-center justify-center border border-[#00ff88]/20 text-[#00ff88] shadow-[0_0_10px_rgba(0,255,136,0.2)]">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-zinc-100">Hackathon Wins</h4>
            <p className="text-[11px] text-zinc-500 font-mono">Achievements Verified</p>
          </div>
        </div>

        <hr className="border-[#1f1f1f]" />

        <div className="space-y-3.5">
          {achievements.map((ach, idx) => (
            <div
              key={idx}
              className="bg-[#0a0a0a] border border-[#1f1f1f] rounded p-3 relative group/item hover:border-[#00ff88]/20 transition-colors"
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-[10px] font-mono text-[#00ff88] bg-[#00ff88]/10 border border-[#00ff88]/20 px-1.5 py-0.5 rounded">
                  {ach.badge}
                </span>
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
              </div>
              <h5 className="text-xs font-bold text-zinc-100 leading-snug">
                {ach.title}
              </h5>
              <p className="text-[11px] text-zinc-400 mt-1 leading-normal">
                {ach.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

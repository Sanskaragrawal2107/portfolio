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
      className="w-full md:w-[320px] bg-white border-2 border-[#1E293B] rounded-2xl p-5 font-sans relative overflow-hidden group shadow-pop-tertiary hover:scale-[1.02] transition-bounce select-none"
    >
      <div className="absolute -top-12 -right-12 w-24 h-24 bg-[#FBBF24] rounded-full blur-3xl opacity-10 pointer-events-none" />

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FBBF24] flex items-center justify-center border-2 border-[#1E293B] text-[#1E293B] shadow-pop-sm">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-[#1E293B]">Hackathon Wins</h4>
            <p className="text-[10px] text-[#64748B] font-mono font-bold">Achievements Verified</p>
          </div>
        </div>

        <hr className="border-t-2 border-[#E2E8F0]" />

        <div className="space-y-4">
          {achievements.map((ach, idx) => (
            <div
              key={idx}
              className="bg-[#F8FAFC] border-2 border-[#1E293B] rounded-xl p-3 relative shadow-pop-sm hover:-translate-y-0.5 transition-transform duration-200"
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-[9px] font-extrabold text-[#8B5CF6] bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 px-2 py-0.5 rounded-full font-mono">
                  {ach.badge}
                </span>
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" />
              </div>
              <h5 className="text-xs font-extrabold text-[#1E293B] leading-snug">
                {ach.title}
              </h5>
              <p className="text-[11px] text-[#64748B] mt-1 leading-normal font-semibold">
                {ach.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

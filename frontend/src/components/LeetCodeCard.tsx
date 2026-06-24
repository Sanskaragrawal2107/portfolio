"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Award, Zap, Code, Loader2 } from "lucide-react";

interface LeetCodeData {
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  ranking: number;
}

export default function LeetCodeCard() {
  const [data, setData] = useState<LeetCodeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLeetCodeData() {
      try {
        const username = process.env.NEXT_PUBLIC_LEETCODE_USERNAME || "sanskaragrawal";
        const res = await fetch(`/api/leetcode?username=${username}`);
        if (!res.ok) {
          throw new Error("Failed to load LeetCode stats");
        }
        const json = await res.json();
        if (json.success) {
          setData(json);
        } else {
          throw new Error(json.error || "LeetCode fetch error");
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchLeetCodeData();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, x: 50, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className="w-full md:w-[320px] bg-white border-2 border-[#1E293B] rounded-2xl p-5 font-sans relative overflow-hidden group shadow-pop-secondary hover:scale-[1.02] transition-bounce select-none"
    >
      <div className="absolute -top-12 -right-12 w-24 h-24 bg-[#F472B6] rounded-full blur-3xl opacity-10 pointer-events-none" />

      {loading ? (
        <div className="flex flex-col items-center justify-center py-8 text-[#64748B] gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-[#8B5CF6]" />
          <span className="text-xs font-mono font-bold">Syncing LeetCode MCP...</span>
        </div>
      ) : error || !data ? (
        <div className="text-center py-4">
          <p className="text-xs text-[#8B5CF6] font-mono font-bold mb-1">LEETCODE CONNECTION</p>
          <p className="text-xs text-[#64748B] font-semibold">
            {error || "Could not retrieve live metrics. Live RAG agent has info."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FBBF24] flex items-center justify-center border-2 border-[#1E293B] text-[#1E293B] font-extrabold text-base shadow-pop-sm select-none">
              LC
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-[#1E293B]">LeetCode Stats</h4>
              <p className="text-[10px] text-[#64748B] font-mono font-bold">@leetcode/active</p>
            </div>
            <div className="ml-auto">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-[#34D399] text-[#1E293B] border-2 border-[#1E293B] shadow-pop-sm animate-pulse">
                SYNCED
              </span>
            </div>
          </div>

          <div className="bg-white border-2 border-[#1E293B] rounded-xl p-3 flex justify-between items-center shadow-pop-sm">
            <div>
              <p className="text-[9px] text-[#64748B] uppercase tracking-widest font-mono font-extrabold">
                Global Ranking
              </p>
              <p className="text-lg font-extrabold text-[#1E293B] font-mono mt-0.5">
                #{data.ranking.toLocaleString()}
              </p>
            </div>
            <Award className="w-8 h-8 text-[#8B5CF6]" />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-end pb-1">
              <span className="text-xs text-[#1E293B] font-bold flex items-center gap-1.5">
                <Code className="w-3.5 h-3.5 text-[#8B5CF6]" />
                Problems Solved
              </span>
              <span className="text-sm font-extrabold text-[#1E293B] font-mono">
                {data.totalSolved}
              </span>
            </div>

            {/* Easy Stats */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-mono font-bold text-[#64748B]">
                <span className="text-[#10B981]">Easy</span>
                <span className="text-[#1E293B]">{data.easySolved}</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 border border-[#1E293B] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#10B981] rounded-full border-r border-[#1E293B]"
                  style={{
                    width: `${Math.min(
                      100,
                      (data.easySolved / (data.totalSolved || 1)) * 100
                    )}%`,
                  }}
                />
              </div>
            </div>

            {/* Medium Stats */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-mono font-bold text-[#64748B]">
                <span className="text-[#FBBF24]">Medium</span>
                <span className="text-[#1E293B]">{data.mediumSolved}</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 border border-[#1E293B] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#FBBF24] rounded-full border-r border-[#1E293B]"
                  style={{
                    width: `${Math.min(
                      100,
                      (data.mediumSolved / (data.totalSolved || 1)) * 100
                    )}%`,
                  }}
                />
              </div>
            </div>

            {/* Hard Stats */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-mono font-bold text-[#64748B]">
                <span className="text-[#F472B6]">Hard</span>
                <span className="text-[#1E293B]">{data.hardSolved}</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 border border-[#1E293B] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#F472B6] rounded-full border-r border-[#1E293B]"
                  style={{
                    width: `${Math.min(
                      100,
                      (data.hardSolved / (data.totalSolved || 1)) * 100
                    )}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

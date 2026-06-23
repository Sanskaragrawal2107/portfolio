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
      className="w-full md:w-[320px] bg-[#111111] border border-[#1f1f1f] rounded-lg p-5 font-sans relative overflow-hidden group shadow-[0_4px_24px_rgba(0,0,0,0.4)]"
    >
      {/* Decorative top green glow */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#6366f1] opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="absolute -top-12 -right-12 w-24 h-24 bg-[#6366f1] rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none" />

      {loading ? (
        <div className="flex flex-col items-center justify-center py-8 text-zinc-500 gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
          <span className="text-xs font-mono">Syncing LeetCode MCP...</span>
        </div>
      ) : error || !data ? (
        <div className="text-center py-4">
          <p className="text-xs text-indigo-400 font-mono mb-1">LEETCODE CONNECTION</p>
          <p className="text-xs text-zinc-500">
            {error || "Could not retrieve live metrics. Live RAG agent has info."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-[#f7901e]/10 flex items-center justify-center border border-[#f7901e]/20 text-[#f7901e] font-bold text-lg select-none">
              LC
            </div>
            <div>
              <h4 className="text-sm font-semibold text-zinc-100">LeetCode Profile</h4>
              <p className="text-[11px] text-zinc-500 font-mono">@leetcode/mcp-active</p>
            </div>
            <div className="ml-auto">
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#6366f1]/10 text-indigo-400 border border-[#6366f1]/20 animate-pulse">
                SYNCED
              </span>
            </div>
          </div>

          <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded p-3 flex justify-between items-center">
            <div>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">
                Global Ranking
              </p>
              <p className="text-lg font-bold text-zinc-100 font-mono mt-0.5">
                #{data.ranking.toLocaleString()}
              </p>
            </div>
            <Award className="w-8 h-8 text-indigo-400 opacity-80" />
          </div>

          <div className="space-y-2.5">
            <div className="flex justify-between items-end">
              <span className="text-xs text-zinc-400 flex items-center gap-1.5">
                <Code className="w-3.5 h-3.5 text-[#00ff88]" />
                Problems Solved
              </span>
              <span className="text-sm font-bold text-zinc-100 font-mono">
                {data.totalSolved}
              </span>
            </div>

            {/* Easy Stats */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                <span>Easy</span>
                <span className="text-zinc-300">{data.easySolved}</span>
              </div>
              <div className="w-full h-1.5 bg-[#1f1f1f] rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
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
              <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                <span>Medium</span>
                <span className="text-zinc-300">{data.mediumSolved}</span>
              </div>
              <div className="w-full h-1.5 bg-[#1f1f1f] rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
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
              <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                <span>Hard</span>
                <span className="text-zinc-300">{data.hardSolved}</span>
              </div>
              <div className="w-full h-1.5 bg-[#1f1f1f] rounded-full overflow-hidden">
                <div
                  className="h-full bg-rose-500 rounded-full"
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

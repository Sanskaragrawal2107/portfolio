"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { GitBranch, Users, Code2, ShieldCheck, Loader2 } from "lucide-react";

interface GitHubData {
  name: string;
  avatarUrl: string;
  bio: string;
  publicRepos: number;
  followers: number;
  following: number;
  languages: string[];
}

export default function GitHubCard() {
  const [data, setData] = useState<GitHubData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchGitHubData() {
      try {
        const username = process.env.NEXT_PUBLIC_GITHUB_USERNAME || "sanskaragrawal";
        const res = await fetch(`/api/github?username=${username}`);
        if (!res.ok) {
          throw new Error("Failed to load GitHub stats");
        }
        const json = await res.json();
        if (json.success) {
          setData(json);
        } else {
          throw new Error(json.error || "GitHub fetch error");
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchGitHubData();
  }, []);

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

      {loading ? (
        <div className="flex flex-col items-center justify-center py-8 text-zinc-500 gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-[#00ff88]" />
          <span className="text-xs font-mono">Syncing GitHub MCP...</span>
        </div>
      ) : error || !data ? (
        <div className="text-center py-4">
          <p className="text-xs text-[#00ff88] font-mono mb-1">GITHUB CONNECTION</p>
          <p className="text-xs text-zinc-500">
            {error || "Could not retrieve live metrics. Live RAG agent has info."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <img
              src={data.avatarUrl}
              alt={data.name}
              className="w-12 h-12 rounded-full border border-[#1f1f1f] bg-zinc-800"
            />
            <div className="min-w-0">
              <h4 className="text-sm font-semibold text-zinc-100 truncate">{data.name}</h4>
              <p className="text-[11px] text-zinc-500 font-mono">@github/mcp-active</p>
            </div>
            <div className="ml-auto">
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/20 animate-pulse">
                CONNECTED
              </span>
            </div>
          </div>

          <p className="text-xs text-zinc-400 leading-snug line-clamp-2">{data.bio}</p>

          <hr className="border-[#1f1f1f]" />

          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded p-2.5">
              <div className="flex justify-center text-[#00ff88] mb-1">
                <GitBranch className="w-4 h-4" />
              </div>
              <p className="text-lg font-bold text-zinc-100 font-mono">{data.publicRepos}</p>
              <p className="text-[9px] text-zinc-500 tracking-wider uppercase font-semibold">
                Repositories
              </p>
            </div>
            <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded p-2.5">
              <div className="flex justify-center text-indigo-400 mb-1">
                <Users className="w-4 h-4" />
              </div>
              <p className="text-lg font-bold text-zinc-100 font-mono">{data.followers}</p>
              <p className="text-[9px] text-zinc-500 tracking-wider uppercase font-semibold">
                Followers
              </p>
            </div>
          </div>

          <div>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono mb-2 flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5 text-[#00ff88]" />
              Top Stack Languages
            </p>
            <div className="flex flex-wrap gap-1.5">
              {data.languages.map((lang, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded bg-[#1f1f1f] text-[10px] text-zinc-300 font-mono border border-transparent hover:border-[#00ff88]/30 transition-colors"
                >
                  {lang}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

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
      className="w-full md:w-[320px] bg-white border-2 border-[#1E293B] rounded-2xl p-5 font-sans relative overflow-hidden group shadow-pop-accent hover:scale-[1.02] transition-bounce select-none"
    >
      <div className="absolute -top-12 -right-12 w-24 h-24 bg-[#8B5CF6] rounded-full blur-3xl opacity-10 pointer-events-none" />

      {loading ? (
        <div className="flex flex-col items-center justify-center py-8 text-[#64748B] gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-[#8B5CF6]" />
          <span className="text-xs font-mono font-bold">Syncing GitHub MCP...</span>
        </div>
      ) : error || !data ? (
        <div className="text-center py-4">
          <p className="text-xs text-[#8B5CF6] font-mono font-bold mb-1">GITHUB CONNECTION</p>
          <p className="text-xs text-[#64748B] font-semibold">
            {error || "Could not retrieve live metrics. Live RAG agent has info."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <img
              src={data.avatarUrl}
              alt={data.name}
              className="w-12 h-12 rounded-full border-2 border-[#1E293B] bg-slate-100 shadow-pop-sm"
            />
            <div className="min-w-0">
              <h4 className="text-sm font-extrabold text-[#1E293B] truncate">{data.name}</h4>
              <p className="text-[10px] text-[#64748B] font-mono font-bold">@github/active</p>
            </div>
            <div className="ml-auto">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-[#34D399] text-[#1E293B] border-2 border-[#1E293B] shadow-pop-sm animate-pulse">
                CONNECTED
              </span>
            </div>
          </div>

          <p className="text-xs text-[#1E293B] leading-snug line-clamp-2 font-medium">{data.bio}</p>

          <hr className="border-t-2 border-[#E2E8F0]" />

          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-white border-2 border-[#1E293B] rounded-xl p-2.5 shadow-pop-sm">
              <div className="flex justify-center text-[#8B5CF6] mb-1">
                <GitBranch className="w-4 h-4" />
              </div>
              <p className="text-lg font-extrabold text-[#1E293B] font-mono">{data.publicRepos}</p>
              <p className="text-[8px] text-[#64748B] tracking-wider uppercase font-extrabold">
                Repos
              </p>
            </div>
            <div className="bg-white border-2 border-[#1E293B] rounded-xl p-2.5 shadow-pop-sm">
              <div className="flex justify-center text-[#F472B6] mb-1">
                <Users className="w-4 h-4" />
              </div>
              <p className="text-lg font-extrabold text-[#1E293B] font-mono">{data.followers}</p>
              <p className="text-[8px] text-[#64748B] tracking-wider uppercase font-extrabold">
                Followers
              </p>
            </div>
          </div>

          <div>
            <p className="text-[9px] text-[#64748B] uppercase tracking-widest font-mono font-extrabold mb-2.5 flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5 text-[#8B5CF6]" />
              Top Stack Languages
            </p>
            <div className="flex flex-wrap gap-2">
              {data.languages.map((lang, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded bg-white text-[10px] text-[#1E293B] font-mono border border-[#1E293B] shadow-pop-sm font-bold"
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

"use client";

import { motion } from "framer-motion";
import { ArrowDownRight, FolderGit2 } from "lucide-react";

export default function ProjectsTeaser() {
  const projects = [
    { name: "LangGraph Multi-Agent RAG", id: "project-1" },
    { name: "MCP Server Manager CLI", id: "project-2" },
    { name: "IFSC Automated Verifier", id: "project-3" },
  ];

  const handleScrollToProjects = () => {
    const event = new CustomEvent("scroll-to-element", {
      detail: { target: "#projects-section", offset: -20 },
    });
    window.dispatchEvent(event);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className="mt-3 flex flex-col gap-2 font-sans"
    >
      <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-mono">
        <FolderGit2 className="w-3.5 h-3.5 text-[#00ff88]" />
        <span>REVEALED: Sanskar's Featured Systems (Click to scroll)</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {projects.map((proj, idx) => (
          <button
            key={idx}
            onClick={handleScrollToProjects}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#111111] hover:bg-[#1a1a1a] border border-[#1f1f1f] hover:border-[#00ff88]/30 text-xs text-zinc-300 hover:text-[#00ff88] transition-all duration-200 text-left cursor-none interactive"
          >
            <span>{proj.name}</span>
            <ArrowDownRight className="w-3.5 h-3.5 opacity-60" />
          </button>
        ))}
      </div>
    </motion.div>
  );
}

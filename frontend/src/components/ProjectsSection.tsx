"use client";

import { motion } from "framer-motion";
import { MessageSquarePlus, Terminal } from "lucide-react";
import GithubIcon from "./GithubIcon";

interface Project {
  name: string;
  description: string;
  tags: string[];
  githubUrl: string;
}

export default function ProjectsSection() {
  const projects: Project[] = [
    {
      name: "LangGraph Multi-Agent RAG",
      description: "A production-grade multi-agent reasoning architecture with integrated vector store and live web research tools.",
      tags: ["LangGraph", "FastAPI", "OpenAI", "Pinecone"],
      githubUrl: "https://github.com/sanskaragrawal/langgraph-multi-agent-rag", // [FILL IN: Your project github link]
    },
    {
      name: "MCP Server Manager CLI",
      description: "An automated developer CLI to manage, configure, and dynamically connect Model Context Protocol servers.",
      tags: ["TypeScript", "Node.js", "MCP", "Commander"],
      githubUrl: "https://github.com/sanskaragrawal/mcp-server-manager", // [FILL IN: Your project github link]
    },
    {
      name: "IFSC Automated Verifier",
      description: "Enterprise admin ledger tool verifying banking routing codes utilizing public APIs with dynamic spreadsheet reporting.",
      tags: ["Next.js", "Razorpay API", "ExcelJS", "Tailwind"],
      githubUrl: "https://github.com/sanskaragrawal/ifsc-verifier", // [FILL IN: Your project github link]
    },
  ];

  const handleAskAI = (projectName: string) => {
    // 1. Scroll back to Chat Section
    const scrollEvent = new CustomEvent("scroll-to-element", {
      detail: { target: "#chat-section", offset: 0 },
    });
    window.dispatchEvent(scrollEvent);

    // 2. Pre-fill chat input
    const prefillEvent = new CustomEvent("prefill-chat", {
      detail: { message: `Tell me more about ${projectName}` },
    });
    window.dispatchEvent(prefillEvent);
  };

  return (
    <section
      id="projects-section"
      className="py-24 px-6 md:px-12 max-w-7xl mx-auto w-full border-t border-[#1f1f1f] bg-[#0a0a0a]"
    >
      <div className="mb-12 space-y-2">
        <div className="flex items-center gap-2 text-xs text-[#00ff88] font-mono tracking-widest uppercase">
          <Terminal className="w-4 h-4" />
          <span>Section 03 // Showcase</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight font-heading text-zinc-100">
          Featured Engineering Projects
        </h2>
        <p className="text-sm text-zinc-500 max-w-lg">
          Custom built production-grade platforms and systems. Ask the AI assistant to query their architectural pipelines.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {projects.map((project, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ type: "spring", stiffness: 180, damping: 20, delay: idx * 0.1 }}
            className="flex flex-col bg-[#111111]/40 backdrop-blur-md border border-[#1f1f1f] rounded-lg p-6 hover:border-[#00ff88]/30 transition-all duration-300 relative group shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
          >
            {/* Hover green line element */}
            <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-[#00ff88] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />

            <div className="flex-1 space-y-4">
              <h3 className="text-xl font-bold text-zinc-100 font-heading tracking-wide group-hover:text-[#00ff88] transition-colors">
                {project.name}
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed min-h-[60px]">
                {project.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 pt-2">
                {project.tags.map((tag, tagIdx) => (
                  <span
                    key={tagIdx}
                    className="px-2 py-0.5 rounded bg-[#1f1f1f]/60 text-[10px] text-zinc-300 font-mono border border-transparent hover:border-[#6366f1]/30 transition-colors"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 mt-6 pt-4 border-t border-[#1f1f1f]">
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded bg-[#111111] hover:bg-[#1a1a1a] border border-[#1f1f1f] text-xs text-zinc-300 hover:text-zinc-100 transition-colors font-medium cursor-none interactive"
              >
                <GithubIcon className="w-3.5 h-3.5" />
                <span>GitHub</span>
              </a>
              <button
                onClick={() => handleAskAI(project.name)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded bg-[#00ff88]/10 hover:bg-[#00ff88]/20 border border-[#00ff88]/20 text-xs text-[#00ff88] transition-colors font-semibold cursor-none interactive"
              >
                <MessageSquarePlus className="w-3.5 h-3.5 animate-pulse" />
                <span>Ask AI</span>
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

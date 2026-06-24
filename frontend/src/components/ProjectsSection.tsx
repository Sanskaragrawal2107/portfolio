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

  const cardShadows = ["shadow-pop-accent", "shadow-pop-secondary", "shadow-pop-tertiary"];
  const textHighlights = ["text-[#8B5CF6]", "text-[#F472B6]", "text-[#FBBF24]"];

  return (
    <section
      id="projects-section"
      className="py-24 px-6 md:px-12 w-full border-t-2 border-[#1E293B] bg-[#FFFDF5] bg-dot-grid"
    >
      <div className="max-w-7xl mx-auto mb-12 space-y-4">
        <div className="inline-flex items-center gap-2 text-xs text-[#1E293B] bg-[#34D399] border-2 border-[#1E293B] font-mono font-bold tracking-wider px-3.5 py-1 rounded-md shadow-pop-sm select-none">
          <Terminal className="w-4 h-4" />
          <span>Section 03 // Showcase</span>
        </div>
        <h2 className="text-3xl md:text-5xl font-extrabold font-heading text-[#1E293B]">
          Featured Engineering Projects
        </h2>
        <p className="text-base text-[#64748B] max-w-lg font-medium">
          Custom built production-grade platforms and systems. Ask the AI assistant to query their architectural pipelines.
        </p>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {projects.map((project, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ type: "spring", stiffness: 180, damping: 20, delay: idx * 0.1 }}
            className={`flex flex-col bg-white border-2 border-[#1E293B] rounded-2xl p-6 transition-bounce relative group ${cardShadows[idx % 3]} hover:scale-[1.02] hover:-rotate-1`}
          >
            <div className="flex-1 space-y-4">
              <h3 className={`text-xl font-extrabold font-heading tracking-wide ${textHighlights[idx % 3]}`}>
                {project.name}
              </h3>
              <p className="text-sm text-[#1E293B] leading-relaxed min-h-[60px] font-medium">
                {project.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 pt-2">
                {project.tags.map((tag, tagIdx) => (
                  <span
                    key={tagIdx}
                    className="px-2.5 py-0.5 rounded-full bg-[#F1F5F9] text-[10px] text-[#64748B] font-bold border border-[#CBD5E1]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 mt-6 pt-4 border-t-2 border-[#E2E8F0]">
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-white hover:bg-[#FBBF24] border-2 border-[#1E293B] text-xs font-bold text-[#1E293B] transition-bounce cursor-none interactive"
              >
                <GithubIcon className="w-3.5 h-3.5" />
                <span>GitHub</span>
              </a>
              <button
                onClick={() => handleAskAI(project.name)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-[#8B5CF6] hover:bg-[#7c3aed] border-2 border-[#1E293B] text-xs font-bold text-white shadow-pop-sm hover:shadow-pop transition-bounce active:translate-x-[1px] active:translate-y-[1px] active:shadow-pop-sm cursor-none interactive"
              >
                <MessageSquarePlus className="w-3.5 h-3.5" />
                <span>Ask AI</span>
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

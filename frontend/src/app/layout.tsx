import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sanskar Agrawal — Applied AI Engineer & Backend Systems Architect | Available for Hire",
  description:
    "Hire Sanskar Agrawal — Applied AI Engineer, Backend Engineer, and Agentic Systems Specialist. Expert in LangGraph, LangChain, custom FastMCP servers, RAG pipelines, LiveKit voice AI, and Python/FastAPI production backends. Available for full-time and contract roles worldwide.",
  keywords: [
    "Hire AI Engineer",
    "Hire Applied AI Engineer",
    "Hire LangGraph Developer",
    "Hire Backend Engineer",
    "Hire Agentic AI Engineer",
    "Hire RAG Specialist",
    "Custom MCP Developer",
    "FastMCP Developer",
    "Hire Python FastAPI Developer",
    "Voice AI Engineer LiveKit",
    "Sanskar Agrawal",
    "AI Engineer Portfolio",
    "Remote AI Engineer",
    "Full-Stack AI Developer"
  ],
  authors: [{ name: "Sanskar Agrawal", url: "https://www.sanskaragrawal.tech/" }],
  creator: "Sanskar Agrawal",
  publisher: "Sanskar Agrawal",
  robots: "index, follow",
  alternates: {
    canonical: "https://www.sanskaragrawal.tech/",
  },
  openGraph: {
    type: "profile",
    title: "Sanskar Agrawal — Applied AI Engineer & Backend Architect | Available for Hire",
    description: "Applied AI Engineer & Backend Systems Architect available for hire worldwide. Building production agentic systems, LangGraph, RAG, MCP servers & full-stack web products.",
    url: "https://www.sanskaragrawal.tech/",
    siteName: "Sanskar Agrawal Portfolio",
    locale: "en_IN",
    images: [{ url: "https://www.sanskaragrawal.tech/assets/images/thumbs/sanskar-portrait.png", alt: "Sanskar Agrawal" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sanskar Agrawal — Applied AI Engineer & Backend Architect | Available for Hire",
    description: "Applied AI Engineer building production agentic AI systems, LangGraph architectures, RAG pipelines, and MCP servers for global teams.",
    images: ["https://www.sanskaragrawal.tech/assets/images/thumbs/sanskar-portrait.png"],
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full w-full m-0 p-0 overflow-hidden">
      <body className="h-full w-full m-0 p-0 overflow-hidden bg-black">
        {children}
      </body>
    </html>
  );
}

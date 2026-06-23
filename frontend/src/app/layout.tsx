import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// Import Scroll and Custom Cursor Provider
import ScrollProvider from "@/components/ScrollProvider";
import CustomCursor from "@/components/CustomCursor";

// Load Google Fonts
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sanskar.AI // Intelligent Portfolio Experience",
  description:
    "Interactive AI Chat portfolio for Sanskar (AI Systems Engineer). Built on LangGraph, FastAPI, and live Model Context Protocol integrations to LeetCode and GitHub.",
  keywords: ["AI Engineer", "LangGraph", "RAG Pipeline", "Next.js Portfolio", "Model Context Protocol", "Developer"],
  authors: [{ name: "Sanskar" }],
  openGraph: {
    title: "Sanskar.AI // Intelligent Portfolio Experience",
    description:
      "Interactive AI Chat portfolio for Sanskar (AI Systems Engineer). Built on LangGraph, FastAPI, and live Model Context Protocol integrations.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-black text-zinc-100 selection:bg-[#00ff88] selection:text-black">
        <ScrollProvider>
          <CustomCursor />
          {children}
        </ScrollProvider>
      </body>
    </html>
  );
}

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  output: "standalone",
  compress: true,
  async rewrites() {
    return [
      {
        source: "/",
        destination: "/portfolio.html",
      },
      {
        source: "/profile",
        destination: "/profile/index.html",
      },
      {
        source: "/profile/",
        destination: "/profile/index.html",
      },
      {
        source: "/experience",
        destination: "/profile/index.html",
      },
      {
        source: "/experience/",
        destination: "/profile/index.html",
      },
      {
        source: "/hire",
        destination: "/profile/index.html",
      },
      {
        source: "/hire/",
        destination: "/profile/index.html",
      },
      {
        source: "/projects/hire-a-human",
        destination: "/projects/hire-a-human/index.html",
      },
      {
        source: "/projects/hire-a-human/",
        destination: "/projects/hire-a-human/index.html",
      },
      {
        source: "/projects/d2c-ai-employee",
        destination: "/projects/d2c-ai-employee/index.html",
      },
      {
        source: "/projects/d2c-ai-employee/",
        destination: "/projects/d2c-ai-employee/index.html",
      },
      {
        source: "/projects/medical-rag",
        destination: "/projects/medical-rag/index.html",
      },
      {
        source: "/projects/medical-rag/",
        destination: "/projects/medical-rag/index.html",
      },
      {
        source: "/projects/manufacturing-automation",
        destination: "/projects/manufacturing-automation/index.html",
      },
      {
        source: "/projects/manufacturing-automation/",
        destination: "/projects/manufacturing-automation/index.html",
      },
      {
        source: "/services/ai-development",
        destination: "/services/ai-development/index.html",
      },
      {
        source: "/services/ai-development/",
        destination: "/services/ai-development/index.html",
      },
      {
        source: "/services/web-development",
        destination: "/services/web-development/index.html",
      },
      {
        source: "/services/web-development/",
        destination: "/services/web-development/index.html",
      },
      {
        source: "/api/chat/stream",
        destination: `${process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "http://65.0.141.163:8000"}/chat/stream`,
      },
    ];
  },
};

export default nextConfig;

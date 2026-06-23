# Sanskar.AI // Intelligent AI Portfolio Website

A premium, production-ready portfolio website for Sanskar (AI Systems Engineer) featuring a 3D opening scene (bypassed on mobile for efficiency) and a dark full-screen chat interface. Information reveals itself reactively using slide-in widgets when topics like GitHub stats, LeetCode ranks, achievements, and projects are conversational themes.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS v4 (theme integration directly inside `globals.css`)
- **Animations**: Framer Motion (spring-physics transitions) & GSAP (dolly-in camera control)
- **3D Engine**: React Three Fiber (Three.js) loaded lazily
- **Scroll Physics**: Lenis smooth scroll
- **AI Streaming**: ReadableStream SSE parser interfacing with FastAPI backend

---

## 📁 File Structure

```text
frontend/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── github/route.ts        # Secure GitHub proxy cache
│   │   │   └── leetcode/route.ts      # Secure LeetCode GraphQL API query
│   │   ├── globals.css                # Custom theme variables & animation keyframes
│   │   ├── layout.tsx                 # Google fonts load & smooth scroll wrap
│   │   └── page.tsx                   # Boot controller and layout orchestrator
│   └── components/
│       ├── CustomCursor.tsx           # Bounding green block cursor (desktop only)
│       ├── ScrollProvider.tsx         # Lenis scroll controller
│       ├── OpeningScene.tsx           # 3D Silhouette desk scene & typewriter boot
│       ├── TerminalOverlay.tsx        # Lightweight fallback terminal boot
│       ├── ChatInterface.tsx          # SSE client, UUID engine, keyword hooks
│       ├── GitHubCard.tsx             # Interactive slide-in GitHub stats
│       ├── LeetCodeCard.tsx           # Interactive slide-in LeetCode stats
│       ├── AchievementBadge.tsx       # Shiny trophies detailing hackathon wins
│       ├── ProjectsTeaser.tsx         # Inline project chip prompts (trigger once)
│       └── ProjectsSection.tsx        # Horizontal glassmorphism cards
│       └── CTASection.tsx             # Staggered typography CTA & footer
├── .env.local                         # Environment settings
├── package.json
└── README.md
```

---

## ⚙️ Setup & Installation

### 1. Install Dependencies
Navigate into the `frontend` folder and install:
```bash
cd frontend
npm install
```

### 2. Configure Environment Variables
Create or open the `.env.local` file at the root of the `frontend` folder:
```ini
# FastAPI Backend URL (streaming endpoint)
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000

# Social Profiles
NEXT_PUBLIC_GITHUB_USERNAME=sanskaragrawal
NEXT_PUBLIC_LEETCODE_USERNAME=sanskaragrawal
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application locally.

### 4. Build for Production
```bash
npm run build
```

---

## 🎨 Customization Guide

To tailor the portfolio with your personal achievements, projects, and contact info, update the following files:

### 1. GitHub & LeetCode Usernames
Change the usernames in `frontend/.env.local` to fetch your specific statistics.

### 2. Project Details
Modify the projects array in `frontend/src/components/ProjectsSection.tsx` (Lines 14-36):
```typescript
const projects = [
  {
    name: "LangGraph Multi-Agent RAG",
    description: "A production-grade multi-agent reasoning architecture...",
    tags: ["LangGraph", "FastAPI", "OpenAI", "Pinecone"],
    githubUrl: "https://github.com/yourusername/repo-name", // REPLACE
  },
  ...
];
```

### 3. Hackathon Achievements
Update the hackathon details listed in `frontend/src/components/AchievementBadge.tsx` (Lines 7-18):
```typescript
const achievements = [
  {
    title: "1st Place Winner - AI Hackathon 2025",
    desc: "Built a collaborative LangGraph system with custom MCP integration.",
    badge: "Champion",
  },
  ...
];
```

### 4. Contact Details & Socials
Update the email mailto link and GitHub link in `frontend/src/components/CTASection.tsx`:
- **Line 79**: Update the mailto target `href="mailto:sanskar.agrawal@example.com"` with your actual email address.
- **Line 85**: Update the profile URL `href="https://github.com/sanskaragrawal"` with your GitHub profile page link.

import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username") || process.env.NEXT_PUBLIC_GITHUB_USERNAME || "Sanskaragrawal2107";

  try {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "Sanskar-AI-Portfolio",
    };

    if (process.env.GITHUB_TOKEN) {
      headers["Authorization"] = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    // Fetch profile data
    const profileRes = await fetch(`https://api.github.com/users/${username}`, {
      headers,
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    let profileData;
    let languages: string[] = ["Python", "TypeScript", "JavaScript", "C++"];

    if (profileRes.ok) {
      profileData = await profileRes.json();
      
      // Fetch repositories to compute language breakdown
      const reposRes = await fetch(`https://api.github.com/users/${username}/repos?per_page=50&sort=updated`, {
        headers,
        next: { revalidate: 3600 },
      });

      if (reposRes.ok) {
        const repos = await reposRes.json();
        const langCounts: Record<string, number> = {};
        if (Array.isArray(repos)) {
          repos.forEach((repo: any) => {
            if (repo.language) {
              langCounts[repo.language] = (langCounts[repo.language] || 0) + 1;
            }
          });
          const sortedLangs = Object.entries(langCounts)
            .sort((a, b) => b[1] - a[1])
            .map(([lang]) => lang);
          if (sortedLangs.length > 0) {
            languages = sortedLangs.slice(0, 4);
          }
        }
      }
    } else {
      console.warn(`GitHub API returned status ${profileRes.status}, falling back to static data.`);
      profileData = {
        name: "sanskar agrawal",
        avatar_url: `https://github.com/${username}.png`,
        bio: "AI Engineer & Developer. Specializes in LLMs, RAG, LangGraph, agentic systems, and automation.",
        public_repos: 42,
        followers: 7,
        following: 10,
      };
    }

    return NextResponse.json({
      success: true,
      name: profileData.name || username,
      avatarUrl: profileData.avatar_url || `https://github.com/${username}.png`,
      bio: profileData.bio || "AI Engineer & Developer",
      publicRepos: profileData.public_repos || 0,
      followers: profileData.followers || 0,
      following: profileData.following || 0,
      languages,
    });
  } catch (error: any) {
    console.error("GitHub API error:", error);
    // Absolute fallback on throw
    return NextResponse.json({
      success: true,
      name: "sanskar agrawal",
      avatarUrl: `https://github.com/${username}.png`,
      bio: "AI Engineer & Developer. Specializes in LLMs, RAG, LangGraph, agentic systems, and automation.",
      publicRepos: 42,
      followers: 7,
      following: 10,
      languages: ["Python", "TypeScript", "JavaScript", "C++"],
    });
  }
}

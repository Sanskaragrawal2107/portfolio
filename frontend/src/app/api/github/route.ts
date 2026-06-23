import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username") || process.env.NEXT_PUBLIC_GITHUB_USERNAME || "sanskaragrawal";

  try {
    // Fetch profile data
    const profileRes = await fetch(`https://api.github.com/users/${username}`, {
      headers: {
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "Sanskar-AI-Portfolio",
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!profileRes.ok) {
      return NextResponse.json(
        { error: `Failed to fetch GitHub profile: ${profileRes.statusText}` },
        { status: profileRes.status }
      );
    }

    const profileData = await profileRes.json();

    // Fetch repositories to compute language breakdown
    const reposRes = await fetch(`https://api.github.com/users/${username}/repos?per_page=50&sort=updated`, {
      headers: {
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "Sanskar-AI-Portfolio",
      },
      next: { revalidate: 3600 },
    });

    let languages: string[] = ["TypeScript", "Python", "JavaScript", "C++"];
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

    return NextResponse.json({
      success: true,
      name: profileData.name || username,
      avatarUrl: profileData.avatar_url,
      bio: profileData.bio || "AI Engineer & Developer",
      publicRepos: profileData.public_repos || 0,
      followers: profileData.followers || 0,
      following: profileData.following || 0,
      languages,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

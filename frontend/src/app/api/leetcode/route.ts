import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username") || process.env.NEXT_PUBLIC_LEETCODE_USERNAME || "sanskaragrawal";

  const query = `
    query userProblemsSolved($username: String!) {
      allQuestionsCount {
        difficulty
        count
      }
      matchedUser(username: $username) {
        submitStats {
          acSubmissionNum {
            difficulty
            count
            submissions
          }
        }
        profile {
          ranking
        }
      }
    }
  `;

  try {
    const res = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Referer: "https://leetcode.com",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      body: JSON.stringify({ query, variables: { username } }),
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Failed to fetch from LeetCode: ${res.statusText}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    if (data.errors) {
      return NextResponse.json({ error: data.errors[0].message }, { status: 400 });
    }

    const matchedUser = data.data.matchedUser;
    if (!matchedUser) {
      return NextResponse.json({ error: "LeetCode user profile not found or is private." }, { status: 404 });
    }

    const stats = matchedUser.submitStats.acSubmissionNum;
    const totalSolved = stats.find((s: any) => s.difficulty === "All")?.count || 0;
    const easySolved = stats.find((s: any) => s.difficulty === "Easy")?.count || 0;
    const mediumSolved = stats.find((s: any) => s.difficulty === "Medium")?.count || 0;
    const hardSolved = stats.find((s: any) => s.difficulty === "Hard")?.count || 0;

    const ranking = matchedUser.profile.ranking || 0;

    return NextResponse.json({
      success: true,
      totalSolved,
      easySolved,
      mediumSolved,
      hardSolved,
      ranking,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

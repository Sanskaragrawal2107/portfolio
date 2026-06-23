import GitHubCard from "@/components/GitHubCard";
import LeetCodeCard from "@/components/LeetCodeCard";
import AchievementBadge from "@/components/AchievementBadge";
import ProjectsTeaser from "@/components/ProjectsTeaser";

export interface RegisteredComponent {
  component: React.ComponentType;
  label: string;
}

export const componentRegistry: Record<string, RegisteredComponent> = {
  github_card: {
    component: GitHubCard,
    label: "GitHub Profile",
  },
  leetcode_card: {
    component: LeetCodeCard,
    label: "LeetCode Stats",
  },
  achievement_badge: {
    component: AchievementBadge,
    label: "Achievements",
  },
  projects_teaser: {
    component: ProjectsTeaser,
    label: "Projects",
  },
};

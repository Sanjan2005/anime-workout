import { type Rank } from "@prisma/client";
import { LEVEL_BASE_XP, RANK_TITLES } from "@/lib/constants";

export function calculateLevel(totalXp: number): number {
  return Math.floor(Math.sqrt(totalXp / LEVEL_BASE_XP)) + 1;
}

export function xpForNextLevel(level: number): number {
  return level * level * LEVEL_BASE_XP;
}

export function xpProgressInLevel(totalXp: number): {
  level: number;
  currentLevelXp: number;
  xpToNext: number;
  progress: number;
} {
  const level = calculateLevel(totalXp);
  const prevThreshold = (level - 1) ** 2 * LEVEL_BASE_XP;
  const nextThreshold = level ** 2 * LEVEL_BASE_XP;
  const currentLevelXp = totalXp - prevThreshold;
  const xpToNext = nextThreshold - totalXp;
  const progress = currentLevelXp / (nextThreshold - prevThreshold);
  return { level, currentLevelXp, xpToNext, progress };
}

export function calculateRank(level: number): Rank {
  const entries = Object.entries(RANK_TITLES) as [Rank, (typeof RANK_TITLES)[Rank]][];
  for (const [rank, info] of entries) {
    if (level >= info.minLevel && level <= info.maxLevel) return rank;
  }
  return "S";
}

export function getRankTitle(rank: Rank): string {
  return RANK_TITLES[rank]?.title ?? "Unknown";
}

export function getStreakBadge(streak: number): string | null {
  if (streak >= 100) return "Century Warrior";
  if (streak >= 30) return "Monthly Champion";
  if (streak >= 7) return "Week Warrior";
  return null;
}

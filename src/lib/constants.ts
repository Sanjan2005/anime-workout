export const DAILY_XP_CAP = 50;
export const MIN_XP_PER_SET = 0.5;
export const LEVEL_BASE_XP = 100;

export const DIFFICULTY_TIERS: Record<
  number,
  { label: string; multiplier: number }
> = {
  1: { label: "Beginner", multiplier: 0.6 },
  2: { label: "Modified", multiplier: 0.8 },
  3: { label: "Standard", multiplier: 1.0 },
  4: { label: "Advanced", multiplier: 1.25 },
  5: { label: "Elite", multiplier: 1.5 },
};

export const RANK_TITLES: Record<
  string,
  { title: string; minLevel: number; maxLevel: number }
> = {
  F: { title: "Novice Adventurer", minLevel: 1, maxLevel: 5 },
  E: { title: "Guild Recruit", minLevel: 6, maxLevel: 10 },
  D: { title: "Rising Hunter", minLevel: 11, maxLevel: 18 },
  C: { title: "Elite Fighter", minLevel: 19, maxLevel: 28 },
  B: { title: "Ace Captain", minLevel: 29, maxLevel: 40 },
  A: { title: "Legendary Warrior", minLevel: 41, maxLevel: 55 },
  S: { title: "Hero-Class", minLevel: 56, maxLevel: Infinity },
};

export const STREAK_MILESTONES = [7, 30, 100] as const;

export const AI_DAILY_LIMIT = 5;

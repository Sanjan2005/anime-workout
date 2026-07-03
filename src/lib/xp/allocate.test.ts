import { describe, expect, it } from "vitest";
import {
  allocateDailyXp,
  simulateDailyAward,
  sumXpBudgets,
} from "@/lib/xp/allocate";
import { calculateLevel, calculateRank } from "@/lib/xp/level";
import { DAILY_XP_CAP } from "@/lib/constants";

describe("allocateDailyXp", () => {
  it("allocates exactly 50 XP across 4 exercises", () => {
    const exercises = [
      { sets: 3, reps: 12, difficultyMultiplier: 1.0, priorityWeight: 1.0 },
      { sets: 3, reps: 10, difficultyMultiplier: 1.0, priorityWeight: 1.0 },
      { sets: 4, reps: 15, difficultyMultiplier: 0.8, priorityWeight: 1.0 },
      { sets: 3, reps: 12, difficultyMultiplier: 1.0, priorityWeight: 1.0 },
    ];

    const allocations = allocateDailyXp(exercises);
    const total = sumXpBudgets(allocations);

    expect(allocations).toHaveLength(4);
    expect(total).toBeCloseTo(DAILY_XP_CAP, 5);
  });

  it("allocates exactly 50 XP across 8 exercises", () => {
    const exercises = Array.from({ length: 8 }, (_, i) => ({
      sets: 3,
      reps: 10,
      difficultyMultiplier: 0.8 + (i % 5) * 0.15,
      priorityWeight: 1.0,
    }));

    const allocations = allocateDailyXp(exercises);
    expect(sumXpBudgets(allocations)).toBeCloseTo(DAILY_XP_CAP, 5);
  });

  it("gives harder exercises more XP budget", () => {
    const easy = allocateDailyXp([
      { sets: 3, reps: 10, difficultyMultiplier: 0.6 },
    ]);
    const hard = allocateDailyXp([
      { sets: 3, reps: 10, difficultyMultiplier: 1.5 },
    ]);

    expect(hard[0].xpBudget).toBeGreaterThan(easy[0].xpBudget);
  });

  it("simulated daily award never exceeds cap", () => {
    const exercises = Array.from({ length: 6 }, () => ({
      sets: 4,
      reps: 12,
      difficultyMultiplier: 1.25,
      priorityWeight: 1.2,
    }));

    const allocations = allocateDailyXp(exercises);
    const earned = simulateDailyAward(allocations);
    expect(earned).toBeLessThanOrEqual(DAILY_XP_CAP);
    expect(earned).toBe(DAILY_XP_CAP);
  });
});

describe("level and rank", () => {
  it("calculates levels from total XP", () => {
    expect(calculateLevel(0)).toBe(1);
    expect(calculateLevel(100)).toBe(2);
    expect(calculateLevel(400)).toBe(3);
  });

  it("maps levels to ranks", () => {
    expect(calculateRank(1)).toBe("F");
    expect(calculateRank(6)).toBe("E");
    expect(calculateRank(56)).toBe("S");
  });
});

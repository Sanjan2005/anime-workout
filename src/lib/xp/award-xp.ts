"use server";

import { DAILY_XP_CAP } from "@/lib/constants";
import { prisma } from "@/lib/db/prisma";
import { getUserLocalDate } from "@/lib/utils/dates";
import { calculateLevel, calculateRank } from "@/lib/xp/level";

export interface AwardXpResult {
  awarded: number;
  capped: boolean;
  dailyTotal: number;
  totalXp: number;
  level: number;
  rank: string;
  levelUp: boolean;
  previousLevel: number;
}

export async function awardSetXp(
  userId: string,
  dayExerciseId: string,
  setNumber: number,
  repsCompleted: number
): Promise<AwardXpResult> {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
  });

  const localDate = getUserLocalDate(user.timezone);
  const dayExercise = await prisma.workoutDayExercise.findUniqueOrThrow({
    where: { id: dayExerciseId },
    include: { variation: true },
  });

  const xpPerSet = dayExercise.xpPerSet ?? 0;
  const xpPerRep =
    dayExercise.xpBudget && dayExercise.sets > 0
      ? dayExercise.xpBudget / (dayExercise.sets * dayExercise.reps)
      : xpPerSet / Math.max(dayExercise.reps, 1);

  const requestedXp =
    repsCompleted >= dayExercise.reps
      ? xpPerSet
      : repsCompleted * xpPerRep;

  return prisma.$transaction(async (tx) => {
    const existing = await tx.workoutCompletion.findUnique({
      where: {
        userId_dayExerciseId_setNumber_localDate: {
          userId,
          dayExerciseId,
          setNumber,
          localDate,
        },
      },
    });

    if (existing) {
      const dailyLog = await tx.dailyXpLog.findUniqueOrThrow({
        where: { userId_localDate: { userId, localDate } },
      });
      return {
        awarded: existing.xpAwarded,
        capped: false,
        dailyTotal: dailyLog.earnedXp,
        totalXp: user.totalXp,
        level: user.level,
        rank: user.rank,
        levelUp: false,
        previousLevel: user.level,
      };
    }

    let dailyLog = await tx.dailyXpLog.findUnique({
      where: { userId_localDate: { userId, localDate } },
    });

    if (!dailyLog) {
      dailyLog = await tx.dailyXpLog.create({
        data: { userId, localDate, earnedXp: 0, cap: DAILY_XP_CAP },
      });
    }

    const remaining = DAILY_XP_CAP - dailyLog.earnedXp;
    const awarded = Math.min(requestedXp, Math.max(0, remaining));
    const capped = awarded < requestedXp;

    await tx.workoutCompletion.create({
      data: {
        userId,
        dayExerciseId,
        setNumber,
        repsCompleted,
        xpAwarded: awarded,
        localDate,
      },
    });

    const updatedDaily = await tx.dailyXpLog.update({
      where: { id: dailyLog.id },
      data: { earnedXp: { increment: awarded } },
    });

    const previousLevel = user.level;
    const newTotalXp = user.totalXp + Math.round(awarded);
    const newLevel = calculateLevel(newTotalXp);
    const newRank = calculateRank(newLevel);

    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: {
        totalXp: newTotalXp,
        level: newLevel,
        rank: newRank,
      },
    });

    return {
      awarded,
      capped,
      dailyTotal: updatedDaily.earnedXp,
      totalXp: updatedUser.totalXp,
      level: updatedUser.level,
      rank: updatedUser.rank,
      levelUp: newLevel > previousLevel,
      previousLevel,
    };
  });
}

export async function updateStreakOnDayComplete(userId: string): Promise<{
  currentStreak: number;
  longestStreak: number;
  streakBadge: string | null;
  milestoneUnlocked: number | null;
}> {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const localDate = getUserLocalDate(user.timezone);

  if (
    user.lastWorkoutDate &&
    user.lastWorkoutDate.toISOString().slice(0, 10) ===
      localDate.toISOString().slice(0, 10)
  ) {
    return {
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      streakBadge: user.streakBadge,
      milestoneUnlocked: null,
    };
  }

  let currentStreak = 1;
  if (user.lastWorkoutDate) {
    const yesterday = new Date(localDate);
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    if (
      user.lastWorkoutDate.toISOString().slice(0, 10) ===
      yesterday.toISOString().slice(0, 10)
    ) {
      currentStreak = user.currentStreak + 1;
    }
  }

  const longestStreak = Math.max(user.longestStreak, currentStreak);
  let streakBadge = user.streakBadge;
  let milestoneUnlocked: number | null = null;

  for (const milestone of [100, 30, 7] as const) {
    if (currentStreak >= milestone) {
      const badge =
        milestone === 7
          ? "Week Warrior"
          : milestone === 30
            ? "Monthly Champion"
            : "Century Warrior";
      if (user.currentStreak < milestone) {
        milestoneUnlocked = milestone;
      }
      streakBadge = badge;
      break;
    }
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      currentStreak,
      longestStreak,
      lastWorkoutDate: localDate,
      streakBadge,
    },
  });

  return { currentStreak, longestStreak, streakBadge, milestoneUnlocked };
}

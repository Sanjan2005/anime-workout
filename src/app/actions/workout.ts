"use server";

import { revalidatePath } from "next/cache";
import { ensureUserProfile } from "@/lib/auth/user";
import { prisma } from "@/lib/db/prisma";
import { awardSetXp, updateStreakOnDayComplete } from "@/lib/xp/award-xp";
import { getUserLocalDate } from "@/lib/utils/dates";
import { createClient } from "@/lib/supabase/server";
import { type Rank } from "@prisma/client";

export async function completeSetAction(input: {
  dayExerciseId: string;
  setNumber: number;
  repsCompleted: number;
  dayId: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) return { error: "Not authenticated" };

  await ensureUserProfile(user.id, user.email);

  try {
    const result = await awardSetXp(
      user.id,
      input.dayExerciseId,
      input.setNumber,
      input.repsCompleted
    );

    const dayExercise = await prisma.workoutDayExercise.findUnique({
      where: { id: input.dayExerciseId },
    });

    let streakResult = null;
    if (dayExercise) {
      const allExercises = await prisma.workoutDayExercise.findMany({
        where: { dayId: input.dayId },
      });
      const completions = await prisma.workoutCompletion.findMany({
        where: {
          userId: user.id,
          dayExerciseId: { in: allExercises.map((e) => e.id) },
          localDate: getUserLocalDate(
            (await prisma.user.findUniqueOrThrow({ where: { id: user.id } }))
              .timezone
          ),
        },
      });

      const totalSetsNeeded = allExercises.reduce((s, e) => s + e.sets, 0);
      if (completions.length >= totalSetsNeeded) {
        streakResult = await updateStreakOnDayComplete(user.id);
      }
    }

    revalidatePath("/dashboard");
    revalidatePath("/workout");
    revalidatePath("/progress");

    return {
      ...result,
      rank: result.rank as Rank,
      streak: streakResult,
    };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to award XP" };
  }
}

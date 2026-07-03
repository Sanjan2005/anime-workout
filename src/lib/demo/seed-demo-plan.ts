import { PlanPhase } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { allocateDailyXp } from "@/lib/xp/allocate";

export async function seedDemoPlan(userId: string): Promise<string> {
  await prisma.workoutPlan.updateMany({
    where: { userId, isActive: true },
    data: { isActive: false },
  });

  const exercises = await prisma.exercise.findMany({
    include: { variations: true },
  });

  const getVariation = (slug: string, tier: number) => {
    const ex = exercises.find((e) => e.slug === slug);
    return ex?.variations.find((v) => v.difficultyTier === tier);
  };

  const day1Exercises = [
    { slug: "push_up", tier: 3, sets: 3, reps: 12, priority: 1.0 },
    { slug: "row", tier: 3, sets: 3, reps: 10, priority: 1.2 },
    { slug: "squat", tier: 2, sets: 4, reps: 15, priority: 1.0 },
    { slug: "plank", tier: 3, sets: 3, reps: 12, priority: 1.0 },
  ];

  const plan = await prisma.workoutPlan.create({
    data: {
      userId,
      name: "Demo Hero Training Arc",
      phase: PlanPhase.RECOMP,
      isActive: true,
      nutrition: {
        create: {
          dailyCalories: 2200,
          proteinG: 130,
          carbsG: 220,
          fatG: 70,
          mealStructure: [
            { meal: "Breakfast", suggestion: "Oats, banana, protein shake" },
            { meal: "Lunch", suggestion: "Rice, chicken, vegetables" },
            { meal: "Dinner", suggestion: "Salmon, sweet potato, greens" },
          ],
        },
      },
    },
  });

  const resolved = day1Exercises
    .map((d) => {
      const variation = getVariation(d.slug, d.tier);
      if (!variation) return null;
      return {
        variationId: variation.id,
        sets: d.sets,
        reps: d.reps,
        difficultyMultiplier: variation.difficultyMultiplier,
        priorityWeight: d.priority,
      };
    })
    .filter(Boolean) as {
    variationId: string;
    sets: number;
    reps: number;
    difficultyMultiplier: number;
    priorityWeight: number;
  }[];

  const allocations = allocateDailyXp(
    resolved.map(({ sets, reps, difficultyMultiplier, priorityWeight }) => ({
      sets,
      reps,
      difficultyMultiplier,
      priorityWeight,
    }))
  );

  const day = await prisma.workoutDay.create({
    data: { planId: plan.id, dayIndex: 0, name: "Full Body Power Day" },
  });

  for (let i = 0; i < resolved.length; i++) {
    await prisma.workoutDayExercise.create({
      data: {
        dayId: day.id,
        variationId: resolved[i].variationId,
        sets: resolved[i].sets,
        reps: resolved[i].reps,
        priorityWeight: resolved[i].priorityWeight,
        orderIndex: i,
        xpBudget: allocations[i].xpBudget,
        xpPerSet: allocations[i].xpPerSet,
      },
    });
  }

  const day2Resolved = [
    { slug: "pull_up", tier: 2, sets: 3, reps: 8, priority: 1.2 },
    { slug: "dip", tier: 2, sets: 3, reps: 10, priority: 1.0 },
    { slug: "lunge", tier: 3, sets: 3, reps: 12, priority: 1.0 },
    { slug: "crunch", tier: 3, sets: 3, reps: 15, priority: 1.0 },
  ]
    .map((d) => {
      const variation = getVariation(d.slug, d.tier);
      if (!variation) return null;
      return {
        variationId: variation.id,
        sets: d.sets,
        reps: d.reps,
        difficultyMultiplier: variation.difficultyMultiplier,
        priorityWeight: d.priority,
      };
    })
    .filter(Boolean) as typeof resolved;

  const allocations2 = allocateDailyXp(
    day2Resolved.map(({ sets, reps, difficultyMultiplier, priorityWeight }) => ({
      sets,
      reps,
      difficultyMultiplier,
      priorityWeight,
    }))
  );

  const day2 = await prisma.workoutDay.create({
    data: { planId: plan.id, dayIndex: 1, name: "Pull & Core Day" },
  });

  for (let i = 0; i < day2Resolved.length; i++) {
    await prisma.workoutDayExercise.create({
      data: {
        dayId: day2.id,
        variationId: day2Resolved[i].variationId,
        sets: day2Resolved[i].sets,
        reps: day2Resolved[i].reps,
        priorityWeight: day2Resolved[i].priorityWeight,
        orderIndex: i,
        xpBudget: allocations2[i].xpBudget,
        xpPerSet: allocations2[i].xpPerSet,
      },
    });
  }

  return plan.id;
}

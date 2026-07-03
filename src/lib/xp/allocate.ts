import { DAILY_XP_CAP, MIN_XP_PER_SET } from "@/lib/constants";

export interface ExerciseXpInput {
  sets: number;
  reps: number;
  difficultyMultiplier: number;
  priorityWeight?: number;
}

export interface ExerciseXpAllocation extends ExerciseXpInput {
  workload: number;
  xpBudget: number;
  xpPerSet: number;
  xpPerRep: number;
}

export function computeWorkload(exercise: ExerciseXpInput): number {
  const priorityWeight = exercise.priorityWeight ?? 1;
  return (
    exercise.sets *
    exercise.reps *
    exercise.difficultyMultiplier *
    priorityWeight
  );
}

export function allocateDailyXp(
  exercises: ExerciseXpInput[],
  dailyCap: number = DAILY_XP_CAP
): ExerciseXpAllocation[] {
  if (exercises.length === 0) return [];

  const workloads = exercises.map((ex) => computeWorkload(ex));
  const totalWorkload = workloads.reduce((sum, w) => sum + w, 0);

  if (totalWorkload === 0) {
    const evenBudget = dailyCap / exercises.length;
    return exercises.map((ex) => ({
      ...ex,
      priorityWeight: ex.priorityWeight ?? 1,
      workload: 0,
      xpBudget: evenBudget,
      xpPerSet: Math.max(MIN_XP_PER_SET, evenBudget / ex.sets),
      xpPerRep: evenBudget / (ex.sets * ex.reps),
    }));
  }

  return exercises.map((ex, i) => {
    const workload = workloads[i];
    const xpBudget = dailyCap * (workload / totalWorkload);
    const xpPerSet = Math.max(MIN_XP_PER_SET, xpBudget / ex.sets);
    const xpPerRep = xpBudget / (ex.sets * ex.reps);
    return {
      ...ex,
      priorityWeight: ex.priorityWeight ?? 1,
      workload,
      xpBudget,
      xpPerSet,
      xpPerRep,
    };
  });
}

export function sumXpBudgets(allocations: ExerciseXpAllocation[]): number {
  return allocations.reduce((sum, a) => sum + a.xpBudget, 0);
}

export function simulateDailyAward(
  allocations: ExerciseXpAllocation[],
  dailyCap: number = DAILY_XP_CAP
): number {
  let earned = 0;
  for (const alloc of allocations) {
    for (let set = 0; set < alloc.sets; set++) {
      const remaining = dailyCap - earned;
      const award = Math.min(alloc.xpPerSet, remaining);
      earned += award;
      if (earned >= dailyCap) return dailyCap;
    }
  }
  return earned;
}

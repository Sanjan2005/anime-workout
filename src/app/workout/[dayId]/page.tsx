import { notFound } from "next/navigation";
import { AppNav } from "@/components/layout/app-nav";
import { WorkoutDayClient } from "@/components/workout/workout-day-client";
import { ErrorBoundary } from "@/components/error-boundary";
import { ensureUserProfile } from "@/lib/auth/user";
import { prisma } from "@/lib/db/prisma";
import { getUserLocalDate } from "@/lib/utils/dates";
import { createClient } from "@/lib/supabase/server";

export default async function WorkoutDayPage({
  params,
}: {
  params: Promise<{ dayId: string }>;
}) {
  const { dayId } = await params;
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser?.email) return null;

  await ensureUserProfile(authUser.id, authUser.email);

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: authUser.id },
  });

  const day = await prisma.workoutDay.findFirst({
    where: {
      id: dayId,
      plan: { userId: authUser.id },
    },
    include: {
      exercises: {
        orderBy: { orderIndex: "asc" },
        include: {
          variation: { include: { exercise: true } },
        },
      },
    },
  });

  if (!day) notFound();

  const localDate = getUserLocalDate(user.timezone);
  const dailyLog = await prisma.dailyXpLog.findUnique({
    where: { userId_localDate: { userId: user.id, localDate } },
  });

  const completions = await prisma.workoutCompletion.findMany({
    where: {
      userId: user.id,
      dayExerciseId: { in: day.exercises.map((e) => e.id) },
      localDate,
    },
  });

  const completedSets: Record<string, number[]> = {};
  for (const c of completions) {
    if (!completedSets[c.dayExerciseId]) completedSets[c.dayExerciseId] = [];
    completedSets[c.dayExerciseId].push(c.setNumber);
  }

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <AppNav />
      <main className="container py-8 max-w-2xl">
        <ErrorBoundary>
          <WorkoutDayClient
            dayId={day.id}
            dayName={day.name}
            exercises={day.exercises.map((e) => ({
              id: e.id,
              sets: e.sets,
              reps: e.reps,
              xpPerSet: e.xpPerSet,
              notes: e.notes,
              variation: e.variation,
            }))}
            completedSets={completedSets}
            dailyXpEarned={dailyLog?.earnedXp ?? 0}
          />
        </ErrorBoundary>
      </main>
    </div>
  );
}

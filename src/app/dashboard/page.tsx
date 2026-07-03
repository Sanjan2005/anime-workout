import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AppNav } from "@/components/layout/app-nav";
import {
  DailyXpBar,
  RankBadge,
  RankTitle,
  StreakCounter,
} from "@/components/gamification/stats";
import { seedDemoPlanAction } from "@/app/actions/demo";
import { ensureUserProfile, getCurrentUser } from "@/lib/auth/user";
import { prisma } from "@/lib/db/prisma";
import { getUserLocalDate } from "@/lib/utils/dates";
import { createClient } from "@/lib/supabase/server";
import { Dumbbell, Plus } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser?.email) return null;

  await ensureUserProfile(authUser.id, authUser.email);
  const user = await getCurrentUser(authUser.id);
  if (!user) return null;

  const localDate = getUserLocalDate(user.timezone);
  const dailyLog = await prisma.dailyXpLog.findUnique({
    where: { userId_localDate: { userId: user.id, localDate } },
  });

  const activePlan = user.plans[0];

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <AppNav />

      <main className="container py-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, hunter</p>
          </div>
          <div className="flex items-center gap-3">
            <RankBadge rank={user.rank} level={user.level} />
            <RankTitle rank={user.rank} />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Today&apos;s XP</CardTitle>
            </CardHeader>
            <CardContent>
              <DailyXpBar earned={dailyLog?.earnedXp ?? 0} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Streak</CardTitle>
            </CardHeader>
            <CardContent>
              <StreakCounter
                current={user.currentStreak}
                longest={user.longestStreak}
                badge={user.streakBadge}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Total XP</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-violet-400">{user.totalXp}</p>
              <p className="text-sm text-muted-foreground">
                Level {user.level} · {user.rank}-Rank
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <CardTitle>Active Workout Plan</CardTitle>
                <CardDescription>
                  {activePlan
                    ? `${activePlan.name} · ${activePlan.days.length} days`
                    : "No plan yet — generate one or load the demo"}
                </CardDescription>
              </div>
              {!activePlan && (
                <form action={seedDemoPlanAction}>
                  <Button type="submit" variant="outline" size="sm">
                    <Plus className="h-4 w-4" />
                    Load Demo Plan
                  </Button>
                </form>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {activePlan ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {activePlan.days.map((day) => (
                  <Link key={day.id} href={`/workout/${day.id}`}>
                    <Card className="hover:border-violet-500/50 transition-colors cursor-pointer h-full">
                      <CardContent className="pt-6 flex items-center gap-3">
                        <Dumbbell className="h-5 w-5 text-violet-400 shrink-0" />
                        <div>
                          <p className="font-medium">{day.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {day.exercises.length} exercises
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 space-y-4">
                <p className="text-muted-foreground">
                  Complete your profile, then generate a character-based plan.
                </p>
                <div className="flex gap-3 justify-center flex-wrap">
                  <Button asChild>
                    <Link href="/plan">Generate Plan</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/profile">Set Up Profile</Link>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {activePlan?.nutrition && (
          <Card>
            <CardHeader>
              <CardTitle>Nutrition Targets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Calories</p>
                  <p className="text-xl font-bold">{activePlan.nutrition.dailyCalories}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Protein</p>
                  <p className="text-xl font-bold">{activePlan.nutrition.proteinG}g</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Carbs</p>
                  <p className="text-xl font-bold">{activePlan.nutrition.carbsG}g</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Fat</p>
                  <p className="text-xl font-bold">{activePlan.nutrition.fatG}g</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}

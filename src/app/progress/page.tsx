import { subDays } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { AppNav } from "@/components/layout/app-nav";
import { ProgressClient } from "@/components/progress/progress-client";
import { ErrorBoundary } from "@/components/error-boundary";
import { ensureUserProfile } from "@/lib/auth/user";
import { prisma } from "@/lib/db/prisma";
import { getUserLocalDate } from "@/lib/utils/dates";
import { createClient } from "@/lib/supabase/server";

export default async function ProgressPage() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser?.email) return null;

  await ensureUserProfile(authUser.id, authUser.email);
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: authUser.id },
  });

  const localDate = getUserLocalDate(user.timezone);
  const dailyLog = await prisma.dailyXpLog.findUnique({
    where: { userId_localDate: { userId: user.id, localDate } },
  });

  const xpLogs = await prisma.dailyXpLog.findMany({
    where: {
      userId: user.id,
      localDate: { gte: subDays(localDate, 13) },
    },
    orderBy: { localDate: "asc" },
  });

  const xpHistory = xpLogs.map((log) => ({
    date: formatInTimeZone(log.localDate, user.timezone, "MMM d"),
    xp: log.earnedXp,
  }));

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <AppNav />
      <main className="container py-8 max-w-3xl">
        <h1 className="text-3xl font-bold mb-6">Progress</h1>
        <ErrorBoundary>
          <ProgressClient
            user={{
              totalXp: user.totalXp,
              level: user.level,
              rank: user.rank,
              currentStreak: user.currentStreak,
              longestStreak: user.longestStreak,
              streakBadge: user.streakBadge,
            }}
            xpHistory={xpHistory}
            todayXp={dailyLog?.earnedXp ?? 0}
          />
        </ErrorBoundary>
      </main>
    </div>
  );
}

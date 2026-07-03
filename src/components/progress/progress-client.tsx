"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DailyXpBar,
  RankBadge,
  RankTitle,
  StreakCounter,
} from "@/components/gamification/stats";
import { STREAK_MILESTONES } from "@/lib/constants";
import { xpProgressInLevel } from "@/lib/xp/level";
import { type Rank } from "@prisma/client";

interface ProgressClientProps {
  user: {
    totalXp: number;
    level: number;
    rank: Rank;
    currentStreak: number;
    longestStreak: number;
    streakBadge: string | null;
  };
  xpHistory: { date: string; xp: number }[];
  todayXp: number;
}

export function ProgressClient({ user, xpHistory, todayXp }: ProgressClientProps) {
  const progress = xpProgressInLevel(user.totalXp);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <RankBadge rank={user.rank} level={user.level} className="text-base px-4 py-1" />
        <RankTitle rank={user.rank} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Level Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Level {progress.level}</span>
            <span className="text-muted-foreground">
              {progress.xpToNext} XP to next level
            </span>
          </div>
          <div className="h-4 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all"
              style={{ width: `${progress.progress * 100}%` }}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Today</CardTitle>
          </CardHeader>
          <CardContent>
            <DailyXpBar earned={todayXp} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
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
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">XP History (14 days)</CardTitle>
        </CardHeader>
        <CardContent>
          {xpHistory.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={xpHistory}>
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 50]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="xp" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              Complete workouts to see your XP history.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Streak Milestones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {STREAK_MILESTONES.map((milestone) => {
              const unlocked = user.longestStreak >= milestone;
              const badge =
                milestone === 7
                  ? "Week Warrior"
                  : milestone === 30
                    ? "Monthly Champion"
                    : "Century Warrior";
              return (
                <div
                  key={milestone}
                  className={`flex items-center justify-between rounded-lg border p-3 ${
                    unlocked ? "border-violet-500/40 bg-violet-950/20" : "opacity-50"
                  }`}
                >
                  <span className="font-medium">{milestone} days</span>
                  <span className="text-sm text-muted-foreground">{badge}</span>
                  {unlocked && (
                    <span className="text-xs text-violet-400">Unlocked</span>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

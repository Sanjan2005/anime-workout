import { type Rank } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { getRankTitle } from "@/lib/xp/level";
import { cn } from "@/lib/utils";

const rankColors: Record<Rank, string> = {
  F: "bg-rank-f",
  E: "bg-rank-e",
  D: "bg-rank-d",
  C: "bg-rank-c",
  B: "bg-rank-b",
  A: "bg-rank-a",
  S: "bg-rank-s",
};

export function RankBadge({
  rank,
  level,
  className,
}: {
  rank: Rank;
  level: number;
  className?: string;
}) {
  return (
    <Badge variant="rank" className={cn(rankColors[rank], className)}>
      {rank}-Rank · Lv.{level}
    </Badge>
  );
}

export function RankTitle({ rank }: { rank: Rank }) {
  return (
    <p className="text-sm text-muted-foreground">{getRankTitle(rank)}</p>
  );
}

export function StreakCounter({
  current,
  longest,
  badge,
}: {
  current: number;
  longest: number;
  badge?: string | null;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <span className="text-2xl font-bold text-orange-400">{current}</span>
        <span className="text-sm text-muted-foreground">day streak</span>
      </div>
      <p className="text-xs text-muted-foreground">Best: {longest} days</p>
      {badge && (
        <Badge variant="secondary" className="w-fit">
          {badge}
        </Badge>
      )}
    </div>
  );
}

export function DailyXpBar({ earned, cap = 50 }: { earned: number; cap?: number }) {
  const pct = Math.min(100, (earned / cap) * 100);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span>Daily XP</span>
        <span className="font-mono">
          {earned.toFixed(1)} / {cap}
        </span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

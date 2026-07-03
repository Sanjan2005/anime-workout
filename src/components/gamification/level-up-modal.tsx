"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RankBadge } from "@/components/gamification/stats";
import { type Rank } from "@prisma/client";

export function LevelUpModal({
  open,
  onOpenChange,
  level,
  rank,
  previousLevel,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  level: number;
  rank: Rank;
  previousLevel: number;
  type?: "level" | "rank";
}) {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (open) {
      setAnimate(true);
      const t = setTimeout(() => setAnimate(false), 600);
      return () => clearTimeout(t);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-violet-500/50 bg-gradient-to-b from-violet-950 to-background">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl animate-rank-up">
            Level Up!
          </DialogTitle>
          <DialogDescription className="text-center">
            You advanced from Lv.{previousLevel} to Lv.{level}
          </DialogDescription>
        </DialogHeader>
        <div
          className={`flex flex-col items-center gap-4 py-6 ${animate ? "animate-rank-up" : ""}`}
        >
          <div className="text-6xl font-black text-violet-400">{level}</div>
          <RankBadge rank={rank} level={level} />
          <p className="text-sm text-muted-foreground">
            Keep training to unlock the next rank!
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function StreakMilestoneModal({
  open,
  onOpenChange,
  milestone,
  badge,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  milestone: number;
  badge: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center">Streak Milestone!</DialogTitle>
          <DialogDescription className="text-center">
            {milestone} consecutive days of training
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-3 py-6 animate-rank-up">
          <div className="text-4xl">🔥</div>
          <p className="text-xl font-bold text-orange-400">{badge}</p>
          <p className="text-sm text-muted-foreground">Cosmetic badge unlocked</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

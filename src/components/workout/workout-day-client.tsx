"use client";

import { useState } from "react";
import { Check, Dumbbell } from "lucide-react";
import { type Rank } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LevelUpModal, StreakMilestoneModal } from "@/components/gamification/level-up-modal";
import { completeSetAction } from "@/app/actions/workout";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

interface ExerciseData {
  id: string;
  sets: number;
  reps: number;
  xpPerSet: number | null;
  notes: string | null;
  variation: {
    name: string;
    difficultyTier: number;
    exercise: { name: string; muscleGroup: string };
  };
}

interface WorkoutDayClientProps {
  dayId: string;
  dayName: string;
  exercises: ExerciseData[];
  completedSets: Record<string, number[]>;
  dailyXpEarned: number;
  onXpUpdate?: (earned: number, result: Awaited<ReturnType<typeof completeSetAction>>) => void;
}

export function WorkoutDayClient({
  dayId,
  dayName,
  exercises,
  completedSets: initialCompleted,
  dailyXpEarned: initialDailyXp,
  onXpUpdate,
}: WorkoutDayClientProps) {
  const [completedSets, setCompletedSets] = useState(initialCompleted);
  const [dailyXp, setDailyXp] = useState(initialDailyXp);
  const [loading, setLoading] = useState<string | null>(null);
  const [levelUp, setLevelUp] = useState<{
    level: number;
    rank: Rank;
    previousLevel: number;
  } | null>(null);
  const [streakMilestone, setStreakMilestone] = useState<{
    milestone: number;
    badge: string;
  } | null>(null);

  async function handleComplete(exerciseId: string, setNumber: number, reps: number) {
    const key = `${exerciseId}-${setNumber}`;
    if (loading) return;
    if (completedSets[exerciseId]?.includes(setNumber)) return;

    setLoading(key);
    try {
      const result = await completeSetAction({
        dayExerciseId: exerciseId,
        setNumber,
        repsCompleted: reps,
        dayId,
      });

      if (result.error) {
        toast({ title: "Error", description: result.error });
        return;
      }

      setCompletedSets((prev) => ({
        ...prev,
        [exerciseId]: [...(prev[exerciseId] ?? []), setNumber],
      }));
      setDailyXp(result.dailyTotal ?? dailyXp);

      toast({
        title: result.capped ? "Daily cap reached!" : `+${result.awarded?.toFixed(1)} XP`,
        description: result.levelUp
          ? `Level up! Now Lv.${result.level}`
          : `Daily total: ${result.dailyTotal?.toFixed(1)}/50`,
      });

      if (result.levelUp && result.level && result.rank) {
        setLevelUp({
          level: result.level,
          rank: result.rank as Rank,
          previousLevel: result.previousLevel ?? result.level - 1,
        });
      }

      if (result.streak?.milestoneUnlocked && result.streak.streakBadge) {
        setStreakMilestone({
          milestone: result.streak.milestoneUnlocked,
          badge: result.streak.streakBadge,
        });
      }

      onXpUpdate?.(result.dailyTotal ?? dailyXp, result);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-6">
      <LevelUpModal
        open={!!levelUp}
        onOpenChange={(open) => !open && setLevelUp(null)}
        level={levelUp?.level ?? 1}
        rank={levelUp?.rank ?? "F"}
        previousLevel={levelUp?.previousLevel ?? 1}
      />
      <StreakMilestoneModal
        open={!!streakMilestone}
        onOpenChange={(open) => !open && setStreakMilestone(null)}
        milestone={streakMilestone?.milestone ?? 0}
        badge={streakMilestone?.badge ?? ""}
      />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{dayName}</h1>
        <Badge variant="secondary">{dailyXp.toFixed(1)} / 50 XP today</Badge>
      </div>

      {exercises.map((exercise) => (
        <Card key={exercise.id}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Dumbbell className="h-4 w-4 text-violet-400" />
                  {exercise.variation.exercise.name}
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {exercise.variation.name} · Tier {exercise.variation.difficultyTier}
                </p>
              </div>
              <Badge variant="outline">
                +{(exercise.xpPerSet ?? 0).toFixed(1)} XP/set
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-4">
              {exercise.sets} sets × {exercise.reps} reps
              {exercise.notes && (
                <span className="text-muted-foreground"> · {exercise.notes}</span>
              )}
            </p>
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: exercise.sets }, (_, i) => {
                const setNum = i + 1;
                const done = completedSets[exercise.id]?.includes(setNum);
                return (
                  <Button
                    key={setNum}
                    variant={done ? "secondary" : "outline"}
                    size="sm"
                    disabled={done || loading === `${exercise.id}-${setNum}`}
                    onClick={() =>
                      handleComplete(exercise.id, setNum, exercise.reps)
                    }
                    className={cn(done && "border-green-500/50 text-green-400")}
                  >
                    {done ? <Check className="h-4 w-4" /> : null}
                    Set {setNum}
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

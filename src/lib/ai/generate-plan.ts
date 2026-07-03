import { GoogleGenAI } from "@google/genai";
import { Gender, Goal, PlanPhase } from "@prisma/client";
import { buildSystemPrompt } from "@/lib/ai/prompts";
import {
  generatedPlanSchema,
  workoutPlanJsonSchema,
  type GeneratedPlan,
} from "@/lib/ai/gemini-schema";
import { AI_DAILY_LIMIT } from "@/lib/constants";
import { prisma } from "@/lib/db/prisma";
import { allocateDailyXp } from "@/lib/xp/allocate";
import { getUserLocalDate } from "@/lib/utils/dates";

const GEMINI_MODEL = "gemini-2.5-flash";

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not set. Create a free key at https://aistudio.google.com/apikey"
    );
  }
  return new GoogleGenAI({ apiKey });
}

async function checkRateLimit(userId: string): Promise<void> {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const localDate = getUserLocalDate(user.timezone);

  const record = await prisma.aiRateLimit.upsert({
    where: { userId_localDate: { userId, localDate } },
    create: { userId, localDate, count: 0 },
    update: {},
  });

  if (record.count >= AI_DAILY_LIMIT) {
    throw new Error(
      `Daily AI generation limit reached (${AI_DAILY_LIMIT}/day). Try again tomorrow.`
    );
  }
}

async function incrementRateLimit(userId: string): Promise<void> {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const localDate = getUserLocalDate(user.timezone);

  await prisma.aiRateLimit.upsert({
    where: { userId_localDate: { userId, localDate } },
    create: { userId, localDate, count: 1 },
    update: { count: { increment: 1 } },
  });
}

export async function callGeminiForPlan(
  frontBase64: string,
  backBase64: string,
  frontMime: string,
  backMime: string,
  context: {
    heightCm: number;
    weightKg: number;
    gender: Gender;
    goal: Goal;
    calorieTarget: number;
    allowedSlugs: string[];
  }
): Promise<GeneratedPlan> {
  const ai = getGeminiClient();
  const systemPrompt = buildSystemPrompt(context);

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: [
      {
        role: "user",
        parts: [
          { text: systemPrompt },
          { inlineData: { mimeType: frontMime, data: frontBase64 } },
          { inlineData: { mimeType: backMime, data: backBase64 } },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: workoutPlanJsonSchema,
    },
  });

  const text = response.text;
  if (!text) throw new Error("Empty response from Gemini");

  const parsed = generatedPlanSchema.parse(JSON.parse(text));
  return parsed;
}

export async function persistGeneratedPlan(
  userId: string,
  plan: GeneratedPlan,
  characterRefId: string,
  goal: Goal
): Promise<string> {
  const phaseMap: Record<Goal, PlanPhase> = {
    CUT: PlanPhase.CUT,
    BULK: PlanPhase.BULK,
    MAINTAIN: PlanPhase.RECOMP,
  };

  await prisma.workoutPlan.updateMany({
    where: { userId, isActive: true },
    data: { isActive: false },
  });

  const exercises = await prisma.exercise.findMany({
    include: { variations: true },
  });
  const slugMap = new Map(exercises.map((e) => [e.slug, e]));

  const planRecord = await prisma.workoutPlan.create({
    data: {
      userId,
      characterId: characterRefId,
      name: plan.workoutPlan.name,
      phase: phaseMap[goal],
      isActive: true,
      nutrition: {
        create: {
          dailyCalories: plan.nutritionPlan.dailyCalories,
          proteinG: plan.nutritionPlan.proteinG,
          carbsG: plan.nutritionPlan.carbsG,
          fatG: plan.nutritionPlan.fatG,
          mealStructure: plan.nutritionPlan.mealTemplates,
        },
      },
    },
  });

  for (let dayIdx = 0; dayIdx < plan.workoutPlan.days.length; dayIdx++) {
    const day = plan.workoutPlan.days[dayIdx];
    const xpInputs = day.exercises.map((ex) => {
      const exercise = slugMap.get(ex.exerciseSlug);
      const variation = exercise?.variations.find(
        (v) =>
          v.name === ex.variationName ||
          v.difficultyTier === ex.difficultyTier
      );
      return {
        sets: ex.sets,
        reps: ex.reps,
        difficultyMultiplier: variation?.difficultyMultiplier ?? 1,
        priorityWeight: ex.priorityWeight ?? 1,
        exerciseData: ex,
        variationId: variation?.id,
      };
    });

    const validInputs = xpInputs.filter((x) => x.variationId);
    const allocations = allocateDailyXp(
      validInputs.map(({ sets, reps, difficultyMultiplier, priorityWeight }) => ({
        sets,
        reps,
        difficultyMultiplier,
        priorityWeight,
      }))
    );

    const dayRecord = await prisma.workoutDay.create({
      data: {
        planId: planRecord.id,
        dayIndex: dayIdx,
        name: day.name,
      },
    });

    for (let i = 0; i < validInputs.length; i++) {
      const input = validInputs[i];
      const alloc = allocations[i];
      if (!input.variationId) continue;

      await prisma.workoutDayExercise.create({
        data: {
          dayId: dayRecord.id,
          variationId: input.variationId,
          sets: input.sets,
          reps: input.reps,
          priorityWeight: input.priorityWeight ?? 1,
          orderIndex: i,
          xpBudget: alloc.xpBudget,
          xpPerSet: alloc.xpPerSet,
          notes: input.exerciseData.notes,
        },
      });
    }
  }

  return planRecord.id;
}

export async function generateWorkoutPlanFromImages(
  userId: string,
  frontBuffer: Buffer,
  backBuffer: Buffer,
  frontMime: string,
  backMime: string,
  frontImageUrl: string,
  backImageUrl: string
): Promise<{ planId: string; analysis: GeneratedPlan["characterAnalysis"] }> {
  await checkRateLimit(userId);

  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  if (!user.heightCm || !user.weightKg || !user.gender || !user.goal) {
    throw new Error("Complete your profile before generating a plan.");
  }

  const exercises = await prisma.exercise.findMany({ select: { slug: true } });

  const plan = await callGeminiForPlan(
    frontBuffer.toString("base64"),
    backBuffer.toString("base64"),
    frontMime,
    backMime,
    {
      heightCm: user.heightCm,
      weightKg: user.weightKg,
      gender: user.gender,
      goal: user.goal,
      calorieTarget: user.calorieTarget ?? 2000,
      allowedSlugs: exercises.map((e) => e.slug),
    }
  );

  const characterRef = await prisma.characterReference.create({
    data: {
      userId,
      frontImageUrl,
      backImageUrl,
      visionAnalysis: plan,
    },
  });

  const planId = await persistGeneratedPlan(
    userId,
    plan,
    characterRef.id,
    user.goal
  );

  await incrementRateLimit(userId);

  return { planId, analysis: plan.characterAnalysis };
}

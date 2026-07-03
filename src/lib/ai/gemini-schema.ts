import { z } from "zod";

export const generatedPlanSchema = z.object({
  characterAnalysis: z.object({
    physiqueType: z.enum(["athletic_lean", "muscular_bulk", "slim_toned"]),
    emphasisMuscleGroups: z.array(z.string()).min(1),
    realismNote: z.string(),
    animeRankFlavor: z.string(),
  }),
  workoutPlan: z.object({
    name: z.string(),
    daysPerWeek: z.number().int().min(1).max(6),
    days: z
      .array(
        z.object({
          name: z.string(),
          exercises: z
            .array(
              z.object({
                exerciseSlug: z.string(),
                variationName: z.string(),
                difficultyTier: z.number().int().min(1).max(5),
                sets: z.number().int().min(1).max(10),
                reps: z.number().int().min(1).max(50),
                priorityWeight: z.number().min(0.5).max(2).default(1),
                notes: z.string().optional(),
              })
            )
            .min(2)
            .max(8),
        })
      )
      .min(2)
      .max(5),
  }),
  nutritionPlan: z.object({
    dailyCalories: z.number().int().min(1200).max(6000),
    proteinG: z.number().int().min(50).max(400),
    carbsG: z.number().int().min(50).max(800),
    fatG: z.number().int().min(20).max(300),
    mealTemplates: z.array(
      z.object({
        meal: z.string(),
        suggestion: z.string(),
      })
    ),
  }),
});

export type GeneratedPlan = z.infer<typeof generatedPlanSchema>;

export const workoutPlanJsonSchema = {
  type: "object",
  properties: {
    characterAnalysis: {
      type: "object",
      properties: {
        physiqueType: {
          type: "string",
          enum: ["athletic_lean", "muscular_bulk", "slim_toned"],
        },
        emphasisMuscleGroups: { type: "array", items: { type: "string" } },
        realismNote: { type: "string" },
        animeRankFlavor: { type: "string" },
      },
      required: [
        "physiqueType",
        "emphasisMuscleGroups",
        "realismNote",
        "animeRankFlavor",
      ],
    },
    workoutPlan: {
      type: "object",
      properties: {
        name: { type: "string" },
        daysPerWeek: { type: "integer" },
        days: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              exercises: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    exerciseSlug: { type: "string" },
                    variationName: { type: "string" },
                    difficultyTier: { type: "integer" },
                    sets: { type: "integer" },
                    reps: { type: "integer" },
                    priorityWeight: { type: "number" },
                    notes: { type: "string" },
                  },
                  required: [
                    "exerciseSlug",
                    "variationName",
                    "difficultyTier",
                    "sets",
                    "reps",
                  ],
                },
              },
            },
            required: ["name", "exercises"],
          },
        },
      },
      required: ["name", "daysPerWeek", "days"],
    },
    nutritionPlan: {
      type: "object",
      properties: {
        dailyCalories: { type: "integer" },
        proteinG: { type: "integer" },
        carbsG: { type: "integer" },
        fatG: { type: "integer" },
        mealTemplates: {
          type: "array",
          items: {
            type: "object",
            properties: {
              meal: { type: "string" },
              suggestion: { type: "string" },
            },
            required: ["meal", "suggestion"],
          },
        },
      },
      required: [
        "dailyCalories",
        "proteinG",
        "carbsG",
        "fatG",
        "mealTemplates",
      ],
    },
  },
  required: ["characterAnalysis", "workoutPlan", "nutritionPlan"],
};

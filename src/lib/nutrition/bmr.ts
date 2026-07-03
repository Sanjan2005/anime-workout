import { Gender, Goal } from "@prisma/client";

const ACTIVITY_FACTOR = 1.55;

export interface NutritionInput {
  weightKg: number;
  heightCm: number;
  age: number;
  gender: Gender;
  goal: Goal;
}

export interface NutritionResult {
  bmr: number;
  tdee: number;
  calorieTarget: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

export function calculateBmr(input: NutritionInput): number {
  const { weightKg, heightCm, age, gender } = input;
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  if (gender === Gender.MALE) return base + 5;
  if (gender === Gender.FEMALE) return base - 161;
  return base - 78;
}

export function calculateNutrition(input: NutritionInput): NutritionResult {
  const bmr = calculateBmr(input);
  const tdee = bmr * ACTIVITY_FACTOR;

  let calorieTarget = tdee;
  if (input.goal === Goal.CUT) calorieTarget = tdee - 400;
  if (input.goal === Goal.BULK) calorieTarget = tdee + 300;

  const proteinG = Math.round(input.weightKg * 1.8);
  const fatG = Math.round((calorieTarget * 0.25) / 9);
  const carbsG = Math.round((calorieTarget - proteinG * 4 - fatG * 9) / 4);

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    calorieTarget: Math.round(calorieTarget),
    proteinG,
    carbsG: Math.max(0, carbsG),
    fatG,
  };
}

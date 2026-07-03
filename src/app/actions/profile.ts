"use server";

import { Gender, Goal } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { ensureUserProfile } from "@/lib/auth/user";
import { prisma } from "@/lib/db/prisma";
import { calculateNutrition } from "@/lib/nutrition/bmr";
import { createClient } from "@/lib/supabase/server";

export async function updateProfileAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) return { error: "Not authenticated" };

  await ensureUserProfile(user.id, user.email);

  const age = Number(formData.get("age"));
  const heightCm = Number(formData.get("heightCm"));
  const weightKg = Number(formData.get("weightKg"));
  const gender = formData.get("gender") as Gender;
  const goal = formData.get("goal") as Goal;
  const timezone = (formData.get("timezone") as string) || "UTC";

  if (!age || !heightCm || !weightKg || !gender || !goal) {
    return { error: "All fields are required" };
  }

  const nutrition = calculateNutrition({
    age,
    heightCm,
    weightKg,
    gender,
    goal,
  });

  await prisma.user.update({
    where: { id: user.id },
    data: {
      age,
      heightCm,
      weightKg,
      gender,
      goal,
      timezone,
      ...nutrition,
    },
  });

  revalidatePath("/profile");
  revalidatePath("/dashboard");

  return { success: true, nutrition };
}

export async function deleteAccountAction() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  await prisma.user.delete({ where: { id: user.id } }).catch(() => null);
  await supabase.auth.signOut();

  return { success: true };
}

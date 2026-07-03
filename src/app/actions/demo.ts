"use server";

import { seedDemoPlan } from "@/lib/demo/seed-demo-plan";
import { ensureUserProfile } from "@/lib/auth/user";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function seedDemoPlanAction() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) return { error: "Not authenticated" };

  await ensureUserProfile(user.id, user.email);
  await seedDemoPlan(user.id);

  revalidatePath("/dashboard");
  return { success: true };
}

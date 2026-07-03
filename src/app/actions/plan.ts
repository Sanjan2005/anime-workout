"use server";

import { revalidatePath } from "next/cache";
import { generateWorkoutPlanFromImages } from "@/lib/ai/generate-plan";
import { ensureUserProfile } from "@/lib/auth/user";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";

const IMAGE_MIME_MAP: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
  avif: "image/avif",
  svg: "image/svg+xml",
};

/** Resolve a reliable image MIME type — falls back to extension-based detection
 *  when the browser-reported type is lost through FormData / server actions. */
function resolveImageMime(reportedType: string, fileName: string): string {
  if (reportedType && reportedType !== "application/octet-stream") {
    return reportedType;
  }
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  return IMAGE_MIME_MAP[ext] ?? "image/jpeg";
}

async function uploadCharacterImage(
  userId: string,
  file: File,
  side: "front" | "back"
): Promise<string> {
  const supabase = createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${userId}/${side}-${Date.now()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage
    .from("character-images")
    .upload(path, buffer, { contentType: file.type, upsert: true });

  if (error) {
    throw new Error(`Image upload failed: ${error.message}`);
  }

  const { data } = supabase.storage.from("character-images").getPublicUrl(path);
  return data.publicUrl;
}

export async function generateWorkoutPlanAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) return { error: "Not authenticated" };

  await ensureUserProfile(user.id, user.email);

  const frontImage = formData.get("frontImage") as File | null;
  const backImage = formData.get("backImage") as File | null;

  if (!frontImage?.size || !backImage?.size) {
    return { error: "Both front and back images are required" };
  }

  if (frontImage.size > 5_000_000 || backImage.size > 5_000_000) {
    return { error: "Images must be under 5MB each" };
  }

  try {
    const frontBuffer = Buffer.from(await frontImage.arrayBuffer());
    const backBuffer = Buffer.from(await backImage.arrayBuffer());

    let frontUrl = "local://front";
    let backUrl = "local://back";

    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      frontUrl = await uploadCharacterImage(user.id, frontImage, "front");
      backUrl = await uploadCharacterImage(user.id, backImage, "back");
    }

    const frontMime = resolveImageMime(frontImage.type, frontImage.name);
    const backMime = resolveImageMime(backImage.type, backImage.name);

    const { planId, analysis } = await generateWorkoutPlanFromImages(
      user.id,
      frontBuffer,
      backBuffer,
      frontMime,
      backMime,
      frontUrl,
      backUrl
    );

    revalidatePath("/dashboard");
    revalidatePath("/plan");

    return { success: true, planId, analysis };
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Plan generation failed",
    };
  }
}

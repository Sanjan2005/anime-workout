import { AppNav } from "@/components/layout/app-nav";
import { ProfileForm } from "@/components/profile/profile-form";
import { DeleteAccountSection } from "@/components/profile/delete-account";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { ensureUserProfile } from "@/lib/auth/user";
import { prisma } from "@/lib/db/prisma";
import { createClient } from "@/lib/supabase/server";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser?.email) return null;

  await ensureUserProfile(authUser.id, authUser.email);
  const user = await prisma.user.findUnique({ where: { id: authUser.id } });

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <AppNav />
      <main className="container py-8 max-w-2xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="text-muted-foreground">{authUser.email}</p>
        </div>
        <ProfileForm initial={user ?? undefined} />
        <div className="flex justify-end">
          <SignOutButton />
        </div>
        <DeleteAccountSection />
      </main>
    </div>
  );
}

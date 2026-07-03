import { AppNav } from "@/components/layout/app-nav";
import { PlanGeneratorForm } from "@/components/workout/plan-generator-form";
import { ErrorBoundary } from "@/components/error-boundary";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ensureUserProfile, getCurrentUser } from "@/lib/auth/user";
import { createClient } from "@/lib/supabase/server";
import { AI_DAILY_LIMIT } from "@/lib/constants";

export default async function PlanPage() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser?.email) return null;

  await ensureUserProfile(authUser.id, authUser.email);
  const user = await getCurrentUser(authUser.id);

  const profileComplete =
    user?.heightCm && user?.weightKg && user?.gender && user?.goal;

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <AppNav />
      <main className="container py-8 max-w-2xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Character Plan</h1>
          <p className="text-muted-foreground">
            Upload anime character references for AI-powered plan generation
          </p>
        </div>

        {!profileComplete && (
          <Card className="border-orange-500/30 bg-orange-950/10">
            <CardHeader>
              <CardTitle className="text-base">Profile Required</CardTitle>
              <CardDescription>
                Complete your height, weight, gender, and goal on the Profile page
                before generating a plan.
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        <Card className="border-violet-500/20">
          <CardContent className="pt-6 text-sm text-muted-foreground">
            Uses Google AI Studio Gemini Flash (free tier). Limit: {AI_DAILY_LIMIT}{" "}
            generations per day. Never enable Google Cloud billing for this key.
          </CardContent>
        </Card>

        <ErrorBoundary>
          {profileComplete ? (
            <PlanGeneratorForm />
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Set up your profile first to unlock plan generation.
              </CardContent>
            </Card>
          )}
        </ErrorBoundary>
      </main>
    </div>
  );
}

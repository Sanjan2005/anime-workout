"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { updateProfileAction } from "@/app/actions/profile";
import { toast } from "@/components/ui/use-toast";
import { Gender, Goal } from "@prisma/client";

interface ProfileFormProps {
  initial?: {
    age?: number | null;
    heightCm?: number | null;
    weightKg?: number | null;
    gender?: Gender | null;
    goal?: Goal | null;
    timezone?: string;
    bmr?: number | null;
    tdee?: number | null;
    calorieTarget?: number | null;
    proteinG?: number | null;
    carbsG?: number | null;
    fatG?: number | null;
  };
}

export function ProfileForm({ initial }: ProfileFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [gender, setGender] = useState<string>(initial?.gender ?? "");
  const [goal, setGoal] = useState<string>(initial?.goal ?? "");
  const [preview, setPreview] = useState<{
    bmr: number;
    tdee: number;
    calorieTarget: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
  } | null>(
    initial?.bmr
      ? {
          bmr: initial.bmr,
          tdee: initial.tdee!,
          calorieTarget: initial.calorieTarget!,
          proteinG: initial.proteinG!,
          carbsG: initial.carbsG!,
          fatG: initial.fatG!,
        }
      : null
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await updateProfileAction(formData);
    setLoading(false);

    if (result.error) {
      toast({ title: "Error", description: result.error });
      return;
    }

    if (result.nutrition) setPreview(result.nutrition);
    toast({ title: "Profile saved", description: "Your metrics have been updated." });
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Metrics</CardTitle>
        <CardDescription>
          Used to calculate BMR, TDEE, and calorie targets for cut/bulk.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input id="age" name="age" type="number" defaultValue={initial?.age ?? ""} required min={13} max={100} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="heightCm">Height (cm)</Label>
              <Input id="heightCm" name="heightCm" type="number" defaultValue={initial?.heightCm ?? ""} required min={100} max={250} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weightKg">Weight (kg)</Label>
              <Input id="weightKg" name="weightKg" type="number" step="0.1" defaultValue={initial?.weightKg ?? ""} required min={30} max={300} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Input id="timezone" name="timezone" defaultValue={initial?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Gender</Label>
              <Select value={gender} onValueChange={setGender} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MALE">Male</SelectItem>
                  <SelectItem value="FEMALE">Female</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
              <input type="hidden" name="gender" value={gender} />
            </div>
            <div className="space-y-2">
              <Label>Goal</Label>
              <Select value={goal} onValueChange={setGoal} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select goal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CUT">Cut (calorie deficit)</SelectItem>
                  <SelectItem value="BULK">Bulk (calorie surplus)</SelectItem>
                  <SelectItem value="MAINTAIN">Maintain</SelectItem>
                </SelectContent>
              </Select>
              <input type="hidden" name="goal" value={goal} />
            </div>
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Profile"}
          </Button>
        </form>

        {preview && (
          <div className="mt-6 rounded-lg border p-4 space-y-2">
            <h3 className="font-semibold">Nutrition Targets</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="text-muted-foreground">BMR</span>
              <span>{preview.bmr} kcal</span>
              <span className="text-muted-foreground">TDEE</span>
              <span>{preview.tdee} kcal</span>
              <span className="text-muted-foreground">Daily Target</span>
              <span className="font-bold text-violet-400">{preview.calorieTarget} kcal</span>
              <span className="text-muted-foreground">Protein</span>
              <span>{preview.proteinG}g</span>
              <span className="text-muted-foreground">Carbs</span>
              <span>{preview.carbsG}g</span>
              <span className="text-muted-foreground">Fat</span>
              <span>{preview.fatG}g</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

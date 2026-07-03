"use client";

import { useState } from "react";
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
import { generateWorkoutPlanAction } from "@/app/actions/plan";
import { toast } from "@/components/ui/use-toast";
import { Loader2, Upload } from "lucide-react";

export function PlanGeneratorForm() {
  const [frontImage, setFrontImage] = useState<File | null>(null);
  const [backImage, setBackImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<{
    physiqueType: string;
    animeRankFlavor: string;
    realismNote: string;
  } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!frontImage || !backImage) {
      toast({ title: "Missing images", description: "Upload front and back character images." });
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("frontImage", frontImage);
      formData.append("backImage", backImage);

      const result = await generateWorkoutPlanAction(formData);
      if (result.error) {
        toast({ title: "Generation failed", description: result.error });
        return;
      }

      setAnalysis(result.analysis ?? null);
      toast({
        title: "Plan generated!",
        description: "Your anime-inspired workout plan is ready.",
      });
      window.location.href = "/dashboard";
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generate Character Plan</CardTitle>
        <CardDescription>
          Upload front/back anime character reference images. Uses Google AI Studio
          Gemini Flash (free tier).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="front">Front view</Label>
              <Input
                id="front"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => setFrontImage(e.target.files?.[0] ?? null)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="back">Back view</Label>
              <Input
                id="back"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => setBackImage(e.target.files?.[0] ?? null)}
              />
            </div>
          </div>

          {analysis && (
            <div className="rounded-lg border border-violet-500/30 bg-violet-950/20 p-4 text-sm">
              <p className="font-medium">{analysis.animeRankFlavor}</p>
              <p className="text-muted-foreground mt-1">{analysis.realismNote}</p>
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing character...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Generate Workout Plan
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export function AdjustDifficultyForm({ planId }: { planId: string }) {
  const [loading, setLoading] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Adjust Difficulty</CardTitle>
        <CardDescription>Regenerate with harder or easier variations</CardDescription>
      </CardHeader>
      <CardContent>
        <Select disabled={loading}>
          <SelectTrigger>
            <SelectValue placeholder="Select adjustment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="easier">Make Easier (-1 tier)</SelectItem>
            <SelectItem value="harder">Make Harder (+1 tier)</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground mt-2">
          Re-upload character images on the Plan page to regenerate with Gemini.
        </p>
      </CardContent>
    </Card>
  );
}

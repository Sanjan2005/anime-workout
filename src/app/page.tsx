import Link from "next/link";
import { Flame, Swords, Trophy, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <header className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2 font-bold">
          <Flame className="h-6 w-6 text-violet-400" />
          Anime Workout RPG
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" asChild>
            <Link href="/login">Log in</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">Start Training</Link>
          </Button>
        </div>
      </header>

      <main className="container py-16 md:py-24">
        <div className="mx-auto max-w-3xl text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-black tracking-tight">
            Train Like an{" "}
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-orange-400 bg-clip-text text-transparent">
              Anime Hero
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Upload your target character, get personalized workout and nutrition
            plans, and level up from F-Rank Adventurer to S-Rank Hero — 50 XP per
            day, every set counts.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button size="lg" asChild>
              <Link href="/signup">Begin Your Arc</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">Returning Hunter</Link>
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-20 max-w-4xl mx-auto">
          {[
            {
              icon: Swords,
              title: "Character Plans",
              desc: "Gemini Flash analyzes anime physique and builds bodyweight routines.",
            },
            {
              icon: Zap,
              title: "50 XP Daily Cap",
              desc: "Fair XP split across exercises. Harder moves earn more per set.",
            },
            {
              icon: Trophy,
              title: "Ranks & Streaks",
              desc: "Level up, unlock anime-inspired ranks, and build daily streaks.",
            },
          ].map(({ icon: Icon, title, desc }) => (
            <Card key={title}>
              <CardContent className="pt-6 space-y-2">
                <Icon className="h-8 w-8 text-violet-400" />
                <h3 className="font-bold">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}

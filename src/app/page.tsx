"use client";

import Link from "next/link";
import { Flame, Swords, Trophy, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100, damping: 10 },
  },
};

export default function HomePage() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      {/* Optional ambient background effect can go here in the future */}
      
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="container flex h-16 items-center justify-between relative z-10"
      >
        <div className="flex items-center gap-2 font-bold font-orbitron text-xl">
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
      </motion.header>

      <main className="container py-16 md:py-24 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mx-auto max-w-3xl text-center space-y-8"
        >
          <motion.div variants={itemVariants} className="relative inline-block">
            {/* Radial Glow behind text */}
            <div className="absolute inset-0 bg-violet-600/20 blur-[60px] rounded-full mix-blend-screen -z-10" />
            <h1 className="text-5xl md:text-7xl font-black tracking-tight font-orbitron uppercase drop-shadow-[0_0_15px_rgba(167,139,250,0.3)]">
              Train Like an{" "}
              <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-orange-400 bg-clip-text text-transparent">
                Anime Hero
              </span>
            </h1>
          </motion.div>
          
          <motion.p variants={itemVariants} className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Upload your target character, get personalized workout and nutrition
            plans, and level up from F-Rank Adventurer to S-Rank Hero — 50 XP per
            day, every set counts.
          </motion.p>
          
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button size="lg" className="relative group overflow-hidden bg-violet-600 hover:bg-violet-500 text-white font-orbitron tracking-wide border border-violet-400/50 shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.6)] transition-all duration-300" asChild>
                <Link href="/signup">
                  <span className="relative z-10">Begin Your Arc</span>
                  {/* Shimmer Glint Effect */}
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover:animate-shimmer-slide skew-x-12 z-0" />
                </Link>
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button size="lg" variant="outline" className="font-orbitron tracking-wide border-violet-500/30 hover:border-violet-500 hover:bg-violet-500/10 transition-colors" asChild>
                <Link href="/login">Returning Hunter</Link>
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid md:grid-cols-3 gap-6 mt-24 max-w-4xl mx-auto"
        >
          {[
            {
              icon: Swords,
              title: "Character Plans",
              desc: "Gemini Flash analyzes anime physique and builds bodyweight routines.",
              iconHover: "group-hover:rotate-12 group-hover:scale-110",
            },
            {
              icon: Zap,
              title: "50 XP Daily Cap",
              desc: "Fair XP split across exercises. Harder moves earn more per set.",
              iconHover: "group-hover:-rotate-12 group-hover:scale-110",
            },
            {
              icon: Trophy,
              title: "Ranks & Streaks",
              desc: "Level up, unlock anime-inspired ranks, and build daily streaks.",
              iconHover: "group-hover:scale-110 group-hover:-translate-y-1",
            },
          ].map(({ icon: Icon, title, desc, iconHover }) => (
            <motion.div
              key={title}
              variants={itemVariants}
              whileHover={{ y: -8 }}
              className="group cursor-default"
            >
              <Card className="h-full bg-card/50 backdrop-blur-sm border-border transition-all duration-300 group-hover:border-violet-500 group-hover:shadow-[0_0_20px_rgba(139,92,246,0.3)]">
                <CardContent className="pt-6 space-y-3">
                  <Icon className={`h-10 w-10 text-violet-400 transition-all duration-300 ${iconHover}`} />
                  <h3 className="font-bold text-xl font-orbitron tracking-wide">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </main>
    </div>
  );
}

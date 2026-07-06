"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { AmbientBackground } from "@/components/ambient-background";
import { motion } from "framer-motion";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });

    setLoading(false);
    if (authError) {
      setError(authError.message);
      return;
    }

    router.push("/profile");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative z-0">
      <AmbientBackground />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <Card className="w-full max-w-md bg-card/80 backdrop-blur-md border-violet-500/20 shadow-[0_0_40px_rgba(139,92,246,0.1)]">
          <CardHeader>
            <CardTitle className="font-orbitron tracking-wide text-2xl">Sign Up</CardTitle>
            <CardDescription className="text-muted-foreground">Register as a Novice Adventurer</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="transition-all duration-300 focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:border-violet-500 focus-visible:shadow-[0_0_15px_rgba(139,92,246,0.5)]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="transition-all duration-300 focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:border-violet-500 focus-visible:shadow-[0_0_15px_rgba(139,92,246,0.5)]"
                />
              </div>
              {error && <p className="text-sm text-destructive font-semibold">{error}</p>}
              
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="pt-2">
                <Button 
                  type="submit" 
                  className="w-full relative group overflow-hidden bg-violet-600 hover:bg-violet-500 text-white font-orbitron tracking-wide border border-violet-400/50 hover:shadow-[0_0_20px_rgba(139,92,246,0.6)] transition-all duration-300" 
                  disabled={loading}
                >
                  <span className="relative z-10">{loading ? "Forging Account..." : "Create Account"}</span>
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover:animate-shimmer-slide skew-x-12 z-0" />
                </Button>
              </motion.div>
            </form>
            <p className="text-sm text-muted-foreground text-center mt-6">
              Already registered?{" "}
              <Link href="/login" className="text-violet-400 hover:text-violet-300 hover:underline hover:drop-shadow-[0_0_8px_rgba(167,139,250,0.8)] transition-all">
                Log in
              </Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

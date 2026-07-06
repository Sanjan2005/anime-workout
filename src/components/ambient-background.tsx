"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function AmbientBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Generate an array of 30 particles with random properties
  const particles = Array.from({ length: 30 }).map((_, i) => ({
    id: i,
    size: Math.random() * 4 + 1, // 1px to 5px
    startX: Math.random() * 100, // 0% to 100% vw
    duration: Math.random() * 15 + 15, // 15s to 30s
    delay: Math.random() * -30, // Negative delay so they start already on screen
    opacityMax: Math.random() * 0.5 + 0.1, // 0.1 to 0.6
  }));

  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden bg-background">
      {/* Subtle radial glow in the center */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-violet-900/10 rounded-full blur-[120px]" />
      
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute bottom-0 rounded-full bg-violet-400"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.startX}%`,
            boxShadow: `0 0 ${p.size * 2}px rgba(167, 139, 250, 0.8)`,
          }}
          animate={{
            y: ["100vh", "-100vh"],
            x: [0, Math.random() * 100 - 50, 0], // Sway back and forth
            opacity: [0, p.opacityMax, p.opacityMax, 0],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "linear",
            opacity: {
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              times: [0, 0.2, 0.8, 1],
            },
            x: {
              duration: p.duration / 2,
              repeat: Infinity,
              repeatType: "mirror",
              ease: "easeInOut",
            }
          }}
        />
      ))}
    </div>
  );
}

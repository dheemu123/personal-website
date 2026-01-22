"use client";

import { motion } from "framer-motion";
import { useRef, useEffect, useState, useMemo } from "react";

interface IntroAnimationProps {
  onComplete: () => void;
}

// Animation phases
type Phase = "dm-show" | "dm-arrange" | "typeout" | "settle";

// Typewriter text component
function TypewriterText({ 
  text, 
  charDelay = 0.1,
  onComplete,
}: { 
  text: string; 
  charDelay?: number;
  onComplete?: () => void;
}) {
  const [displayedChars, setDisplayedChars] = useState(1); // Start with first char already shown (D or M)
  
  useEffect(() => {
    if (displayedChars >= text.length) {
      onComplete?.();
      return;
    }
    
    const timeout = setTimeout(() => {
      setDisplayedChars(prev => prev + 1);
    }, charDelay * 1000);
    
    return () => clearTimeout(timeout);
  }, [displayedChars, text.length, charDelay, onComplete]);
  
  return (
    <span className="inline-block">
      {text.slice(0, displayedChars)}
      {displayedChars < text.length && (
        <motion.span
          className="inline-block w-[3px] h-[0.85em] bg-stone-900 ml-1 align-middle"
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        />
      )}
    </span>
  );
}

// Floating particles for atmosphere
function FloatingParticles() {
  const particles = useMemo(() => {
    return Array.from({ length: 25 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 4 + 3,
      delay: Math.random() * 2,
    }));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-blue-200/30"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
          }}
          initial={{ opacity: 0 }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

export default function IntroAnimation({ onComplete }: IntroAnimationProps) {
  const [phase, setPhase] = useState<Phase>("dm-show");
  const [dComplete, setDComplete] = useState(false);
  const [mComplete, setMComplete] = useState(false);
  const hasCompleted = useRef(false);

  // Phase progression
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    
    // Phase 1: Show D and M (1.2s)
    // Phase 2: Arrange vertically (starts at 1.2s, takes ~1s)
    timers.push(setTimeout(() => setPhase("dm-arrange"), 1200));
    
    // Phase 3: Start typeout (starts at 2.4s)
    timers.push(setTimeout(() => setPhase("typeout"), 2400));
    
    return () => timers.forEach(clearTimeout);
  }, []);

  // Check if both typeouts are complete
  useEffect(() => {
    if (dComplete && mComplete && phase === "typeout") {
      // Wait 1 second after typing, then zoom
      setTimeout(() => {
        setPhase("settle");
        
        // Complete after zoom animation finishes
        setTimeout(() => {
          if (!hasCompleted.current) {
            hasCompleted.current = true;
            onComplete();
          }
        }, 500);
      }, 1000);
    }
  }, [dComplete, mComplete, phase, onComplete]);

  return (
    <div className="fixed inset-0 z-40 bg-white overflow-hidden">
      {/* Floating particles for atmosphere */}
      <FloatingParticles />

      {/* Main content */}
      <div className="h-screen flex items-center justify-center overflow-hidden">
        
        {/* Phase 1: D and M shown together horizontally */}
        {phase === "dm-show" && (
          <motion.div
            className="flex items-center justify-center gap-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{ perspective: "1000px" }}
          >
            <motion.span
              className="font-bodoni text-[12rem] md:text-[16rem] lg:text-[20rem] tracking-tight text-stone-900"
              initial={{ rotateY: -15, x: -30 }}
              animate={{ rotateY: 0, x: 0 }}
              transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
              style={{ 
                transformStyle: "preserve-3d",
                textShadow: "0 15px 40px rgba(0,0,0,0.1)",
              }}
            >
              D
            </motion.span>
            <motion.span
              className="font-bodoni text-[12rem] md:text-[16rem] lg:text-[20rem] tracking-tight text-stone-900"
              initial={{ rotateY: 15, x: 30 }}
              animate={{ rotateY: 0, x: 0 }}
              transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1], delay: 0.1 }}
              style={{ 
                transformStyle: "preserve-3d",
                textShadow: "0 15px 40px rgba(0,0,0,0.1)",
              }}
            >
              M
            </motion.span>
          </motion.div>
        )}

        {/* Phase 2: D and M arranging vertically */}
        {phase === "dm-arrange" && (
          <motion.div
            className="relative z-10 flex flex-col items-center"
            initial={{ opacity: 1 }}
            style={{ perspective: "1000px" }}
          >
            <motion.span
              className="font-bodoni text-7xl md:text-9xl lg:text-[10rem] xl:text-[12rem] tracking-tight text-stone-900 block"
              initial={{ 
                scale: 1.8, 
                x: -120, 
                y: 80,
                rotateY: -10,
              }}
              animate={{ 
                scale: 1, 
                x: 0, 
                y: 0,
                rotateY: 0,
              }}
              transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
              style={{ 
                transformStyle: "preserve-3d",
                textShadow: "0 10px 30px rgba(0,0,0,0.08)",
              }}
            >
              D
            </motion.span>
            <motion.span
              className="font-bodoni text-7xl md:text-9xl lg:text-[10rem] xl:text-[12rem] tracking-tight text-stone-900 block"
              initial={{ 
                scale: 1.8, 
                x: 120, 
                y: -80,
                rotateY: 10,
              }}
              animate={{ 
                scale: 1, 
                x: 0, 
                y: 0,
                rotateY: 0,
              }}
              transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1], delay: 0.05 }}
              style={{ 
                transformStyle: "preserve-3d",
                textShadow: "0 10px 30px rgba(0,0,0,0.08)",
              }}
            >
              M
            </motion.span>
          </motion.div>
        )}

        {/* Phase 3: Typeout */}
        {phase === "typeout" && (
          <motion.div
            className="relative z-10 flex flex-col items-center"
          >
            <span
              className="font-bodoni text-7xl md:text-9xl lg:text-[10rem] xl:text-[12rem] tracking-tight text-stone-900 block"
            >
              <TypewriterText 
                text="Dheemanth" 
                charDelay={0.25}
                onComplete={() => setDComplete(true)}
              />
            </span>
            <span
              className="font-bodoni text-7xl md:text-9xl lg:text-[10rem] xl:text-[12rem] tracking-tight text-stone-900 block"
            >
              <TypewriterText 
                text="Munipalli" 
                charDelay={0.25}
                onComplete={() => setMComplete(true)}
              />
            </span>
          </motion.div>
        )}

        {/* Phase 4: Settle - exact match to homepage */}
        {phase === "settle" && (
          <motion.div
            className="relative z-10 flex flex-col items-center"
            initial={{ scale: 1 }}
            animate={{ scale: 1.2 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <span className="font-bodoni text-7xl md:text-9xl lg:text-[10rem] xl:text-[12rem] tracking-tight text-stone-900 block">
              Dheemanth
            </span>
            <span className="font-bodoni text-7xl md:text-9xl lg:text-[10rem] xl:text-[12rem] tracking-tight text-stone-900 block">
              Munipalli
            </span>
          </motion.div>
        )}
      </div>

      {/* Subtle vignette */}
      <div 
        className="absolute inset-0 pointer-events-none" 
        style={{
          background: "radial-gradient(ellipse at center, transparent 60%, rgba(255,255,255,0.4) 100%)",
        }}
      />
    </div>
  );
}

"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import HobbiesStage3D, { HOBBIES } from "./HobbiesStage3D";

// Arrow button component
function ArrowButton({ 
  direction, 
  onClick, 
  disabled 
}: { 
  direction: "left" | "right"; 
  onClick: () => void; 
  disabled: boolean;
}) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-12 h-12 rounded-full border border-stone-700 
        flex items-center justify-center
        transition-all duration-300
        ${disabled 
          ? "opacity-30 cursor-not-allowed" 
          : "hover:border-blue-400 hover:bg-blue-400/10 cursor-pointer"
        }
      `}
      whileHover={disabled ? {} : { scale: 1.1 }}
      whileTap={disabled ? {} : { scale: 0.95 }}
      aria-label={direction === "left" ? "Previous hobby" : "Next hobby"}
    >
      <svg 
        width="20" 
        height="20" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2"
        className={`text-stone-300 ${direction === "left" ? "rotate-180" : ""}`}
      >
        <path d="M9 18l6-6-6-6" />
      </svg>
    </motion.button>
  );
}

export default function HobbiesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isInView, setIsInView] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  
  // Animation progress (0 to 1) - time-based, triggered when section is in view
  const [animationProgress, setAnimationProgress] = useState(0);
  const animationRef = useRef<number | null>(null);
  const hasAnimatedRef = useRef(false);
  
  // Track if section is in view with snap detection
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        const nowInView = entry.isIntersecting && entry.intersectionRatio > 0.5;
        setIsInView(nowInView);
        
        // Start animation when section snaps into view (and hasn't animated yet)
        if (nowInView && !hasAnimatedRef.current && activeIndex === 0) {
          hasAnimatedRef.current = true;
          startAnimation();
        }
      },
      { threshold: [0.5, 0.75, 1.0] }
    );
    
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    
    return () => observer.disconnect();
  }, [activeIndex]);
  
  // Animation function - runs the basketball/model entrance
  const startAnimation = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    setAnimationProgress(0);
    const startTime = performance.now();
    const duration = shouldReduceMotion ? 500 : 1500; // 1.5 seconds for the animation
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      
      setAnimationProgress(eased);
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setAnimationComplete(true);
      }
    };
    
    animationRef.current = requestAnimationFrame(animate);
  }, [shouldReduceMotion]);
  
  // Handle switching hobbies - reset and animate
  useEffect(() => {
    // Cancel any existing animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    // For basketball (index 0), only animate if we're returning to it
    if (activeIndex === 0) {
      if (hasAnimatedRef.current) {
        // Already animated once, keep it complete
        setAnimationProgress(1);
        setAnimationComplete(true);
      }
      return;
    }
    
    // For other hobbies, animate their entrance
    setAnimationComplete(false);
    startAnimation();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [activeIndex, startAnimation]);
  
  // Navigate to next hobby
  const goToNext = useCallback(() => {
    setActiveIndex((prev) => Math.min(prev + 1, HOBBIES.length - 1));
  }, []);
  
  // Navigate to previous hobby
  const goToPrev = useCallback(() => {
    setActiveIndex((prev) => Math.max(prev - 1, 0));
  }, []);
  
  // Keyboard navigation with left/right arrows
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isInView || !animationComplete) return;
    
    if (e.key === "ArrowRight") {
      e.preventDefault();
      goToNext();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      goToPrev();
    }
  }, [isInView, animationComplete, goToNext, goToPrev]);
  
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
  
  // Current hobby data
  const currentHobby = HOBBIES[activeIndex];

  return (
    <section
      id="hobbies"
      ref={sectionRef}
      className="h-screen relative z-10"
      tabIndex={0}
      aria-label="Hobbies"
    >
      {/* Full screen stage - transparent to show shader background */}
      <div className="h-full flex items-center justify-center overflow-hidden">
        
        <div className="max-w-7xl mx-auto px-8 w-full relative">
          {/* 3D canvas */}
          <div className="absolute inset-0 top-1/2 -translate-y-1/2 h-screen">
            <HobbiesStage3D
              activeIndex={activeIndex}
              progress={animationProgress}
            />
          </div>
          
          {/* Content overlay - centered vertically */}
          <div className="relative z-10 pointer-events-none">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center w-full">
              {/* Left side - Text content */}
              <div className="order-2 lg:order-1 pointer-events-auto">
                {/* Section label */}
                <p className="text-sm font-medium tracking-[0.3em] uppercase mb-6 text-blue-400">
                  Hobbies
                </p>
                
                {/* Hobby label with animation */}
                <div className="relative h-20 md:h-24 mb-4 overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.h2
                      key={currentHobby.id}
                      initial={{ opacity: 0, y: 40 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -40 }}
                      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                      className="font-bodoni text-5xl md:text-6xl lg:text-7xl tracking-tight absolute text-stone-100"
                    >
                      {currentHobby.label}
                    </motion.h2>
                  </AnimatePresence>
                </div>
                
                {/* Description with animation */}
                <div className="relative min-h-[80px] mb-8">
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={currentHobby.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.4, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
                      className="text-lg md:text-xl leading-relaxed max-w-md font-didact text-stone-400"
                    >
                      {currentHobby.description}
                    </motion.p>
                  </AnimatePresence>
                </div>
                
                {/* Navigation arrows and progress indicators */}
                <div className="flex items-center gap-6">
                  {/* Left arrow */}
                  <AnimatePresence>
                    {animationComplete && (
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ArrowButton 
                          direction="left" 
                          onClick={goToPrev}
                          disabled={activeIndex === 0}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  {/* Progress indicators */}
                  <div className="flex items-center gap-3">
                    {HOBBIES.map((hobby, idx) => (
                      <motion.button
                        key={hobby.id}
                        onClick={() => animationComplete && setActiveIndex(idx)}
                        className={`relative ${animationComplete ? "cursor-pointer" : "cursor-default"}`}
                        animate={{
                          scale: idx === activeIndex ? 1.2 : 1,
                        }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        aria-label={`Go to ${hobby.label}`}
                      >
                        <motion.div
                          className="w-2 h-2 rounded-full"
                          animate={{
                            backgroundColor: idx === activeIndex ? "#60a5fa" : "#525252",
                          }}
                          transition={{ duration: 0.3 }}
                        />
                        {idx === activeIndex && (
                          <motion.div
                            className="absolute inset-0 rounded-full bg-blue-400"
                            initial={{ scale: 1 }}
                            animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          />
                        )}
                      </motion.button>
                    ))}
                  </div>
                  
                  {/* Right arrow */}
                  <AnimatePresence>
                    {animationComplete && (
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ArrowButton 
                          direction="right" 
                          onClick={goToNext}
                          disabled={activeIndex === HOBBIES.length - 1}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                {/* Navigation hint */}
                <AnimatePresence mode="wait">
                  <motion.p
                    key={animationComplete ? "arrows" : "wait"}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="mt-6 text-xs tracking-wide text-stone-600"
                  >
                    {animationComplete 
                      ? "Use arrows or click dots to navigate" 
                      : ""
                    }
                  </motion.p>
                </AnimatePresence>
              </div>
              
              {/* Right side - empty, 3D model renders in canvas */}
              <div className="order-1 lg:order-2" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

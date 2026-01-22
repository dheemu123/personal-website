"use client";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

export interface Experience {
  company: string;
  role: string;
  dates: string;
  summary: string;
  logoSrc?: string;
}

interface ExperienceDetailsCardProps {
  experience: Experience;
  activeIndex: number;
  direction: 1 | -1;
}

export default function ExperienceDetailsCard({
  experience,
  activeIndex,
  direction,
}: ExperienceDetailsCardProps) {
  const shouldReduceMotion = useReducedMotion();

  const variants = {
    enter: (dir: number) => ({
      x: shouldReduceMotion ? 0 : dir > 0 ? -30 : 30,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: shouldReduceMotion ? 0 : dir > 0 ? 30 : -30,
      opacity: 0,
    }),
  };

  return (
    <div className="relative h-full flex items-center">
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={activeIndex}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 },
          }}
          className="w-full"
        >
          {/* Glass card container */}
          <div className="relative">
            {/* Glow background */}
            <div className="absolute -inset-4 bg-gradient-to-br from-blue-200/40 to-blue-400/20 rounded-2xl blur-2xl" />
            
            {/* Card - fixed height for consistency */}
            <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-2xl shadow-blue-500/10 h-[320px] flex flex-col justify-between">
              <div>
                {/* Company & Role */}
                <div className="mb-4">
                  <p className="text-blue-500 text-sm font-medium tracking-[0.2em] uppercase mb-2">
                    {experience.company}
                  </p>
                  <h3 className="font-bodoni text-2xl md:text-3xl lg:text-4xl text-stone-900 leading-tight tracking-tight">
                    {experience.role}
                  </h3>
                </div>

                {/* Dates */}
                <p className="text-stone-500 text-sm font-medium tracking-wide mb-4">
                  {experience.dates}
                </p>

                {/* Summary / Impact */}
                <div className="font-didact">
                  <p className="text-base md:text-lg text-stone-600 leading-relaxed">
                    {experience.summary}
                  </p>
                </div>
              </div>

              {/* Decorative line - pushed to bottom */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                className="h-px bg-gradient-to-r from-blue-500 via-blue-400 to-transparent origin-left max-w-xs"
              />
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

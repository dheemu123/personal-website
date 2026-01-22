"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Experience } from "./ExperienceDetailsCard";

interface ExperienceLogoCarousel3DProps {
  experiences: Experience[];
  activeIndex: number;
  direction: 1 | -1;
}

// Single card component for the carousel
function CarouselCard({
  experience,
  position,
  isActive,
}: {
  experience: Experience;
  position: number; // -1 = left, 0 = center, 1 = right
  isActive: boolean;
}) {
  const shouldReduceMotion = useReducedMotion();

  // Position calculations for 3 cards: left (-1), center (0), right (1)
  const xOffset = position * 220; // horizontal spacing between cards
  const zOffset = isActive ? 50 : -60; // center card comes forward, side cards go back
  const rotateY = position * -45; // angle side cards to face center
  const scale = isActive ? 1 : 0.7;
  const opacity = isActive ? 1 : 0.45;

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center"
      style={{ transformStyle: "preserve-3d" }}
    >
      <motion.div
        className="w-64 h-64 md:w-72 md:h-72 lg:w-80 lg:h-80"
        animate={{
          x: shouldReduceMotion ? xOffset : xOffset,
          z: shouldReduceMotion ? 0 : zOffset,
          rotateY: shouldReduceMotion ? 0 : rotateY,
          scale,
          opacity,
        }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 25,
        }}
        style={{
          transformStyle: "preserve-3d",
        }}
      >
        {/* Shadow layer */}
        <div
          className="absolute inset-0 rounded-2xl"
          style={{
            background: isActive ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.1)",
            filter: "blur(25px)",
            transform: "translateY(15px) scale(0.9)",
          }}
        />

        {/* Main card panel */}
        <div
          className="absolute inset-0 rounded-2xl overflow-hidden"
          style={{
            transformStyle: "preserve-3d",
            backfaceVisibility: "hidden",
          }}
        >
          {/* Glass panel background */}
          <div
            className={`absolute inset-0 backdrop-blur-md transition-all duration-300 ${
              isActive
                ? "bg-gradient-to-br from-white/95 via-white/90 to-white/80"
                : "bg-gradient-to-br from-white/50 via-white/40 to-white/30"
            }`}
          />

          {/* Subtle gradient overlay */}
          <div
            className={`absolute inset-0 transition-opacity duration-300 ${
              isActive ? "opacity-100" : "opacity-30"
            }`}
            style={{
              background:
                "linear-gradient(135deg, rgba(59,130,246,0.15) 0%, transparent 50%, rgba(59,130,246,0.08) 100%)",
            }}
          />

          {/* Border */}
          <div
            className={`absolute inset-0 rounded-2xl transition-all duration-300 ${
              isActive ? "border-2 border-blue-300/60" : "border border-white/20"
            }`}
          />

        {/* Content */}
        <div className="relative h-full flex items-center justify-center p-6">
          {experience.logoSrc ? (
            // Logo with faded edges
            <div
              className="relative w-[80%] h-[80%] flex items-center justify-center"
              style={{
                maskImage: "radial-gradient(ellipse 70% 70% at center, black 40%, transparent 100%)",
                WebkitMaskImage: "radial-gradient(ellipse 70% 70% at center, black 40%, transparent 100%)",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={experience.logoSrc}
                alt={`${experience.company} logo`}
                className="max-w-full max-h-full object-contain"
              />
            </div>
          ) : (
              // Company name as placeholder
              <div className="text-center px-3">
                <p
                  className={`font-bodoni text-xl md:text-2xl lg:text-3xl tracking-tight leading-tight transition-colors duration-300 ${
                    isActive ? "text-stone-800" : "text-stone-400"
                  }`}
                >
                  {experience.company}
                </p>
              </div>
            )}
          </div>

          {/* Highlight edge for active card */}
          {isActive && (
            <div
              className="absolute inset-0 rounded-2xl pointer-events-none"
              style={{
                boxShadow:
                  "inset 0 2px 4px rgba(255,255,255,0.9), inset 0 -1px 2px rgba(0,0,0,0.05)",
              }}
            />
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function ExperienceLogoCarousel3D({
  experiences,
  activeIndex,
}: ExperienceLogoCarousel3DProps) {
  // Get visible cards: previous (-1), current (0), next (1)
  // Max 3 cards, min 2 at edges
  const getVisibleCards = () => {
    const cards = [];

    // Previous card (left)
    if (activeIndex > 0) {
      cards.push({
        experience: experiences[activeIndex - 1],
        position: -1,
        index: activeIndex - 1,
      });
    }

    // Current card (center)
    cards.push({
      experience: experiences[activeIndex],
      position: 0,
      index: activeIndex,
    });

    // Next card (right)
    if (activeIndex < experiences.length - 1) {
      cards.push({
        experience: experiences[activeIndex + 1],
        position: 1,
        index: activeIndex + 1,
      });
    }

    return cards;
  };

  const visibleCards = getVisibleCards();

  return (
    <div
      className="relative w-full h-full min-h-[350px] flex items-center justify-center"
      style={{
        perspective: "1000px",
        perspectiveOrigin: "center center",
      }}
    >
      {/* 3D Stage */}
      <div
        className="relative w-full h-80 md:h-96"
        style={{ transformStyle: "preserve-3d" }}
      >
        {visibleCards.map(({ experience, position, index }) => (
          <CarouselCard
            key={index}
            experience={experience}
            position={position}
            isActive={position === 0}
          />
        ))}
      </div>
    </div>
  );
}

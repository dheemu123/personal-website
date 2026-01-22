"use client";

import { useState, useRef, useCallback } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import ExperienceDetailsCard, { Experience } from "./ExperienceDetailsCard";
import ExperienceLogoCarousel3D from "./ExperienceLogoCarousel3D";

// Experience data
const experiences: Experience[] = [
  {
    company: "Amazon",
    role: "Software Development Engineering Intern",
    dates: "May 2025 – August 2025",
    summary:
      "Built an autonomous matching system for Amazon Ads.",
    logoSrc: "/amazon logo.png",
  },
  {
    company: "AMD",
    role: "Data Scientist",
    dates: "August 2024 – January 2025",
    summary:
      "Developed ML and NLP pipelines to detect supply-chain diversion.",
    logoSrc: "/AMD logo.png",
  },
  {
    company: "Redhorse Corporation",
    role: "Machine Learning Engineering Intern",
    dates: "May 2024 – August 2024",
    summary:
      "Built an AI-driven human simulation platform using LLMs and reinforcement learning to model realistic decision-making at scale.",
    logoSrc: "/redhorse.png",
  },
  {
    company: "Ernst & Young (EY)",
    role: "Machine Learning Engineer – Cybersecurity",
    dates: "February 2024 – May 2024",
    summary:
      "Led development of an ML-based SIEM system for TikTok, achieving high-accuracy threat detection with streaming data pipelines.",
    logoSrc: "/ey logo.png",
  },
  {
    company: "Navy Federal Credit Union",
    role: "Software Engineering Intern",
    dates: "June 2023 – October 2023",
    summary:
      "Built an NLP-powered categorization system for open-banking APIs, increasing classification efficiency.",
    logoSrc: "/navy federal logo.jpg",
  },
  {
    company: "Databricks",
    role: "Data Engineering Consultant",
    dates: "February 2023 – June 2023",
    summary:
      "Designed scalable ETL and forecasting pipelines on Databricks to improve financial data processing and projections.",
    logoSrc: "/databricks logo.png",
  },
];

export default function ExperienceSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);

  // Scroll-based reveal animation for the section
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const sectionOpacity = useTransform(scrollYProgress, [0, 0.1, 0.9, 1], [0, 1, 1, 0]);
  const sectionY = useTransform(scrollYProgress, [0, 0.1], [50, 0]);

  // Navigation handlers
  const goToPrevious = useCallback(() => {
    if (activeIndex > 0) {
      setDirection(-1);
      setActiveIndex(activeIndex - 1);
    }
  }, [activeIndex]);

  const goToNext = useCallback(() => {
    if (activeIndex < experiences.length - 1) {
      setDirection(1);
      setActiveIndex(activeIndex + 1);
    }
  }, [activeIndex]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        goToPrevious();
      } else if (e.key === "ArrowRight") {
        goToNext();
      }
    },
    [goToPrevious, goToNext]
  );

  return (
    <section
      id="experience"
      ref={sectionRef}
      className="min-h-screen relative z-10 flex items-center py-16 md:py-24"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label="Work Experience"
    >
      <motion.div
        style={{ opacity: sectionOpacity, y: sectionY }}
        className="max-w-7xl mx-auto px-8 w-full"
      >
        {/* Section label with LinkedIn link */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-3 mb-12 justify-center lg:justify-start"
        >
          <p className="text-blue-500 text-sm font-medium tracking-[0.3em] uppercase">
            Experience
          </p>
          <a
            href="https://www.linkedin.com/in/dheemanth-munipalli/"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative"
            aria-label="View LinkedIn Profile"
          >
            {/* Pulsing glow ring */}
            <motion.div
              className="absolute inset-0 rounded-full bg-blue-400/30"
              animate={{
                scale: [1, 1.8, 1],
                opacity: [0.6, 0, 0.6],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.svg
              viewBox="0 0 24 24"
              className="w-5 h-5 text-blue-500 group-hover:text-blue-600 transition-colors relative z-10"
              fill="currentColor"
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.95 }}
            >
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </motion.svg>
          </a>
        </motion.div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left side - Experience details */}
          <div className="order-2 lg:order-1">
            <ExperienceDetailsCard
              experience={experiences[activeIndex]}
              activeIndex={activeIndex}
              direction={direction}
            />
          </div>

          {/* Right side - 3D Logo Carousel */}
          <div className="order-1 lg:order-2 h-[400px] w-full">
            <ExperienceLogoCarousel3D
              experiences={experiences}
              activeIndex={activeIndex}
              direction={direction}
            />
          </div>
        </div>

        {/* Navigation controls */}
        <div className="mt-12 flex items-center justify-center gap-6">
          {/* Left arrow */}
          <motion.button
            onClick={goToPrevious}
            disabled={activeIndex === 0}
            className="group relative p-3 rounded-full bg-white/80 backdrop-blur-sm shadow-lg shadow-blue-500/10 border border-white/60 disabled:opacity-40 disabled:cursor-not-allowed"
            whileHover={{ scale: activeIndex === 0 ? 1 : 1.1 }}
            whileTap={{ scale: activeIndex === 0 ? 1 : 0.95 }}
            aria-label="Previous experience"
          >
            <svg
              className="w-6 h-6 text-stone-700 group-hover:text-blue-500 transition-colors"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </motion.button>

          {/* Pagination dots */}
          <div className="flex items-center gap-2">
            {experiences.map((_, idx) => (
              <motion.button
                key={idx}
                onClick={() => {
                  setDirection(idx > activeIndex ? 1 : -1);
                  setActiveIndex(idx);
                }}
                className="relative p-1"
                aria-label={`Go to experience ${idx + 1}`}
              >
                <motion.div
                  className="w-2 h-2 rounded-full"
                  animate={{
                    scale: idx === activeIndex ? 1.3 : 1,
                    backgroundColor: idx === activeIndex ? "#3b82f6" : "#d1d5db",
                  }}
                  whileHover={{ scale: 1.4 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                />
              </motion.button>
            ))}
          </div>

          {/* Right arrow */}
          <motion.button
            onClick={goToNext}
            disabled={activeIndex === experiences.length - 1}
            className="group relative p-3 rounded-full bg-white/80 backdrop-blur-sm shadow-lg shadow-blue-500/10 border border-white/60 disabled:opacity-40 disabled:cursor-not-allowed"
            whileHover={{ scale: activeIndex === experiences.length - 1 ? 1 : 1.1 }}
            whileTap={{ scale: activeIndex === experiences.length - 1 ? 1 : 0.95 }}
            aria-label="Next experience"
          >
            <svg
              className="w-6 h-6 text-stone-700 group-hover:text-blue-500 transition-colors"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </motion.button>
        </div>

        {/* Keyboard hint */}
        <p className="mt-4 text-center text-xs text-stone-400 tracking-wide">
          Use arrow keys to navigate
        </p>
      </motion.div>
    </section>
  );
}

"use client";

import { motion, useScroll, useTransform, AnimatePresence, LayoutGroup } from "framer-motion";
import { HOBBIES_ENABLED } from "@/lib/config";
import { useEffect, useRef, useState, ComponentType } from "react";

// Animation phases
type AnimationPhase = "intro" | "ready";

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const experienceRef = useRef<HTMLDivElement>(null);
  const hobbiesRef = useRef<HTMLDivElement>(null);
  
  // Animation phase state - start directly with intro
  const [phase, setPhase] = useState<AnimationPhase>("intro");
  
  // Lazy load components on client only
  const [ShaderBackground, setShaderBackground] = useState<ComponentType | null>(null);
  const [TiltCard, setTiltCard] = useState<ComponentType<{ children: React.ReactNode; className?: string; tiltAmount?: number; floatIntensity?: number; floatSpeed?: number }> | null>(null);
  const [IntroAnimation, setIntroAnimation] = useState<ComponentType<{ onComplete: () => void }> | null>(null);
  const [ExperienceSection, setExperienceSection] = useState<ComponentType | null>(null);
  const [NavHeader, setNavHeader] = useState<ComponentType | null>(null);
  const [HobbiesSection, setHobbiesSection] = useState<ComponentType | null>(null);
  
  // On mount/refresh: always start at top, prevent scroll restoration
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.history.scrollRestoration = "manual";
      window.scrollTo(0, 0);
    }
  }, []);

  // Hide scrollbar during intro, show when ready
  useEffect(() => {
    if (typeof document === "undefined") return;
    const { documentElement, body } = document;
    if (phase === "intro") {
      documentElement.style.overflow = "hidden";
      body.style.overflow = "hidden";
    } else {
      documentElement.style.overflow = "";
      body.style.overflow = "";
    }
    return () => {
      documentElement.style.overflow = "";
      body.style.overflow = "";
    };
  }, [phase]);

  useEffect(() => {
    // Load components
    import("@/components/ShaderBackground").then((mod) => {
      setShaderBackground(() => mod.default);
    });
    import("@/components/TiltCard").then((mod) => {
      setTiltCard(() => mod.default);
    });
    import("@/components/IntroAnimation").then((mod) => {
      setIntroAnimation(() => mod.default);
    });
    import("@/components/ExperienceSection").then((mod) => {
      setExperienceSection(() => mod.default);
    });
    import("@/components/NavHeader").then((mod) => {
      setNavHeader(() => mod.default);
    });
    import("@/components/HobbiesSection").then((mod) => {
      setHobbiesSection(() => mod.default);
    });
  }, []);
  
  // Handle intro completion
  const handleIntroComplete = () => {
    setPhase("ready");
  };

  // Hero scroll animations
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  // Phase 1: Name zooms out slightly (happens earlier in scroll)
  const nameScale = useTransform(heroProgress, [0, 0.08], [1.2, 1]);
  const nameOpacity = useTransform(heroProgress, [0.05, 0.18], [1, 0.5]);
  
  // "Munipalli" swings 180 degrees to go under "Dheemanth"
  const munipalliRotate = useTransform(heroProgress, [0.03, 0.14], [0, 180]);
  const munipalliX = useTransform(heroProgress, [0.03, 0.14], [0, -100]);
  const munipalliY = useTransform(heroProgress, [0.03, 0.14], [0, 80]);
  
  // Phase 2: Signature draws after swing completes
  const signaturePathLength = useTransform(heroProgress, [0.12, 0.32], [0, 1]);
  const signatureOpacity = useTransform(heroProgress, [0.10, 0.18], [0, 1]);
  
  // Hero exit - dramatic zoom and fade out
  const heroExitScale = useTransform(heroProgress, [0.7, 1], [1, 0.8]);
  const heroExitOpacity = useTransform(heroProgress, [0.8, 1], [1, 0]);
  const heroBlur = useTransform(heroProgress, [0.85, 1], [0, 8]);

  // About section scroll animations
  const { scrollYProgress: aboutProgress } = useScroll({
    target: aboutRef,
    offset: ["start end", "end start"],
  });

  // ========== SLIDE-IN REVEAL EFFECTS ==========
  // Text slides in from left
  const aboutTextOpacity = useTransform(aboutProgress, [0.05, 0.2], [0, 1]);
  const aboutTextX = useTransform(aboutProgress, [0.05, 0.2], [-100, 0]);
  
  // Photo slides in from right (slightly delayed)
  const aboutPhotoOpacity = useTransform(aboutProgress, [0.1, 0.25], [0, 1]);
  const aboutPhotoX = useTransform(aboutProgress, [0.1, 0.25], [100, 0]);
  
  // Staggered text reveals within the left panel
  const aboutLabelOpacity = useTransform(aboutProgress, [0.08, 0.18], [0, 1]);
  const aboutHeadingOpacity = useTransform(aboutProgress, [0.12, 0.22], [0, 1]);
  const aboutP1Opacity = useTransform(aboutProgress, [0.16, 0.26], [0, 1]);
  const aboutP2Opacity = useTransform(aboutProgress, [0.20, 0.30], [0, 1]);
  const aboutP3Opacity = useTransform(aboutProgress, [0.24, 0.34], [0, 1]);
  
  // About section exit animations (scale down and fade as you leave)
  const aboutExitScale = useTransform(aboutProgress, [0.6, 0.9], [1, 0.85]);
  const aboutExitOpacity = useTransform(aboutProgress, [0.7, 0.95], [1, 0]);
  const aboutExitY = useTransform(aboutProgress, [0.6, 0.9], [0, -50]);
  const aboutRotateX = useTransform(aboutProgress, [0.7, 0.95], [0, 10]);

  // Experience section scroll animations
  const { scrollYProgress: experienceProgress } = useScroll({
    target: experienceRef,
    offset: ["start end", "end start"],
  });
  
  // Experience enter animations
  const experienceEnterScale = useTransform(experienceProgress, [0, 0.15], [0.9, 1]);
  const experienceEnterOpacity = useTransform(experienceProgress, [0, 0.15], [0, 1]);
  const experienceEnterY = useTransform(experienceProgress, [0, 0.15], [100, 0]);
  const experienceRotateX = useTransform(experienceProgress, [0, 0.15], [-5, 0]);
  
  // Experience exit animations
  const experienceExitScale = useTransform(experienceProgress, [0.7, 0.95], [1, 0.9]);
  const experienceExitOpacity = useTransform(experienceProgress, [0.75, 0.95], [1, 0]);

  return (
    <LayoutGroup>
      {/* Intro Animation - overlays on top */}
      <AnimatePresence mode="wait">
        {phase === "intro" && IntroAnimation && (
          <motion.div
            key="intro"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0 }}
            className="fixed inset-0 z-[90]"
          >
            <IntroAnimation onComplete={handleIntroComplete} />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Main Content - always mounted, instant visibility when ready */}
      <div
        style={{ 
          opacity: phase === "ready" ? 1 : 0,
          pointerEvents: phase === "ready" ? "auto" : "none" 
        }}
      >
        {/* Navigation Header */}
        {NavHeader && <NavHeader />}
        
        <div ref={containerRef} className="relative">
              {/* WebGL Shader Background - Gradient Plasma with Interactive Distortion */}
              {ShaderBackground && <ShaderBackground />}
              
              {/* Noise texture overlay */}
              <div className="fixed inset-0 z-[1] pointer-events-none">
                <div className="noise" />
              </div>

              {/* Hero Section - Sticky with signature transition */}
              <section id="home" ref={heroRef} className="h-[400vh] relative z-10">
                <motion.div 
                  className="sticky top-0 h-screen flex items-center justify-center overflow-hidden"
                  style={{
                    scale: heroExitScale,
                    opacity: heroExitOpacity,
                    filter: useTransform(heroBlur, (v) => `blur(${v}px)`),
                  }}
                >
                  {/* Name container - zooms out and fades, each name has its own tilt */}
                  <motion.div
                    style={{ 
                      scale: nameScale,
                      opacity: nameOpacity,
                    }}
                    className="relative z-10 flex flex-col items-center"
                  >
                    {/* First name with its own tilt */}
                    {TiltCard ? (
                      <TiltCard tiltAmount={10}>
                        <motion.span 
                          layoutId="intro-dheemanth"
                          className="font-bodoni text-7xl md:text-9xl lg:text-[10rem] xl:text-[12rem] tracking-tight text-stone-900 block"
                          transition={{ layout: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] } }}
                        >
                          Dheemanth
                        </motion.span>
                      </TiltCard>
                    ) : (
                      <span className="font-bodoni text-7xl md:text-9xl lg:text-[10rem] xl:text-[12rem] tracking-tight text-stone-900 block">
                        Dheemanth
                      </span>
                    )}
                    
                    {/* Last name with its own tilt - swings 180 degrees */}
                    {TiltCard ? (
                      <TiltCard tiltAmount={10}>
                        <motion.span
                          layoutId="intro-munipalli"
                          style={{
                            rotateX: munipalliRotate,
                            x: munipalliX,
                            y: munipalliY,
                          }}
                          className="font-bodoni text-7xl md:text-9xl lg:text-[10rem] xl:text-[12rem] tracking-tight text-stone-900 origin-center block"
                          transition={{ layout: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] } }}
                        >
                          Munipalli
                        </motion.span>
                      </TiltCard>
                    ) : (
                      <motion.span
                        style={{
                          rotateX: munipalliRotate,
                          x: munipalliX,
                          y: munipalliY,
                        }}
                        className="font-bodoni text-7xl md:text-9xl lg:text-[10rem] xl:text-[12rem] tracking-tight text-stone-900 origin-center block"
                      >
                        Munipalli
                      </motion.span>
                    )}
                  </motion.div>

                  {/* Signature reveal animation */}
                  <motion.div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] max-w-4xl z-30 pointer-events-none overflow-hidden"
                    style={{ 
                      opacity: signatureOpacity,
                      clipPath: useTransform(
                        signaturePathLength,
                        [0, 1],
                        ["inset(0 100% 0 0)", "inset(0 0% 0 0)"]
                      ),
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src="/signature.svg" 
                      alt="Signature"
                      className="w-full h-auto"
                    />
                  </motion.div>

                  {/* Scroll indicator - only shows at start */}
                  <motion.div
                    style={{ opacity: useTransform(heroProgress, [0, 0.1], [1, 0]) }}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30"
                  >
                    <motion.div
                      animate={{ y: [0, 10, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      className="flex flex-col items-center gap-3"
                    >
                      <span className="text-xs tracking-[0.3em] uppercase text-stone-500">
                        Scroll
                      </span>
                      <div className="w-px h-12 bg-gradient-to-b from-stone-400 to-transparent" />
                    </motion.div>
                  </motion.div>
                </motion.div>
              </section>

              {/* About Section - Split Layout with Slide-in Effects */}
              <section
                id="about"
                ref={aboutRef}
                className="min-h-screen relative z-10 flex items-center py-16 md:py-24"
                style={{ perspective: "1000px" }}
              >
                <motion.div 
                  className="max-w-7xl mx-auto px-8 w-full"
                  style={{ 
                    scale: aboutExitScale,
                    opacity: aboutExitOpacity,
                    y: aboutExitY,
                    rotateX: aboutRotateX,
                  }}
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                    {/* Left side - Text content slides in from left */}
                    <motion.div
                      style={{ opacity: aboutTextOpacity, x: aboutTextX }}
                      className="order-2 lg:order-1"
                    >
                      {/* About label */}
                      <motion.p
                        style={{ opacity: aboutLabelOpacity }}
                        className="text-blue-500 text-sm font-medium tracking-[0.3em] uppercase mb-8"
                      >
                        About
                      </motion.p>

                      {/* Text card with TiltCard effect - matches photo styling */}
                      {TiltCard ? (
                        <TiltCard className="relative">
                          <div className="absolute -inset-4 bg-gradient-to-br from-blue-200/40 to-blue-400/20 rounded-2xl blur-2xl" />
                          <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-2xl shadow-blue-500/10">
                            {/* Main heading */}
                            <motion.p 
                              style={{ opacity: aboutHeadingOpacity }}
                              className="font-bodoni text-4xl md:text-5xl lg:text-6xl leading-[1.15] tracking-tight text-stone-900 mb-6"
                            >
                              Hey! I&apos;m Dheemanth.
                            </motion.p>

                            {/* Paragraphs */}
                            <div className="space-y-5 font-didact">
                              <motion.p 
                                style={{ opacity: aboutP1Opacity }}
                                className="text-lg md:text-xl text-stone-600 leading-relaxed"
                              >
                                I&apos;m an undergraduate at UC Berkeley studying Data Science, and I enjoy working on challenging engineering problems and building scalable, well-designed systems.
                              </motion.p>

                              <motion.p 
                                style={{ opacity: aboutP2Opacity }}
                                className="text-lg md:text-xl text-stone-600 leading-relaxed"
                              >
                                Most of my experience has been in machine learning, software development, and data engineering. I&apos;m always excited to explore new areas at the intersection of data, systems, and real-world impact.
                              </motion.p>

                              <motion.p 
                                style={{ opacity: aboutP3Opacity }}
                                className="text-lg md:text-xl text-stone-600 leading-relaxed"
                              >
                                Currently, I&apos;m focused on applying machine learning to high-stakes domains like supply chains, cybersecurity, and large-scale marketplaces. I&apos;ve worked on autonomous agent–based matching systems at Amazon Ads, anomaly detection and NLP pipelines for anti-diversion efforts at AMD, AI-driven human simulation systems at Redhorse Corporation, and more.
                              </motion.p>
                            </div>

                            {/* Decorative element */}
                            <motion.div
                              initial={{ scaleX: 0, opacity: 0 }}
                              whileInView={{ scaleX: 1, opacity: 1 }}
                              viewport={{ once: true, margin: "-100px" }}
                              transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                              className="mt-10 h-px bg-gradient-to-r from-blue-500 via-blue-400 to-transparent origin-left max-w-md"
                            />
                          </div>
                        </TiltCard>
                      ) : (
                        <div className="relative">
                          <div className="absolute -inset-4 bg-gradient-to-br from-blue-200/40 to-blue-400/20 rounded-2xl blur-2xl" />
                          <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-2xl shadow-blue-500/10">
                            {/* Main heading */}
                            <motion.p 
                              style={{ opacity: aboutHeadingOpacity }}
                              className="font-bodoni text-4xl md:text-5xl lg:text-6xl leading-[1.15] tracking-tight text-stone-900 mb-6"
                            >
                              Hey! I&apos;m Dheemanth.
                            </motion.p>

                            {/* Paragraphs */}
                            <div className="space-y-5 font-didact">
                              <motion.p 
                                style={{ opacity: aboutP1Opacity }}
                                className="text-lg md:text-xl text-stone-600 leading-relaxed"
                              >
                                I&apos;m an undergraduate at UC Berkeley studying Data Science, and I enjoy working on challenging engineering problems and building scalable, well-designed systems.
                              </motion.p>

                              <motion.p 
                                style={{ opacity: aboutP2Opacity }}
                                className="text-lg md:text-xl text-stone-600 leading-relaxed"
                              >
                                Most of my experience has been in machine learning, software development, and data engineering. I&apos;m always excited to explore new areas at the intersection of data, systems, and real-world impact.
                              </motion.p>

                              <motion.p 
                                style={{ opacity: aboutP3Opacity }}
                                className="text-lg md:text-xl text-stone-600 leading-relaxed"
                              >
                                Currently, I&apos;m focused on applying machine learning to high-stakes domains like supply chains, cybersecurity, and large-scale marketplaces. I&apos;ve worked on autonomous agent–based matching systems at Amazon Ads, anomaly detection and NLP pipelines for anti-diversion efforts at AMD, AI-driven human simulation systems at Redhorse Corporation, and more.
                              </motion.p>
                            </div>

                            {/* Decorative element */}
                            <motion.div
                              initial={{ scaleX: 0, opacity: 0 }}
                              whileInView={{ scaleX: 1, opacity: 1 }}
                              viewport={{ once: true, margin: "-100px" }}
                              transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                              className="mt-10 h-px bg-gradient-to-r from-blue-500 via-blue-400 to-transparent origin-left max-w-md"
                            />
                          </div>
                        </div>
                      )}
                    </motion.div>

                    {/* Right side - Photo slides in from right with Tilt effect */}
                    <motion.div
                      style={{ opacity: aboutPhotoOpacity, x: aboutPhotoX }}
                      className="order-1 lg:order-2 flex justify-center lg:justify-end"
                    >
                      {TiltCard ? (
                        <TiltCard className="relative" floatIntensity={0.7} floatSpeed={0.8}>
                          <div className="absolute -inset-4 bg-gradient-to-br from-blue-200/40 to-blue-400/20 rounded-2xl blur-2xl" />
                          <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-blue-500/10">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src="/headshot.jpeg"
                              alt="Dheemanth Munipalli"
                              className="w-72 h-72 md:w-80 md:h-80 lg:w-96 lg:h-96 object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-stone-900/10 to-transparent" />
                          </div>
                        </TiltCard>
                      ) : (
                        <div className="relative">
                          <div className="absolute -inset-4 bg-gradient-to-br from-blue-200/40 to-blue-400/20 rounded-2xl blur-2xl" />
                          <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-blue-500/10">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src="/headshot.jpeg"
                              alt="Dheemanth Munipalli"
                              className="w-72 h-72 md:w-80 md:h-80 lg:w-96 lg:h-96 object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-stone-900/10 to-transparent" />
                          </div>
                        </div>
                      )}
                    </motion.div>
                  </div>
                </motion.div>
              </section>

              {/* Experience Section - 3D Carousel with Wheel Stepper */}
              <div 
                ref={experienceRef}
                style={{ perspective: "1000px" }}
              >
                <motion.div
                  style={{
                    scale: experienceEnterScale,
                    opacity: experienceEnterOpacity,
                    y: experienceEnterY,
                    rotateX: experienceRotateX,
                  }}
                >
                  <motion.div
                    style={{
                      scale: experienceExitScale,
                      opacity: experienceExitOpacity,
                    }}
                  >
                    {ExperienceSection && <ExperienceSection />}
                  </motion.div>
                </motion.div>
              </div>

              {/* Hobbies Section - 3D showcase with dark finale (disabled via HOBBIES_ENABLED) */}
              {HOBBIES_ENABLED && (
                <div ref={hobbiesRef}>
                  {HobbiesSection && <HobbiesSection />}
                </div>
              )}

              {/* Contact Section - Dark theme finale */}
              <section 
                id="contact" 
                className="min-h-screen relative z-10 flex items-center justify-center"
                style={{ background: "linear-gradient(to bottom, #0a0a0a, #000000)" }}
              >
                <div className="max-w-4xl mx-auto px-8 text-center">
                  {/* Section label */}
                  <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-sm font-medium tracking-[0.3em] uppercase mb-6 text-blue-400"
                  >
                    Get In Touch
                  </motion.p>
                  
                  {/* Main heading */}
                  <motion.h2
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="font-bodoni text-5xl md:text-6xl lg:text-7xl tracking-tight text-stone-100 mb-8"
                  >
                    Let&apos;s Connect
                  </motion.h2>
                  
                  {/* Description */}
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="text-lg md:text-xl leading-relaxed max-w-2xl mx-auto font-didact text-stone-400 mb-12"
                  >
                    I&apos;m always open to discussing new opportunities, interesting projects, 
                    or just having a conversation about technology and innovation.
                  </motion.p>
                  
                  {/* Email link */}
                  <motion.a
                    href="mailto:dheemanth.munipalli@berkeley.edu"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center gap-3 px-8 py-4 bg-blue-500/10 border border-blue-500/30 rounded-full text-blue-400 hover:bg-blue-500/20 hover:border-blue-400 transition-all duration-300 text-lg font-medium"
                  >
                    <svg 
                      width="24" 
                      height="24" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2"
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <rect width="20" height="16" x="2" y="4" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                    dheemanth.munipalli@berkeley.edu
                  </motion.a>
                  
                  {/* Footer */}
                  <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="mt-24 text-sm text-stone-600"
                  >
                    Designed & Built by Dheemanth Munipalli
                  </motion.p>
                </div>
              </section>
            </div>
      </div>
    </LayoutGroup>
  );
}

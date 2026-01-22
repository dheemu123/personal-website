"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef, useEffect, ReactNode } from "react";

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  tiltAmount?: number;
  scale?: number;
  perspective?: number;
  floatIntensity?: number; // 0-1, how much of the tilt range to use for floating (1 = max)
  floatSpeed?: number; // Speed multiplier for floating animation
}

export default function TiltCard({
  children,
  className = "",
  tiltAmount = 15,
  scale = 1.02,
  perspective = 1000,
  floatIntensity = 0, // Default to no floating (static until hovered)
  floatSpeed = 1,
}: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const isHovering = useRef(false);
  const animationRef = useRef<number | null>(null);
  const startTime = useRef(Date.now());
  
  // Random phase offset so each card moves differently
  const phaseOffset = useRef(Math.random() * Math.PI * 2);
  
  // Motion values for tracking position
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Spring configs for smooth animation
  const springConfig = { damping: 20, stiffness: 150 };
  
  // Transform position to rotation
  const rotateX = useSpring(
    useTransform(mouseY, [-0.5, 0.5], [tiltAmount, -tiltAmount]),
    springConfig
  );
  const rotateY = useSpring(
    useTransform(mouseX, [-0.5, 0.5], [-tiltAmount, tiltAmount]),
    springConfig
  );
  
  // Scale on hover
  const scaleValue = useSpring(1, springConfig);
  
  // Shine effect position
  const shineX = useSpring(
    useTransform(mouseX, [-0.5, 0.5], [0, 100]),
    springConfig
  );
  const shineY = useSpring(
    useTransform(mouseY, [-0.5, 0.5], [0, 100]),
    springConfig
  );
  
  // Ambient floating animation - figure 8 pattern (only when floatIntensity > 0)
  useEffect(() => {
    // Skip animation entirely if no float intensity
    if (floatIntensity <= 0) return;
    
    const animate = () => {
      if (!isHovering.current) {
        const elapsed = (Date.now() - startTime.current) / 1000;
        const speed = floatSpeed * 1.5; // Faster base speed for visible movement
        
        // Figure-8 / lissajous pattern using full range (-0.5 to 0.5)
        // floatIntensity of 1.0 = full tilt range
        const intensity = floatIntensity * 0.5; // 0.5 is max for the -0.5 to 0.5 range
        const x = Math.sin(elapsed * speed + phaseOffset.current) * intensity;
        const y = Math.sin(elapsed * speed * 0.7 + phaseOffset.current + Math.PI / 3) * intensity;
        
        mouseX.set(x);
        mouseY.set(y);
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [floatIntensity, floatSpeed, mouseX, mouseY]);
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Normalize to -0.5 to 0.5
    const normalizedX = (e.clientX - centerX) / rect.width;
    const normalizedY = (e.clientY - centerY) / rect.height;
    
    mouseX.set(normalizedX);
    mouseY.set(normalizedY);
  };
  
  const handleMouseEnter = () => {
    isHovering.current = true;
    scaleValue.set(scale);
  };
  
  const handleMouseLeave = () => {
    isHovering.current = false;
    scaleValue.set(1);
    // Snap back to center (0,0) immediately
    mouseX.set(0);
    mouseY.set(0);
  };
  
  return (
    <motion.div
      ref={cardRef}
      className={`relative ${className}`}
      style={{
        perspective,
        transformStyle: "preserve-3d",
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          scale: scaleValue,
          transformStyle: "preserve-3d",
        }}
        className="relative"
      >
        {/* Main content */}
        {children}
        
        {/* Shine overlay */}
        <motion.div
          className="absolute inset-0 pointer-events-none rounded-2xl overflow-hidden"
          style={{
            background: useTransform(
              [shineX, shineY],
              ([x, y]) =>
                `radial-gradient(circle at ${x}% ${y}%, rgba(255,255,255,0.15) 0%, transparent 50%)`
            ),
          }}
        />
        
        {/* Subtle shadow that moves with tilt */}
        <motion.div
          className="absolute -inset-4 -z-10 rounded-3xl"
          style={{
            background: "rgba(0,0,0,0.1)",
            filter: "blur(20px)",
            x: useTransform(rotateY, [-tiltAmount, tiltAmount], [-10, 10]),
            y: useTransform(rotateX, [-tiltAmount, tiltAmount], [10, -10]),
          }}
        />
      </motion.div>
    </motion.div>
  );
}

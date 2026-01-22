"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useScroll } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

// Vertex shader - simple passthrough
const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

// Fragment shader - Floating blobs that transition through color phases
const fragmentShader = `
  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec2 uPointer;
  uniform float uScroll;
  uniform float uReducedMotion;
  uniform float uMobile;
  
  varying vec2 vUv;
  
  void main() {
    vec2 uv = vUv;
    float aspect = uResolution.x / uResolution.y;
    
    // Time factor (reduced if prefers-reduced-motion)
    float time = uTime * (1.0 - uReducedMotion * 0.9);
    
    // ========== COLOR TRANSITIONS ==========
    // Page layout: Hero(400vh) + About(~100vh) + Experience(~100vh) + Hobbies(100vh) + Contact(100vh) ≈ 800vh
    // Hero ends ~0.50, About ends ~0.625, Experience ends ~0.75, Hobbies ends ~0.875, Contact ends ~1.0
    
    // Phase 1: Blue → Orange during hero scroll (0.15-0.40)
    float toOrange = smoothstep(0.15, 0.40, uScroll);
    
    // Phase 2: Orange → Blue for about/experience (0.45-0.65)
    float backToBlue = smoothstep(0.45, 0.65, uScroll);
    
    // Phase 3: Light → Dark for hobbies/contact section (0.70-0.80)
    float toDark = smoothstep(0.70, 0.80, uScroll);
    
    // Combine orange transition (goes up then back down)
    float colorTransition = toOrange * (1.0 - backToBlue) * (1.0 - toDark);
    
    // ========== COLORS ==========
    // Light theme colors
    vec3 white = vec3(1.0, 1.0, 1.0);
    vec3 lightBlue = vec3(0.7, 0.88, 1.0);
    vec3 warmOrange = vec3(1.0, 0.75, 0.5);
    vec3 softOrange = vec3(1.0, 0.85, 0.7);
    
    // Dark theme colors
    vec3 darkBg = vec3(0.04, 0.04, 0.04);        // #0a0a0a
    vec3 accentBlue = vec3(0.23, 0.51, 0.96);    // #3b82f6 blue accent
    
    // Blob color: blue → orange → blue → dark blue accent
    vec3 lightBlobColor = mix(lightBlue, warmOrange, colorTransition);
    vec3 blobColor = mix(lightBlobColor, accentBlue, toDark);
    
    // Background: white → soft orange tint → dark
    vec3 lightBgColor = mix(white, softOrange, colorTransition * 0.15);
    vec3 bgColor = mix(lightBgColor, darkBg, toDark);
    
    // ========== FLOATING BLOBS ==========
    // 2 blobs - top left and bottom right
    
    // Blob 1 - top left area
    vec2 blob1Center = vec2(
      0.2 + sin(time * 0.12) * 0.1,
      0.75 + cos(time * 0.1) * 0.1
    );
    vec2 blob1Dist = uv - blob1Center;
    blob1Dist.x *= aspect;
    float blob1 = exp(-dot(blob1Dist, blob1Dist) * 5.0);
    
    // Blob 2 - bottom right area
    vec2 blob2Center = vec2(
      0.8 + cos(time * 0.1) * 0.1,
      0.25 + sin(time * 0.12) * 0.1
    );
    vec2 blob2Dist = uv - blob2Center;
    blob2Dist.x *= aspect;
    float blob2 = exp(-dot(blob2Dist, blob2Dist) * 5.0);
    
    // Combine blobs
    float blobs = blob1 * 0.5 + blob2 * 0.5;
    
    // ========== POINTER INTERACTION ==========
    vec2 pointerDist = uv - uPointer;
    pointerDist.x *= aspect;
    float pointerInfluence = exp(-dot(pointerDist, pointerDist) * 3.0);
    
    // Pointer adds a subtle bloom
    blobs += pointerInfluence * 0.2;
    
    // ========== SCROLL EFFECT ==========
    blobs *= (1.0 + uScroll * 0.3);
    
    // In dark mode, make blobs more subtle but with blue glow
    float blobIntensity = mix(0.7, 0.4, toDark);
    blobs = clamp(blobs, 0.0, blobIntensity);
    
    // ========== FINAL COLOR ==========
    // Background with colored blobs
    vec3 color = mix(bgColor, blobColor, blobs);
    
    gl_FragColor = vec4(color, 1.0);
  }
`;

// Shader plane component - renders smooth gradient hues
function GradientPlane() {
  const meshRef = useRef<THREE.Mesh>(null);
  const { size } = useThree();
  
  // Scroll progress from Framer Motion
  const { scrollYProgress } = useScroll();
  const scrollRef = useRef(0);
  
  // Pointer position
  const pointerRef = useRef({ x: 0.5, y: 0.5 });
  
  // Reduced motion preference
  const [reducedMotion, setReducedMotion] = useState(0);
  
  // Mobile detection for performance
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches ? 1 : 0);
    
    const handleChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches ? 1 : 0);
    };
    
    mediaQuery.addEventListener("change", handleChange);
    
    // Check if mobile device
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || "ontouchstart" in window);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    
    return () => {
      mediaQuery.removeEventListener("change", handleChange);
      window.removeEventListener("resize", checkMobile);
    };
  }, []);
  
  useEffect(() => {
    // Subscribe to scroll progress
    const unsubscribe = scrollYProgress.on("change", (v) => {
      scrollRef.current = v;
    });
    return unsubscribe;
  }, [scrollYProgress]);
  
  useEffect(() => {
    // Track pointer/touch position
    const handlePointer = (e: PointerEvent | TouchEvent) => {
      let x: number, y: number;
      
      if ("touches" in e) {
        x = e.touches[0].clientX;
        y = e.touches[0].clientY;
      } else {
        x = e.clientX;
        y = e.clientY;
      }
      
      pointerRef.current = {
        x: x / window.innerWidth,
        y: 1.0 - y / window.innerHeight, // Flip Y for shader coords
      };
    };
    
    window.addEventListener("pointermove", handlePointer);
    window.addEventListener("touchmove", handlePointer as EventListener);
    
    return () => {
      window.removeEventListener("pointermove", handlePointer);
      window.removeEventListener("touchmove", handlePointer as EventListener);
    };
  }, []);
  
  // Shader uniforms
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(size.width, size.height) },
      uPointer: { value: new THREE.Vector2(0.5, 0.5) },
      uScroll: { value: 0 },
      uReducedMotion: { value: 0 },
      uMobile: { value: 0 },
    }),
    []
  );
  
  // Update uniforms on each frame
  useFrame((state) => {
    if (!meshRef.current) return;
    
    const material = meshRef.current.material as THREE.ShaderMaterial;
    // Slower time on mobile for better performance
    const timeMultiplier = isMobile ? 0.5 : 1.0;
    material.uniforms.uTime.value = state.clock.elapsedTime * timeMultiplier;
    material.uniforms.uResolution.value.set(size.width, size.height);
    material.uniforms.uPointer.value.set(pointerRef.current.x, pointerRef.current.y);
    material.uniforms.uScroll.value = scrollRef.current;
    material.uniforms.uReducedMotion.value = reducedMotion;
    material.uniforms.uMobile.value = isMobile ? 1 : 0;
  });
  
  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
}

// Main exported component
export default function ShaderBackground() {
  const [webglSupported, setWebglSupported] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    // Check WebGL support
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      setWebglSupported(!!gl);
    } catch {
      setWebglSupported(false);
    }
    
    // Check if mobile
    setIsMobile(window.innerWidth < 768 || "ontouchstart" in window);
  }, []);
  
  // Fallback gradient if WebGL not supported
  if (!webglSupported) {
    return (
      <div 
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 40% 40% at 20% 25%, rgba(255, 200, 150, 0.5), transparent),
            radial-gradient(ellipse 40% 40% at 80% 75%, rgba(255, 200, 150, 0.5), transparent),
            #ffffff
          `,
        }}
      />
    );
  }
  
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Canvas
        dpr={isMobile ? [1, 1] : [1, 1.5]}
        gl={{ 
          antialias: false,
          alpha: false,
          powerPreference: isMobile ? "low-power" : "high-performance",
          failIfMajorPerformanceCaveat: true,
        }}
        style={{ 
          position: "absolute", 
          top: 0, 
          left: 0, 
          width: "100%", 
          height: "100%" 
        }}
        onCreated={({ gl }) => {
          // Additional mobile optimizations
          if (isMobile) {
            gl.setPixelRatio(1);
          }
        }}
      >
        <GradientPlane />
      </Canvas>
    </div>
  );
}

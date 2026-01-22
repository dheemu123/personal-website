"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

interface ParticleTextProps {
  text?: string;
  color?: string;
}

function TextParticles({ text = "About", color = "#f97316" }: ParticleTextProps) {
  const particlesRef = useRef<THREE.Points>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  // Generate particle positions based on text shape
  const { positions, originalPositions, count } = useMemo(() => {
    // Create a canvas to render text and sample pixel positions
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    
    const fontSize = 80;
    canvas.width = 400;
    canvas.height = 120;
    
    ctx.fillStyle = "#000";
    ctx.font = `bold ${fontSize}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);
    
    // Sample pixels to get particle positions
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    const particlePositions: number[] = [];
    const step = 3; // Sample every 3rd pixel for density
    
    for (let y = 0; y < canvas.height; y += step) {
      for (let x = 0; x < canvas.width; x += step) {
        const i = (y * canvas.width + x) * 4;
        if (data[i + 3] > 128) { // If pixel is visible
          // Normalize to -1 to 1 range, scaled down
          const px = ((x / canvas.width) - 0.5) * 3;
          const py = ((y / canvas.height) - 0.5) * -1; // Flip Y
          const pz = (Math.random() - 0.5) * 0.2;
          particlePositions.push(px, py, pz);
        }
      }
    }
    
    return {
      positions: new Float32Array(particlePositions),
      originalPositions: new Float32Array(particlePositions),
      count: particlePositions.length / 3,
    };
  }, [text]);

  // Track mouse position
  useMemo(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Animate particles
  useFrame((state) => {
    if (!particlesRef.current) return;
    
    const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
    const time = state.clock.elapsedTime;
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // Get original position
      const ox = originalPositions[i3];
      const oy = originalPositions[i3 + 1];
      const oz = originalPositions[i3 + 2];
      
      // Calculate distance from mouse (in normalized coords)
      const dx = mouseRef.current.x * 1.5 - ox;
      const dy = mouseRef.current.y * 0.5 - oy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      // Repel particles from mouse
      const repelStrength = Math.max(0, 1 - dist * 2) * 0.3;
      
      // Gentle floating animation
      const floatX = Math.sin(time * 0.5 + i * 0.1) * 0.02;
      const floatY = Math.cos(time * 0.7 + i * 0.15) * 0.02;
      
      // Lerp towards target position
      const targetX = ox + floatX - (dx / dist) * repelStrength;
      const targetY = oy + floatY - (dy / dist) * repelStrength;
      const targetZ = oz + Math.sin(time + i * 0.05) * 0.05;
      
      positions[i3] += (targetX - positions[i3]) * 0.1;
      positions[i3 + 1] += (targetY - positions[i3 + 1]) * 0.1;
      positions[i3 + 2] += (targetZ - positions[i3 + 2]) * 0.1;
    }
    
    particlesRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        color={color}
        transparent
        opacity={0.9}
        sizeAttenuation
      />
    </points>
  );
}

export default function ParticleText({ text, color }: ParticleTextProps) {
  return (
    <div className="w-full h-16 relative">
      <Canvas
        camera={{ position: [0, 0, 2], fov: 50 }}
        dpr={[1, 2]}
        style={{ background: "transparent" }}
      >
        <TextParticles text={text} color={color} />
      </Canvas>
    </div>
  );
}

"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Center, Text3D } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";

interface RotatingTextProps {
  onComplete?: () => void;
}

function RotatingDM() {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (!groupRef.current) return;
    
    // Rotate 360 degrees per second (2π radians)
    groupRef.current.rotation.y = state.clock.elapsedTime * Math.PI * 2;
  });
  
  return (
    <group ref={groupRef}>
      <Center>
        <Text3D
          font="/fonts/Inter_Bold.json"
          size={1.5}
          height={0.3}
          curveSegments={12}
          bevelEnabled
          bevelThickness={0.02}
          bevelSize={0.02}
          bevelOffset={0}
          bevelSegments={5}
        >
          DM
          <meshStandardMaterial color="#3b82f6" metalness={0.3} roughness={0.4} />
        </Text3D>
      </Center>
    </group>
  );
}

interface LoadingScreenProps {
  onComplete: () => void;
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  // Trigger onComplete after 2 seconds
  useRef<ReturnType<typeof setTimeout>>();
  
  return (
    <div className="fixed inset-0 z-50 bg-white flex items-center justify-center">
      <div className="w-full h-full">
        <Canvas
          camera={{ position: [0, 0, 5], fov: 50 }}
          dpr={[1, 2]}
        >
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} />
          <RotatingDM />
        </Canvas>
      </div>
      
      {/* Subtle loading text */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
        <p className="text-stone-400 text-sm tracking-[0.3em] uppercase animate-pulse">
          Loading
        </p>
      </div>
    </div>
  );
}

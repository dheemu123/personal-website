"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

interface ShapeProps {
  position: [number, number, number];
  scale: number;
  rotationSpeed: number;
  floatSpeed: number;
  floatAmplitude: number;
  color: string;
  geometry: "icosahedron" | "octahedron" | "tetrahedron" | "torus";
}

function FloatingShape({
  position,
  scale,
  rotationSpeed,
  floatSpeed,
  floatAmplitude,
  color,
  geometry,
}: ShapeProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const initialY = position[1];
  
  useFrame((state) => {
    if (!meshRef.current) return;
    
    const time = state.clock.elapsedTime;
    
    // Gentle rotation
    meshRef.current.rotation.x += rotationSpeed * 0.005;
    meshRef.current.rotation.y += rotationSpeed * 0.008;
    
    // Floating motion
    meshRef.current.position.y = initialY + Math.sin(time * floatSpeed) * floatAmplitude;
    meshRef.current.position.x = position[0] + Math.cos(time * floatSpeed * 0.7) * floatAmplitude * 0.3;
  });
  
  const geo = useMemo(() => {
    switch (geometry) {
      case "icosahedron":
        return <icosahedronGeometry args={[1, 0]} />;
      case "octahedron":
        return <octahedronGeometry args={[1, 0]} />;
      case "tetrahedron":
        return <tetrahedronGeometry args={[1, 0]} />;
      case "torus":
        return <torusGeometry args={[1, 0.4, 8, 16]} />;
      default:
        return <icosahedronGeometry args={[1, 0]} />;
    }
  }, [geometry]);
  
  return (
    <mesh ref={meshRef} position={position} scale={scale}>
      {geo}
      <meshStandardMaterial
        color={color}
        transparent
        opacity={0.6}
        wireframe
      />
    </mesh>
  );
}

interface FloatingShapesProps {
  className?: string;
}

export default function FloatingShapes({ className = "" }: FloatingShapesProps) {
  // Define shapes with different properties
  const shapes: ShapeProps[] = useMemo(
    () => [
      {
        position: [-3, 1, -2],
        scale: 0.3,
        rotationSpeed: 0.8,
        floatSpeed: 0.5,
        floatAmplitude: 0.3,
        color: "#93c5fd", // Light blue
        geometry: "icosahedron",
      },
      {
        position: [3.5, -0.5, -3],
        scale: 0.4,
        rotationSpeed: 0.6,
        floatSpeed: 0.4,
        floatAmplitude: 0.25,
        color: "#a5b4fc", // Light indigo
        geometry: "octahedron",
      },
      {
        position: [-2.5, -1.5, -2.5],
        scale: 0.25,
        rotationSpeed: 1.0,
        floatSpeed: 0.6,
        floatAmplitude: 0.2,
        color: "#c4b5fd", // Light purple
        geometry: "tetrahedron",
      },
      {
        position: [2.5, 1.5, -2],
        scale: 0.2,
        rotationSpeed: 0.7,
        floatSpeed: 0.55,
        floatAmplitude: 0.35,
        color: "#bfdbfe", // Lighter blue
        geometry: "torus",
      },
      {
        position: [0, 2, -4],
        scale: 0.35,
        rotationSpeed: 0.5,
        floatSpeed: 0.35,
        floatAmplitude: 0.2,
        color: "#ddd6fe", // Light violet
        geometry: "icosahedron",
      },
    ],
    []
  );
  
  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        dpr={[1, 1.5]}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={0.8} />
        <pointLight position={[-10, -10, -10]} intensity={0.4} />
        
        {shapes.map((shape, i) => (
          <FloatingShape key={i} {...shape} />
        ))}
      </Canvas>
    </div>
  );
}

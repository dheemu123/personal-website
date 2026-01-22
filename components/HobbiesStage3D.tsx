"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, Environment } from "@react-three/drei";
import { Suspense, useRef, useEffect, useState, useMemo } from "react";
import * as THREE from "three";

// Hobby data with model paths
export const HOBBIES = [
  {
    id: "basketball",
    label: "Basketball",
    description: "From pickup games to watching the NBA, basketball has been a lifelong passion that keeps me active and competitive.",
    modelPath: "/fonts/basketball/scene.gltf",
    cameraPosition: [0, 0, 5] as [number, number, number],
    finalPosition: [5.5, -0.2, 0] as [number, number, number], // More to the right
    modelScale: 0.8,
    spinAxis: "y" as const,
  },
  {
    id: "f1",
    label: "Formula 1",
    description: "The engineering precision, strategy, and pure speed of F1 racing fascinates me. Always cheering for the underdog.",
    modelPath: "/mclaren_mcl60_f1_2023/scene.gltf",
    cameraPosition: [0, 0.3, 5] as [number, number, number],
    finalPosition: [5.5, -0.2, 0] as [number, number, number],
    modelScale: 0.8,
    spinAxis: "y" as const,
  },
  {
    id: "weightlifting",
    label: "Weightlifting",
    description: "Strength training is my way of building discipline and pushing limits. There's something meditative about the iron.",
    modelPath: "/simple_weight/scene.gltf",
    cameraPosition: [0, 0, 5] as [number, number, number],
    finalPosition: [5.5, -0.1, 0] as [number, number, number],
    modelScale: 0.8,
    spinAxis: "x" as const,
  },
  {
    id: "food",
    label: "Food",
    description: "Exploring cuisines and cooking new dishes is how I unwind. Food brings people together and tells cultural stories.",
    modelPath: "/pizza/scene.gltf",
    cameraPosition: [0, 0.3, 5] as [number, number, number],
    finalPosition: [5.5, 0.2, 0] as [number, number, number],
    modelScale: 1.2,
    spinAxis: "y" as const,
  },
];

// Preload all models
HOBBIES.forEach((hobby) => {
  try {
    useGLTF.preload(hobby.modelPath);
  } catch {
    // Model might not exist yet
  }
});

// Glowing platform component
function GlowingPlatform({ opacity, position }: { opacity: number; position: [number, number, number] }) {
  const ringRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.z = state.clock.elapsedTime * 0.3;
    }
    if (glowRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.1 + 1;
      glowRef.current.scale.setScalar(pulse);
    }
  });

  if (opacity < 0.1) return null;

  return (
    <group position={position}>
      {/* Outer glow ring */}
      <mesh ref={glowRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[0.6, 1, 64]} />
        <meshBasicMaterial 
          color="#3b82f6" 
          transparent 
          opacity={opacity * 0.3}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Inner ring */}
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[0.4, 0.6, 64]} />
        <meshBasicMaterial 
          color="#60a5fa" 
          transparent 
          opacity={opacity * 0.5}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Center glow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <circleGeometry args={[0.4, 64]} />
        <meshBasicMaterial 
          color="#1e40af" 
          transparent 
          opacity={opacity * 0.2}
        />
      </mesh>
      
      {/* Point light for glow effect */}
      <pointLight 
        position={[0, 0.3, 0]} 
        color="#3b82f6" 
        intensity={opacity * 1.5} 
        distance={3}
      />
    </group>
  );
}

interface HobbyModelProps {
  hobby: typeof HOBBIES[0];
  isActive: boolean;
  scrollProgress: number; // 0-1 progress within the current hobby segment
  dragRotation: { x: number; y: number }; // User drag rotation offset
  isDragging: boolean;
}

// Individual hobby model with dramatic entrance - ONLY renders when active
function HobbyModel({ hobby, isActive, scrollProgress, dragRotation, isDragging }: HobbyModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [hasEntered, setHasEntered] = useState(false);
  const [modelReady, setModelReady] = useState(false);
  
  // Animation state (used for non-basketball hobbies)
  const animState = useRef({
    progress: 0,
    rotation: 0,
  });
  
  // Load model
  let gltf = null;
  try {
    gltf = useGLTF(hobby.modelPath);
  } catch {
    // Model not found
  }
  
  // Clone the scene ONCE using useMemo - deep clone to preserve materials/textures
  const clonedScene = useMemo(() => {
    if (!gltf?.scene) return null;
    const clone = gltf.scene.clone(true);
    // Reset any transforms on the clone
    clone.position.set(0, 0, 0);
    clone.rotation.set(0, 0, 0);
    clone.scale.set(1, 1, 1);
    
    // Traverse and ensure materials are properly set up
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        // Clone materials to avoid sharing state between instances
        if (mesh.material) {
          if (Array.isArray(mesh.material)) {
            mesh.material = mesh.material.map(m => m.clone());
          } else {
            mesh.material = mesh.material.clone();
          }
        }
      }
    });
    
    return clone;
  }, [gltf?.scene]);
  
  useEffect(() => {
    if (clonedScene) {
      setModelReady(true);
    }
  }, [clonedScene]);

  // Reset animation when becoming active
  useEffect(() => {
    if (isActive && !hasEntered) {
      animState.current.progress = 0;
      animState.current.rotation = 0;
      setHasEntered(true);
    } else if (!isActive) {
      setHasEntered(false);
    }
  }, [isActive, hasEntered]);

  useFrame((state, delta) => {
    if (!groupRef.current || !isActive) return;
    
    const finalPos = hobby.finalPosition;
    
    // Basketball has special scroll-synced arc animation
    if (hobby.id === "basketball") {
      // Arc animation parameters
      const startPos = [-6, 4, 0]; // Top-left corner
      const endPos = finalPos;
      const arcHeight = 2; // Peak height added to the arc
      
      // Use scroll progress directly (0-1)
      const t = scrollProgress;
      
      // Check if basketball has landed
      const hasLanded = t > 0.95;
      
      // Easing for smoother motion
      const easeOutQuad = (x: number) => 1 - (1 - x) * (1 - x);
      const easedT = easeOutQuad(t);
      
      // X position: linear interpolation
      const x = THREE.MathUtils.lerp(startPos[0], endPos[0], easedT);
      
      // Y position: parabolic arc
      // The formula -4 * h * t * (t - 1) creates an arc that:
      // - Starts at 0 when t=0
      // - Peaks at h when t=0.5
      // - Returns to 0 when t=1
      const arcOffset = -4 * arcHeight * t * (t - 1);
      const baseY = THREE.MathUtils.lerp(startPos[1], endPos[1], easedT);
      const y = baseY + arcOffset;
      
      // Z position: linear interpolation
      const z = THREE.MathUtils.lerp(startPos[2], endPos[2], easedT);
      
      // Scale: starts slightly larger, shrinks to normal as it lands
      // Scale up slightly when being dragged for feedback
      const baseScale = THREE.MathUtils.lerp(1.2, hobby.modelScale, easedT);
      const scale = hasLanded && isDragging ? baseScale * 1.05 : baseScale;
      
      // Rotation logic
      let rotationX: number;
      let rotationY: number;
      
      if (hasLanded) {
        // When landed, use user's drag rotation
        rotationX = dragRotation.x;
        rotationY = dragRotation.y;
      } else {
        // During flight: spin synced to scroll progress (3 full rotations)
        const spinRotations = 3;
        rotationY = t * spinRotations * Math.PI * 2;
        // Add slight tilt on X axis during flight for more dynamic feel
        rotationX = Math.sin(t * Math.PI) * 0.3;
      }
      
      // Apply transforms
      groupRef.current.position.set(x, y, z);
      groupRef.current.scale.setScalar(scale);
      groupRef.current.rotation.set(rotationX, rotationY, 0);
      
      // Subtle bounce when fully settled (only when not dragging)
      if (hasLanded && !isDragging) {
        groupRef.current.position.y = endPos[1] + Math.sin(state.clock.elapsedTime * 2) * 0.03;
      }
    } else if (hobby.id === "f1") {
      // F1 car drives around the screen in a racing path
      // Clamp t to valid range (0.001 to 0.999 to avoid edge case issues)
      const t = THREE.MathUtils.clamp(scrollProgress || 0, 0.001, 0.999);
      
      // Check if car has parked
      const hasParked = t > 0.95;
      
      // Define waypoints for the driving path (racing circuit feel)
      // Start off-screen left, drive up, curve around, come down to final position
      const waypoints = [
        new THREE.Vector3(-10, -0.5, 3),    // Start: off-screen left, coming toward viewer
        new THREE.Vector3(-4, 0.5, 1),       // Curve up and left
        new THREE.Vector3(0, 1.5, -1),       // Top center, going away
        new THREE.Vector3(4, 1, 0),          // Curve right
        new THREE.Vector3(5.5, -0.2, 0),     // Final position
      ];
      
      // Create a smooth curve through the waypoints
      const curve = new THREE.CatmullRomCurve3(waypoints);
      
      // Get position on curve based on scroll progress
      const position = curve.getPointAt(t);
      
      // Get tangent for car orientation (which way it's facing)
      const tangent = curve.getTangentAt(t);
      
      // Calculate rotation to face driving direction
      // The car should face along the tangent of the path
      const baseRotationY = Math.atan2(tangent.x, tangent.z);
      
      // Add slight banking/tilt based on curve direction
      // Calculate how much the path is curving by comparing tangents
      const lookAhead = Math.min(t + 0.05, 0.999);
      const futureTangent = curve.getTangentAt(lookAhead);
      const turnAmount = tangent.x - futureTangent.x;
      const baseBankAngle = THREE.MathUtils.clamp(turnAmount * 2, -0.3, 0.3);
      
      // Scale animation - starts at half size (far away), grows to full size
      const carScale = 1.8; // Car size
      const baseScale = THREE.MathUtils.lerp(carScale * 0.5, carScale, Math.min(t * 2, 1));
      const scale = hasParked && isDragging ? baseScale * 1.05 : baseScale;
      
      // Rotation logic - use drag rotation when parked, otherwise use path direction
      let rotationX: number;
      let rotationY: number;
      let rotationZ: number;
      
      if (hasParked) {
        // When parked, use user's drag rotation
        rotationX = dragRotation.x;
        rotationY = baseRotationY + dragRotation.y;
        rotationZ = 0;
      } else {
        // During driving, use path-based rotation
        rotationX = 0;
        rotationY = baseRotationY;
        rotationZ = baseBankAngle;
      }
      
      // Apply transforms
      groupRef.current.position.copy(position);
      groupRef.current.scale.setScalar(scale);
      groupRef.current.rotation.set(rotationX, rotationY, rotationZ);
      
      // Subtle idle animation when parked (only when not dragging)
      if (hasParked && !isDragging) {
        // Small vibration like engine idling
        groupRef.current.position.y = finalPos[1] + Math.sin(state.clock.elapsedTime * 15) * 0.005;
      }
    } else if (hobby.id === "weightlifting") {
      // Weights drop from above with heavy impact
      const t = THREE.MathUtils.clamp(scrollProgress || 0, 0, 1);
      
      // Check if weights have landed
      const hasLanded = t > 0.85;
      
      // Start position (high above)
      const startY = 8;
      const endPos = finalPos;
      
      // Ease-in for accelerating fall (like gravity)
      const easeIn = (x: number) => x * x * x;
      // Faster drop - complete the fall in first 60% of animation
      const dropProgress = Math.min(t / 0.6, 1);
      const easedDrop = easeIn(dropProgress);
      
      // Position - drops straight down to final position
      const x = endPos[0];
      const y = THREE.MathUtils.lerp(startY, endPos[1], easedDrop);
      const z = endPos[2];
      
      // Scale - smaller to fit on the right side
      const weightScale = 0.6;
      const scale = hasLanded && isDragging ? weightScale * 1.05 : weightScale;
      
      // Rotation - slight wobble during fall, then user control when landed
      let rotationX: number;
      let rotationY: number;
      
      if (hasLanded) {
        rotationX = dragRotation.x;
        rotationY = dragRotation.y;
      } else {
        // Slight wobble during fall
        rotationX = Math.sin(t * 10) * 0.1;
        rotationY = Math.sin(t * 8) * 0.15;
      }
      
      // Apply transforms
      groupRef.current.position.set(x, y, z);
      groupRef.current.scale.setScalar(scale);
      groupRef.current.rotation.set(rotationX, rotationY, 0);
      
      // Impact bounce when landing (between 60% and 85%)
      if (t > 0.6 && t <= 0.85) {
        const bounceT = (t - 0.6) / 0.25; // 0 to 1 during bounce phase
        // Damped bounce - decreasing amplitude
        const bounceHeight = Math.sin(bounceT * Math.PI * 3) * 0.15 * (1 - bounceT);
        groupRef.current.position.y = endPos[1] + Math.abs(bounceHeight);
      }
      
      // Subtle idle when fully settled (only when not dragging)
      if (hasLanded && !isDragging) {
        // Heavy, slow breathing motion
        groupRef.current.position.y = endPos[1] + Math.sin(state.clock.elapsedTime * 1.5) * 0.01;
      }
    } else if (hobby.id === "food") {
      // Pizza spins onto the screen like a frisbee being tossed
      const t = THREE.MathUtils.clamp(scrollProgress || 0, 0, 1);
      
      // Check if pizza has settled
      const hasSettled = t > 0.9;
      
      // Start position - off screen left, slightly above
      const startPos = [-8, 2, 2];
      const endPos = finalPos;
      
      // Ease out for smooth landing
      const easeOutQuart = (x: number) => 1 - Math.pow(1 - x, 4);
      const easedT = easeOutQuart(t);
      
      // Arc path - pizza floats in with a slight arc
      const x = THREE.MathUtils.lerp(startPos[0], endPos[0], easedT);
      const arcHeight = Math.sin(t * Math.PI) * 1.5; // Arc up then down
      const baseY = THREE.MathUtils.lerp(startPos[1], endPos[1], easedT);
      const y = baseY + arcHeight * (1 - easedT); // Arc diminishes as it lands
      const z = THREE.MathUtils.lerp(startPos[2], endPos[2], easedT);
      
      // Scale - make pizza bigger
      const pizzaScale = 3.0;
      const scale = hasSettled && isDragging ? pizzaScale * 1.05 : pizzaScale;
      
      // Rotation - pizza spins rapidly like being tossed, slows as it lands
      const spinSpeed = (1 - easedT) * 8 + 0.5; // Fast spin that slows down
      const spinRotations = t * spinSpeed * Math.PI * 2;
      
      // Pizza tilts like a frisbee (angled during flight, levels out when landing)
      const tiltAngle = (1 - easedT) * 0.4; // Tilts during flight
      
      let rotationX: number;
      let rotationY: number;
      let rotationZ: number;
      
      if (hasSettled) {
        // When settled, use user's drag rotation plus gentle continuous spin
        rotationX = dragRotation.x;
        rotationY = dragRotation.y + state.clock.elapsedTime * 0.3; // Slow continuous spin
        rotationZ = 0;
      } else {
        // During flight - spinning and tilted
        rotationX = tiltAngle;
        rotationY = spinRotations;
        rotationZ = Math.sin(t * Math.PI * 2) * 0.1; // Slight wobble
      }
      
      // Apply transforms
      groupRef.current.position.set(x, y, z);
      groupRef.current.scale.setScalar(scale);
      groupRef.current.rotation.set(rotationX, rotationY, rotationZ);
      
      // Gentle floating motion when settled (only when not dragging)
      if (hasSettled && !isDragging) {
        groupRef.current.position.y = endPos[1] + Math.sin(state.clock.elapsedTime * 2) * 0.05;
      }
    } else {
      // Original time-based animation for other hobbies
      const anim = animState.current;
      
      // Animate in
      anim.progress = Math.min(1, anim.progress + delta * 1.5);
      
      // Easing functions
      const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
      const easeInOut = (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      
      const p = easeInOut(anim.progress);
      
      // Position interpolation - sweeps from left to right
      const startX = -5;
      const startY = 0.5;
      const startZ = 1;
      
      const x = THREE.MathUtils.lerp(startX, finalPos[0], p);
      const y = THREE.MathUtils.lerp(startY, finalPos[1], p);
      const z = THREE.MathUtils.lerp(startZ, finalPos[2], p);
      
      // Scale: starts larger, shrinks to normal
      const scaleProgress = easeOut(anim.progress);
      const scale = THREE.MathUtils.lerp(1.8, hobby.modelScale, scaleProgress);
      
      // Rotation - spins on Y axis only
      const spinSpeed = (1 - p) * 10 + 0.3;
      anim.rotation += delta * spinSpeed;
      
      // Apply transforms to the GROUP only (not the model inside)
      groupRef.current.position.set(x, y, z);
      groupRef.current.scale.setScalar(scale);
      groupRef.current.rotation.set(0, anim.rotation, 0);
      
      // Subtle bounce when settled
      if (p > 0.95) {
        groupRef.current.position.y = finalPos[1] + Math.sin(state.clock.elapsedTime * 2) * 0.03;
      }
    }
  });

  // Only render if active
  if (!isActive) return null;

  // Use placeholder if model not loaded
  if (!modelReady || !clonedScene) {
    return (
      <group ref={groupRef}>
        <mesh>
          <sphereGeometry args={[0.5, 64, 64]} />
          <meshStandardMaterial 
            color="#f97316"
            roughness={0.8}
            metalness={0.1}
          />
        </mesh>
      </group>
    );
  }

  return (
    <group ref={groupRef}>
      <primitive object={clonedScene} />
    </group>
  );
}

interface SceneProps {
  activeIndex: number;
  progress: number;
  pointerPosition: { x: number; y: number };
  isMobile: boolean;
  dragRotation: { x: number; y: number };
  isDragging: boolean;
}

function Scene({ activeIndex, progress, pointerPosition, isMobile, dragRotation, isDragging }: SceneProps) {
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3());
  const currentPos = useRef(new THREE.Vector3(0, 0, 5));
  const shakeOffset = useRef(new THREE.Vector3());
  
  const currentHobby = HOBBIES[activeIndex];
  
  useFrame((state) => {
    // Camera position
    const camPos = new THREE.Vector3(...currentHobby.cameraPosition);
    targetPos.current.copy(camPos);
    
    // Parallax (disabled while dragging the basketball)
    if (!isMobile && !isDragging) {
      targetPos.current.x += (pointerPosition.x - 0.5) * 0.5;
      targetPos.current.y += (pointerPosition.y - 0.5) * 0.3;
    }
    
    // Camera shake for weightlifting impact
    if (currentHobby.id === "weightlifting" && progress > 0.58 && progress < 0.85) {
      // Calculate shake intensity - strongest at impact (0.6), fades out
      const impactPoint = 0.6;
      const shakeProgress = progress - impactPoint;
      
      if (shakeProgress >= 0) {
        // Intensity decreases over time
        const intensity = Math.max(0, 0.15 * (1 - shakeProgress / 0.25));
        // High frequency shake
        const time = state.clock.elapsedTime * 50;
        shakeOffset.current.set(
          (Math.random() - 0.5) * intensity + Math.sin(time) * intensity * 0.5,
          (Math.random() - 0.5) * intensity * 1.5 + Math.cos(time * 1.3) * intensity * 0.5,
          (Math.random() - 0.5) * intensity * 0.3
        );
      }
    } else {
      // Smoothly reduce shake
      shakeOffset.current.lerp(new THREE.Vector3(0, 0, 0), 0.2);
    }
    
    currentPos.current.lerp(targetPos.current, 0.05);
    camera.position.copy(currentPos.current);
    camera.position.add(shakeOffset.current);
    camera.lookAt(3.5, 0, 0);
  });

  return (
    <>
      {/* Lighting for dark theme */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />
      <pointLight position={[-5, 3, 0]} intensity={0.6} color="#3b82f6" />
      <pointLight position={[5, 2, 3]} intensity={0.5} color="#60a5fa" />
      
      {/* Environment for reflections - not visible as background */}
      <Environment preset="night" background={false} />
      
      {/* Only render the ACTIVE model */}
      <HobbyModel 
        hobby={currentHobby}
        isActive={true}
        scrollProgress={progress}
        dragRotation={dragRotation}
        isDragging={isDragging}
      />
    </>
  );
}

interface HobbiesStage3DProps {
  activeIndex: number;
  progress: number;
}

export default function HobbiesStage3D({ activeIndex, progress }: HobbiesStage3DProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [pointerPosition, setPointerPosition] = useState({ x: 0.5, y: 0.5 });
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Drag state for basketball interaction
  const [isDragging, setIsDragging] = useState(false);
  const [dragRotation, setDragRotation] = useState({ x: 0, y: 0 });
  const dragStart = useRef({ x: 0, y: 0 });
  const rotationStart = useRef({ x: 0, y: 0 });
  
  // Momentum/velocity for smooth release
  const velocity = useRef({ x: 0, y: 0 });
  const lastPointer = useRef({ x: 0, y: 0 });
  
  // Check if model is interactive (all hobbies when settled)
  const isModelInteractive = progress > 0.95;
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || "ontouchstart" in window);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  
  // Reset drag rotation when switching hobbies
  useEffect(() => {
    setDragRotation({ x: 0, y: 0 });
    velocity.current = { x: 0, y: 0 };
  }, [activeIndex]);
  
  useEffect(() => {
    if (isMobile) return;
    
    const handlePointer = (e: PointerEvent) => {
      if (!isDragging) {
        setPointerPosition({
          x: e.clientX / window.innerWidth,
          y: e.clientY / window.innerHeight,
        });
      }
    };
    
    window.addEventListener("pointermove", handlePointer);
    return () => window.removeEventListener("pointermove", handlePointer);
  }, [isMobile, isDragging]);
  
  // Handle drag for model rotation (basketball and F1)
  useEffect(() => {
    if (!isModelInteractive) return;
    
    const handlePointerDown = (e: PointerEvent) => {
      setIsDragging(true);
      dragStart.current = { x: e.clientX, y: e.clientY };
      rotationStart.current = { ...dragRotation };
      lastPointer.current = { x: e.clientX, y: e.clientY };
      velocity.current = { x: 0, y: 0 };
    };
    
    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      
      const deltaX = e.clientX - dragStart.current.x;
      const deltaY = e.clientY - dragStart.current.y;
      
      // Calculate velocity for momentum
      velocity.current = {
        x: (e.clientX - lastPointer.current.x) * 0.01,
        y: (e.clientY - lastPointer.current.y) * 0.01,
      };
      lastPointer.current = { x: e.clientX, y: e.clientY };
      
      // Sensitivity for rotation
      const sensitivity = 0.01;
      
      setDragRotation({
        x: rotationStart.current.x + deltaY * sensitivity,
        y: rotationStart.current.y + deltaX * sensitivity,
      });
    };
    
    const handlePointerUp = () => {
      setIsDragging(false);
    };
    
    const container = containerRef.current;
    if (container) {
      container.addEventListener("pointerdown", handlePointerDown);
      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", handlePointerUp);
      
      return () => {
        container.removeEventListener("pointerdown", handlePointerDown);
        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("pointerup", handlePointerUp);
      };
    }
  }, [isModelInteractive, isDragging, dragRotation]);
  
  // Apply momentum after release
  useEffect(() => {
    if (isDragging || !isModelInteractive) return;
    
    let animationFrame: number;
    
    const applyMomentum = () => {
      const friction = 0.95;
      
      if (Math.abs(velocity.current.x) > 0.001 || Math.abs(velocity.current.y) > 0.001) {
        setDragRotation(prev => ({
          x: prev.x + velocity.current.y,
          y: prev.y + velocity.current.x,
        }));
        
        velocity.current = {
          x: velocity.current.x * friction,
          y: velocity.current.y * friction,
        };
        
        animationFrame = requestAnimationFrame(applyMomentum);
      }
    };
    
    animationFrame = requestAnimationFrame(applyMomentum);
    
    return () => cancelAnimationFrame(animationFrame);
  }, [isDragging, isModelInteractive]);

  return (
    <div 
      ref={containerRef}
      className="w-full h-full"
      style={{ cursor: isModelInteractive ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
    >
      <Canvas
        dpr={isMobile ? [1, 1] : [1, 2]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: isMobile ? "low-power" : "high-performance",
        }}
        camera={{ position: [0, 0, 5], fov: 50 }}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={null}>
          <Scene 
            activeIndex={activeIndex}
            progress={progress}
            pointerPosition={pointerPosition}
            isMobile={isMobile}
            dragRotation={dragRotation}
            isDragging={isDragging}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}

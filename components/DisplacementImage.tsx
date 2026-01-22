"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

// Vertex shader with displacement
const vertexShader = `
  varying vec2 vUv;
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uHover;
  
  void main() {
    vUv = uv;
    
    vec3 pos = position;
    
    // Calculate distance from mouse
    vec2 mouseOffset = uv - uMouse;
    float dist = length(mouseOffset);
    
    // Create ripple displacement
    float wave = sin(dist * 20.0 - uTime * 3.0) * 0.02;
    float falloff = smoothstep(0.5, 0.0, dist);
    
    pos.z += wave * falloff * uHover;
    
    // Subtle breathing effect
    pos.z += sin(uTime * 0.5) * 0.005;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

// Fragment shader with subtle distortion
const fragmentShader = `
  varying vec2 vUv;
  uniform sampler2D uTexture;
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uHover;
  
  void main() {
    vec2 uv = vUv;
    
    // Calculate distance from mouse
    vec2 mouseOffset = uv - uMouse;
    float dist = length(mouseOffset);
    float falloff = smoothstep(0.4, 0.0, dist);
    
    // Subtle UV distortion based on mouse
    float distortionStrength = 0.02 * uHover * falloff;
    uv += mouseOffset * distortionStrength * sin(uTime * 2.0 + dist * 10.0);
    
    vec4 color = texture2D(uTexture, uv);
    
    // Subtle color shift on hover
    color.rgb += vec3(0.02, 0.01, 0.0) * falloff * uHover;
    
    gl_FragColor = color;
  }
`;

interface ImagePlaneProps {
  imagePath: string;
}

function ImagePlane({ imagePath }: ImagePlaneProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useTexture(imagePath);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const hoverRef = useRef(0);
  const [isHovered, setIsHovered] = useState(false);
  const { size } = useThree();
  
  // Create uniforms
  const uniforms = useMemo(
    () => ({
      uTexture: { value: texture },
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uHover: { value: 0 },
    }),
    [texture]
  );
  
  // Handle pointer move
  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!meshRef.current) return;
      
      // Get element bounds
      const canvas = document.querySelector("canvas");
      if (!canvas) return;
      
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = (e.clientX - rect.left) / rect.width;
      mouseRef.current.y = 1 - (e.clientY - rect.top) / rect.height;
    };
    
    window.addEventListener("pointermove", handlePointerMove);
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, []);
  
  // Animation loop
  useFrame((state) => {
    if (!meshRef.current) return;
    
    const material = meshRef.current.material as THREE.ShaderMaterial;
    material.uniforms.uTime.value = state.clock.elapsedTime;
    
    // Smooth mouse interpolation
    material.uniforms.uMouse.value.lerp(
      new THREE.Vector2(mouseRef.current.x, mouseRef.current.y),
      0.1
    );
    
    // Smooth hover transition
    const targetHover = isHovered ? 1 : 0;
    hoverRef.current += (targetHover - hoverRef.current) * 0.1;
    material.uniforms.uHover.value = hoverRef.current;
  });
  
  // Calculate aspect ratio
  const img = texture.image as HTMLImageElement | undefined;
  const imageAspect = img?.width && img?.height ? img.width / img.height : 1;
  
  return (
    <mesh
      ref={meshRef}
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => setIsHovered(false)}
    >
      <planeGeometry args={[imageAspect, 1, 32, 32]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
}

interface DisplacementImageProps {
  src: string;
  className?: string;
}

export default function DisplacementImage({ src, className = "" }: DisplacementImageProps) {
  return (
    <div className={`relative ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 1.2], fov: 50 }}
        dpr={[1, 2]}
        style={{ background: "transparent" }}
      >
        <ImagePlane imagePath={src} />
      </Canvas>
    </div>
  );
}

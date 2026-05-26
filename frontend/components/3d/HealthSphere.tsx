"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface HealthSphereProps {
  score: number;
}

function MorphingDroplet({ score }: HealthSphereProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReducedMotion(reduced);
  }, []);

  // Update loop for fluid wobble & slow floating rotation
  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();

    if (!reducedMotion) {
      // Fluid slow rotation
      meshRef.current.rotation.y = time * 0.22;
      meshRef.current.rotation.z = time * 0.12;

      // Premium 3D liquid wobble (oscillates size scales out-of-sync to look like fluid)
      const scaleX = 1.35 + Math.sin(time * 1.5) * 0.08;
      const scaleY = 1.35 + Math.cos(time * 1.8) * 0.08;
      const scaleZ = 1.35 + Math.sin(time * 2.2) * 0.06;
      meshRef.current.scale.set(scaleX, scaleY, scaleZ);
    } else {
      meshRef.current.scale.set(1.35, 1.35, 1.35);
    }
  });

  // Calculate dynamic colors based on aggregate diagnostics score
  const getSphereColors = () => {
    if (score >= 90) {
      return { main: "#22C55E", emissive: "#15803D" }; // Green success
    }
    if (score >= 50) {
      return { main: "#F59E0B", emissive: "#B45309" }; // Amber warning
    }
    return { main: "#EF4444", emissive: "#B91C1C" }; // Rose danger
  };

  const colors = getSphereColors();

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1, 48, 48]} />
      {/* High-fidelity glassmorphic transmissive material */}
      <meshPhysicalMaterial
        color={colors.main}
        roughness={0.12}
        metalness={0.05}
        clearcoat={1.0}
        clearcoatRoughness={0.1}
        transmission={0.65}
        thickness={1.8}
        ior={1.4}
        emissive={colors.emissive}
        emissiveIntensity={0.25}
        transparent
        opacity={0.9}
      />
    </mesh>
  );
}

export default function HealthSphere({ score }: HealthSphereProps) {
  return (
    <div className="w-full h-full absolute inset-0 pointer-events-none select-none z-0">
      <Canvas 
        camera={{ position: [0, 0, 3.2], fov: 45 }}
        gl={{ alpha: true, antialias: true }}
      >
        {/* Balanced high-fidelity ambient lights to highlight glass transmissive refractions */}
        <ambientLight intensity={1.5} />
        <pointLight position={[5, 5, 5]} intensity={1.8} />
        <pointLight position={[-5, -5, -2]} intensity={1.0} color="#00B4D8" />
        <directionalLight position={[0, 4, 2]} intensity={1.5} />
        
        <MorphingDroplet score={score} />
      </Canvas>
    </div>
  );
}

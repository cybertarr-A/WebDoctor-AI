"use client";

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";

interface OrbitalModuleNodeProps {
  position: [number, number, number];
  label: string;
  score: number | string;
  color: string;
  isActive: boolean;
  onClick: () => void;
}

export default function OrbitalModuleNode({
  position,
  label,
  score,
  color,
  isActive,
  onClick
}: OrbitalModuleNodeProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const particleRef = useRef<THREE.Points>(null);
  const [hovered, setHovered] = useState(false);

  // Rotate local geometries in frame loops
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.y = time * 0.4;
      meshRef.current.rotation.x = time * 0.15;
      
      // Floating sinusoidal bounce animation
      meshRef.current.position.y = Math.sin(time * 1.5 + position[0]) * 0.08;
    }
    if (particleRef.current) {
      particleRef.current.rotation.z = -time * 0.3;
    }
  });

  return (
    <group position={position}>
      {/* 1. Core Glowing Module Geometry (Reactive to hover) */}
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHovered(false);
          document.body.style.cursor = "default";
        }}
      >
        <octahedronGeometry args={[isActive ? 0.35 : 0.22, 0]} />
        <meshPhysicalMaterial
          color={color}
          roughness={0.1}
          metalness={0.8}
          emissive={color}
          emissiveIntensity={hovered || isActive ? 1.6 : 0.5}
          wireframe
        />
      </mesh>

      {/* 2. Concentrated Solid Core */}
      <mesh>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshBasicMaterial color={color} />
      </mesh>

      {/* 3. Orbiting Neon Dust Ring */}
      <points ref={particleRef}>
        <ringGeometry args={[0.38, 0.48, 16]} />
        <pointsMaterial
          color={color}
          size={0.02}
          transparent
          opacity={hovered || isActive ? 0.9 : 0.4}
          sizeAttenuation
        />
      </points>

      {/* 4. Selection Halo (Renders when active) */}
      {isActive && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.55, 0.58, 32]} />
          <meshBasicMaterial
            color={color}
            side={THREE.DoubleSide}
            transparent
            opacity={0.3}
          />
        </mesh>
      )}

      {/* 5. Holographic HTML Overlay Label */}
      <Html distanceFactor={4.5} position={[0, 0.6, 0]} center>
        <div
          onClick={onClick}
          className={`flex flex-col items-center select-none cursor-pointer transition-all duration-300 ${
            isActive 
              ? "scale-110 opacity-100 filter drop-shadow-[0_0_12px_rgba(6,182,212,0.6)]" 
              : hovered 
              ? "scale-105 opacity-90" 
              : "scale-100 opacity-60"
          }`}
          style={{ width: "max-content" }}
        >
          <div 
            className="text-[8px] font-black uppercase tracking-[0.25em] px-2 py-0.5 rounded border mb-1 transition-colors"
            style={{ 
              borderColor: `${color}40`, 
              color: color,
              background: `${color}0c` 
            }}
          >
            {label}
          </div>
          <div className="flex items-center gap-1 bg-black/85 backdrop-blur-md px-2 py-0.5 rounded-full border border-slate-800 text-[10px] font-mono font-bold text-slate-300">
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: color }} />
            {score}
          </div>
        </div>
      </Html>
    </group>
  );
}

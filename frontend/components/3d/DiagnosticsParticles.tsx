"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface DiagnosticsParticlesProps {
  scanStep: number;
}

interface ParticlePoint {
  pos: THREE.Vector3;
  angle: number;
  radius: number;
  speed: number;
  yVelocity: number;
}

function SwirlingVortex({ scanStep }: DiagnosticsParticlesProps) {
  const [particleCount, setParticleCount] = useState(80);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const particlesRef = useRef<ParticlePoint[]>([]);
  const pointsRef = useRef<THREE.Points>(null);

  // Checks options on mount
  useEffect(() => {
    const mobile = window.innerWidth < 768;
    setParticleCount(mobile ? 35 : 80);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReducedMotion(reduced);

    const checkTheme = () => {
      setIsDarkMode(document.body.classList.contains("dark"));
    };
    checkTheme();

    const observer = new MutationObserver(checkTheme);
    observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });

    return () => observer.disconnect();
  }, []);

  // Initialize random cylinder vortex particles
  useEffect(() => {
    const list: ParticlePoint[] = [];
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 0.5 + Math.random() * 1.5;
      
      const pos = new THREE.Vector3(
        Math.cos(angle) * radius,
        (Math.random() - 0.5) * 3, // cylinder height
        Math.sin(angle) * radius
      );

      const speed = 0.01 + Math.random() * 0.02;
      const yVelocity = (Math.random() - 0.5) * 0.015;

      list.push({
        pos,
        angle,
        radius,
        speed,
        yVelocity
      });
    }

    particlesRef.current = list;
  }, [particleCount]);

  // Frame update render loop
  useFrame((state) => {
    if (!pointsRef.current || particlesRef.current.length === 0) return;

    const list = particlesRef.current;
    const geom = pointsRef.current.geometry as THREE.BufferGeometry;
    const positions = new Float32Array(list.length * 3);

    // Compute speed scale based on diagnostic scanStep
    // scanStep ranges from 0 to 5. Speed multiplies up to 4.5x at final phase!
    const stepMultiplier = 1.0 + (scanStep * 0.7);
    const motionSpeed = reducedMotion ? 0.05 : stepMultiplier;

    list.forEach((particle, idx) => {
      // Swirl around the Y-axis
      particle.angle += particle.speed * motionSpeed;
      
      // Keep float oscillation within boundaries
      particle.pos.y += particle.yVelocity * motionSpeed;
      if (Math.abs(particle.pos.y) > 1.8) {
        particle.yVelocity *= -1;
      }

      // Compute cylinder coords
      positions[idx * 3] = Math.cos(particle.angle) * particle.radius;
      positions[idx * 3 + 1] = particle.pos.y;
      positions[idx * 3 + 2] = Math.sin(particle.angle) * particle.radius;
    });

    geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geom.attributes.position.needsUpdate = true;
  });

  // Theme-sensitive colors
  const particleColor = isDarkMode ? "#00B4D8" : "#0077B6";

  return (
    <points ref={pointsRef}>
      <bufferGeometry />
      <pointsMaterial 
        color={particleColor} 
        size={0.075} 
        transparent 
        opacity={0.8} 
        sizeAttenuation
      />
    </points>
  );
}

export default function DiagnosticsParticles({ scanStep }: DiagnosticsParticlesProps) {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none rounded-3xl z-0">
      <Canvas 
        camera={{ position: [0, 0, 4.2], fov: 50 }}
        gl={{ alpha: true, antialias: true }}
      >
        <SwirlingVortex scanStep={scanStep} />
      </Canvas>
    </div>
  );
}

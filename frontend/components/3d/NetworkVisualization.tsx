"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

interface NodePoint {
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  targetPos: THREE.Vector3;
}

function NetworkNodes() {
  const { size, viewport, pointer } = useThree();
  const [nodeCount, setNodeCount] = useState(40);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  const nodesRef = useRef<NodePoint[]>([]);
  const pointsRef = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);

  // Setup options based on performance queries & settings on mount
  useEffect(() => {
    // Check mobile scaling
    const mobile = window.innerWidth < 768;
    setNodeCount(mobile ? 18 : 45);

    // Check prefers-reduced-motion
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReducedMotion(reduced);

    // Theme checks
    const checkTheme = () => {
      setIsDarkMode(document.body.classList.contains("dark"));
    };
    checkTheme();

    // Listen to theme state switches
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });

    return () => observer.disconnect();
  }, []);

  // Initialize nodes coordinates and speeds
  useEffect(() => {
    const list: NodePoint[] = [];
    
    // Scale boundaries to fit viewport size
    const width = viewport.width * 1.2;
    const height = viewport.height * 1.2;
    
    for (let i = 0; i < nodeCount; i++) {
      const pos = new THREE.Vector3(
        (Math.random() - 0.5) * width,
        (Math.random() - 0.5) * height,
        (Math.random() - 0.5) * 4
      );
      
      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 0.015,
        (Math.random() - 0.5) * 0.015,
        0
      );

      list.push({
        pos,
        vel,
        targetPos: pos.clone()
      });
    }

    nodesRef.current = list;
  }, [nodeCount, viewport]);

  // Frame update render loop
  useFrame((state) => {
    if (!pointsRef.current || !linesRef.current || nodesRef.current.length === 0) return;

    const list = nodesRef.current;
    const pointsGeom = pointsRef.current.geometry as THREE.BufferGeometry;
    const linesGeom = linesRef.current.geometry as THREE.BufferGeometry;

    const width = viewport.width * 1.2;
    const height = viewport.height * 1.2;

    // Convert mouse coordinates from NDC (-1 to 1) to world spaces
    const mouseWorld = new THREE.Vector3(
      pointer.x * (viewport.width / 2),
      pointer.y * (viewport.height / 2),
      0
    );

    const positions = new Float32Array(list.length * 3);
    const linePositions: number[] = [];

    // 1. Move and update node positions
    list.forEach((node, idx) => {
      if (!reducedMotion) {
        // Move nodes based on velocity
        node.pos.add(node.vel);

        // Slow float back to base boundaries if drifted out of viewport
        if (Math.abs(node.pos.x) > width / 2) node.vel.x *= -1;
        if (Math.abs(node.pos.y) > height / 2) node.vel.y *= -1;

        // Interactive mouse magnetism: pull points closer slightly
        const distToMouse = node.pos.distanceTo(mouseWorld);
        if (distToMouse < 2.5) {
          const dir = new THREE.Vector3().subVectors(mouseWorld, node.pos).normalize();
          node.pos.addScaledVector(dir, 0.01);
        }
      }

      positions[idx * 3] = node.pos.x;
      positions[idx * 3 + 1] = node.pos.y;
      positions[idx * 3 + 2] = node.pos.z;
    });

    // Feed updated coords to the Points points layer
    pointsGeom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    pointsGeom.attributes.position.needsUpdate = true;

    // 2. Compute connection lines between nearby points
    const maxDistance = 2.4;
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const dist = list[i].pos.distanceTo(list[j].pos);
        if (dist < maxDistance) {
          linePositions.push(
            list[i].pos.x, list[i].pos.y, list[i].pos.z,
            list[j].pos.x, list[j].pos.y, list[j].pos.z
          );
        }
      }
    }

    // Update lines segment layer
    if (linePositions.length > 0) {
      linesGeom.setAttribute("position", new THREE.BufferAttribute(new Float32Array(linePositions), 3));
      linesGeom.attributes.position.needsUpdate = true;
      linesRef.current.visible = true;
    } else {
      linesRef.current.visible = false;
    }
  });

  // Theme-sensitive colors
  const nodeColor = isDarkMode ? "#0077B6" : "#023E8A";
  const lineColor = isDarkMode ? "#1E293B" : "#E2E8F0";

  return (
    <group>
      {/* Node mesh points */}
      <points ref={pointsRef}>
        <bufferGeometry />
        <pointsMaterial 
          color={nodeColor} 
          size={0.16} 
          transparent 
          opacity={0.7} 
          sizeAttenuation 
        />
      </points>

      {/* Interconnecting grid lines */}
      <lineSegments ref={linesRef}>
        <bufferGeometry />
        <lineBasicMaterial 
          color={lineColor} 
          transparent 
          opacity={0.45} 
          linewidth={1} 
        />
      </lineSegments>
    </group>
  );
}

export default function NetworkVisualization() {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
      <Canvas 
        camera={{ position: [0, 0, 5], fov: 60 }} 
        gl={{ alpha: true, antialias: true }}
      >
        <NetworkNodes />
      </Canvas>
    </div>
  );
}

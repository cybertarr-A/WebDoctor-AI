"use client";

import { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";

interface SpatialCameraRigProps {
  activeModuleIndex: number | null;
  modulePositions: [number, number, number][];
}

export default function SpatialCameraRig({
  activeModuleIndex,
  modulePositions
}: SpatialCameraRigProps) {
  const { camera } = useThree();
  
  // Ref targets to smoothly interpolate camera
  const targetCamPos = useRef(new THREE.Vector3(0, 0, 7.5));
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0));
  
  const currentLookAt = useRef(new THREE.Vector3(0, 0, 0));

  useEffect(() => {
    // 1. Zoom into target module node coordinates if one is active
    if (activeModuleIndex !== null) {
      const nodePos = modulePositions[activeModuleIndex];
      
      // Position the camera slightly back and to the side of the node for a premium focus look
      targetCamPos.current.set(
        nodePos[0] * 1.25 + 0.5,
        nodePos[1] * 1.25 + 0.3,
        nodePos[2] * 1.25 + 1.2
      );
      
      // Look directly at the focused node
      targetLookAt.current.set(nodePos[0], nodePos[1], nodePos[2]);
    } else {
      // 2. Default: Let scroll control the camera path
      const handleScroll = () => {
        const lenis = (window as any).lenis;
        if (!lenis) return;
        
        const progress = lenis.progress; // 0.0 to 1.0
        
        // Define a smooth circular sweep orbit around the AI Core
        const angle = progress * Math.PI * 2.0;
        const radius = 6.8 + Math.sin(progress * Math.PI * 4) * 1.2;
        
        targetCamPos.current.set(
          Math.sin(angle) * radius,
          Math.cos(progress * Math.PI) * 2.2,
          Math.cos(angle) * radius
        );
        
        // Slightly offset the lookAt to create fluid camera pans
        targetLookAt.current.set(
          Math.sin(angle * 0.5) * 0.4,
          Math.cos(angle * 0.5) * 0.3,
          0
        );
      };

      // Set up scrolling hooks
      const lenis = (window as any).lenis;
      if (lenis) {
        lenis.on("scroll", handleScroll);
        // Initial call
        handleScroll();
      }

      return () => {
        if (lenis) {
          lenis.off("scroll", handleScroll);
        }
      };
    }
  }, [activeModuleIndex, modulePositions]);

  // Frame tick: smoothly interpolate camera position & lookAt
  useFrame(() => {
    // Smoothly interpolate position using frame dampening
    camera.position.lerp(targetCamPos.current, 0.065);

    // Smoothly interpolate lookAt vectors
    currentLookAt.current.lerp(targetLookAt.current, 0.065);
    camera.lookAt(currentLookAt.current);
  });

  return null;
}

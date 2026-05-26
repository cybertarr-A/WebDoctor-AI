"use client";

import { useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Custom GLSL Shaders for the AI Core displacement & glowing energy fields
const AI_CORE_VERTEX_SHADER = `
  uniform float uTime;
  uniform float uWobbleSpeed;
  uniform float uWobbleStrength;
  uniform vec2 uMouseOffset;
  
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying float vDisplacement;

  // Classic Simplex 3D Noise by Ashima Arts
  vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
  vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

  float snoise(vec3 v){
    const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
    const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 i  = floor(v + dot(v, C.yyy) );
    vec3 x0 =   v - i + dot(i, C.xxx) ;

    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min( g.xyz, l.zxy );
    vec3 i2 = max( g.xyz, l.zxy );

    vec3 x1 = x0 - i1 + 1.0 * C.xxx;
    vec3 x2 = x0 - i2 + 2.0 * C.xxx;
    vec3 x3 = x0 - D.yyy;

    i = mod(i, 289.0 );
    vec4 p = permute( permute( permute(
               i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
             + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
             + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

    float n_ = 0.142857142857;
    vec3  ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z *ns.z);

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_ );

    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4( x.xy, y.xy );
    vec4 b1 = vec4( x.zw, y.zw );

    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);

    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                                  dot(p2,x2), dot(p3,x3) ) );
  }

  void main() {
    vNormal = normal;
    vPosition = position;
    
    // Add procedural Simplex wobble noise to shape coordinates
    float displacement = snoise(position * 2.0 + vec3(uTime * uWobbleSpeed)) * uWobbleStrength;
    vDisplacement = displacement;

    // React slowly towards mouse coordinate drift
    vec3 reactivePos = position + vec3(displacement) + vec3(uMouseOffset.x * 0.1, uMouseOffset.y * 0.1, 0.0);
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(reactivePos, 1.0);
  }
`;

const AI_CORE_FRAGMENT_SHADER = `
  uniform float uTime;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying float vDisplacement;

  void main() {
    // Pulse calculation based on normal angle and time
    float pulse = sin(uTime * 2.0) * 0.5 + 0.5;
    
    // Emissive electric neon color shift (cyan/violet)
    vec3 baseColor = mix(uColorA, uColorB, vPosition.y * 0.5 + 0.5);
    baseColor += vec3(pulse * 0.08);

    // Fresnel rim light glow overlay
    float fresnel = pow(1.0 - max(dot(vNormal, vec3(0.0, 0.0, 1.0)), 0.0), 3.0);
    vec3 finalGlow = baseColor + fresnel * vec3(0.12, 0.64, 1.0);

    // Map noise displacement depth to brightness
    finalGlow += vec3(vDisplacement * 0.4);

    gl_FragColor = vec4(finalGlow, 0.72 + fresnel * 0.28);
  }
`;

interface AICoreProps {
  isScanning: boolean;
  percentProgress: number;
}

export default function AICore({ isScanning, percentProgress }: AICoreProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const particleRef = useRef<THREE.Points>(null);
  const ringRef1 = useRef<THREE.Mesh>(null);
  const ringRef2 = useRef<THREE.Mesh>(null);
  
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const mouseDampened = useRef({ x: 0, y: 0 });

  // Shader Uniform variables setup
  const uniforms = useRef({
    uTime: { value: 0 },
    uWobbleSpeed: { value: 0.4 },
    uWobbleStrength: { value: 0.15 },
    uMouseOffset: { value: new THREE.Vector2(0, 0) },
    uColorA: { value: new THREE.Color("#7c3aed") }, // Violet
    uColorB: { value: new THREE.Color("#06b6d4") }  // Cyan
  });

  // Tracking mouse movement in the window for parallax drift
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMouse({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Update dynamic animation loop
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    uniforms.current.uTime.value = time;

    // Smooth damp mouse values
    mouseDampened.current.x += (mouse.x - mouseDampened.current.x) * 0.06;
    mouseDampened.current.y += (mouse.y - mouseDampened.current.y) * 0.06;
    uniforms.current.uMouseOffset.value.set(mouseDampened.current.x, mouseDampened.current.y);

    // Adjust shader wiggles on scanning state
    if (isScanning) {
      // Speed up core vibration and increase strength
      uniforms.current.uWobbleSpeed.value = 1.6;
      uniforms.current.uWobbleStrength.value = 0.28 + Math.sin(time * 12.0) * 0.05;
      
      // Speed up orbiting elements
      if (meshRef.current) {
        meshRef.current.rotation.y = time * 0.45;
        meshRef.current.rotation.z = time * 0.15;
      }
      if (particleRef.current) {
        particleRef.current.rotation.y = -time * 0.75;
      }
      if (ringRef1.current) {
        ringRef1.current.rotation.x = time * 0.6;
        ringRef1.current.rotation.y = time * 0.3;
      }
      if (ringRef2.current) {
        ringRef2.current.rotation.y = -time * 0.5;
        ringRef2.current.rotation.z = time * 0.3;
      }
    } else {
      // Slow float / standby breathing
      uniforms.current.uWobbleSpeed.value = 0.36;
      uniforms.current.uWobbleStrength.value = 0.12 + Math.sin(time * 0.8) * 0.02;

      if (meshRef.current) {
        meshRef.current.rotation.y = time * 0.06 + mouseDampened.current.x * 0.15;
        meshRef.current.rotation.x = Math.sin(time * 0.2) * 0.05 + mouseDampened.current.y * 0.15;
      }
      if (particleRef.current) {
        particleRef.current.rotation.y = -time * 0.03;
      }
      if (ringRef1.current) {
        ringRef1.current.rotation.z = time * 0.1;
      }
      if (ringRef2.current) {
        ringRef2.current.rotation.y = -time * 0.08;
      }
    }
  });

  return (
    <group scale={1.2}>
      {/* 1. Core Morphing Simplex Shader Mesh */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[1.5, 64, 64]} />
        <shaderMaterial
          vertexShader={AI_CORE_VERTEX_SHADER}
          fragmentShader={AI_CORE_FRAGMENT_SHADER}
          uniforms={uniforms.current}
          transparent
          depthWrite={true}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 2. Concentrated Inner Energy Core Glow */}
      <mesh>
        <sphereGeometry args={[1.0, 32, 32]} />
        <meshBasicMaterial
          color="#06b6d4"
          transparent
          opacity={0.3}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* 3. Orbiting Neural Particle Constellation */}
      <points ref={particleRef}>
        <sphereGeometry args={[2.4, 32, 32]} />
        <pointsMaterial
          color={isScanning ? "#06b6d4" : "#c084fc"}
          size={isScanning ? 0.045 : 0.03}
          transparent
          opacity={0.8}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
        />
      </points>

      {/* 4. Glowing Vector Accelerator Ring A */}
      <mesh ref={ringRef1} rotation={[Math.PI / 4, 0, 0]}>
        <ringGeometry args={[2.55, 2.58, 64]} />
        <meshBasicMaterial
          color="#8b5cf6"
          side={THREE.DoubleSide}
          transparent
          opacity={0.4}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* 5. Glowing Vector Accelerator Ring B */}
      <mesh ref={ringRef2} rotation={[-Math.PI / 4, Math.PI / 6, 0]}>
        <ringGeometry args={[2.68, 2.71, 64]} />
        <meshBasicMaterial
          color="#06b6d4"
          side={THREE.DoubleSide}
          transparent
          opacity={0.4}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

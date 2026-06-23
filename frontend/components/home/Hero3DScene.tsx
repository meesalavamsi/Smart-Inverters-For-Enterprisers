"use client";

import { useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Environment } from "@react-three/drei";
import * as THREE from "three";

function EnergyCoil() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    if (!ref.current) return;
    ref.current.rotation.y = s.clock.elapsedTime * 0.5;
    ref.current.rotation.x = Math.sin(s.clock.elapsedTime * 0.3) * 0.3;
  });
  return (
    <Float speed={1.6} rotationIntensity={0.12} floatIntensity={0.5}>
      <mesh ref={ref}>
        <torusKnotGeometry args={[1.6, 0.45, 200, 20]} />
        <meshPhysicalMaterial
          color="#3b82f6"
          metalness={1}
          roughness={0.02}
          clearcoat={1}
          clearcoatRoughness={0.03}
          emissive="#2563eb"
          emissiveIntensity={0.5}
        />
      </mesh>
    </Float>
  );
}

function Ring({ radius, speed, tilt }: { radius: number; speed: number; tilt: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    if (!ref.current) return;
    ref.current.rotation.y = s.clock.elapsedTime * speed;
    ref.current.rotation.x = tilt;
  });
  return (
    <mesh ref={ref}>
      <torusGeometry args={[radius, 0.025, 16, 140]} />
      <meshStandardMaterial color="#93c5fd" metalness={1} roughness={0} transparent opacity={0.5} emissive="#60a5fa" emissiveIntensity={0.3} />
    </mesh>
  );
}

function Orbs() {
  const cfg: [number, number, number, number, string][] = [
    [-3, 2, -1.5, 0.32, "#60a5fa"],
    [3, -1.5, -2, 0.48, "#3b82f6"],
    [-2, -2.5, -1, 0.22, "#93c5fd"],
    [2, 2.8, -2, 0.38, "#2563eb"],
    [3.5, 0.5, -2.5, 0.26, "#bfdbfe"],
    [-3.2, -0.8, -3, 0.3, "#60a5fa"],
    [0.5, 3.2, -3, 0.2, "#dbeafe"],
  ];
  return (
    <>
      {cfg.map(([x, y, z, r, col], i) => (
        <Float key={i} speed={0.9 + i * 0.2} floatIntensity={1.6} rotationIntensity={0.3}>
          <mesh position={[x, y, z]}>
            <sphereGeometry args={[r, 32, 32]} />
            <meshPhysicalMaterial color={col} metalness={0.85} roughness={0.05} transparent opacity={0.88} emissive={col} emissiveIntensity={0.25} />
          </mesh>
        </Float>
      ))}
    </>
  );
}

function GridFloor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3.5, 0]}>
      <planeGeometry args={[20, 20, 20, 20]} />
      <meshBasicMaterial color="#1d4ed8" wireframe transparent opacity={0.08} />
    </mesh>
  );
}

export default function Hero3DScene() {
  return (
    <Canvas
      camera={{ position: [0, 0.5, 8], fov: 50 }}
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={0.4} />
      <pointLight position={[8, 8, 8]} intensity={3} color="#3b82f6" />
      <pointLight position={[-8, -4, 4]} intensity={1.5} color="#60a5fa" />
      <pointLight position={[0, 0, 6]} intensity={1} color="#bfdbfe" />
      <spotLight position={[0, 12, 0]} angle={0.4} penumbra={1} intensity={1.5} color="#93c5fd" />

      <Suspense fallback={null}>
        <EnergyCoil />
        <Orbs />
        <Ring radius={3.2} speed={0.2} tilt={0.3} />
        <Ring radius={3.8} speed={-0.15} tilt={-0.5} />
        <Ring radius={4.5} speed={0.1} tilt={1.0} />
        <GridFloor />
        <Environment preset="night" />
      </Suspense>
    </Canvas>
  );
}

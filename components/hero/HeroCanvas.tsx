"use client";

import { PerformanceMonitor, Sparkles } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useMemo, useState } from "react";
import { makeDiyas } from "./scene/diyaLayout";
import Diyas from "./scene/Diyas";
import Rig from "./scene/Rig";
import Water from "./scene/Water";

/**
 * Dozens of diyas drifting on the Ganga before dawn.
 * "Bloom" is faked with additive glow billboards instead of a post-processing
 * pass, which keeps the scene to five draw calls and avoids an extra package.
 */
export default function HeroCanvas({
  active,
  onReady,
}: {
  active: boolean;
  onReady: () => void;
}) {
  const [dpr, setDpr] = useState(1.5);
  const diyas = useMemo(() => makeDiyas(54), []);

  return (
    <Canvas
      dpr={dpr}
      frameloop={active ? "always" : "never"}
      gl={{
        antialias: false,
        alpha: true,
        powerPreference: "high-performance",
        stencil: false,
      }}
      camera={{ position: [0, 1.45, 7.5], fov: 42, near: 0.1, far: 60 }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
        onReady();
      }}
      style={{ position: "absolute", inset: 0 }}
    >
      <PerformanceMonitor
        onDecline={() => setDpr(1)}
        onIncline={() => setDpr(Math.min(1.5, window.devicePixelRatio || 1))}
      />
      <ambientLight intensity={0.35} color="#ffd27a" />
      <hemisphereLight args={["#1c1b3a", "#5a3a2e", 0.7]} />
      <Rig />
      <Water diyas={diyas} />
      <Diyas diyas={diyas} />
      <Sparkles
        count={40}
        color="#FFD27A"
        size={1.4}
        speed={0.2}
        opacity={0.3}
        scale={[16, 3, 10]}
        position={[0, 1.6, -3]}
        noise={0.5}
      />
    </Canvas>
  );
}

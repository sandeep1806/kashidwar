"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

/**
 * Camera parallax. Listens on window (the HTML title sits above the canvas,
 * so canvas-local pointer events would rarely fire) and eases toward the
 * pointer with a critically damped lerp.
 */
export default function Rig() {
  const pointer = useRef({ x: 0, y: 0 });
  const target = useMemo(() => new THREE.Vector3(0, 0.25, -2.5), []);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useFrame(({ camera }, dt) => {
    const step = Math.min(dt, 0.05);
    camera.position.x = THREE.MathUtils.damp(
      camera.position.x,
      pointer.current.x * 0.7,
      2.2,
      step,
    );
    camera.position.y = THREE.MathUtils.damp(
      camera.position.y,
      1.45 + pointer.current.y * 0.22,
      2.2,
      step,
    );
    camera.lookAt(target);
  });

  return null;
}

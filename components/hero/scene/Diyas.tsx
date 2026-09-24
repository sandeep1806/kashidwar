"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { waveHeight, type DiyaSpec } from "./diyaLayout";

/** Soft radial sprite drawn once on a canvas; `stretch` elongates it into a flame. */
function makeSprite(size: number, stretch: number, stops: [number, string][]) {
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const ctx = c.getContext("2d")!;
  ctx.translate(size / 2, size / 2);
  ctx.scale(1, stretch);
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, size / 2 / stretch);
  for (const [o, col] of stops) g.addColorStop(o, col);
  ctx.fillStyle = g;
  ctx.fillRect(-size / 2, -size / 2, size, size);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const billboardVertex = /* glsl */ `
attribute float aSeed;
attribute float aScale;
uniform float uTime;
uniform float uSize;
uniform float uAspect;
varying vec2 vUv;
varying float vFlicker;
void main() {
  vUv = uv;
  float f = 0.86 + 0.14 * sin(uTime * 9.0 + aSeed) * sin(uTime * 5.3 + aSeed * 1.7);
  vFlicker = f;
  vec3 center = (instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
  vec4 mv = modelViewMatrix * vec4(center, 1.0);
  mv.xy += position.xy * vec2(1.0, uAspect) * uSize * aScale * (0.9 + 0.1 * f);
  gl_Position = projectionMatrix * mv;
}
`;

const billboardFragment = /* glsl */ `
uniform sampler2D uMap;
uniform vec3 uColor;
uniform float uOpacity;
varying vec2 vUv;
varying float vFlicker;
void main() {
  float a = texture2D(uMap, vUv).a;
  gl_FragColor = vec4(uColor, a * uOpacity * vFlicker);
}
`;

function billboardUniforms(
  map: THREE.Texture,
  color: string,
  size: number,
  aspect: number,
  opacity: number,
) {
  return {
    uMap: { value: map },
    uColor: { value: new THREE.Color(color) },
    uSize: { value: size },
    uAspect: { value: aspect },
    uOpacity: { value: opacity },
    uTime: { value: 0 },
  };
}

const BOWL_PROFILE = [
  new THREE.Vector2(0, 0),
  new THREE.Vector2(0.12, 0),
  new THREE.Vector2(0.2, 0.05),
  new THREE.Vector2(0.23, 0.1),
  new THREE.Vector2(0.19, 0.1),
  new THREE.Vector2(0.16, 0.06),
  new THREE.Vector2(0.05, 0.045),
];

export default function Diyas({ diyas }: { diyas: DiyaSpec[] }) {
  const count = diyas.length;
  const bowls = useRef<THREE.InstancedMesh>(null);
  const flames = useRef<THREE.InstancedMesh>(null);
  const glows = useRef<THREE.InstancedMesh>(null);
  const flameMat = useRef<THREE.ShaderMaterial>(null);
  const glowMat = useRef<THREE.ShaderMaterial>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // One quad shared by flames and glows, with per-instance seed + scale.
  const quad = useMemo(() => {
    const g = new THREE.PlaneGeometry(1, 1);
    const seeds = new Float32Array(count);
    const scales = new Float32Array(count);
    diyas.forEach((d, i) => {
      seeds[i] = d.seed;
      scales[i] = d.scale;
    });
    g.setAttribute("aSeed", new THREE.InstancedBufferAttribute(seeds, 1));
    g.setAttribute("aScale", new THREE.InstancedBufferAttribute(scales, 1));
    return g;
  }, [diyas, count]);

  const textures = useMemo(
    () => ({
      flame: makeSprite(64, 1.35, [
        [0, "rgba(255,255,255,1)"],
        [0.25, "rgba(255,225,150,0.95)"],
        [0.55, "rgba(240,140,60,0.5)"],
        [1, "rgba(224,120,42,0)"],
      ]),
      glow: makeSprite(128, 1, [
        [0, "rgba(255,210,122,0.85)"],
        [0.35, "rgba(242,169,59,0.35)"],
        [1, "rgba(224,120,42,0)"],
      ]),
    }),
    [],
  );
  const flameUniforms = useMemo(
    () => billboardUniforms(textures.flame, "#FFE1A0", 0.22, 1.6, 1),
    [textures],
  );
  const glowUniforms = useMemo(
    () => billboardUniforms(textures.glow, "#F2A93B", 1.1, 1, 0.28),
    [textures],
  );

  useEffect(
    () => () => {
      quad.dispose();
      textures.flame.dispose();
      textures.glow.dispose();
    },
    [quad, textures],
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (flameMat.current) flameMat.current.uniforms.uTime.value = t;
    if (glowMat.current) glowMat.current.uniforms.uTime.value = t;

    const b = bowls.current;
    const f = flames.current;
    const g = glows.current;
    if (!b || !f || !g) return;

    for (let i = 0; i < count; i++) {
      const d = diyas[i];
      const y = waveHeight(d.x, d.z, t);
      const tilt = (waveHeight(d.x + 0.3, d.z, t) - y) * 2.5;

      dummy.position.set(d.x, y - 0.01, d.z);
      dummy.rotation.set(0, d.seed, tilt);
      dummy.scale.setScalar(d.scale);
      dummy.updateMatrix();
      b.setMatrixAt(i, dummy.matrix);

      dummy.position.set(d.x, y + 0.16 * d.scale, d.z);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      f.setMatrixAt(i, dummy.matrix);
      g.setMatrixAt(i, dummy.matrix);
    }
    b.instanceMatrix.needsUpdate = true;
    f.instanceMatrix.needsUpdate = true;
    g.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      <instancedMesh
        ref={bowls}
        args={[undefined, undefined, count]}
        frustumCulled={false}
      >
        <latheGeometry args={[BOWL_PROFILE, 10]} />
        <meshLambertMaterial color="#9a5233" emissive="#3a1a0c" />
      </instancedMesh>

      <instancedMesh
        ref={glows}
        args={[quad, undefined, count]}
        frustumCulled={false}
        renderOrder={1}
      >
        <shaderMaterial
          ref={glowMat}
          uniforms={glowUniforms}
          vertexShader={billboardVertex}
          fragmentShader={billboardFragment}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </instancedMesh>

      <instancedMesh
        ref={flames}
        args={[quad, undefined, count]}
        frustumCulled={false}
        renderOrder={2}
      >
        <shaderMaterial
          ref={flameMat}
          uniforms={flameUniforms}
          vertexShader={billboardVertex}
          fragmentShader={billboardFragment}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </instancedMesh>
    </group>
  );
}

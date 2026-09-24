"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { WAVE_GLSL, type DiyaSpec } from "./diyaLayout";

const MAX_LIGHTS = 64;

const vertexShader = /* glsl */ `
uniform float uTime;
varying vec3 vWorld;
varying float vWave;
${WAVE_GLSL}
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  float w = wave(wp.xz, uTime);
  wp.y += w;
  vWorld = wp.xyz;
  vWave = w;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;

const fragmentShader = /* glsl */ `
precision highp float;
uniform float uTime;
uniform vec3 uNight;
uniform vec3 uGanga;
uniform vec3 uIndigo;
uniform vec3 uDiya;
uniform vec3 uCamPos;
uniform vec3 uLights[${MAX_LIGHTS}];
uniform int uCount;
varying vec3 vWorld;
varying float vWave;

void main() {
  float dist = distance(vWorld.xz, uCamPos.xz);
  float depth = smoothstep(2.0, 18.0, dist);

  // Cool Ganga near the viewer, sinking into night toward the far bank,
  // with a faint indigo sheen where the sky touches the water.
  vec3 col = mix(uGanga, uNight, 0.58 + depth * 0.38);
  col += uIndigo * (0.18 * depth);
  col += vWave * 1.4 * uGanga;

  // Each lamp leaves a broken streak of light pointing at the viewer.
  vec3 glow = vec3(0.0);
  for (int i = 0; i < ${MAX_LIGHTS}; i++) {
    if (i >= uCount) break;
    vec3 L = uLights[i];
    vec2 dir = normalize(uCamPos.xz - L.xz);
    vec2 rel = vWorld.xz - L.xz;
    float along = dot(rel, dir);
    if (along < -0.15 || along > 5.0) continue;
    float across = abs(rel.x * dir.y - rel.y * dir.x);
    float streak = exp(-across * across / (0.010 + along * 0.022));
    float fade = exp(-along * 0.85);
    float ripple = 0.55 + 0.45 * sin(along * 9.0 - uTime * 2.6 + L.x * 3.1);
    float head = smoothstep(-0.15, 0.08, along);
    glow += uDiya * streak * fade * ripple * head;
  }
  col += glow * 0.85;

  // Far water dissolves into the sky behind the canvas.
  float fog = smoothstep(11.0, 18.5, dist);
  gl_FragColor = vec4(mix(col, uNight, fog * 0.6), 1.0 - fog);
}
`;

export default function Water({ diyas }: { diyas: DiyaSpec[] }) {
  const material = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(() => {
    const lights = new Float32Array(MAX_LIGHTS * 3);
    diyas.slice(0, MAX_LIGHTS).forEach((d, i) => {
      lights[i * 3] = d.x;
      lights[i * 3 + 1] = 0;
      lights[i * 3 + 2] = d.z;
    });
    return {
      uTime: { value: 0 },
      uNight: { value: new THREE.Color("#0B0A14") },
      uGanga: { value: new THREE.Color("#23415A") },
      uIndigo: { value: new THREE.Color("#1C1B3A") },
      uDiya: { value: new THREE.Color("#FFD27A") },
      uCamPos: { value: new THREE.Vector3(0, 1.4, 7.5) },
      uLights: { value: lights },
      uCount: { value: Math.min(diyas.length, MAX_LIGHTS) },
    };
  }, [diyas]);

  useFrame((state) => {
    const m = material.current;
    if (!m) return;
    m.uniforms.uTime.value = state.clock.elapsedTime;
    (m.uniforms.uCamPos.value as THREE.Vector3).copy(state.camera.position);
  });

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -4]} frustumCulled={false}>
      <planeGeometry args={[44, 32, 110, 80]} />
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthWrite
      />
    </mesh>
  );
}

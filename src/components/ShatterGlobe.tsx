import * as React from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { glitch, glitchTime } from "../lib/glitchClock";

// The globe breaks into blue particles for one second. Particles nearest the
// centre let go first, and each one flies off in its own direction.
// Drawn additively so it reads like an X-ray.

const MAX_POINTS = 9000;
const COLOUR = new THREE.Color("#4f7bff");

const VERTEX = /* glsl */ `
uniform float uT;      // seconds into the shatter
uniform float uSize;
attribute vec3 aDir;
attribute float aDelay;
attribute float aSeed;
varying float vAlpha;
void main() {
  float k = clamp((uT - aDelay) / 0.55, 0.0, 1.0);
  float ease = k * k;
  vec3 p = position + aDir * ease * 6.0;
  p.y += sin(uT * 9.0 + aSeed * 6.2831) * 0.04 * k;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uSize * (1.0 - k * 0.6) * (300.0 / -mv.z);
  vAlpha = 1.0 - k * 0.9;
}
`;

const FRAGMENT = /* glsl */ `
uniform vec3 uColor;
varying float vAlpha;
void main() {
  float d = length(gl_PointCoord - vec2(0.5));
  if (d > 0.5) discard;
  gl_FragColor = vec4(uColor, vAlpha * (1.0 - 2.0 * d));
}
`;

// Samples points from the globe's mesh vertices, in the globe's own space.
// The points are added as children of the globe, so they spin and float with it.
export function ShatterGlobe({ source }: { source: THREE.Object3D }) {
  const { geometry, material, points } = React.useMemo(() => {
    source.updateWorldMatrix(true, true);
    const inverse = source.matrixWorld.clone().invert();
    const verts: THREE.Vector3[] = [];
    source.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (!mesh.isMesh) return;
      const pos = mesh.geometry.attributes.position as THREE.BufferAttribute;
      const m = mesh.matrixWorld.clone().premultiply(inverse);
      for (let i = 0; i < pos.count; i++) {
        verts.push(new THREE.Vector3().fromBufferAttribute(pos, i).applyMatrix4(m));
      }
    });
    const stride = Math.max(1, Math.floor(verts.length / MAX_POINTS));
    const picked = verts.filter((_, i) => i % stride === 0).slice(0, MAX_POINTS);
    let radius = 0;
    picked.forEach((v) => (radius = Math.max(radius, v.length())));
    radius = radius || 1;

    const n = picked.length;
    const pos = new Float32Array(n * 3);
    const dir = new Float32Array(n * 3);
    const delay = new Float32Array(n);
    const seed = new Float32Array(n);
    picked.forEach((v, i) => {
      pos[i * 3] = v.x;
      pos[i * 3 + 1] = v.y;
      pos[i * 3 + 2] = v.z;
      // Uniform random direction over the whole sphere, so the pieces fly
      // out in every direction, not just one side.
      const u = Math.random() * 2 - 1;
      const phi = Math.random() * Math.PI * 2;
      const r = Math.sqrt(1 - u * u);
      const d = new THREE.Vector3(r * Math.cos(phi), u, r * Math.sin(phi));
      const speed = 0.5 + Math.random() * 0.8;
      dir[i * 3] = d.x * speed;
      dir[i * 3 + 1] = d.y * speed;
      dir[i * 3 + 2] = d.z * speed;
      // Inside first: points near the centre start breaking earliest.
      delay[i] = (v.length() / radius) * 0.4 + Math.random() * 0.05;
      seed[i] = Math.random();
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aDir", new THREE.BufferAttribute(dir, 3));
    g.setAttribute("aDelay", new THREE.BufferAttribute(delay, 1));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    const mat = new THREE.ShaderMaterial({
        vertexShader: VERTEX,
        fragmentShader: FRAGMENT,
        uniforms: {
          uT: { value: 0 },
          uSize: { value: 6 },
          uColor: { value: COLOUR },
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
    });
    return { geometry: g, material: mat, points: new THREE.Points(g, mat) };
  }, [source]);

  React.useEffect(() => {
    source.add(points);
    return () => {
      source.remove(points);
    };
  }, [source, points]);

  useFrame(() => {
    const active = glitch.phase === "shatter";
    points.visible = active;
    if (active) material.uniforms.uT.value = glitchTime();
  });

  return null;
}

import * as React from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { glitch, glitchTime, GLITCH_SHATTER_MS } from "../lib/glitchClock";

// During the glitch the globe turns into a green sun: particles fill the
// globe's volume, then drift slowly outward from the centre to every edge
// of the screen, fading as they go.

const MAX_POINTS = 9000;

const VERTEX = /* glsl */ `
uniform float uT;      // seconds into the sequence
uniform float uSize;
uniform float uRadius; // globe radius, in the globe's own units
uniform float uSpread; // how far a particle drifts over the sequence
attribute vec3 aDir;   // outward direction
attribute float aR;    // starting distance from the centre, 0..1
attribute float aSeed; // colour and timing variation
attribute float aSpeed;
varying float vAlpha;
varying float vSeed;
void main() {
  float d = aR * uRadius + uT * aSpeed * uSpread;
  vec3 p = aDir * d;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uSize * (300.0 / -mv.z);
  // Start fully bright, fade out over the last part of the sequence.
  float fade = 1.0 - smoothstep(0.55, 1.0, uT / ${(GLITCH_SHATTER_MS / 1000).toFixed(2)});
  vAlpha = fade * (0.6 + 0.4 * aSeed);
  vSeed = aSeed;
}
`;

const FRAGMENT = /* glsl */ `
varying float vAlpha;
varying float vSeed;
void main() {
  float d = length(gl_PointCoord - vec2(0.5));
  if (d > 0.5) discard;
  // Green, with some yellow in it, as in the sun reference.
  vec3 green = vec3(0.35, 1.0, 0.45);
  vec3 yellow = vec3(1.0, 0.95, 0.45);
  vec3 col = mix(green, yellow, vSeed * vSeed);
  gl_FragColor = vec4(col, vAlpha * (1.0 - 2.0 * d));
}
`;

// Samples points through the globe's volume. The points are added as children
// of the globe, so they spin and float with it.
export function ShatterGlobe({ source }: { source: THREE.Object3D }) {
  const { geometry, material, points } = React.useMemo(() => {
    // Radius in the globe's own units: the globe is scaled inside the scene,
    // so measure its world size and divide by its world scale.
    source.updateWorldMatrix(true, true);
    const box = new THREE.Box3().setFromObject(source);
    const worldRadius = box.getSize(new THREE.Vector3()).length() / 2;
    const worldScale = source.getWorldScale(new THREE.Vector3()).x || 1;
    const radius = worldRadius / worldScale;
    const n = MAX_POINTS;
    const dir = new Float32Array(n * 3);
    const dist = new Float32Array(n);
    const seed = new Float32Array(n);
    const speed = new Float32Array(n);
    const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      // Uniform direction over the sphere.
      const u = Math.random() * 2 - 1;
      const phi = Math.random() * Math.PI * 2;
      const r = Math.sqrt(1 - u * u);
      const x = r * Math.cos(phi);
      const y = u;
      const z = r * Math.sin(phi);
      dir[i * 3] = x;
      dir[i * 3 + 1] = y;
      dir[i * 3 + 2] = z;
      // Uniform inside the volume: the cube root keeps density even.
      dist[i] = Math.cbrt(Math.random());
      seed[i] = Math.random();
      speed[i] = 0.5 + Math.random() * 0.8;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aDir", new THREE.BufferAttribute(dir, 3));
    g.setAttribute("aR", new THREE.BufferAttribute(dist, 1));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    g.setAttribute("aSpeed", new THREE.BufferAttribute(speed, 1));

    const mat = new THREE.ShaderMaterial({
      vertexShader: VERTEX,
      fragmentShader: FRAGMENT,
      uniforms: {
        uT: { value: 0 },
        uSize: { value: 5 },
        uRadius: { value: radius },
        uSpread: { value: radius * 14 },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    return { geometry: g, material: mat, points: new THREE.Points(g, mat) };
  }, []);

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

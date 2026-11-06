import * as React from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

// A line-drawing interpretation of the globe: a wire sphere, a tilted orbit
// loop around it, and a flat ring grid underneath. Built from plain lines in
// one ink colour, so it reads like the pen drawing it is based on. It turns
// slowly on its vertical axis.
const INK = "#383e42";
const SEGMENTS = 96;

function ring(radius: number, y: number, material: THREE.Material) {
  const pts: THREE.Vector3[] = [];
  for (let j = 0; j <= SEGMENTS; j++) {
    const t = (j / SEGMENTS) * Math.PI * 2;
    pts.push(new THREE.Vector3(Math.cos(t) * radius, y, Math.sin(t) * radius));
  }
  return new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), material);
}

function spoke(from: THREE.Vector3, to: THREE.Vector3, material: THREE.Material) {
  return new THREE.Line(new THREE.BufferGeometry().setFromPoints([from, to]), material);
}

function buildSketch(material: THREE.Material) {
  const root = new THREE.Group();

  // Wire sphere: latitudes and longitudes.
  const R = 1;
  const LAT = 9;
  const LON = 14;
  for (let i = 1; i < LAT; i++) {
    const phi = (i / LAT) * Math.PI;
    const pts: THREE.Vector3[] = [];
    for (let j = 0; j <= SEGMENTS; j++) {
      const th = (j / SEGMENTS) * Math.PI * 2;
      pts.push(new THREE.Vector3(R * Math.sin(phi) * Math.cos(th), R * Math.cos(phi), R * Math.sin(phi) * Math.sin(th)));
    }
    root.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), material));
  }
  for (let j = 0; j < LON; j++) {
    const th = (j / LON) * Math.PI * 2;
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= SEGMENTS; i++) {
      const phi = (i / SEGMENTS) * Math.PI;
      pts.push(new THREE.Vector3(R * Math.sin(phi) * Math.cos(th), R * Math.cos(phi), R * Math.sin(phi) * Math.sin(th)));
    }
    root.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), material));
  }

  // Tilted orbit loop around the sphere.
  const orbit = ring(1.45, 0, material);
  orbit.rotation.set(Math.PI / 2.6, 0, 0.35);
  root.add(orbit);

  // Flat ring grid underneath: concentric rings and radial spokes.
  const baseY = -1.25;
  for (let r = 1.2; r <= 2.41; r += 0.4) root.add(ring(r, baseY, material));
  const SPOKES = 12;
  for (let k = 0; k < SPOKES; k++) {
    const a = (k / SPOKES) * Math.PI * 2;
    root.add(
      spoke(
        new THREE.Vector3(Math.cos(a) * 1.2, baseY, Math.sin(a) * 1.2),
        new THREE.Vector3(Math.cos(a) * 2.4, baseY, Math.sin(a) * 2.4),
        material
      )
    );
  }

  return root;
}

export function SketchGlobe() {
  const groupRef = React.useRef<THREE.Group>(null);
  const material = React.useMemo(() => new THREE.LineBasicMaterial({ color: INK }), []);
  const sketch = React.useMemo(() => buildSketch(material), [material]);

  React.useEffect(() => () => material.dispose(), [material]);

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotateY(-delta * 0.35);
  });

  return (
    <group ref={groupRef} rotation={[0.25, 0, 0]}>
      <primitive object={sketch} />
    </group>
  );
}

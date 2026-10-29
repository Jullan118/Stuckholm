import * as React from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { glitch } from "../lib/glitchClock";

// A half apple in 3D, cut open so the flesh faces the camera, with a worm and
// a patch of rot, as in the reference photo. Built from code, so no model file.
// It takes the globe's place during the "apple" phase of the glitch.

const SEG_W = 96;
const SEG_H = 72;
const SKIN = "#b9c65c";
const FLESH = "#eef1c4";
const CORE = "#d9d59c";
const STEM = "#6e5a2e";
const CALYX = "#4a3520";
const ROT = "#6b4526";
const WORM = "#e6b79b";

// Turns a unit sphere into an apple shape: wider shoulders, a dimple at the
// top and bottom.
function deform(x: number, y: number, z: number): THREE.Vector3 {
  const r = Math.hypot(x, z);
  const pole = Math.exp(-((r / 0.42) ** 2));
  const sx = 1 + 0.08 * y;
  const yy = y * 0.92 - Math.sign(y) * 0.3 * pole;
  return new THREE.Vector3(x * sx, yy, z * sx);
}

export function buildApple(): THREE.Group {
  const group = new THREE.Group();

  // Skin: the back half of the sphere (z <= 0). The cut is at z = 0.
  const skinGeo = new THREE.SphereGeometry(1, SEG_W, SEG_H, Math.PI, Math.PI);
  const pos = skinGeo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const d = deform(pos.getX(i), pos.getY(i), pos.getZ(i));
    pos.setXYZ(i, d.x, d.y, d.z);
  }
  skinGeo.computeVertexNormals();
  group.add(
    new THREE.Mesh(
      skinGeo,
      new THREE.MeshStandardMaterial({ color: SKIN, roughness: 0.55 })
    )
  );

  // Cut face: the outline of the skin at z = 0, filled with flesh.
  // Column 0 of the sphere is the right edge (x > 0), column SEG_W the left.
  const idx = (j: number, i: number) => j * (SEG_W + 1) + i;
  const right: THREE.Vector2[] = [];
  const left: THREE.Vector2[] = [];
  for (let j = 0; j <= SEG_H; j++) {
    right.push(new THREE.Vector2(pos.getX(idx(j, 0)), pos.getY(idx(j, 0))));
    left.push(new THREE.Vector2(pos.getX(idx(j, SEG_W)), pos.getY(idx(j, SEG_W))));
  }
  const outline = new THREE.Shape();
  outline.moveTo(right[0].x, right[0].y);
  for (let j = 1; j <= SEG_H; j++) outline.lineTo(right[j].x, right[j].y);
  for (let j = SEG_H; j >= 0; j--) outline.lineTo(left[j].x, left[j].y);
  outline.closePath();
  const face = new THREE.Mesh(
    new THREE.ShapeGeometry(outline, 1),
    new THREE.MeshStandardMaterial({ color: FLESH, roughness: 0.6, side: THREE.DoubleSide })
  );
  group.add(face);

  // Core: a paler oval in the middle of the cut face.
  const core = new THREE.Shape();
  core.absellipse(0, 0, 0.12, 0.6, 0, Math.PI * 2, false, 0);
  const coreMesh = new THREE.Mesh(
    new THREE.ShapeGeometry(core, 32),
    new THREE.MeshStandardMaterial({ color: CORE, roughness: 0.7, side: THREE.DoubleSide })
  );
  coreMesh.position.z = 0.003;
  group.add(coreMesh);

  // Rot patch, next to the worm.
  const rot = new THREE.Shape();
  for (let k = 0; k <= 48; k++) {
    const a = (k / 48) * Math.PI * 2;
    const rr = 0.26 + 0.05 * Math.sin(5 * a) + 0.03 * Math.cos(9 * a);
    const x = 0.5 + rr * Math.cos(a) * 1.3;
    const y = 0.02 + rr * Math.sin(a);
    if (k === 0) rot.moveTo(x, y);
    else rot.lineTo(x, y);
  }
  const rotMesh = new THREE.Mesh(
    new THREE.ShapeGeometry(rot, 1),
    new THREE.MeshStandardMaterial({ color: ROT, roughness: 0.9, side: THREE.DoubleSide })
  );
  rotMesh.position.z = 0.005;
  group.add(rotMesh);

  // Worm: a tube along a wavy path on the cut face.
  const wormPath = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.1, 0.35, 0.012),
    new THREE.Vector3(0.28, 0.42, 0.012),
    new THREE.Vector3(0.45, 0.3, 0.012),
    new THREE.Vector3(0.6, 0.18, 0.012),
    new THREE.Vector3(0.8, 0.1, 0.012),
  ]);
  group.add(
    new THREE.Mesh(
      new THREE.TubeGeometry(wormPath, 60, 0.035, 10, false),
      new THREE.MeshStandardMaterial({ color: WORM, roughness: 0.5 })
    )
  );

  // Calyx at the bottom, and the stem at the top (behind the cut).
  const calyx = new THREE.Shape();
  calyx.absellipse(0, 0, 0.08, 0.12, 0, Math.PI * 2, false, 0);
  const calyxMesh = new THREE.Mesh(
    new THREE.ShapeGeometry(calyx, 16),
    new THREE.MeshStandardMaterial({ color: CALYX, roughness: 0.9, side: THREE.DoubleSide })
  );
  calyxMesh.position.set(0, -0.8, 0.006);
  group.add(calyxMesh);

  const stem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.035, 0.05, 0.42, 12),
    new THREE.MeshStandardMaterial({ color: STEM, roughness: 0.8 })
  );
  stem.position.set(0.02, 0.85, -0.02);
  stem.rotation.z = 0.08;
  group.add(stem);

  return group;
}

// The apple, shown only during the "apple" phase. It sits outside the spinning
// group, so the cut face stays towards the camera. It sways slightly.
export function GlitchApple() {
  const apple = React.useMemo(() => buildApple(), []);
  const ref = React.useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const g = ref.current;
    if (!g) return;
    g.visible = glitch.phase === "apple";
    g.rotation.y = Math.sin(clock.elapsedTime * 2.2) * 0.35;
    g.rotation.x = Math.sin(clock.elapsedTime * 1.3) * 0.05;
  });

  // The globe's inner group scales by 1.08, and the blob has radius 3.2.
  return (
    <group ref={ref} scale={3.2 * 1.08}>
      <primitive object={apple} />
    </group>
  );
}

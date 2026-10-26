import * as React from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

// A sun and an Earth as solid grey 3D spheres. Their surfaces are uneven:
// the Earth is bumpy like Mars, and the sun is fragmented, with streaks drawn
// across it. They turn slowly on their own axis and sit in their own dips of
// the grid, so the net sinks under them. The scene light comes from the left.

export type SpaceBody = {
  kind: "sun" | "earth";
  /** Position in the grid's own x/z */
  x: number;
  z: number;
  /** Radius in world units */
  r: number;
};

const BODY_GREY = "#b4b8bd"; // the same grey as the globe body

// Smooth pseudo-random noise in 3D, between 0 and 1.
function hash(x: number, y: number, z: number) {
  const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453;
  return s - Math.floor(s);
}
function noise3(x: number, y: number, z: number) {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const xf = x - xi, yf = y - yi, zf = z - zi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf), w = zf * zf * (3 - 2 * zf);
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  const c = (dx: number, dy: number, dz: number) => hash(xi + dx, yi + dy, zi + dz);
  return lerp(
    lerp(lerp(c(0, 0, 0), c(1, 0, 0), u), lerp(c(0, 1, 0), c(1, 1, 0), u), v),
    lerp(lerp(c(0, 0, 1), c(1, 0, 1), u), lerp(c(0, 1, 1), c(1, 1, 1), u), v),
    w
  );
}

// Pushes each vertex of a unit sphere in or out, so the surface is lumpy.
function bumpy(geometry: THREE.BufferGeometry, amplitude: number, frequency: number, seed: number) {
  const pos = geometry.getAttribute("position") as THREE.BufferAttribute;
  const p = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    p.fromBufferAttribute(pos, i).normalize();
    const n =
      0.6 * noise3(p.x * frequency + seed, p.y * frequency, p.z * frequency) +
      0.4 * noise3(p.x * frequency * 2.7 + seed, p.y * frequency * 2.7, p.z * frequency * 2.7);
    p.multiplyScalar(1 + amplitude * (n - 0.5) * 2);
    pos.setXYZ(i, p.x, p.y, p.z);
  }
  geometry.computeVertexNormals();
  return geometry;
}

// A grey canvas with many short, uneven streaks, used as the sun's surface.
function streakTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.fillStyle = BODY_GREY;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < 700; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const len = 10 + Math.random() * 60;
    const bright = Math.random() < 0.5;
    ctx.strokeStyle = bright ? "rgba(235,238,240,0.85)" : "rgba(70,74,80,0.7)";
    ctx.lineWidth = 0.6 + Math.random() * 2.2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + len, y + (Math.random() - 0.5) * 6);
    ctx.stroke();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  return texture;
}

type Props = {
  progress: number;
  /** Where the grid sits in the scene */
  gridPos: [number, number, number];
  /** Height of the grid (its dips) at a point in the grid's x/z */
  heightAt: (x: number, z: number) => number;
  bodies: SpaceBody[];
};

export function SpaceBodies({ gridPos, heightAt, bodies }: Props) {
  const spinRefs = React.useRef<(THREE.Group | null)[]>([]);

  // One geometry and material per body, so each keeps its own surface.
  const parts = React.useMemo(
    () =>
      bodies.map((b, i) => {
        if (b.kind === "sun") {
          const texture = streakTexture();
          return {
            geometry: bumpy(new THREE.SphereGeometry(1, 64, 40), 0.05, 2.2, i * 10),
            material: new THREE.MeshLambertMaterial({ color: "#ffffff", map: texture }),
          };
        }
        return {
          geometry: bumpy(new THREE.SphereGeometry(1, 64, 40), 0.12, 2.6, i * 10),
          material: new THREE.MeshLambertMaterial({ color: BODY_GREY }),
        };
      }),
    [bodies]
  );

  // Place each body in its dip, sunk partly into the net.
  const placements = React.useMemo(
    () =>
      bodies.map((b) => {
        const y = gridPos[1] + heightAt(b.x, b.z) + b.r * 0.2;
        return [gridPos[0] + b.x, y, gridPos[2] + b.z] as [number, number, number];
      }),
    [bodies, gridPos, heightAt]
  );

  useFrame((_, delta) => {
    // Turn each body on its own axis. The Earth turns slowly; the sun slower still.
    bodies.forEach((b, i) => {
      const g = spinRefs.current[i];
      if (g) g.rotation.y += delta * (b.kind === "earth" ? 0.12 : 0.04);
    });
  });

  return (
    <group>
      {bodies.map((b, i) => (
        <group key={b.kind + i} position={placements[i]} scale={b.r}>
          {/* Tilt: the Earth's axis leans about 23 degrees, the Sun's a little. */}
          <group
            ref={(el: THREE.Group | null) => {
              spinRefs.current[i] = el;
            }}
            rotation={[0, 0, b.kind === "earth" ? 0.41 : 0.12]}
          >
            <mesh geometry={parts[i].geometry} material={parts[i].material} />
          </group>
        </group>
      ))}
    </group>
  );
}

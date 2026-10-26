import * as React from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

// A sun and an Earth as real 3D spheres, lit from one side and turning slowly
// on their own axis. They get the same white line-art as the globe: a graticule
// of lines and a white rim. They sit in their own dips of the grid, so the net
// sinks under them. Colours follow the background: dark with white lines at the
// top of the page, light with dark ink lines as you scroll down.

export type SpaceBody = {
  kind: "sun" | "earth";
  /** Position in the grid's own x/z */
  x: number;
  z: number;
  /** Radius in world units */
  r: number;
};

const FILL_DARK = new THREE.Color("#1f2327");
const FILL_LIGHT = new THREE.Color("#ffffff");
const LINE_LIGHT = new THREE.Color("#ffffff");
const INK = new THREE.Color("#383e42");

// Latitude circles and meridians of a unit sphere, as line segments.
function graticule(latitudes = [-60, -30, 0, 30, 60], meridians = 6, steps = 48) {
  const pts: THREE.Vector3[] = [];
  const addLoop = (point: (t: number) => THREE.Vector3) => {
    for (let i = 0; i < steps; i++) {
      pts.push(point((i / steps) * Math.PI * 2), point(((i + 1) / steps) * Math.PI * 2));
    }
  };
  for (const deg of latitudes) {
    const lat = THREE.MathUtils.degToRad(deg);
    addLoop((t) => new THREE.Vector3(Math.cos(t) * Math.cos(lat), Math.sin(lat), Math.sin(t) * Math.cos(lat)));
  }
  for (let m = 0; m < meridians; m++) {
    const phi = (m / meridians) * Math.PI;
    // A meridian is a great circle through both poles.
    addLoop((t) => new THREE.Vector3(Math.cos(t) * Math.cos(phi), Math.sin(t), Math.cos(t) * Math.sin(phi)));
  }
  return new THREE.BufferGeometry().setFromPoints(pts);
}

type Props = {
  progress: number;
  /** Where the grid sits in the scene */
  gridPos: [number, number, number];
  /** Height of the grid (its dips) at a point in the grid's x/z */
  heightAt: (x: number, z: number) => number;
  bodies: SpaceBody[];
};

export function SpaceBodies({ progress, gridPos, heightAt, bodies }: Props) {
  const progressRef = React.useRef(progress);
  const spinRefs = React.useRef<(THREE.Group | null)[]>([]);

  React.useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  const fill = React.useMemo(() => new THREE.MeshLambertMaterial({ color: "#1f2327" }), []);
  const line = React.useMemo(() => new THREE.LineBasicMaterial({ color: "#ffffff" }), []);
  const rim = React.useMemo(
    () => new THREE.MeshBasicMaterial({ color: "#ffffff", side: THREE.BackSide }),
    []
  );
  const sphere = React.useMemo(() => new THREE.SphereGeometry(1, 40, 28), []);
  const lines = React.useMemo(() => graticule(), []);

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
    const p = THREE.MathUtils.clamp(progressRef.current, 0, 1);
    fill.color.lerpColors(FILL_DARK, FILL_LIGHT, p);
    line.color.lerpColors(LINE_LIGHT, INK, p);
    rim.color.copy(line.color);
    // Turn each body on its own axis: the Earth a bit faster than the Sun.
    bodies.forEach((b, i) => {
      const g = spinRefs.current[i];
      if (g) g.rotation.y += delta * (b.kind === "earth" ? 0.25 : 0.06);
    });
  });

  return (
    <group>
      <ambientLight intensity={0.35} />
      <directionalLight position={[-150, 220, 160]} intensity={1.4} />
      {bodies.map((b, i) => (
        <group key={b.kind + i} position={placements[i]} scale={b.r}>
          {/* Tilt: the Earth's axis leans about 23 degrees, the Sun's a little. */}
          <group
            ref={(el: THREE.Group | null) => {
              spinRefs.current[i] = el;
            }}
            rotation={[0, 0, b.kind === "earth" ? 0.41 : 0.12]}
          >
            <mesh geometry={sphere} material={fill} />
            <mesh geometry={sphere} material={rim} scale={1.02} />
            <lineSegments geometry={lines} material={line} />
          </group>
        </group>
      ))}
    </group>
  );
}

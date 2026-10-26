import * as React from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

// A sun and an Earth as solid grey 3D spheres, lit from one side and turning
// slowly on their own axis, like the globe. They sit in their own dips of the
// grid, so the net sinks under them.

export type SpaceBody = {
  kind: "sun" | "earth";
  /** Position in the grid's own x/z */
  x: number;
  z: number;
  /** Radius in world units */
  r: number;
};

const BODY_GREY = "#b4b8bd"; // the same grey as the globe body

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

  // Solid grey spheres, the same grey as the globe body.
  const fill = React.useMemo(() => new THREE.MeshLambertMaterial({ color: BODY_GREY }), []);
  const sphere = React.useMemo(() => new THREE.SphereGeometry(1, 48, 32), []);

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
          </group>
        </group>
      ))}
    </group>
  );
}

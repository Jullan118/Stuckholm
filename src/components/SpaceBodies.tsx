import * as React from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";

// A sun and an Earth, drawn in the same line-art style as the globe. Each sits
// in its own dip of the grid, so the net sinks a little under it. They turn to
// face the camera and follow the background: black with white lines at the top
// of the page, white with dark ink lines as you scroll down.

export type SpaceBody = {
  kind: "sun" | "earth";
  /** Position in the grid's own x/z */
  x: number;
  z: number;
  /** Radius in world units */
  r: number;
};

const DARK = new THREE.Color("#000000");
const LIGHT = new THREE.Color("#ffffff");
const INK = new THREE.Color("#383e42");

// A circle, or an ellipse with half-widths rx and ry, as a closed line loop.
function ellipse(rx: number, ry: number, segments = 64) {
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= segments; i++) {
    const a = (i / segments) * Math.PI * 2;
    pts.push(new THREE.Vector3(Math.cos(a) * rx, Math.sin(a) * ry, 0));
  }
  return new THREE.BufferGeometry().setFromPoints(pts);
}

// Short rays around a sun, from radius r1 to r2.
function rays(r1: number, r2: number, count = 12) {
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2;
    pts.push(new THREE.Vector3(Math.cos(a) * r1, Math.sin(a) * r1, 0));
    pts.push(new THREE.Vector3(Math.cos(a) * r2, Math.sin(a) * r2, 0));
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
  const { camera } = useThree();
  const progressRef = React.useRef(progress);
  const groupRefs = React.useRef<(THREE.Group | null)[]>([]);

  React.useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  const fill = React.useMemo(() => new THREE.MeshBasicMaterial({ color: "#000000" }), []);
  const line = React.useMemo(() => new THREE.LineBasicMaterial({ color: "#ffffff" }), []);

  // Unit shapes; each body scales them to its own radius.
  const disc = React.useMemo(() => new THREE.CircleGeometry(1, 48), []);
  const outline = React.useMemo(() => ellipse(1, 1), []);
  const sunRays = React.useMemo(() => rays(1.6, 2.2), []);
  const meridian = React.useMemo(() => ellipse(0.45, 1), []);
  const parallel = React.useMemo(() => ellipse(1, 0.25), []);

  // Place each body in its dip, sunk partly into the net.
  const placements = React.useMemo(
    () =>
      bodies.map((b) => {
        const y = gridPos[1] + heightAt(b.x, b.z) + b.r * 0.2;
        return [gridPos[0] + b.x, y, gridPos[2] + b.z] as [number, number, number];
      }),
    [bodies, gridPos, heightAt]
  );

  useFrame(() => {
    const p = THREE.MathUtils.clamp(progressRef.current, 0, 1);
    fill.color.lerpColors(DARK, LIGHT, p);
    line.color.lerpColors(LIGHT, INK, p);
    groupRefs.current.forEach((g) => g?.lookAt(camera.position));
  });

  return (
    <group>
      {bodies.map((b, i) => (
        <group
          key={b.kind + i}
          ref={(el: THREE.Group | null) => {
            groupRefs.current[i] = el;
          }}
          position={placements[i]}
          scale={b.r}
        >
          <mesh geometry={disc} material={fill} />
          <lineLoop geometry={outline} material={line} />
          {b.kind === "sun" ? (
            <lineSegments geometry={sunRays} material={line} />
          ) : (
            <>
              <lineLoop geometry={meridian} material={line} />
              <lineLoop geometry={parallel} material={line} />
            </>
          )}
        </group>
      ))}
    </group>
  );
}

import { useEffect, useMemo } from 'react';
import * as THREE from 'three';

type GravityGridProps = {
  /** Width and depth of the grid plane (world units) */
  size?: number;
  /** Number of cells per side. Higher = finer grid, more geometry */
  divisions?: number;
  /** How far the centre of the grid dips below the plane */
  depth?: number;
  /** Width of the well. Smaller = steeper, narrower funnel */
  falloff?: number;
  color?: string;
  opacity?: number;
  /** Drop the grid under the globe so the globe sits in the dip */
  position?: [number, number, number];
  /** Tilt of the plane, so it reads as a surface from the camera */
  rotation?: [number, number, number];
};

/**
 * A flat wireframe grid that dips in the middle, like the
 * "spacetime fabric" images. Place it inside the R3F <Canvas>,
 * next to the globe, with the globe centred above the dip.
 */
export default function GravityGrid({
  size = 14,
  divisions = 36,
  depth = 2.2,
  falloff = 1.6,
  color = '#ffffff',
  opacity = 0.55,
  position = [0, -1.5, 0],
  rotation = [0, 0, 0],
}: GravityGridProps) {
  const geometry = useMemo(() => {
    const step = size / divisions;
    const half = size / 2;
    const n = divisions + 1;

    // Height of the fabric at (x, z): deep at the centre, flattening out
    const heightAt = (x: number, z: number) => {
      const r2 = x * x + z * z;
      return -depth / Math.pow(1 + r2 / (falloff * falloff), 1.5);
    };

    // Grid of vertices
    const vertex = (i: number, j: number) => {
      const x = -half + i * step;
      const z = -half + j * step;
      return [x, heightAt(x, z), z] as const;
    };

    // Two line segments per cell: one along x, one along z
    const points: number[] = [];
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const [x, y, z] = vertex(i, j);
        if (i < n - 1) {
          const [x2, y2, z2] = vertex(i + 1, j);
          points.push(x, y, z, x2, y2, z2);
        }
        if (j < n - 1) {
          const [x2, y2, z2] = vertex(i, j + 1);
          points.push(x, y, z, x2, y2, z2);
        }
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(points, 3)
    );
    return geo;
  }, [size, divisions, depth, falloff]);

  useEffect(() => {
    return () => geometry.dispose();
  }, [geometry]);

  return (
    <lineSegments geometry={geometry} position={position} rotation={rotation}>
      <lineBasicMaterial color={color} transparent opacity={opacity} />
    </lineSegments>
  );
}

import { useMemo } from 'react';
import { Line } from '@react-three/drei';

type GravityGridProps = {
  /** Width and depth of the grid plane (world units) */
  size?: number;
  /** Number of cells per side. Higher = finer grid */
  divisions?: number;
  /** How far the centre of the grid dips below the plane */
  depth?: number;
  /** Width of the well. Smaller = steeper, narrower funnel */
  falloff?: number;
  color?: string;
  /** Overall opacity (used for the scroll fade) */
  opacity?: number;
  /** Line thickness in pixels */
  lineWidth?: number;
  /** How dim the far side of the grid is (0 = invisible, 1 = as bright as near) */
  farBrightness?: number;
  /** Leaves an open ring around the centre (world units). Gives a gap between grid and globe */
  clearRadius?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
};

/**
 * A wireframe grid that dips in the middle, like the spacetime images.
 * Lines near the camera (+z) are bright, lines far away fade out.
 */
export default function GravityGrid({
  size = 36,
  divisions = 60,
  depth = 3.5,
  falloff = 3,
  color = '#ffffff',
  opacity = 1,
  lineWidth = 1.5,
  farBrightness = 0.15,
  clearRadius = 0,
  position = [0, 0.4, 0],
  rotation = [0, 0, 0],
}: GravityGridProps) {
  const { points, colors } = useMemo(() => {
    const step = size / divisions;
    const half = size / 2;
    const n = divisions + 1;

    const heightAt = (x: number, z: number) => {
      const r2 = x * x + z * z;
      return -depth / Math.pow(1 + r2 / (falloff * falloff), 1.5);
    };
    const vertex = (i: number, j: number) => {
      const x = -half + i * step;
      const z = -half + j * step;
      return [x, heightAt(x, z), z] as [number, number, number];
    };
    // Brightness 0..1. Lines are lit near the globe (the mass) and near the
    // camera, and fade into the dark further away, like the reference image.
    const shade = (x: number, z: number) => {
      const t = (z + half) / size;
      const depthT = Math.pow(t, 1.4);
      const r2 = x * x + z * z;
      const glow = Math.exp(-r2 / (2 * (falloff * 1.3) * (falloff * 1.3)));
      const v = 0.6 * glow + 0.4 * depthT;
      return farBrightness + (1 - farBrightness) * Math.min(1, v);
    };

    const pts: [number, number, number][] = [];
    const cols: [number, number, number][] = [];
    const inside = (p: [number, number, number]) =>
      p[0] * p[0] + p[2] * p[2] < clearRadius * clearRadius;
    const pushSeg = (a: [number, number, number], b: [number, number, number]) => {
      if (clearRadius > 0 && inside(a) && inside(b)) return;
      pts.push(a, b);
      const sa = shade(a[0], a[2]);
      const sb = shade(b[0], b[2]);
      cols.push([sa, sa, sa], [sb, sb, sb]);
    };

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const v = vertex(i, j);
        if (i < n - 1) pushSeg(v, vertex(i + 1, j));
        if (j < n - 1) pushSeg(v, vertex(i, j + 1));
      }
    }
    return { points: pts, colors: cols };
  }, [size, divisions, depth, falloff, farBrightness, clearRadius]);

  return (
    <Line
      points={points}
      segments
      color={color}
      vertexColors={colors}
      lineWidth={lineWidth}
      transparent
      opacity={opacity}
      position={position}
      rotation={rotation}
    />
  );
}

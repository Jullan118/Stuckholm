import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { glitch } from '../lib/glitchClock';

/** One dip in the grid. Several can sit side by side, each pulling the net down. */
export type Well = {
  /** Centre of the dip, in the grid's own x/z */
  center: [number, number];
  /** How far the centre sinks below the plane */
  depth: number;
  /** Width of the dip. Smaller = steeper */
  falloff: number;
};

/** Total height of the grid at (x, z) for a list of wells (0 = flat). */
export function dipAt(x: number, z: number, wells: Well[]): number {
  let h = 0;
  for (const w of wells) {
    const dx = x - w.center[0];
    const dz = z - w.center[1];
    const r2 = dx * dx + dz * dz;
    h -= w.depth / Math.pow(1 + r2 / (w.falloff * w.falloff), 1.5);
  }
  return h;
}

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
  /** How dim the far side of the grid is (0 = invisible, 1 = as bright as near) */
  farBrightness?: number;
  /** Leaves an open ring around the centre (world units). Gives a gap between grid and globe */
  clearRadius?: number;
  /** Centre of the open ring, in the grid's own x/z (default: the grid centre) */
  clearCenter?: [number, number];
  /** Centre of the well (the dip), in the grid's own x/z. Default: the grid centre */
  wellCenter?: [number, number];
  /** Several dips at once. When given, these replace the single well above */
  wells?: Well[];
  /** Width (world units) of a soft fade just outside the open ring. 0 = hard edge */
  clearFade?: number;
  /** Leaves out lines that lie fully inside a square of this half-width (for a coarse outer grid) */
  clearHalf?: number;
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
  farBrightness = 0.15,
  clearRadius = 0,
  clearCenter = [0, 0],
  wellCenter = [0, 0],
  wells,
  clearFade = 0,
  clearHalf = 0,
  position = [0, 0.4, 0],
  rotation = [0, 0, 0],
}: GravityGridProps) {
  const { points, colors } = useMemo(() => {
    const step = size / divisions;
    const half = size / 2;
    const n = divisions + 1;

    const heightAt = (x: number, z: number) => {
      if (wells) return dipAt(x, z, wells);
      const dx = x - wellCenter[0];
      const dz = z - wellCenter[1];
      const r2 = dx * dx + dz * dz;
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
      // How far the grid has sunk here: 0 at the rim, 1 at the bottom of the well.
      const sink = Math.min(1, Math.max(0, -heightAt(x, z) / depth));
      const v = 0.85 * sink + 0.25 * depthT;
      return farBrightness + (1 - farBrightness) * Math.min(1, v);
    };

    const pts: [number, number, number][] = [];
    const cols: [number, number, number][] = [];
    const inside = (p: [number, number, number]) =>
      (p[0] - clearCenter[0]) ** 2 + (p[2] - clearCenter[1]) ** 2 < clearRadius * clearRadius;
    const inBox = (p: [number, number, number]) =>
      Math.abs(p[0]) < clearHalf && Math.abs(p[2]) < clearHalf;
    // 0 right at the open ring, rising smoothly to 1 at clearFade beyond it.
    const fadeAt = (p: [number, number, number]) => {
      if (clearRadius <= 0 || clearFade <= 0) return 1;
      const d = Math.hypot(p[0] - clearCenter[0], p[2] - clearCenter[1]);
      const t = Math.min(1, Math.max(0, (d - clearRadius) / clearFade));
      return t * t * (3 - 2 * t);
    };
    const pushSeg = (a: [number, number, number], b: [number, number, number]) => {
      if (clearRadius > 0 && inside(a) && inside(b)) return;
      if (clearHalf > 0 && inBox(a) && inBox(b)) return;
      pts.push(a, b);
      const sa = shade(a[0], a[2]) * fadeAt(a);
      const sb = shade(b[0], b[2]) * fadeAt(b);
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
  }, [size, divisions, depth, falloff, farBrightness, clearRadius, clearCenter, clearFade, clearHalf, wellCenter, wells]);

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(points.length * 2 * 3);
    points.forEach((p, i) => {
      pos[i * 3] = p[0];
      pos[i * 3 + 1] = p[1];
      pos[i * 3 + 2] = p[2];
    });
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const rgb = new Float32Array(points.length * 2 * 3);
    colors.forEach((c, i) => {
      rgb[i * 3] = c[0];
      rgb[i * 3 + 1] = c[1];
      rgb[i * 3 + 2] = c[2];
    });
    g.setAttribute('color', new THREE.BufferAttribute(rgb, 3));
    return g;
  }, [points, colors]);

  const material = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        vertexColors: true,
        color: new THREE.Color(color),
        transparent: true,
        opacity,
        depthWrite: false,
      }),
    [color, opacity]
  );

  // During the glitch the grid turns green and jumps sideways, then returns.
  const meshRef = useRef<THREE.LineSegments>(null);
  const baseColor = useMemo(() => new THREE.Color(color), [color]);
  const GREEN = useMemo(() => new THREE.Color('#7dff6a'), []);
  useFrame(() => {
    const m = meshRef.current;
    if (!m) return;
    const mat = material as THREE.LineBasicMaterial;
    if (glitch.phase === 'shatter') {
      mat.color.copy(GREEN);
      // A small sideways jump, not a wobble across the whole grid.
      m.position.set(position[0] + (Math.random() - 0.5) * 2, position[1], position[2]);
    } else {
      mat.color.copy(baseColor);
      m.position.set(position[0], position[1], position[2]);
    }
  });

  return (
    <lineSegments ref={meshRef} geometry={geometry} material={material} position={position} rotation={rotation} />
  );
}

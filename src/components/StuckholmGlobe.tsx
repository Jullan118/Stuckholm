import * as React from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, useGLTF } from "@react-three/drei";
import GravityGrid from "./GravityGrid";
import * as THREE from "three";

// The blob is a Rhino/Grasshopper export (blobben.glb). It is re-centred and
// re-scaled in code, so the file's own units don't matter.
export const BLOB_MODEL_URL = "/models/globe_19oct.glb";
const BLOB_RADIUS = 3.2; // 20 % mindre än 4.0
// Scales the letter ring around the globe. 1 = as placed in blobben.glb.
const LETTER_SCALE = 1;

// Fragmentation: gap between parts, and how broken the band looks.
const PART_GAP = 0; // fraction of the globe's half-size
const BAND_HEIGHT = 0.25; // parts this close to the equator count as band
const BAND_EVERY = 2; // every third band part is broken
const BAND_BREAK = 0; // how far a broken band part is shifted sideways
const BAND_TWIST = 0; // radians a broken band part is turned

// Line-drawing look: white fill, anthracite grey (RAL 7016) for all details.
const INK = "#383e42";
const PAPER = "#ffffff";
// How opaque the globe is at the top of the page (1 = solid).
const GLOBE_START_OPACITY = 0.95; // 5 % transparent
// One number for the size of the globe AND the grid, so they change together.
// 1 = the size before the last +10 % step.
const SCENE_SIZE = 1.782; // 35 % större än 1.32
// Open ring between the grid and the globe, in world units.
const GLOBE_WORLD_RADIUS = 3.2 * 1.08 * 2.17 * SCENE_SIZE; // blob radius after the group scales
const GRID_GAP = 1;
// Light grey for the globe body.
const GLOBE_GREY = "#b4b8bd";
// Night-sky navy at the top of the page, fading to white as you scroll.
const SKY_DARK = new THREE.Color("#000000"); // helsvart
const SKY_WHITE = new THREE.Color("#ffffff");
// Stars are white so they stay visible on the dark background.
const STAR = "#ffffff";


useGLTF.preload(BLOB_MODEL_URL);

// The 16 "Raven" meshes are the letters; everything else is the blob.
// three.js turns spaces into underscores, so match on the prefix.
function isLetter(name: string) {
  // three.js replaces spaces with underscores in node names.
  const clean = name.replace(/ /g, "_");
  return clean.startsWith("Raven") || clean.startsWith("SVG_bandtext") || clean.startsWith("Skissbokstav");
}

// Splits the GLB into the blob (sits at the origin) and the letter ring
// (returned separately so it can orbit on its own).
export function createBlobFromModel(scene: THREE.Object3D, fillColor: string = GLOBE_GREY) {
  const root = scene.clone(true);

  // Size and centre come from the blob parts only, so the letters don't
  // change how big the globe is.
  const box = new THREE.Box3();
  root.children.forEach((child) => {
    if (!isLetter(child.name)) box.expandByObject(child);
  });
  const center = box.getCenter(new THREE.Vector3());
  const halfDiagonal = box.getSize(new THREE.Vector3()).length() / 2;
  const scale = BLOB_RADIUS / halfDiagonal;
  root.position.copy(center).multiplyScalar(-scale);
  root.scale.setScalar(scale);

  // The letters use the same placement as the globe, so the ring keeps the
  // proportions set in blobben.glb.
  const letters = new THREE.Group();
  letters.position.copy(root.position).multiplyScalar(LETTER_SCALE);
  letters.scale.setScalar(scale * LETTER_SCALE);

  // White fill that hides what's behind it. Pushed slightly back in depth so
  // the ink lines sit on top of it instead of flickering against it.
  const fill = new THREE.MeshBasicMaterial({
    color: fillColor,
    polygonOffset: true,
    polygonOffsetFactor: 1,
    polygonOffsetUnits: 1,
  });
  const ink = new THREE.LineBasicMaterial({ color: INK });
  const inkHull = new THREE.MeshBasicMaterial({
    color: INK,
    side: THREE.BackSide,
  });
  const letterInk = new THREE.MeshBasicMaterial({ color: PAPER, side: THREE.DoubleSide });
  const letterEdge = new THREE.LineBasicMaterial({ color: PAPER });

  const letterMeshes: THREE.Mesh[] = [];
  const blobMeshes: THREE.Mesh[] = [];
  root.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (!mesh.isMesh) return;
    // Geometry is shared with the cached GLTF, so work on a copy.
    mesh.geometry = mesh.geometry.clone();
    if (isLetter(mesh.name)) {
      mesh.material = letterInk;
      letterMeshes.push(mesh);
    } else {
      mesh.material = fill;
      blobMeshes.push(mesh);
    }
  });

  // Move the letters out of the blob after the walk, so the tree isn't
  // changing while it is being traversed.
  letterMeshes.forEach((mesh) => {
    root.remove(mesh);
    letters.add(mesh);
  });

  // Fragmentation: every blob part is pushed a little away from the globe's
  // centre, which opens the seams between parts into gaps. Parts near the
  // band (the equator) are also shifted sideways and turned, so the band
  // looks broken. Values are fractions of the globe's half-size.
  const halfSize = halfDiagonal;
  blobMeshes.forEach((mesh, index) => {
    mesh.geometry.computeBoundingBox();
    const local = mesh.geometry.boundingBox!.getCenter(new THREE.Vector3());
    mesh.updateMatrix();
    const inRoot = local.applyMatrix4(mesh.matrix);
    const dir = inRoot.clone().sub(center);
    if (dir.lengthSq() === 0) return;
    dir.normalize();
    mesh.position.addScaledVector(dir, halfSize * PART_GAP);

    const nearBand = Math.abs(inRoot.y - center.y) < halfSize * BAND_HEIGHT;
    if (nearBand && index % BAND_EVERY === 0) {
      const tangent = new THREE.Vector3(-dir.z, 0, dir.x).normalize();
      mesh.position.addScaledVector(tangent, halfSize * BAND_BREAK);
      mesh.rotation.y += BAND_TWIST;
    }
    mesh.updateMatrix();
  });

  // Silhouette: a slightly larger black back-face shell behind each blob part.
  blobMeshes.forEach((mesh) => {
    const hull = new THREE.Mesh(mesh.geometry, inkHull);
    hull.scale.setScalar(1.008);
    mesh.add(hull);
  });

  // Creases and edges: lines where the surface turns sharply.
  blobMeshes.forEach((mesh) => {
    mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry, 25), ink));
  });
  // The orbiting letters get white edges so the wordmark reads as white.
  letterMeshes.forEach((mesh) => {
    mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry, 25), letterEdge));
  });

  return { blob: root, letters };
}

type DragState = { dragging: boolean; deltaX: number; deltaY: number };

// Sideways drag spins the globe around its vertical axis (no limit). Vertical
// drag tilts it, but never past this angle, so it can't end up upside down.
const PITCH_LIMIT = 0.9; // radians, about 50 degrees
const DRAG_SPEED = 0.0032; // radians per pixel of mouse travel

// The globe and its letter ring share one drag group, so the ring turns with
// the globe. Its own orbit spin is layered on top.
//
// At rest the globe slowly spins; the spin picks up pace as you scroll. Drag
// with the mouse to rotate it freely. As scroll progresses, everything fades
// out in place (opacity -> 0) rather than flying away.
function DriftingGlobe({
  scrollProgress,
  dragRef,
}: {
  scrollProgress: number;
  dragRef: React.MutableRefObject<DragState>;
}) {
  const groupRef = React.useRef<THREE.Group>(null);
  const ringRef = React.useRef<THREE.Group>(null);
  const progressRef = React.useRef(0);
  const yawRef = React.useRef(0);
  const pitchRef = React.useRef(0);
  const gltf = useGLTF(BLOB_MODEL_URL);
  const { blob, letters } = React.useMemo(
    () => createBlobFromModel(gltf.scene),
    [gltf.scene]
  );

  React.useEffect(() => {
    progressRef.current = scrollProgress;
  }, [scrollProgress]);

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;

    const drag = dragRef.current;
    if (drag.dragging) {
      yawRef.current += drag.deltaX * DRAG_SPEED;
      pitchRef.current = THREE.MathUtils.clamp(
        pitchRef.current + drag.deltaY * DRAG_SPEED,
        -PITCH_LIMIT,
        PITCH_LIMIT
      );
      drag.deltaX = 0;
      drag.deltaY = 0;
    } else {
      // Idle spin around the globe's own (possibly tilted) vertical axis.
      const spinSpeed = 0.07 + progressRef.current * 0.18;
      yawRef.current -= delta * spinSpeed;
    }
    // Tilt first, then spin around the vertical axis, so the globe stays upright.
    group.rotation.set(pitchRef.current, yawRef.current, 0, "YXZ");

    // The letter ring has no spin of its own: it turns with the globe, in the
    // same direction and speed, and follows drag too.

    // Starts at 80% opacity and fades out with the rest as you scroll.
    const opacity = GLOBE_START_OPACITY * (1 - THREE.MathUtils.clamp(progressRef.current, 0, 1));
    group.traverse((child) => {
      const mat = (child as THREE.Mesh).material as
        | THREE.Material
        | THREE.Material[]
        | undefined;
      if (!mat) return;
      const mats = Array.isArray(mat) ? mat : [mat];
      for (const m of mats) {
        m.transparent = true;
        m.opacity = opacity;
      }
    });
  });

  // rotationIntensity 0 stops Float's small wobble, which tilted the globe
  // around the z axis. Float still bobs the whole thing up and down.
  return (
    // Outer group: the lean (30 degrees to the right) and 10 % larger size.
    // The inner group keeps the drag and spin.
    <group position={[0, 1.14, 1.9]} rotation={[0, 0, -Math.PI / 6]} scale={2.17 * SCENE_SIZE}>
      <group ref={groupRef} scale={1.08}>
        <Float speed={1.5} rotationIntensity={0} floatIntensity={0.4}>
          <primitive object={blob} />
          <group ref={ringRef}>
            <primitive object={letters} />
          </group>
        </Float>
      </group>
    </group>
  );
}

// Outline of an eight-point compass sparkle: long spikes on the main axes,
// shorter ones on the diagonals, and concave sides between them.
// Fades the background from night-sky navy to white as scroll progresses.
function SceneBackground({ progress }: { progress: number }) {
  const { scene } = useThree();
  const colorRef = React.useRef(new THREE.Color().copy(SKY_DARK));
  const progressRef = React.useRef(progress);

  React.useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  React.useEffect(() => {
    scene.background = colorRef.current;
  }, [scene]);

  useFrame(() => {
    colorRef.current.lerpColors(
      SKY_DARK,
      SKY_WHITE,
      THREE.MathUtils.clamp(progressRef.current, 0, 1)
    );
  });

  return null;
}

// How many stars there are in the sky. About 1 in 10 is a small dot instead
// of an outlined sparkle.
const SPARKLE_COUNT = 350;
const DOT_COUNT = Math.round(SPARKLE_COUNT * 0.1);
const OUTLINE_COUNT = SPARKLE_COUNT - DOT_COUNT;

function sparkleOutline(size: number, pinch = 0.12, segments = 10) {
  const TIPS = 8;
  const tips: THREE.Vector2[] = [];
  for (let i = 0; i < TIPS; i++) {
    const angle = (i / TIPS) * Math.PI * 2 + Math.PI / 2;
    const length = size * (i % 2 === 0 ? 1 : 0.45);
    tips.push(
      new THREE.Vector2(Math.cos(angle) * length, Math.sin(angle) * length)
    );
  }
  const points: THREE.Vector3[] = [];
  for (let i = 0; i < TIPS; i++) {
    const a = tips[i];
    const b = tips[(i + 1) % TIPS];
    const control = a.clone().add(b).multiplyScalar(0.5 * pinch);
    const curve = new THREE.QuadraticBezierCurve(a, control, b);
    for (const p of curve.getPoints(segments)) {
      points.push(new THREE.Vector3(p.x, p.y, 0));
    }
  }
  return points;
}

type StarLayer = {
  geometry: THREE.BufferGeometry;
  colors: THREE.BufferAttribute;
  base: Float32Array;
  phases: Float32Array;
  speeds: Float32Array;
};

function makeStarLayer(count: number, bright: boolean): StarLayer {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const base = new Float32Array(count);
  const phases = new Float32Array(count);
  const speeds = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    // Depth: most stars are far away, a few are closer.
    const depth = 18 + Math.pow(Math.random(), 1.6) * 140;
    positions[i * 3] = (Math.random() * 2 - 1) * depth * 1.1;
    positions[i * 3 + 1] = (Math.random() * 2 - 1) * depth * 0.64;
    positions[i * 3 + 2] = -depth;
    base[i] = bright
      ? 0.8 + Math.random() * 0.2
      : 0.25 + Math.pow(Math.random(), 2) * 0.45;
    phases[i] = Math.random() * Math.PI * 2;
    speeds[i] = 0.6 + Math.random() * 1.2;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const colorAttr = new THREE.BufferAttribute(colors, 3);
  geometry.setAttribute("color", colorAttr);
  return { geometry, colors: colorAttr, base, phases, speeds };
}

function twinkle(layer: StarLayer, t: number) {
  const arr = layer.colors.array as Float32Array;
  for (let i = 0; i < layer.base.length; i++) {
    // Stays between 70% and 100% of its brightness.
    const v =
      layer.base[i] * (0.85 + 0.15 * Math.sin(t * layer.speeds[i] + layer.phases[i]));
    arr[i * 3] = v;
    arr[i * 3 + 1] = v;
    arr[i * 3 + 2] = v;
  }
  layer.colors.needsUpdate = true;
}


// Thin-outline sparkles spread through depth, like a night sky. Far stars are
// scaled up so they stay visible, and every star keeps a minimum brightness.
// They twinkle, drift slowly, and fade out only as scroll progresses.
function Starfield({ progress }: { progress: number }) {
  const groupRef = React.useRef<THREE.Group>(null);
  const lineRefs = React.useRef<(THREE.LineLoop | null)[]>([]);
  const progressRef = React.useRef(progress);

  React.useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  const geometry = React.useMemo(
    () => new THREE.BufferGeometry().setFromPoints(sparkleOutline(1)),
    []
  );

  const stars = React.useMemo(
    () =>
      Array.from({ length: OUTLINE_COUNT }, () => {
        // Depth: most stars are far away, a few are closer.
        const depth = 18 + Math.pow(Math.random(), 1.6) * 140;
        // Brightness: most stars are fairly bright, a few shine the brightest.
        const brightness = 0.45 + Math.pow(Math.random(), 2) * 0.55;
        return {
          x: (Math.random() * 2 - 1) * depth * 1.1,
          y: (Math.random() * 2 - 1) * depth * 0.64,
          z: -depth,
          // Size grows with distance, so far stars are still big enough to see.
          size: (0.12 + Math.random() * 0.1) * (depth / 25),
          brightness,
          phase: Math.random() * Math.PI * 2,
          speed: 0.6 + Math.random() * 1.2,
        };
      }),
    []
  );

  // One material per star, so each star can have its own brightness.
  const materials = React.useMemo(
    () =>
      stars.map(
        (s) =>
          new THREE.LineBasicMaterial({
            color: STAR,
            transparent: true,
            depthWrite: false,
            opacity: s.brightness,
          })
      ),
    [stars]
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const fade = 1 - THREE.MathUtils.clamp(progressRef.current, 0, 1);

    if (groupRef.current) {
      // Sway back and forth instead of spinning forever.
      groupRef.current.rotation.y = Math.sin(t * 0.05) * 0.06;
    }

    dotMaterial.opacity = fade;
    twinkle(dots, t);

    stars.forEach((s, i) => {
      // Gentle twinkle: stays between 70% and 100% of its brightness.
      const twinkle = 0.85 + 0.15 * Math.sin(t * s.speed + s.phase);
      materials[i].opacity = s.brightness * twinkle * fade;

      const line = lineRefs.current[i];
      if (line) {
        line.scale.setScalar(s.size * (0.95 + 0.05 * Math.sin(t * s.speed + s.phase)));
      }
    });
  });

  const dots = React.useMemo(() => makeStarLayer(DOT_COUNT, false), []);
  const dotMaterial = React.useMemo(
    () =>
      new THREE.PointsMaterial({
        color: STAR,
        size: 2.2,
        sizeAttenuation: false,
        vertexColors: true,
        transparent: true,
        depthWrite: false,
      }),
    []
  );

  return (
    <group ref={groupRef}>
      <points geometry={dots.geometry} material={dotMaterial} />
      {stars.map((s, i) => (
        <lineLoop
          key={i}
          ref={(el: THREE.LineLoop | null) => {
            lineRefs.current[i] = el;
          }}
          geometry={geometry}
          material={materials[i]}
          position={[s.x, s.y, s.z]}
        />
      ))}
    </group>
  );
}


// Moves the camera back on narrow screens (phones), so the whole globe and its
// letter ring fit the width instead of being cut off at the sides. Wide
// screens keep the normal distance of 8.
function FitCamera() {
  const size = useThree((state) => state.size);
  const camera = useThree((state) => state.camera);

  React.useEffect(() => {
    const aspect = size.width / size.height;
    const halfTan = Math.tan(THREE.MathUtils.degToRad(45 / 2));
    // 4 = how many world units wide the view must be to hold the letter ring.
    const fit = 4 / (halfTan * aspect);
    camera.position.z = Math.max(34, fit);
    // Titta ner så att det horisontella nätet syns under globen.
    camera.position.y = 19;
    camera.lookAt(0, -0.6, 0);
  }, [size, camera]);

  return null;
}

export function StuckholmGlobe({
  scrollProgress = 0,
}: {
  scrollProgress?: number;
}) {
  const dragRef = React.useRef<DragState>({
    dragging: false,
    deltaX: 0,
    deltaY: 0,
  });
  const [isDragging, setIsDragging] = React.useState(false);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    dragRef.current.dragging = true;
    dragRef.current.deltaX = 0;
    dragRef.current.deltaY = 0;
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.dragging) return;
    dragRef.current.deltaX += e.movementX;
    dragRef.current.deltaY += e.movementY;
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    dragRef.current.dragging = false;
    setIsDragging(false);
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  return (
    <div
      className="w-full h-full"
      style={{
        cursor: isDragging ? "grabbing" : "grab",
        // "pan-y" keeps vertical swipes for page scrolling on touch screens,
        // while horizontal swipes still drive the globe.
        touchAction: "pan-y",
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerLeave={endDrag}
      onPointerCancel={endDrag}
    >
      {/* No tone mapping: it would grey out the pure white and darken the ink. */}
      <Canvas
        camera={{ position: [0, 19, 34], fov: 45 }}
        gl={{ toneMapping: THREE.NoToneMapping }}
      >
        <SceneBackground progress={scrollProgress} />
        <FitCamera />
        <DriftingGlobe scrollProgress={scrollProgress} dragRef={dragRef} />
        {/* Linjenätet under globen. Tonas bort när bakgrunden blir vit. */}
        <GravityGrid
          size={303.6 * SCENE_SIZE}
          divisions={176}
          depth={10.12 * SCENE_SIZE}
          falloff={6.33 * SCENE_SIZE}
          position={[0, 1.27 * SCENE_SIZE, -1.9 * SCENE_SIZE]}
          rotation={[0, 0, 0]}
          clearRadius={GLOBE_WORLD_RADIUS + GRID_GAP}
          clearCenter={[0, 3.8 * SCENE_SIZE]}
          clearFade={8}
          opacity={0.45 * (1 - scrollProgress)}
        />
      </Canvas>
    </div>
  );
}

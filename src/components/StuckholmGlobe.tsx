import * as React from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, useGLTF } from "@react-three/drei";
import * as THREE from "three";

// The blob is a Rhino/Grasshopper export (blobben.glb). It is re-centred and
// re-scaled in code, so the file's own units don't matter.
const BLOB_MODEL_URL = "/models/blobben.glb";
const BLOB_RADIUS = 4.0;
// Scales the letter ring around the globe. 1 = as placed in blobben.glb.
const LETTER_SCALE = 1;

// Line-drawing look: white fill, anthracite grey (RAL 7016) for all details.
const INK = "#383e42";
const PAPER = "#ffffff";
// How opaque the globe is at the top of the page (1 = solid).
const GLOBE_START_OPACITY = 0.8;
// Light grey for the globe body.
const GLOBE_GREY = "#d4d7da";
// Night-sky navy at the top of the page, fading to white as you scroll.
const SKY_DARK = new THREE.Color("#04050c");
const SKY_WHITE = new THREE.Color("#ffffff");
// Stars are white so they stay visible on the dark background.
const STAR = "#ffffff";

// Orbit speed of the letter ring around the globe's vertical axis, in rad/s.
const TEXT_ORBIT_SPEED = 0.08;

useGLTF.preload(BLOB_MODEL_URL);

// The 16 "Raven" meshes are the letters; everything else is the blob.
// three.js turns spaces into underscores, so match on the prefix.
function isLetter(name: string) {
  return name.startsWith("Raven");
}

// Splits the GLB into the blob (sits at the origin) and the letter ring
// (returned separately so it can orbit on its own).
function createBlobFromModel(scene: THREE.Object3D) {
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
    color: GLOBE_GREY,
    polygonOffset: true,
    polygonOffsetFactor: 1,
    polygonOffsetUnits: 1,
  });
  const ink = new THREE.LineBasicMaterial({ color: INK });
  const inkHull = new THREE.MeshBasicMaterial({
    color: INK,
    side: THREE.BackSide,
  });
  const letterInk = new THREE.MeshBasicMaterial({ color: PAPER });

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

  // Silhouette: a slightly larger black back-face shell behind each blob part.
  blobMeshes.forEach((mesh) => {
    const hull = new THREE.Mesh(mesh.geometry, inkHull);
    hull.scale.setScalar(1.008);
    mesh.add(hull);
  });

  // Creases and edges: lines where the surface turns sharply.
  [...blobMeshes, ...letterMeshes].forEach((mesh) => {
    mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry, 25), ink));
  });

  return { blob: root, letters };
}

type DragState = { dragging: boolean; deltaX: number; deltaY: number };

// Drag only turns the globe sideways, around the world vertical (Y) axis. It
// stays upright and never tips over, no matter how you drag.
const YAW_AXIS = new THREE.Vector3(0, 1, 0);
const dragQuat = new THREE.Quaternion();

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
      // About one radian per ~320px of sideways mouse travel.
      dragQuat.setFromAxisAngle(YAW_AXIS, drag.deltaX * 0.0032);
      group.quaternion.premultiply(dragQuat);
      drag.deltaX = 0;
      drag.deltaY = 0;
    } else {
      // Idle spin around the globe's own (possibly tilted) vertical axis.
      const spinSpeed = 0.07 + progressRef.current * 0.18;
      group.rotateY(delta * spinSpeed);
    }

    // The letter ring's own orbit, running whether or not the globe is dragged.
    if (ringRef.current) {
      ringRef.current.rotation.y += delta * TEXT_ORBIT_SPEED;
    }

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
    <group ref={groupRef}>
      <Float speed={1.5} rotationIntensity={0} floatIntensity={0.4}>
        <primitive object={blob} />
        <group ref={ringRef}>
          <primitive object={letters} />
        </group>
      </Float>
    </group>
  );
}

// Outline of an eight-point compass sparkle: long spikes on the main axes,
// shorter ones on the diagonals, and concave sides between them.
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

const SPARKLE_COUNT = 70;

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

// Thin-outline sparkles scattered behind the globe. They twinkle, drift
// slowly, and fade out as scroll progresses.
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

  const material = React.useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: STAR,
        transparent: true,
        depthWrite: false,
      }),
    []
  );

  const sparkles = React.useMemo(
    () =>
      Array.from({ length: SPARKLE_COUNT }, () => ({
        x: (Math.random() * 2 - 1) * 28,
        y: (Math.random() * 2 - 1) * 16,
        z: -25 - Math.random() * 35,
        size: 0.12 + Math.random() * 0.16,
        phase: Math.random() * Math.PI * 2,
        speed: 0.6 + Math.random() * 0.8,
      })),
    []
  );

  useFrame((state, delta) => {
    if (groupRef.current) {
      // Sway back and forth instead of spinning forever. A full spin carried
      // the stars off-screen over time, and they never came back.
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.05) * 0.06;
    }
    material.opacity = 1 - THREE.MathUtils.clamp(progressRef.current, 0, 1);

    const t = state.clock.elapsedTime;
    sparkles.forEach((s, i) => {
      const line = lineRefs.current[i];
      if (!line) return;
      // Gentle size wobble only. A deep pulse made the small sparkles look
      // like they were disappearing.
      const pulse = 0.94 + 0.06 * Math.sin(t * s.speed + s.phase);
      line.scale.setScalar(s.size * pulse);
    });
  });

  return (
    <group ref={groupRef}>
      {sparkles.map((s, i) => (
        <lineLoop
          key={i}
          ref={(el: THREE.LineLoop | null) => {
            lineRefs.current[i] = el;
          }}
          geometry={geometry}
          material={material}
          position={[s.x, s.y, s.z]}
        />
      ))}
    </group>
  );
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
        camera={{ position: [0, 0, 8], fov: 45 }}
        gl={{ toneMapping: THREE.NoToneMapping }}
      >
        <SceneBackground progress={scrollProgress} />
        <Starfield progress={scrollProgress} />
        <DriftingGlobe scrollProgress={scrollProgress} dragRef={dragRef} />
      </Canvas>
    </div>
  );
}

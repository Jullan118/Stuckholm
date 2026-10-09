import * as React from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

// The blob is a Rhino/Grasshopper export (blobben.glb). It is re-centred and
// re-scaled in code, so the file's own units don't matter.
const BLOB_MODEL_URL = "/models/blobben.glb";
const BLOB_RADIUS = 4.0;
// Scales the letter ring around the globe. 1 = as placed in blobben.glb.
const LETTER_SCALE = 1;

const OCEAN_DEEP = new THREE.Color("#214a9c").convertSRGBToLinear();
const OCEAN_SHALLOW = new THREE.Color("#0a9ac5").convertSRGBToLinear();
const LAND = new THREE.Color("#87c661").convertSRGBToLinear();
const GOLD = new THREE.Color("#d4af37").convertSRGBToLinear();
const ENAMEL_BLUE = new THREE.Color("#2f63e0").convertSRGBToLinear();

// "blue-green": the blob uses the ocean/land palette.
// "gold": the blob is gold, with a blue bead on top and white pearls.
const GLOBE_STYLE: "gold" | "blue-green" = "blue-green";

// The round bead on the stalk, just below the crown (raw model units).
const BEAD_CENTER = new THREE.Vector3(0, 0.117, 0);
const BEAD_RADIUS = 0.0075;

type PartKind = "globe" | "pearl" | "gold" | "stalk" | "letter";

// Node names from blobben.glb. The letters are the 16 "Raven" meshes that
// orbit the globe; everything else is part of the blob.
function partKind(name: string): PartKind {
  // three.js turns spaces into underscores and adds _N to duplicate names,
  // so match on prefixes rather than the exact export names.
  if (name.startsWith("Raven")) return "letter";
  const part = /BLOBBI_part_0(\d)/.exec(name);
  if (part) {
    const n = Number(part[1]);
    if (n === 1 || n === 2) return "globe";
    if (n >= 3 && n <= 5) return "pearl";
    if (n === 7) return "stalk";
  }
  // Band (part 06) and the Svensk krona crown.
  return "gold";
}

const _dir = new THREE.Vector3();
const _vertex = new THREE.Vector3();
const _color = new THREE.Color();

function colorBlobGeometry(
  geometry: THREE.BufferGeometry,
  center: THREE.Vector3,
  kind: PartKind
) {
  const position = geometry.attributes.position;
  const colors = new Float32Array(position.count * 3);
  const usePalette = GLOBE_STYLE === "blue-green";

  for (let i = 0; i < position.count; i++) {
    _vertex.fromBufferAttribute(position, i);

    if (usePalette) {
      _dir.copy(_vertex).sub(center).normalize();
      const landNoise =
        Math.sin(_dir.x * 3 + _dir.y * 2.5 + 1.5) * 0.5 +
        Math.sin(_dir.y * 4 - _dir.z * 3 + 0.7) * 0.5 +
        Math.sin(_dir.z * 2 + _dir.x * 5) * 0.3;
      const t = THREE.MathUtils.clamp(landNoise * 0.6 + 0.4, 0, 1);
      _color
        .copy(OCEAN_DEEP)
        .lerp(OCEAN_SHALLOW, _dir.y * 0.5 + 0.5)
        .lerp(LAND, t);
    } else {
      const isBead =
        kind === "stalk" && _vertex.distanceTo(BEAD_CENTER) < BEAD_RADIUS;
      _color.copy(isBead ? ENAMEL_BLUE : GOLD);
    }

    colors[i * 3] = _color.r;
    colors[i * 3 + 1] = _color.g;
    colors[i * 3 + 2] = _color.b;
  }

  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
}

// Splits the GLB into the blob (sits at the origin) and the letter ring
// (returned separately so it can orbit on its own).
function createBlobFromModel(scene: THREE.Object3D) {
  const root = scene.clone(true);

  // Size and centre come from the blob parts only, so the letters don't
  // change how big the globe is.
  const box = new THREE.Box3();
  root.children.forEach((child) => {
    if (partKind(child.name) !== "letter") box.expandByObject(child);
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

  // Matte clay for the blue-green palette; soft metal for the gold style.
  const blobMaterial =
    GLOBE_STYLE === "blue-green"
      ? new THREE.MeshStandardMaterial({
          vertexColors: true,
          roughness: 1,
          metalness: 0,
          flatShading: true,
        })
      : new THREE.MeshStandardMaterial({
          vertexColors: true,
          color: "#ffffff",
          metalness: 0.45,
          roughness: 0.35,
          emissive: "#3a2a00",
          emissiveIntensity: 0.6,
        });
  const pearlMaterial = new THREE.MeshStandardMaterial({
    color: "#f7f3e8",
    metalness: 0.1,
    roughness: 0.25,
  });
  // Glossy white plastic for the wordmark. Clearcoat gives the wet highlights.
  // No emissive glow and reduced environment reflection keep it clean white.
  const letterMaterial = new THREE.MeshPhysicalMaterial({
    color: "#ffffff",
    roughness: 0.25,
    metalness: 0,
    clearcoat: 1,
    clearcoatRoughness: 0.05,
    envMapIntensity: 0.5,
  });

  // Collect the letter meshes first, then move them out of the blob, so the
  // traversal isn't changing the tree while it walks it.
  const letterMeshes: THREE.Mesh[] = [];
  root.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (!mesh.isMesh) return;
    const kind = partKind(mesh.name);
    // Geometry is shared with the cached GLTF, so work on a copy.
    mesh.geometry = mesh.geometry.clone();

    if (kind === "letter") {
      mesh.material = letterMaterial;
      letterMeshes.push(mesh);
    } else if (kind === "pearl" && GLOBE_STYLE === "gold") {
      mesh.material = pearlMaterial;
    } else {
      colorBlobGeometry(mesh.geometry, center, kind);
      mesh.material = blobMaterial;
    }
  });

  letterMeshes.forEach((mesh) => {
    root.remove(mesh);
    letters.add(mesh);
  });

  return { blob: root, letters };
}

useGLTF.preload(BLOB_MODEL_URL);

type DragState = { dragging: boolean; deltaX: number; deltaY: number };

// World-space axes for drag rotation. Rotating around fixed world axes (not
// the group's local axes) keeps "drag sideways = yaw, drag up/down = pitch"
// true however the globe is currently tilted, and avoids gimbal lock.
const YAW_AXIS = new THREE.Vector3(0, 1, 0);
const PITCH_AXIS = new THREE.Vector3(1, 0, 0);
const dragQuat = new THREE.Quaternion();

// Orbit speed of the letter ring around the globe's vertical axis, in rad/s.
const TEXT_ORBIT_SPEED = 0.08;

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
      // About one radian per ~320px of mouse travel, on both axes.
      dragQuat.setFromAxisAngle(YAW_AXIS, drag.deltaX * 0.0032);
      group.quaternion.premultiply(dragQuat);
      dragQuat.setFromAxisAngle(PITCH_AXIS, drag.deltaY * 0.0032);
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

    const opacity = 1 - THREE.MathUtils.clamp(progressRef.current, 0, 1);
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

// Gives the scene a soft studio environment to reflect. Glossy materials
// (the letters' clearcoat) look flat without one. Built offline from
// RoomEnvironment, so nothing is fetched from a CDN.
function SceneEnvironment() {
  const { gl, scene } = useThree();

  React.useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    pmrem.dispose();
    return () => {
      scene.environment = null;
      env.dispose();
    };
  }, [gl, scene]);

  return null;
}

const SKY_DARK = new THREE.Color("#04050c");
const SKY_WHITE = new THREE.Color("#ffffff");

// Fades the scene background from night-sky navy to white as scroll
// progresses from 0 to 1.
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

// Outline of an eight-point compass sparkle, like the reference: long thin
// spikes on the main axes, shorter ones on the diagonals, and concave sides
// between them. `pinch` controls how deep the sides curve in.
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

// Thin-outline sparkles scattered behind the globe. They twinkle, drift
// slowly, and fade out with the sky as scroll progresses.
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
        color: "#ffffff",
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
        size: 0.35 + Math.random() * 0.9,
        phase: Math.random() * Math.PI * 2,
        speed: 0.6 + Math.random() * 0.8,
      })),
    []
  );

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.02;
    }
    material.opacity = 1 - THREE.MathUtils.clamp(progressRef.current, 0, 1);

    const t = state.clock.elapsedTime;
    sparkles.forEach((s, i) => {
      const line = lineRefs.current[i];
      if (!line) return;
      const pulse = 0.75 + 0.25 * Math.sin(t * s.speed + s.phase);
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
        // while horizontal swipes still drive the globe. Mouse dragging on
        // desktop is unaffected.
        touchAction: "pan-y",
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerLeave={endDrag}
      onPointerCancel={endDrag}
    >
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
        <SceneBackground progress={scrollProgress} />
        <SceneEnvironment />
        <Starfield progress={scrollProgress} />
        <ambientLight intensity={0.9} />
        <directionalLight position={[0, 2, 8]} intensity={0.9} />
        <directionalLight position={[0, -2, -6]} intensity={0.25} />
        <DriftingGlobe scrollProgress={scrollProgress} dragRef={dragRef} />
      </Canvas>
    </div>
  );
}

import * as React from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Text3D, Center, Float } from "@react-three/drei";
import * as THREE from "three";

function hashNoise(x: number, y: number, z: number) {
  const s = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 43758.5453;
  return s - Math.floor(s);
}

function createBlobGeometry() {
  const geometry = new THREE.IcosahedronGeometry(1.4, 12);
  const position = geometry.attributes.position;
  const vertex = new THREE.Vector3();
  const colors: number[] = [];

  const oceanDeep = new THREE.Color("#214a9c").convertSRGBToLinear();
  const oceanShallow = new THREE.Color("#0a9ac5").convertSRGBToLinear();
  const land = new THREE.Color("#87c661").convertSRGBToLinear();

  for (let i = 0; i < position.count; i++) {
    vertex.fromBufferAttribute(position, i);
    const dir = vertex.clone().normalize();

    const bigLumps =
      Math.sin(dir.x * 3 + dir.y * 2) * 0.07 +
      Math.sin(dir.y * 2.5 + dir.z * 3) * 0.06 +
      Math.sin(dir.z * 3.5 + dir.x * 2.5) * 0.05;

    const smallBumps =
      (hashNoise(
        Math.round(dir.x * 6),
        Math.round(dir.y * 6),
        Math.round(dir.z * 6)
      ) -
        0.5) *
      0.06;

    const noise = bigLumps + smallBumps;

    vertex.multiplyScalar(1 + noise);
    position.setXYZ(i, vertex.x, vertex.y, vertex.z);

    const landNoise =
      Math.sin(dir.x * 3 + dir.y * 2.5 + 1.5) * 0.5 +
      Math.sin(dir.y * 4 - dir.z * 3 + 0.7) * 0.5 +
      Math.sin(dir.z * 2 + dir.x * 5) * 0.3;

    const t = THREE.MathUtils.clamp(landNoise * 0.6 + 0.4, 0, 1);
    const ocean = oceanDeep.clone().lerp(oceanShallow, dir.y * 0.5 + 0.5);
    const color = ocean.lerp(land, t);
    colors.push(color.r, color.g, color.b);
  }

  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geometry.computeVertexNormals();
  return geometry;
}

function ClayGlobe() {
  const geometry = React.useMemo(() => createBlobGeometry(), []);

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial
        vertexColors
        roughness={1}
        metalness={0}
        flatShading
      />
    </mesh>
  );
}

const GLOBE_WORDS = ["STUCK", "IN", "STUCKHOLM"];

function buildLayout(words: string[]) {
  const letterUnit = 0.85;
  const wordGap = 2.2;

  let totalUnits = 0;
  words.forEach((word) => {
    totalUnits += word.length * letterUnit + wordGap;
  });

  const angleStep = (Math.PI * 2) / totalUnits;

  const items: { char: string; angle: number }[] = [];
  let cursor = 0;
  words.forEach((word) => {
    for (const char of word) {
      items.push({ char, angle: cursor * angleStep });
      cursor += letterUnit;
    }
    cursor += wordGap;
  });

  return items;
}

function GlobeText() {
  const items = React.useMemo(() => buildLayout(GLOBE_WORDS), []);
  const radius = 1.68;

  return (
    <group>
      {items.map(({ char, angle }, i) => {
        const x = Math.sin(angle) * radius;
        const z = Math.cos(angle) * radius;

        return (
          <group key={i} position={[x, 0, z]} rotation={[0, angle, 0]}>
            <Center>
              <Text3D
                font="/fonts/Skarp-Italic.typeface.json"
                size={0.32}
                height={0.09}
                curveSegments={8}
                bevelEnabled
                bevelThickness={0.013}
                bevelSize={0.013}
              >
                {char}
                <meshStandardMaterial color="#d51f26" roughness={0.4} />
              </Text3D>
            </Center>
          </group>
        );
      })}
    </group>
  );
}

// Drag state shared between the plain-HTML pointer handlers (in
// StuckholmGlobe below, outside the R3F tree) and the per-frame rotation
// logic here — a ref so dragging never triggers a React re-render.
type DragState = { dragging: boolean; deltaX: number };

// Wraps the globe + its orbiting wordmark in one animated group: a gentle
// idle spin at rest that picks up a little pace as you scroll (no more
// shrinking/flying off into the distance — the globe stays put, only the
// sky around it changes, see SceneBackground/Starfield below). Grabbing it
// with the mouse overrides the auto-spin and rotates it directly.
function DriftingGlobe({
  scrollProgress,
  dragRef,
}: {
  scrollProgress: number;
  dragRef: React.MutableRefObject<DragState>;
}) {
  const groupRef = React.useRef<THREE.Group>(null);
  const progressRef = React.useRef(0);

  React.useEffect(() => {
    progressRef.current = scrollProgress;
  }, [scrollProgress]);

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;

    const drag = dragRef.current;
    if (drag.dragging) {
      // Direct manipulation: one radian of spin per ~320px of mouse travel.
      group.rotation.y += drag.deltaX * 0.0032;
      drag.deltaX = 0;
    } else {
      const p = progressRef.current;
      const spinSpeed = 0.18 + p * 0.5;
      group.rotation.y += delta * spinSpeed;
    }
  });

  return (
    <group ref={groupRef}>
      <Float speed={1.5} rotationIntensity={0.15} floatIntensity={0.4}>
        <ClayGlobe />
        <GlobeText />
      </Float>
    </group>
  );
}

const SKY_DARK = new THREE.Color("#04050c");
const SKY_WHITE = new THREE.Color("#ffffff");

// Animates the scene's clear colour from the night-sky navy to white as
// `progress` goes 0 -> 1, instead of the globe flying away into it.
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

// A simple hand-rolled starfield (instead of drei's <Stars>) so we can fade
// its opacity to nothing as the sky goes white, rather than leaving grey
// specks floating over a white background.
function Starfield({ progress }: { progress: number }) {
  const pointsRef = React.useRef<THREE.Points>(null);
  const materialRef = React.useRef<THREE.PointsMaterial>(null);
  const progressRef = React.useRef(progress);

  React.useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  const geometry = React.useMemo(() => {
    const count = 2400;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 40 + Math.random() * 50;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, []);

  useFrame((_, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.02;
    }
    if (materialRef.current) {
      materialRef.current.opacity =
        1 - THREE.MathUtils.clamp(progressRef.current, 0, 1);
    }
  });

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        ref={materialRef}
        color="#ffffff"
        size={0.6}
        sizeAttenuation
        transparent
        opacity={1}
        depthWrite={false}
      />
    </points>
  );
}

export function StuckholmGlobe({
  scrollProgress = 0,
}: {
  scrollProgress?: number;
}) {
  const dragRef = React.useRef<DragState>({ dragging: false, deltaX: 0 });
  const [isDragging, setIsDragging] = React.useState(false);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    dragRef.current.dragging = true;
    dragRef.current.deltaX = 0;
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.dragging) return;
    dragRef.current.deltaX += e.movementX;
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
      style={{ cursor: isDragging ? "grabbing" : "grab", touchAction: "none" }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerLeave={endDrag}
      onPointerCancel={endDrag}
    >
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <SceneBackground progress={scrollProgress} />
        <Starfield progress={scrollProgress} />
        <ambientLight intensity={0.9} />
        <directionalLight position={[0, 2, 8]} intensity={0.9} />
        <directionalLight position={[0, -2, -6]} intensity={0.25} />
        <DriftingGlobe scrollProgress={scrollProgress} dragRef={dragRef} />
      </Canvas>
    </div>
  );
}

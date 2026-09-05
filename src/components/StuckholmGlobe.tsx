import * as React from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Text3D, Center, Float, OrbitControls, Stars } from "@react-three/drei";
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

// Wraps the globe + its orbiting wordmark in one animated group: a gentle
// idle spin at rest, ramping into a fast spin-away that shrinks and pushes
// the whole thing back into the starfield as `scrollProgress` goes 0 -> 1.
function DriftingGlobe({ scrollProgress }: { scrollProgress: number }) {
  const groupRef = React.useRef<THREE.Group>(null);
  const progressRef = React.useRef(0);

  React.useEffect(() => {
    progressRef.current = scrollProgress;
  }, [scrollProgress]);

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;

    const p = progressRef.current;

    // idle spin at p = 0, ramping sharply into a fast spin-away
    const spinSpeed = 0.18 + p * p * 5.5;
    group.rotation.y += delta * spinSpeed;

    const targetScale = THREE.MathUtils.lerp(1, 0.06, p);
    const targetZ = THREE.MathUtils.lerp(0, -22, p);
    const targetY = THREE.MathUtils.lerp(0, 3.2, p);

    const dampLambda = 4;
    const nextScale = THREE.MathUtils.damp(group.scale.x, targetScale, dampLambda, delta);
    group.scale.setScalar(nextScale);
    group.position.z = THREE.MathUtils.damp(group.position.z, targetZ, dampLambda, delta);
    group.position.y = THREE.MathUtils.damp(group.position.y, targetY, dampLambda, delta);
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

export function StuckholmGlobe({
  scrollProgress = 0,
}: {
  scrollProgress?: number;
}) {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <color attach="background" args={["#04050c"]} />
        <Stars
          radius={90}
          depth={55}
          count={3200}
          factor={3.2}
          saturation={0}
          fade
          speed={0.6}
        />
        <ambientLight intensity={0.9} />
        <directionalLight position={[0, 2, 8]} intensity={0.9} />
        <directionalLight position={[0, -2, -6]} intensity={0.25} />
        <DriftingGlobe scrollProgress={scrollProgress} />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          enableDamping
          dampingFactor={0.08}
        />
      </Canvas>
    </div>
  );
}

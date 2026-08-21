import * as React from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Text3D, Center } from "@react-three/drei";
import { Link, useLocation } from "react-router-dom";
import * as THREE from "three";

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

function createMiniGeometry() {
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

    const noise =
      Math.sin(dir.x * 3 + dir.y * 2) * 0.07 +
      Math.sin(dir.y * 2.5 + dir.z * 3) * 0.06 +
      Math.sin(dir.z * 3.5 + dir.x * 2.5) * 0.05;

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

function RotatingGlobe() {
  const groupRef = React.useRef<THREE.Group>(null);
  const geometry = React.useMemo(() => createMiniGeometry(), []);
  const items = React.useMemo(() => buildLayout(GLOBE_WORDS), []);
  const radius = 1.5;

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.5;
  });

  return (
    <group ref={groupRef}>
      <mesh geometry={geometry}>
        <meshStandardMaterial vertexColors roughness={1} metalness={0} flatShading />
      </mesh>
      {items.map(({ char, angle }, i) => {
        const x = Math.sin(angle) * radius;
        const z = Math.cos(angle) * radius;

        return (
          <group key={i} position={[x, 0, z]} rotation={[0, angle, 0]}>
            <Center>
              <Text3D
                font="/fonts/Skarp-Italic.typeface.json"
                size={0.22}
                height={0.05}
                curveSegments={4}
                bevelEnabled
                bevelThickness={0.008}
                bevelSize={0.008}
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

export function MiniGlobe() {
  const { pathname } = useLocation();
  if (pathname === "/") return null;

  return (
    <Link
      to="/"
      className="absolute top-4 right-4 z-20 w-12 h-12 rounded-full overflow-hidden cursor-pointer hover:scale-110 transition-transform"
      title="Till startsidan"
    >
      <Canvas camera={{ position: [0, 0, 4.6], fov: 45 }} style={{ background: "transparent" }}>
        <color attach="background" args={["#ffffff"]} />
        <ambientLight intensity={1} />
        <directionalLight position={[0, 2, 8]} intensity={0.9} />
        <directionalLight position={[0, -2, -6]} intensity={0.25} />
        <RotatingGlobe />
      </Canvas>
    </Link>
  );
}

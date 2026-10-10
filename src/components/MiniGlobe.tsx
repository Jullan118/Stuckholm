import * as React from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, Bounds } from "@react-three/drei";
import { Link, useLocation } from "react-router-dom";
import type { Group } from "three";

const BLOB_MODEL_URL = "/models/globee.glb";

function SpinningBlob() {
  const gltf = useGLTF(BLOB_MODEL_URL);
  const groupRef = React.useRef<Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.5;
  });

  return (
    <group ref={groupRef}>
      <primitive object={gltf.scene} />
    </group>
  );
}

export function MiniGlobe() {
  const { pathname } = useLocation();
  if (pathname === "/") return null;

  return (
    <Link
      to="/"
      className="absolute top-3 left-3 z-20 w-16 h-16 rounded-full overflow-hidden cursor-pointer hover:scale-110 transition-transform"
      title="Till startsidan"
    >
      <Canvas camera={{ position: [0, 0, 6], fov: 40 }} style={{ background: "transparent" }}>
        <ambientLight intensity={1} />
        <directionalLight position={[0, 2, 8]} intensity={0.9} />
        <React.Suspense fallback={null}>
          <Bounds fit clip observe margin={1.1}>
            <SpinningBlob />
          </Bounds>
        </React.Suspense>
      </Canvas>
    </Link>
  );
}

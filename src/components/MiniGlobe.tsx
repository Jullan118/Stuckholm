import * as React from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, Bounds } from "@react-three/drei";
import { Link, useLocation } from "react-router-dom";
import { BLOB_MODEL_URL, createBlobFromModel } from "@/components/StuckholmGlobe";

// Same model as the home globe, drawn as a near-black wireframe: the blob shows
// only its triangle edges, and the letter ring is a dark outline. It turns the
// same way as the home globe (negative Y).
const INK = "#3a3e44";

function SpinningBlob() {
  const gltf = useGLTF(BLOB_MODEL_URL);
  const groupRef = React.useRef<THREE.Group>(null);
  const { blob, letters } = React.useMemo(() => {
    const parts = createBlobFromModel(gltf.scene, INK);
    parts.blob.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.material = new THREE.MeshBasicMaterial({ color: INK, wireframe: true });
      }
    });
    parts.letters.traverse((o) => {
      const line = o as THREE.LineSegments;
      if (line.isLineSegments) (line.material as THREE.LineBasicMaterial).color.set(INK);
    });
    return parts;
  }, [gltf.scene]);

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotateY(-delta * 0.3);
  });

  return (
    <group ref={groupRef}>
      <primitive object={blob} />
      <primitive object={letters} />
    </group>
  );
}

export function MiniGlobe() {
  const { pathname } = useLocation();
  if (pathname === "/") return null;

  return (
    <Link
      to="/"
      className="fixed top-1 left-4 sm:left-8 z-20 w-16 h-16 rounded-full overflow-hidden cursor-pointer hover:scale-110 transition-transform"
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

import * as React from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, Bounds } from "@react-three/drei";
import { Link, useLocation } from "react-router-dom";

const BLOB_MODEL_URL = "/models/globee.glb";

function SpinningBlob() {
  const gltf = useGLTF(BLOB_MODEL_URL);
  const groupRef = React.useRef<THREE.Group>(null);

  // Copy the model and give every mesh the same dark, matte grey material,
  // so the globe looks the same regardless of the colours in the .glb file.
  const scene = React.useMemo(() => {
    const copy = gltf.scene.clone(true);
    copy.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.material = new THREE.MeshStandardMaterial({
          color: "#6b6b6b",
          roughness: 1,
          metalness: 0,
        });
      }
    });
    return copy;
  }, [gltf.scene]);

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.5;
  });

  return (
    <group ref={groupRef}>
      <primitive object={scene} />
    </group>
  );
}

export function MiniGlobe() {
  const { pathname } = useLocation();
  if (pathname === "/") return null;

  return (
    <Link
      to="/"
    className="fixed top-4 left-4 sm:left-8 z-20 w-16 h-16 rounded-full overflow-hidden cursor-pointer hover:scale-110 transition-transform"      title="Till startsidan"
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

import * as React from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, Bounds } from "@react-three/drei";
import { Link, useLocation } from "react-router-dom";
import { BLOB_MODEL_URL, createBlobFromModel } from "@/components/StuckholmGlobe";

// Same model as the home globe: a light grey body like the big globe, with the
// dark line-art of the edges and the letters over it. It turns the
// same way as the home globe (negative Y).
const FILL = "#e4e7ea";
const INK = "#383e42";

function SpinningBlob() {
  const gltf = useGLTF(BLOB_MODEL_URL);
  const groupRef = React.useRef<THREE.Group>(null);
  const { blob, letters } = React.useMemo(() => {
    const parts = createBlobFromModel(gltf.scene, FILL);
    // Collect the parts first: adding children while traversing would make the
    // traversal walk into the new wireframe meshes forever.
    const blobMeshes: THREE.Mesh[] = [];
    parts.blob.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) blobMeshes.push(o as THREE.Mesh);
    });
    blobMeshes.forEach((mesh) => {
      mesh.material = new THREE.MeshBasicMaterial({ color: FILL });
      // Edge lines only at the sharp creases, like the home globe's line-art.
      // A full wireframe is too dense at this size and reads as near-black.
      const edges = new THREE.LineSegments(
        new THREE.EdgesGeometry(mesh.geometry, 20),
        new THREE.LineBasicMaterial({ color: INK })
      );
      edges.scale.setScalar(1.002);
      mesh.add(edges);
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

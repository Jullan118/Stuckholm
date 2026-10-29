import * as React from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { glitch } from "../lib/glitchClock";

// The apple model (Rhino export, millimetres, simplified to about 56k triangles).
// It takes the globe's place during the "apple" phase of the glitch.
export const APPLE_MODEL_URL = "/models/apple.glb";

// The globe's blob has radius 3.2 and sits in a group scaled by 1.08.
// The apple is placed in the same group, so it gets the same size.
const APPLE_RADIUS = 1.6; // about half the globe: change here to resize

export function GlitchApple() {
  const gltf = useGLTF(APPLE_MODEL_URL);
  const apple = React.useMemo(() => {
    const scene = gltf.scene.clone(true);
    // Centre the model at the origin and scale its largest side to the diameter.
    const box = new THREE.Box3().setFromObject(scene);
    const centre = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const k = (APPLE_RADIUS * 2) / maxDim;
    scene.position.sub(centre);
    const wrapper = new THREE.Group();
    wrapper.add(scene);
    wrapper.scale.setScalar(k);
    return wrapper;
  }, [gltf.scene]);

  const ref = React.useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const g = ref.current;
    if (!g) return;
    g.visible = glitch.phase === "apple";
    // A slight sway, so the cut face stays towards the camera.
    g.rotation.y = Math.sin(clock.elapsedTime * 2.2) * 0.35;
    g.rotation.x = Math.sin(clock.elapsedTime * 1.3) * 0.05;
  });

  return (
    <group ref={ref}>
      <primitive object={apple} />
    </group>
  );
}

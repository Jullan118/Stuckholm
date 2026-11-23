import * as React from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, useGLTF } from "@react-three/drei";
import GravityGrid, { type Well } from "./GravityGrid";
import * as THREE from "three";

// The blob is a Rhino/Grasshopper export (blobben.glb). It is re-centred and
// re-scaled in code, so the file's own units don't matter.
export const BLOB_MODEL_URL: string =
  (import.meta.env.VITE_BLOB_MODEL_URL as string | undefined) || "/models/globe_2610_v5.glb";
const BLOB_RADIUS = 3.2; // 20 % mindre än 4.0
// Scales the letter ring around the globe. 1 = as placed in blobben.glb.
const LETTER_SCALE = 1;

// Fragmentation: gap between parts, and how broken the band looks.
const PART_GAP = 0; // fraction of the globe's half-size
const BAND_HEIGHT = 0.25; // parts this close to the equator count as band
const BAND_EVERY = 2; // every third band part is broken
const BAND_BREAK = 0; // how far a broken band part is shifted sideways
const BAND_TWIST = 0; // radians a broken band part is turned

// Line-drawing look: white fill, anthracite grey (RAL 7016) for all details.
const INK = "#383e42";
const PAPER = "#ffffff";
// How opaque the globe is at the top of the page (1 = solid).
const GLOBE_START_OPACITY = 0.9; // 10 % transparent
// One number for the size of the globe AND the grid, so they change together.
// 1 = the size before the last +10 % step.
// Extra size for the globe and its letter ring only (2.86875 = 1.5x the previous 1.9125).
const GLOBE_SIZE = 2.86875;
// The dip under the globe: wider (2.25x the previous width) and shallower (1.6x the previous depth).
const DIP_SCALE = 2.25;
const DIP_DEPTH_SCALE = 1.6;
const SCENE_SIZE = 3.564; // 2x the previous 1.782, globe, grid and well all scale with it
// Open ring between the grid and the globe, in world units.
const GLOBE_WORLD_RADIUS = 3.2 * 1.08 * 2.17 * SCENE_SIZE; // blob radius after the group scales
const WELL_CENTER: [number, number] = [0, 3.8 * SCENE_SIZE]; // under the globe, in grid space
const GRID_GAP = -1; // negative: the grid stops just inside the globe's edge

// The grid sits here. The globe's dip is the main well; the sun and Earth each
// have their own smaller well, far back in the same net.
const GRID_POS: [number, number, number] = [0, 1.27 * SCENE_SIZE, -1.9 * SCENE_SIZE];
const MAIN_WELL: Well = {
  center: WELL_CENTER,
  depth: 10.12 * SCENE_SIZE * DIP_DEPTH_SCALE,
  falloff: 11.4 * SCENE_SIZE * DIP_SCALE,
};
// Camera: low and level, with the horizon visible behind the globe (the version the user preferred).
const CAM_X = 0;
const CAM_Y = 26.4; // 10 % higher than before (24 -> 26.4)
const CAM_Z = 189; // 10 % further back than before (172 -> 189)
const CAM_TARGET: [number, number, number] = [0, -0.6, 0];
// Light grey for the globe body.
const GLOBE_GREY = "#e4e7ea";
const CRACK_GREY = "#9aa1a6"; // lighter grey for cracks and scratches

// Night-sky navy at the top of the page, fading to white as you scroll.
const SKY_DARK = new THREE.Color("#000000"); // helsvart
const SKY_WHITE = new THREE.Color("#ffffff");
// Stars are white so they stay visible on the dark background.
const STAR = "#ffffff";


useGLTF.preload(BLOB_MODEL_URL);

// The 16 "Raven" meshes are the letters; everything else is the blob.
// three.js turns spaces into underscores, so match on the prefix.
function isLetter(name: string) {
  // three.js replaces spaces with underscores in node names.
  const clean = name.replace(/ /g, "_");
  return clean.startsWith("Raven") || clean.startsWith("SVG_bandtext") || clean.startsWith("Skissbokstav") || clean.startsWith("Stuck_in") || clean.startsWith("Handskiss_versal");
}

// Splits the GLB into the blob (sits at the origin) and the letter ring
// (returned separately so it can orbit on its own).
export function createBlobFromModel(scene: THREE.Object3D, fillColor: string = GLOBE_GREY) {
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


  const letterMeshes: THREE.Mesh[] = [];
  const blobMeshes: THREE.Mesh[] = [];
  root.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (!mesh.isMesh) return;
    // Geometry is shared with the cached GLTF, so work on a copy.
    // Materials are left exactly as they are in the GLB file.
    mesh.geometry = mesh.geometry.clone();
    if (isLetter(mesh.name)) {
      letterMeshes.push(mesh);
    } else {
      blobMeshes.push(mesh);
    }
  });

  // Letters are outlines: no solid fill, only a white edge line.
  letterMeshes.forEach((mesh) => {
    const edges = new THREE.EdgesGeometry(mesh.geometry, 20);
    const line = new THREE.LineSegments(
      edges,
      new THREE.LineBasicMaterial({ color: PAPER })
    );
    mesh.add(line);
    mesh.material = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
  });

  // Move the letters out of the blob after the walk, so the tree isn't
  // changing while it is being traversed.
  letterMeshes.forEach((mesh) => {
    root.remove(mesh);
    letters.add(mesh);
  });

  // Fragmentation: every blob part is pushed a little away from the globe's
  // centre, which opens the seams between parts into gaps. Parts near the
  // band (the equator) are also shifted sideways and turned, so the band
  // looks broken. Values are fractions of the globe's half-size.
  const halfSize = halfDiagonal;
  blobMeshes.forEach((mesh, index) => {
    mesh.geometry.computeBoundingBox();
    const local = mesh.geometry.boundingBox!.getCenter(new THREE.Vector3());
    mesh.updateMatrix();
    const inRoot = local.applyMatrix4(mesh.matrix);
    const dir = inRoot.clone().sub(center);
    if (dir.lengthSq() === 0) return;
    dir.normalize();
    mesh.position.addScaledVector(dir, halfSize * PART_GAP);

    const nearBand = Math.abs(inRoot.y - center.y) < halfSize * BAND_HEIGHT;
    if (nearBand && index % BAND_EVERY === 0) {
      const tangent = new THREE.Vector3(-dir.z, 0, dir.x).normalize();
      mesh.position.addScaledVector(tangent, halfSize * BAND_BREAK);
      mesh.rotation.y += BAND_TWIST;
    }
    mesh.updateMatrix();
  });


  // Globe and band: solid grey, 95 % opaque (5 % see-through). Each mesh gets
  // its own material copy so the cached GLB materials are not changed.
  blobMeshes.forEach((mesh) => {
    const original = mesh.material as THREE.MeshStandardMaterial;
    const mat = original.clone();
    // Cracks and scratches come in as the near-black material. Keep them as
    // their own, lighter grey so they still show against the globe.
    const isCrack = original.color.r < 0.3 && original.color.g < 0.3 && original.color.b < 0.3;
    mat.color = new THREE.Color(isCrack ? CRACK_GREY : GLOBE_GREY);
    mat.userData.baseColor = mat.color.clone();
    mat.transparent = true;
    mat.opacity = GLOBE_START_OPACITY;
    mat.depthWrite = true;
    mesh.material = mat;
  });

  return { blob: root, letters };
}

type DragState = { dragging: boolean; deltaX: number; deltaY: number };

// Shared between the 3D scene and the custom cursor drawn on top of it.
// The scene writes where the globe is on screen and whether the mouse is over
// it; the cursor reads that every frame.
type InteractState = {
  // Mouse position in the canvas, -1..1 (null when the mouse is outside).
  pointer: THREE.Vector2 | null;
  // Globe centre and radius on screen, in pixels from the canvas top left.
  globeX: number;
  globeY: number;
  globeR: number;
  // True while the mouse is over the globe (and the globe is still visible).
  hovering: boolean;
  // False once the globe has faded out on scroll.
  active: boolean;
};

// How much of the globe's outline counts as "over the globe" (1 = its full
// bounding circle; a bit less, since the blob is not perfectly round).
const HOVER_RADIUS = 0.85;

// Sideways drag spins the globe around its vertical axis (no limit). Vertical
// drag tilts it, but never past this angle, so it can't end up upside down.
const PITCH_LIMIT = 0.9; // radians, about 50 degrees
// Resting tilt: the globe's top leans slightly away from the viewer (about 17
// degrees), so the letter ring sits a bit above the centre, as in the 22 Oct reference.
const GLOBE_BASE_PITCH = -0.4; // radians; negative = top leans back
const DRAG_SPEED = 0.0032; // radians per pixel of mouse travel

// The globe and its letter ring share one drag group, so the ring turns with
// the globe. Its own orbit spin is layered on top.
//
// At rest the globe slowly spins; the spin picks up pace as you scroll. Drag
// with the mouse to rotate it freely. As scroll progresses, everything fades
// out in place (opacity -> 0) rather than flying away.
function DriftingGlobe({
  scrollProgress,
  dragRef,
  interactRef,
}: {
  scrollProgress: number;
  dragRef: React.MutableRefObject<DragState>;
  interactRef: React.MutableRefObject<InteractState>;
}) {
  const groupRef = React.useRef<THREE.Group>(null);
  const ringRef = React.useRef<THREE.Group>(null);
  const progressRef = React.useRef(0);
  const yawRef = React.useRef(0);
  const pitchRef = React.useRef(0);
  const gltf = useGLTF(BLOB_MODEL_URL);
  const { blob, letters } = React.useMemo(
    () => createBlobFromModel(gltf.scene),
    [gltf.scene]
  );

  React.useEffect(() => {
    progressRef.current = scrollProgress;
  }, [scrollProgress]);

  // Every material on the globe body, collected once so the glitch can recolour them.
  const bodyMaterials = React.useMemo(() => {
    const list: THREE.MeshStandardMaterial[] = [];
    blob.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (mesh.isMesh) list.push(mesh.material as THREE.MeshStandardMaterial);
    });
    return list;
  }, [blob]);

  // The globe's bounding sphere in its own space, measured once. Used for the
  // hover check (a circle on screen is cheap and forgiving, unlike testing
  // every triangle of the model).
  const localSphere = React.useMemo(() => {
    // Measured in world space, then moved back into the blob's own space so
    // its own scale isn't counted twice later.
    blob.updateMatrixWorld(true);
    const sphere = new THREE.Sphere();
    new THREE.Box3().setFromObject(blob).getBoundingSphere(sphere);
    return sphere.applyMatrix4(blob.matrixWorld.clone().invert());
  }, [blob]);
  const tmp = React.useMemo(
    () => ({ centre: new THREE.Vector3(), edge: new THREE.Vector3(), scale: new THREE.Vector3(), right: new THREE.Vector3() }),
    []
  );

  useFrame((state, delta) => {
    const group = groupRef.current;
    if (!group) return;

    // Fade the globe out as the page scrolls down to the white part, so it
    // is gone by the time the background is white.
    const fade = 1 - THREE.MathUtils.smoothstep(progressRef.current, 0.2, 0.9);
    bodyMaterials.forEach((mat) => {
      mat.opacity = GLOBE_START_OPACITY * fade;
    });

    const drag = dragRef.current;
    if (drag.dragging) {
      yawRef.current += drag.deltaX * DRAG_SPEED;
      pitchRef.current = THREE.MathUtils.clamp(
        pitchRef.current + drag.deltaY * DRAG_SPEED,
        -PITCH_LIMIT,
        PITCH_LIMIT
      );
      drag.deltaX = 0;
      drag.deltaY = 0;
    } else {
      // Idle spin around the globe's own (possibly tilted) vertical axis.
      const spinSpeed = 0.07 + progressRef.current * 0.18;
      yawRef.current -= delta * spinSpeed;
    }
    // The letter ring has no spin of its own: it turns with the globe, in the
    // same direction (medsols, seen from above) and at the same speed.
    // Spin around the globe's own axis (its Y, which runs bottom to cross). Order XYZ
    // keeps that axis tilted but fixed while it turns, so the globe never wobbles.
    group.rotation.set(GLOBE_BASE_PITCH + pitchRef.current, yawRef.current, 0, "XYZ");

    // The letter ring has no spin of its own: it turns with the globe, in the
    // same direction and speed, and follows drag too.

    // Where the globe is on screen, and whether the mouse is over it.
    const it = interactRef.current;
    const { camera, size } = state;
    blob.updateWorldMatrix(true, false);
    tmp.centre.copy(localSphere.center).applyMatrix4(blob.matrixWorld);
    blob.getWorldScale(tmp.scale);
    const worldR = localSphere.radius * tmp.scale.x;
    tmp.right.setFromMatrixColumn(camera.matrixWorld, 0);
    tmp.edge.copy(tmp.centre).addScaledVector(tmp.right, worldR).project(camera);
    tmp.centre.project(camera);
    it.globeX = ((tmp.centre.x + 1) / 2) * size.width;
    it.globeY = ((1 - tmp.centre.y) / 2) * size.height;
    const edgeX = ((tmp.edge.x + 1) / 2) * size.width;
    it.globeR = Math.abs(edgeX - it.globeX);
    it.active = fade > 0.4;
    if (it.pointer && it.active) {
      const px = ((it.pointer.x + 1) / 2) * size.width;
      const py = ((1 - it.pointer.y) / 2) * size.height;
      it.hovering = Math.hypot(px - it.globeX, py - it.globeY) < it.globeR * HOVER_RADIUS;
    } else {
      it.hovering = false;
    }
  });

  // rotationIntensity 0 stops Float's small wobble, which tilted the globe
  // around the z axis. Float still bobs the whole thing up and down.
  return (
    // Outer group: the lean (30 degrees to the right) and 10 % larger size.
    // The inner group keeps the drag and spin.
    <group position={[6.5, 14, 3.8]} rotation={[0, 0, -Math.PI / 6]} scale={2.17 * SCENE_SIZE * GLOBE_SIZE}>
      <group ref={groupRef} scale={1.08}>
        <Float speed={1.5} rotationIntensity={0} floatIntensity={0.4}>
          <primitive object={blob} />
          <group ref={ringRef}>
            <primitive object={letters} />
          </group>
        </Float>
      </group>
    </group>
  );
}

// Outline of an eight-point compass sparkle: long spikes on the main axes,
// shorter ones on the diagonals, and concave sides between them.
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

// How many stars there are in the sky. About 1 in 10 is a small dot instead
// of an outlined sparkle.
const SPARKLE_COUNT = 350;
const DOT_COUNT = Math.round(SPARKLE_COUNT * 0.1);
const OUTLINE_COUNT = SPARKLE_COUNT - DOT_COUNT;

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

type StarLayer = {
  geometry: THREE.BufferGeometry;
  colors: THREE.BufferAttribute;
  base: Float32Array;
  phases: Float32Array;
  speeds: Float32Array;
};

function makeStarLayer(count: number, bright: boolean): StarLayer {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const base = new Float32Array(count);
  const phases = new Float32Array(count);
  const speeds = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    // Depth: most stars are far away, a few are closer.
    const depth = 18 + Math.pow(Math.random(), 1.6) * 140;
    positions[i * 3] = (Math.random() * 2 - 1) * depth * 1.1;
    positions[i * 3 + 1] = (Math.random() * 2 - 1) * depth * 0.64;
    positions[i * 3 + 2] = -depth;
    base[i] = bright
      ? 0.8 + Math.random() * 0.2
      : 0.25 + Math.pow(Math.random(), 2) * 0.45;
    phases[i] = Math.random() * Math.PI * 2;
    speeds[i] = 0.6 + Math.random() * 1.2;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const colorAttr = new THREE.BufferAttribute(colors, 3);
  geometry.setAttribute("color", colorAttr);
  return { geometry, colors: colorAttr, base, phases, speeds };
}

function twinkle(layer: StarLayer, t: number) {
  const arr = layer.colors.array as Float32Array;
  for (let i = 0; i < layer.base.length; i++) {
    // Stays between 70% and 100% of its brightness.
    const v =
      layer.base[i] * (0.85 + 0.15 * Math.sin(t * layer.speeds[i] + layer.phases[i]));
    arr[i * 3] = v;
    arr[i * 3 + 1] = v;
    arr[i * 3 + 2] = v;
  }
  layer.colors.needsUpdate = true;
}


// Thin-outline sparkles spread through depth, like a night sky. Far stars are
// scaled up so they stay visible, and every star keeps a minimum brightness.
// They twinkle, drift slowly, and fade out only as scroll progresses.
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

  const stars = React.useMemo(
    () =>
      Array.from({ length: OUTLINE_COUNT }, () => {
        // Depth: most stars are far away, a few are closer.
        const depth = 18 + Math.pow(Math.random(), 1.6) * 140;
        // Brightness: most stars are fairly bright, a few shine the brightest.
        const brightness = 0.45 + Math.pow(Math.random(), 2) * 0.55;
        return {
          x: (Math.random() * 2 - 1) * depth * 1.1,
          y: (Math.random() * 2 - 1) * depth * 0.64,
          z: -depth,
          // Size grows with distance, so far stars are still big enough to see.
          size: (0.12 + Math.random() * 0.1) * (depth / 25),
          brightness,
          phase: Math.random() * Math.PI * 2,
          speed: 0.6 + Math.random() * 1.2,
        };
      }),
    []
  );

  // One material per star, so each star can have its own brightness.
  const materials = React.useMemo(
    () =>
      stars.map(
        (s) =>
          new THREE.LineBasicMaterial({
            color: STAR,
            transparent: true,
            depthWrite: false,
            opacity: s.brightness,
          })
      ),
    [stars]
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const fade = 1 - THREE.MathUtils.clamp(progressRef.current, 0, 1);

    if (groupRef.current) {
      // Sway back and forth instead of spinning forever.
      groupRef.current.rotation.y = Math.sin(t * 0.05) * 0.06;
    }

    dotMaterial.opacity = fade;
    twinkle(dots, t);

    stars.forEach((s, i) => {
      // Gentle twinkle: stays between 70% and 100% of its brightness.
      const twinkle = 0.85 + 0.15 * Math.sin(t * s.speed + s.phase);
      materials[i].opacity = s.brightness * twinkle * fade;

      const line = lineRefs.current[i];
      if (line) {
        line.scale.setScalar(s.size * (0.95 + 0.05 * Math.sin(t * s.speed + s.phase)));
      }
    });
  });

  const dots = React.useMemo(() => makeStarLayer(DOT_COUNT, false), []);
  const dotMaterial = React.useMemo(
    () =>
      new THREE.PointsMaterial({
        color: STAR,
        size: 2.2,
        sizeAttenuation: false,
        vertexColors: true,
        transparent: true,
        depthWrite: false,
      }),
    []
  );

  return (
    <group ref={groupRef}>
      <points geometry={dots.geometry} material={dotMaterial} />
      {stars.map((s, i) => (
        <lineLoop
          key={i}
          ref={(el: THREE.LineLoop | null) => {
            lineRefs.current[i] = el;
          }}
          geometry={geometry}
          material={materials[i]}
          position={[s.x, s.y, s.z]}
        />
      ))}
    </group>
  );
}


// Moves the camera back on narrow screens (phones), so the whole globe and its
// letter ring fit the width instead of being cut off at the sides. Wide
// screens keep the normal distance of 8.
function FitCamera() {
  const size = useThree((state) => state.size);
  const camera = useThree((state) => state.camera);

  React.useEffect(() => {
    const aspect = size.width / size.height;
    const halfTan = Math.tan(THREE.MathUtils.degToRad(45 / 2));
    // 75 = half-width (world units) the view must hold: the letter ring and the sun/Earth.
    const fit = 75 / (halfTan * aspect);
    camera.position.set(CAM_X, CAM_Y, Math.max(CAM_Z, fit));
    // Titta ner så att nätet fyller hela bilden ända ut till kanten.
    camera.lookAt(CAM_TARGET[0], CAM_TARGET[1], CAM_TARGET[2]);
  }, [size, camera]);

  return null;
}

// The far sky. Everything sits at SKY_DISTANCE, above the grid's horizon, so
// nothing lands on the net. Stars are tiny fixed-size dots and sparkles.
const SKY_DISTANCE = 1500;
const SKY_FAR = 5000; // camera far plane, so the sky isn't clipped
const SKY_STAR_COUNT = 420;
const SKY_SPARKLE_COUNT = 70;

// Direction from the scene centre. -Z is into the scene, where the camera looks.
function skyPoint(az: number, el: number) {
  return new THREE.Vector3(
    Math.sin(az) * Math.cos(el),
    Math.sin(el),
    -Math.cos(az) * Math.cos(el)
  ).multiplyScalar(SKY_DISTANCE);
}

function SkyField({ progress }: { progress: number }) {
  const { camera } = useThree();
  const progressRef = React.useRef(progress);

  React.useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  const dotGeometry = React.useMemo(() => {
    const arr = new Float32Array(SKY_STAR_COUNT * 3);
    for (let i = 0; i < SKY_STAR_COUNT; i++) {
      const p = skyPoint((Math.random() * 2 - 1) * 1.3, 0.06 + Math.random() * 0.45);
      arr.set([p.x, p.y, p.z], i * 3);
    }
    return new THREE.BufferGeometry().setAttribute("position", new THREE.BufferAttribute(arr, 3));
  }, []);

  const sparkles = React.useMemo(
    () =>
      Array.from({ length: SKY_SPARKLE_COUNT }, (_, i) => ({
        pos: skyPoint((Math.random() * 2 - 1) * 1.3, 0.06 + Math.random() * 0.45),
        size: i < 50 ? 10 + Math.random() * 8 : 6 + Math.random() * 5,
      })),
    []
  );
  const sparkleGeometry = React.useMemo(
    () => new THREE.BufferGeometry().setFromPoints(sparkleOutline(1)),
    []
  );

  const materials = React.useMemo(
    () => ({
      dots: new THREE.PointsMaterial({
        color: "#ffffff",
        size: 1.8,
        sizeAttenuation: false,
        transparent: true,
        depthWrite: false,
      }),
      line: new THREE.LineBasicMaterial({ color: "#ffffff", transparent: true }),
    }),
    []
  );


  useFrame(() => {
    const fade = 1 - THREE.MathUtils.clamp(progressRef.current, 0, 1);
    materials.dots.opacity = fade;
    materials.line.opacity = fade;
    // Turn the discs to face the camera.
  });

  return (
    <group>
      <points geometry={dotGeometry} material={materials.dots} />
      {sparkles.map((s, i) => (
        <lineLoop
          key={i}
          geometry={sparkleGeometry}
          material={materials.line}
          position={s.pos}
          scale={s.size}
        />
      ))}
    </group>
  );
}

export function StuckholmGlobe({
  scrollProgress = 0,
  backgroundOnly = false,
  onEnter,
}: {
  scrollProgress?: number;
  // Only the sky, stars and line grid, without the globe. Used as the faint
  // background on the other pages (see SpaceBackdrop).
  backgroundOnly?: boolean;
  // Called when the visitor clicks (or taps) the globe. When set, the mouse
  // becomes an arrow pointing at the globe out in space, and turns into
  // "Enter" over the globe.
  onEnter?: () => void;
}) {
  const dragRef = React.useRef<DragState>({
    dragging: false,
    deltaX: 0,
    deltaY: 0,
  });
  const interactRef = React.useRef<InteractState>({
    pointer: null,
    globeX: 0,
    globeY: 0,
    globeR: 0,
    hovering: false,
    active: false,
  });
  const containerRef = React.useRef<HTMLDivElement>(null);
  // Where the press started, to tell a click from a drag.
  const downRef = React.useRef<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const interactive = !!onEnter && !backgroundOnly;

  const setPointer = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    const it = interactRef.current;
    if (it.pointer) it.pointer.set(x, y);
    else it.pointer = new THREE.Vector2(x, y);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setPointer(e);
    downRef.current = { x: e.clientX, y: e.clientY };
    dragRef.current.dragging = true;
    dragRef.current.deltaX = 0;
    dragRef.current.deltaY = 0;
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    setPointer(e);
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

  // A press and release on the globe without moving more than a few pixels
  // counts as a click: go in to the shop. A longer move is a drag (rotate).
  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const down = downRef.current;
    downRef.current = null;
    endDrag(e);
    if (!interactive || !down) return;
    const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y);
    if (moved < 6) {
      // Check the globe at the release point (taps have no hover first).
      setPointer(e);
      const it = interactRef.current;
      const rect = e.currentTarget.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      if (it.active && Math.hypot(px - it.globeX, py - it.globeY) < it.globeR * HOVER_RADIUS) {
        onEnter?.();
      }
    }
  };

  const handlePointerLeave = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse") interactRef.current.pointer = null;
    endDrag(e);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full stuck-glitch"
      style={{
        cursor: interactive ? undefined : isDragging ? "grabbing" : "grab",
        // "pan-y" keeps vertical swipes for page scrolling on touch screens,
        // while horizontal swipes still drive the globe.
        touchAction: "pan-y",
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      onPointerCancel={endDrag}
    >
      {interactive && (
        <GlobeCursor containerRef={containerRef} interactRef={interactRef} />
      )}
      {/* No tone mapping: it would grey out the pure white and darken the ink. */}
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [CAM_X, CAM_Y, CAM_Z], fov: 45, far: SKY_FAR }}
        gl={{ toneMapping: THREE.NoToneMapping }}
      >
        <ambientLight intensity={1.4} />
        <directionalLight position={[-8, 6, 6]} intensity={2.2} />
        <SceneBackground progress={scrollProgress} />
        <SkyField progress={scrollProgress} />
        <FitCamera />
        {!backgroundOnly && (
          <DriftingGlobe scrollProgress={scrollProgress} dragRef={dragRef} interactRef={interactRef} />
        )}
        {/* Linjenätet under globen. Tonas bort när bakgrunden blir vit. */}
        <GravityGrid
          wells={[MAIN_WELL]}
          size={303.6 * SCENE_SIZE}
          divisions={88}
          depth={10.12 * SCENE_SIZE * DIP_DEPTH_SCALE}
          falloff={11.4 * SCENE_SIZE * DIP_SCALE}
          position={GRID_POS}
          rotation={[0, 0, 0]}
          clearRadius={0}
          clearCenter={WELL_CENTER}
          wellCenter={WELL_CENTER}
          clearFade={0}
          opacity={0.45 * (1 - scrollProgress)}
        />
      </Canvas>
    </div>
  );
}

// The arrow out in space (Julia's drawing). Its width in pixels, and the
// direction it points in the drawing itself (from tail to tip, down and to
// the right), which is subtracted so the tip ends up aimed at the globe.
const ARROW_W = 46;
// Line look for the arrow and the hand: same thin line as the letters that
// orbit the globe (1 px), and a bit see-through.
const SYMBOL_LINE = 1;
const SYMBOL_OPACITY = 0.7;
const ARROW_ANGLE = Math.atan2(223.83 - 12.2, 151.7 - 31.5);

// The hand and "Enter" are white, like the arrow. Size of the pointing hand,
// in pixels wide. The fingertip sits at about 37 % across and 21 % down the
// drawing, so that point is moved onto the mouse.
const HAND_W = 72;
const HAND_RATIO = 642.67 / 547.07;
const HAND_TIP_X = HAND_W * 0.37;
const HAND_TIP_Y = HAND_W * HAND_RATIO * 0.21;
const ENTER_SHOWN = `translate(${-HAND_TIP_X}px, ${-HAND_TIP_Y}px) scale(1)`;
const ENTER_HIDDEN = `translate(${-HAND_TIP_X}px, ${-HAND_TIP_Y}px) scale(0.85)`;

// The mouse on the home page. Out in space it is an arrow that always points
// at the globe; over the globe it turns into a pointing hand with "Enter". It is drawn
// as a normal page element following the mouse (the real cursor is hidden
// while it shows). On touch screens nothing is drawn: tapping the globe
// enters directly.
function GlobeCursor({
  containerRef,
  interactRef,
}: {
  containerRef: React.RefObject<HTMLDivElement>;
  interactRef: React.MutableRefObject<InteractState>;
}) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const arrowRef = React.useRef<HTMLDivElement>(null);
  const enterRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    let frame = 0;
    let lastHover: boolean | null = null;
    let lastVisible: boolean | null = null;
    const tick = () => {
      frame = requestAnimationFrame(tick);
      const root = rootRef.current;
      const container = containerRef.current;
      const arrow = arrowRef.current;
      const enter = enterRef.current;
      if (!root || !container || !arrow || !enter) return;
      const it = interactRef.current;
      const visible = !!it.pointer && it.active;
      if (visible !== lastVisible) {
        lastVisible = visible;
        root.style.opacity = visible ? "1" : "0";
        container.style.cursor = visible ? "none" : "auto";
      }
      if (!it.pointer) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      const x = ((it.pointer.x + 1) / 2) * w;
      const y = ((1 - it.pointer.y) / 2) * h;
      root.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      const angle = Math.atan2(it.globeY - y, it.globeX - x);
      arrow.style.transform = `translate(-50%, -50%) rotate(${angle - ARROW_ANGLE}rad)`;
      if (it.hovering !== lastHover) {
        lastHover = it.hovering;
        arrow.style.opacity = it.hovering ? "0" : "1";
        enter.style.opacity = it.hovering ? "1" : "0";
        enter.style.transform = it.hovering ? ENTER_SHOWN : ENTER_HIDDEN;
      }
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      if (containerRef.current) containerRef.current.style.cursor = "";
    };
  }, [containerRef, interactRef]);

  return (
    <div
      ref={rootRef}
      aria-hidden
      className="pointer-events-none absolute top-0 left-0 z-10 text-white transition-opacity duration-200"
      style={{ opacity: 0 }}
    >
      {/* The arrow; rotated each frame so its tip aims at the globe. */}
      <div
        ref={arrowRef}
        className="absolute top-0 left-0 transition-opacity duration-200"
        style={{ transform: "translate(-50%, -50%)" }}
      >
        {/* Julia's own arrow drawing (muen.svg), drawn twice slightly offset. */}
        <svg
          width={ARROW_W}
          height={ARROW_W * (254.85 / 192.41)}
          viewBox="0 0 192.41 254.85"
          fill="none"
          stroke="currentColor"
          strokeWidth={SYMBOL_LINE}
          strokeOpacity={SYMBOL_OPACITY}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline vectorEffect="non-scaling-stroke" points="30.28 15.87 149.78 223.83 159.09 154.98" />
          <line vectorEffect="non-scaling-stroke" x1="80.65" y1="202.99" x2="152.8" y2="224.96" />
          <polyline vectorEffect="non-scaling-stroke" points="32.81 8.57 153.7 223.83 163.11 152.56" />
          <line vectorEffect="non-scaling-stroke" x1="74.91" y1="194.52" x2="150.21" y2="220.1" />
        </svg>
      </div>
      {/* Over the globe: "Enter", with a pointing hand with click rays under
          it. The fingertip sits exactly on the mouse position. */}
      <div
        ref={enterRef}
        className="absolute top-0 left-0 flex flex-col items-start text-white transition-[opacity,transform] duration-200"
        style={{
          opacity: 0,
          transform: ENTER_HIDDEN,
          transformOrigin: `${HAND_TIP_X}px ${HAND_TIP_Y}px`,
        }}
      >
        {/* "Enter" above the hand, centred on the fingertip, so it is clear
            that clicking takes you in. */}
        <span
          className="absolute bottom-full mb-1 whitespace-nowrap text-2xl sm:text-3xl leading-none"
          style={{ left: HAND_TIP_X, transform: "translateX(-50%)" }}
        >
          Enter
        </span>
        {/* Julia's own hand drawing (cklick.svg), drawn twice slightly offset. */}
        <svg
          width={HAND_W}
          height={HAND_W * HAND_RATIO}
          viewBox="0 0 547.07 642.67"
          fill="none"
          stroke="currentColor"
          strokeWidth={SYMBOL_LINE}
          strokeOpacity={SYMBOL_OPACITY}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path vectorEffect="non-scaling-stroke" d="Layer_1" />
          <path vectorEffect="non-scaling-stroke" d="M383.29,291.55c3.82-2.31,6.93-5.78,9.91-9.49,8.1-10.08,18.02-12.28,28.5-8.83,11.03,3.64,17.84,13.18,20.67,27.3,6.15,30.65,12.46,61.26,18.56,91.93,3.9,19.62,8.79,38.99,11.42,58.95,4.04,30.79-.72,59.87-13.01,86.86-10.56,23.16-25.78,40.21-44.75,51.96-9.35,5.79-19.44,9.1-29.35,12.88-10.68,4.07-21.3,8.4-32.07,12.12-8.05,2.79-16.17,4.32-24.57,4.62-12.21.43-24.06-1.35-35.68-6.1-7.48-3.05-14.5-7.3-21.4-12-36.25-24.67-72.72-48.79-109.02-73.33-19.48-13.16-38.94-26.37-58.62-39.05-14.2-9.14-16.22-30.42-5.59-44.53,5.68-7.53,12.04-12.89,20.25-15.03,7.26-1.9,14.18-.92,21.01,2.12,26.12,11.61,52.33,22.93,78.5,34.36,4.29,1.87,8.89,2.26,13.45,1.08" />
          <path vectorEffect="non-scaling-stroke" d="M276.68,363.98h-3.86c-4.2-17.87-8.72-35.57-12.78-53.45-2.52-11.07-6.26-21.7-6.85-33.46-.18-3.5-.23-7.01-.22-10.49,0-2.13-.49-3.68-1.66-4.99-6.42-7.18-7.45-17.56-9.82-27.01-4.13-16.42-7.59-33.12-12.07-49.38-4.26-15.5-13.66-24.1-26.46-24.82-17.7-1-30.15,16.55-30.61,35.76-.2,8.18,1.89,15.52,3.74,22.96q8.6,34.68,16.88,69.49c9.52,39.62,19.31,79.14,28.65,118.83,3.1,13.18,6.23,26.36,9.62,39.41,1.49,5.74,2.07,11.39,1.27,17-.46,3.17.4,4.69,1.76,6.54,1.45,1.98,4.01,2.95,3.77,6.49" />
          <path vectorEffect="non-scaling-stroke" d="M386.06,321.02c-2.71-8.34-3.29-17.08-3.18-25.97.02-1.9.06-3.47-1.48-5.13-2.9-3.13-4.64-7.56-6.47-11.83-10.16-23.74-33.7-26.44-47.53-9.03-2.69,3.38-5.61,6.45-9.11,8.5" />
          <path vectorEffect="non-scaling-stroke" d="M329.39,347.49c.28-3.46-.34-6.74-1.19-9.99q-4.7-18.1-8.71-36.46c-1.42-6.54-1.72-13.23-1.61-19.98.04-1.9.17-3.55-1.5-5.11-3.01-2.84-4.6-7.3-6.39-11.39-6.48-14.8-16.42-21.7-29.74-20.39-6.75.66-12.6,4.43-17.42,10.45-2.86,3.56-5.9,6.73-9.53,8.96" />
          <path vectorEffect="non-scaling-stroke" d="M137.58,224.62c.27,2.07-.2,3.34-1.98,4.03-20.9,8.21-41.42,17.87-62.2,26.53-1.5.62-2.89.86-4.39.91" />
          <path vectorEffect="non-scaling-stroke" d="M158.58,32.81c6.82,25.89,13.94,51.65,21,77.43.89,3.23,1.48,6.53,1.19,9.98" />
          <path vectorEffect="non-scaling-stroke" d="M342.07,141.45c-9.9.31-18.6,6.04-27.73,9.79-14.45,5.95-28.74,12.52-43.19,18.51-1.74.72-3.42.88-5.17.92" />
          <path vectorEffect="non-scaling-stroke" d="M265.19,37.81c.09,1.75-.16,3.38-.78,5-9.54,25.04-19.86,49.6-29.03,74.87-.62,1.71-1.14,3.22-1.1,5.04" />
          <path vectorEffect="non-scaling-stroke" d="M78.13,118.73c-.15,1.97.28,3.07,1.95,4.08q29.59,18.05,59.06,36.42c2.25,1.4,4.5.71,6.76.95" />
          <path vectorEffect="non-scaling-stroke" d="M377.11,286.21c3.82-2.31,6.94-5.79,9.91-9.49,8.11-10.09,18.02-12.28,28.5-8.83,11.04,3.64,17.84,13.18,20.67,27.3,6.16,30.65,12.47,61.26,18.56,91.93,3.9,19.62,8.8,38.99,11.42,58.95,4.04,30.78-.72,59.87-13.01,86.85-10.55,23.17-25.77,40.21-44.74,51.97-9.36,5.79-19.45,9.1-29.35,12.88-10.68,4.07-21.31,8.4-32.07,12.12-8.05,2.78-16.18,4.32-24.57,4.62-12.22.43-24.07-1.36-35.68-6.1-7.49-3.05-14.51-7.31-21.4-12-36.25-24.67-72.73-48.8-109.03-73.33-19.47-13.17-38.94-26.37-58.62-39.05-14.2-9.15-16.21-30.42-5.58-44.53,5.67-7.53,12.04-12.89,20.24-15.04,7.26-1.89,14.19-.91,21.02,2.13,26.12,11.61,52.32,22.93,78.49,34.36,4.29,1.87,8.89,2.26,13.46,1.08" />
          <path vectorEffect="non-scaling-stroke" d="M270.51,358.63h-3.86c-4.21-17.86-8.72-35.57-12.79-53.44-2.52-11.07-6.25-21.71-6.85-33.46-.17-3.51-.22-7.01-.22-10.5.01-2.12-.48-3.68-1.65-4.99-6.43-7.17-7.45-17.55-9.83-27.01-4.13-16.41-7.58-33.11-12.06-49.37-4.27-15.51-13.67-24.1-26.47-24.82-17.69-1-30.15,16.55-30.61,35.76-.2,8.18,1.9,15.52,3.74,22.95q8.6,34.69,16.89,69.49c9.51,39.63,19.31,79.15,28.64,118.84,3.1,13.18,6.24,26.36,9.63,39.41,1.49,5.74,2.06,11.39,1.26,17-.45,3.17.41,4.68,1.77,6.54,1.45,1.98,4,2.95,3.76,6.49" />
          <path vectorEffect="non-scaling-stroke" d="M379.89,315.68c-2.72-8.34-3.29-17.09-3.18-25.98.02-1.9.05-3.47-1.49-5.13-2.9-3.13-4.64-7.55-6.47-11.82-10.16-23.74-33.7-26.44-47.53-9.04-2.69,3.39-5.61,6.46-9.1,8.51" />
          <path vectorEffect="non-scaling-stroke" d="M323.21,342.15c.29-3.46-.34-6.74-1.18-9.99q-4.7-18.1-8.72-36.46c-1.41-6.55-1.71-13.24-1.6-19.98.03-1.9.16-3.55-1.5-5.12-3.02-2.83-4.6-7.29-6.39-11.38-6.49-14.8-16.43-21.7-29.74-20.39-6.76.66-12.61,4.43-17.42,10.44-2.86,3.57-5.91,6.74-9.54,8.97" />
          <path vectorEffect="non-scaling-stroke" d="M131.4,219.28c.27,2.06-.2,3.33-1.97,4.03-20.91,8.21-41.42,17.87-62.21,26.52-1.49.63-2.89.87-4.38.91" />
          <path vectorEffect="non-scaling-stroke" d="M152.4,27.47c6.82,25.89,13.94,51.64,21,77.42.89,3.23,1.48,6.53,1.2,9.99" />
          <path vectorEffect="non-scaling-stroke" d="M335.9,136.11c-9.9.3-18.61,6.04-27.73,9.79-14.46,5.95-28.75,12.52-43.19,18.51-1.75.72-3.42.88-5.18.92" />
          <path vectorEffect="non-scaling-stroke" d="M259.01,32.47c.1,1.75-.16,3.38-.77,5-9.55,25.04-19.86,49.6-29.03,74.87-.62,1.7-1.14,3.21-1.11,5.04" />
          <path vectorEffect="non-scaling-stroke" d="M71.95,113.38c-.15,1.97.28,3.07,1.95,4.09q29.6,18.04,59.07,36.42c2.24,1.4,4.5.71,6.75.95" />
        </svg>
      </div>
    </div>
  );
}

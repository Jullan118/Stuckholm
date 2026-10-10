import * as React from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, useGLTF } from "@react-three/drei";
import * as THREE from "three";

// The blob is a Rhino/Grasshopper export (blobben.glb). It is re-centred and
// re-scaled in code, so the file's own units don't matter.
const BLOB_MODEL_URL = "/models/globee.glb";
const BLOB_RADIUS = 4.0;
// Scales the letter ring around the globe. 1 = as placed in blobben.glb.
const LETTER_SCALE = 1;

// Line-drawing look: white fill, anthracite grey (RAL 7016) for all details.
const INK = "#383e42";
const PAPER = "#ffffff";
// How opaque the globe is at the top of the page (1 = solid).
const GLOBE_START_OPACITY = 0.8;
// Light grey for the globe body.
const GLOBE_GREY = "#d4d7da";
// Night-sky navy at the top of the page, fading to white as you scroll.
const SKY_DARK = new THREE.Color("#04050c");
const SKY_WHITE = new THREE.Color("#ffffff");
// Stars are white so they stay visible on the dark background.
const STAR = "#ffffff";

// Orbit speed of the letter ring around the globe's vertical axis, in rad/s.
const TEXT_ORBIT_SPEED = 0.08;

// How many stars there are in the sky.
const SPARKLE_COUNT = 350;

useGLTF.preload(BLOB_MODEL_URL);

// The 16 "Raven" meshes are the letters; everything else is the blob.
// three.js turns spaces into underscores, so match on the prefix.
function isLetter(name: string) {
  return name.startsWith("Raven");
}

// Splits the GLB into the blob (sits at the origin) and the letter ring
// (returned separately so it can orbit on its own).
function createBlobFromModel(scene: THREE.Object3D) {
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

  // White fill that hides what's behind it. Pushed slightly back in depth so
  // the ink lines sit on top of it instead of flickering against it.
  const fill = new THREE.MeshBasicMaterial({
    color: GLOBE_GREY,
    polygonOffset: true,
    polygonOffsetFactor: 1,
    polygonOffsetUnits: 1,
  });
  const ink = new THREE.LineBasicMaterial({ color: INK });
  const inkHull = new THREE.MeshBasicMaterial({
    color: INK,
    side: THREE.BackSide,
  });
  const letterInk = new THREE.MeshBasicMaterial({ color: PAPER });

  const letterMeshes: THREE.Mesh[] = [];
  const blobMeshes: THREE.Mesh[] = [];
  root.traverse((child) => {
    const mesh = child as THREE.Mesh;

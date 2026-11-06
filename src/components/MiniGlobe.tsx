import * as React from "react";
import { Canvas } from "@react-three/fiber";
import { Bounds } from "@react-three/drei";
import { Link, useLocation } from "react-router-dom";
import { BLOB_MODEL_URL, createBlobFromModel } from "@/components/StuckholmGlobe";
import sketchCover from "@/assets/sketch-cover.png?inline";

// Small still drawing in the top-left corner on every page except the home page.
// It is the hand-drawn sketch itself, not a 3D model, and it does not move.
export function MiniGlobe() {
  const { pathname } = useLocation();
  if (pathname === "/") return null;

  return (
    <Link
      to="/"
      className="fixed top-1 left-4 sm:left-8 z-20 w-24 cursor-pointer hover:scale-110 transition-transform"
      title="Till startsidan"
    >
      <img src={sketchCover} alt="" className="block w-full h-auto" />
    </Link>
  );
}

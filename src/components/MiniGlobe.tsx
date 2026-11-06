import * as React from "react";
import { Canvas } from "@react-three/fiber";
import { Bounds } from "@react-three/drei";
import { Link, useLocation } from "react-router-dom";
import { SketchGlobe } from "@/components/SketchGlobe";

// Small globe in the top-left corner on every page except the home page.
// It is a line-drawing interpretation of the globe (see SketchGlobe).
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
        <React.Suspense fallback={null}>
          <Bounds fit clip observe margin={1.1}>
            <SketchGlobe />
          </Bounds>
        </React.Suspense>
      </Canvas>
    </Link>
  );
}

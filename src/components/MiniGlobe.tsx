import * as React from "react";
import { Link, useLocation } from "react-router-dom";

export function MiniGlobe() {
  const { pathname } = useLocation();
  if (pathname === "/") return null;

  return (
    <Link
      to="/"
      className="absolute top-4 left-4 z-20 w-12 h-12 rounded-full overflow-hidden cursor-pointer hover:scale-110 transition-transform bg-white"
      title="Till startsidan"
    >
      <img
        src="/images/blob-mini.png"
        alt="Stuckholm"
        className="w-full h-full object-contain"
      />
    </Link>
  );
}

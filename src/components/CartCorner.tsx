import * as React from "react";
import { useLocation } from "react-router-dom";

// Cart icon pinned to the top-right corner on every page, mirroring the
// mini globe logo in the top-left (see MiniGlobe). It's currently a purely
// visual placeholder — there's no cart state behind it yet, since "Add to
// cart" on product pages is still a mailto link, not a real basket. Wire
// this up to real cart logic before it goes live as an actual link.
// On the home page the hero is a dark starfield, so it switches to white
// there like the rest of the corner UI.
export function CartCorner() {
  const { pathname } = useLocation();
  const isHome = pathname === "/";

  return (
    <div
      className={`absolute top-4 right-4 z-20 flex items-center gap-1 ${
        isHome ? "text-white" : "text-black"
      }`}
      title="Cart"
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 8h12l-1 12.5a1 1 0 0 1-1 .9H8a1 1 0 0 1-1-.9L6 8Z" />
        <path d="M9 8V6a3 3 0 0 1 6 0v2" />
      </svg>
      <sup className="text-[11px] leading-none">0</sup>
    </div>
  );
}

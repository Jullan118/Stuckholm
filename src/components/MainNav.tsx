import * as React from "react";
import { Link, useLocation } from "react-router-dom";

const LINKS = [
  { label: "In Stock", to: "/in-stock" },
  { label: "Trash", to: "/trash" },
];

// Always-visible horizontal category row (replaces the old hamburger menu).
// Each link grows slightly on hover instead of just changing color.
// On the home page the hero is a dark starfield, so the nav switches to
// white there instead of its usual black-on-white. On every other page the
// mini globe logo (MiniGlobe) sits in the same top-left corner, so the nav
// shifts right to sit beside it instead of underneath it.
export function MainNav() {
  const { pathname } = useLocation();
  const isHome = pathname === "/";

  return (
    <nav
  className={`${isHome ? "fixed" : "absolute"} top-4 right-4 z-20 h-16 flex flex-wrap items-center gap-6 sm:gap-10 ${
    isHome ? "left-4 sm:left-8" : "left-24 sm:left-28"
  }`}
  >
      {LINKS.map((link) => (
        <Link
          key={link.label}
          to={link.to}
          className={`inline-block text-lg sm:text-xl transition-transform duration-200 ease-out hover:scale-125 ${
            isHome ? "text-white home-ink hover:opacity-70" : "text-black hover:text-black/70"
          }`}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}

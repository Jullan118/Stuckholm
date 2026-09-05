import * as React from "react";
import { Link, useLocation } from "react-router-dom";

const LINKS = [
  { label: "Off the shelf", to: "/off-the-shelf" },
  { label: "Trash", to: "/trash" },
  { label: "Visit Stuckholm", to: "/contact" },
];

// Always-visible horizontal category row (replaces the old hamburger menu).
// Each link grows slightly on hover instead of just changing color.
// On the home page the hero is a dark starfield, so the nav switches to
// white there instead of its usual black-on-white.
export function MainNav() {
  const { pathname } = useLocation();
  const isHome = pathname === "/";

  return (
    <nav className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center gap-6 sm:gap-10">
      {LINKS.map((link) => (
        <Link
          key={link.label}
          to={link.to}
          className={`inline-block text-xl sm:text-2xl transition-transform duration-200 ease-out hover:scale-125 ${
            isHome ? "text-white hover:text-white/70" : "text-black hover:text-black/70"
          }`}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}

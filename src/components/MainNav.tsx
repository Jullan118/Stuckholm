import * as React from "react";
import { Link } from "react-router-dom";

const LINKS = [
  { label: "Off the shelf", to: "/off-the-shelf" },
  { label: "Trash", to: "/trash" },
  { label: "Visit Stuckholm", to: "/contact" },
];

// Always-visible horizontal category row (replaces the old hamburger menu).
// Each link grows slightly on hover instead of just changing color.
export function MainNav() {
  return (
    <nav className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center gap-6 sm:gap-10">
      {LINKS.map((link) => (
        <Link
          key={link.label}
          to={link.to}
          className="inline-block text-black text-xl sm:text-2xl transition-transform duration-200 ease-out hover:scale-125 hover:text-black/70"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}

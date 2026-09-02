import * as React from "react";
import { Link, useLocation } from "react-router-dom";

// "Contact" lives here instead of in the top nav row — a small link pinned
// to the bottom-right of every page, so it shows up when you scroll down.
export function ContactCorner() {
  const { pathname } = useLocation();
  if (pathname === "/about") return null;

  return (
    <Link
      to="/about"
      className="absolute bottom-4 right-4 z-20 text-black text-sm sm:text-base transition-transform duration-200 ease-out hover:scale-125 hover:text-black/70"
    >
      Contact
    </Link>
  );
}

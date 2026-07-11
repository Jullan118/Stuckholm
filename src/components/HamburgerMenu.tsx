import * as React from "react";
import { Link } from "react-router-dom";

const LINKS = [
  { label: "Ingång", to: "/shop" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
];

export function HamburgerMenu() {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="absolute top-4 left-4 z-20">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Menu"
        className="flex flex-col gap-1.5 p-2"
      >
        <span
          className={`block h-0.5 w-6 bg-zinc-900 transition-transform ${
            open ? "translate-y-2 rotate-45" : ""
          }`}
        />
        <span
          className={`block h-0.5 w-6 bg-zinc-900 transition-opacity ${
            open ? "opacity-0" : ""
          }`}
        />
        <span
          className={`block h-0.5 w-6 bg-zinc-900 transition-transform ${
            open ? "-translate-y-2 -rotate-45" : ""
          }`}
        />
      </button>

      {open && (
        <nav className="mt-2 flex flex-col gap-2 bg-white px-4 py-3 rounded-lg shadow-lg">
          {LINKS.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              onClick={() => setOpen(false)}
              className="text-zinc-800 text-lg hover:text-zinc-500 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}

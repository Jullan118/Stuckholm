import * as React from "react";
import { Link } from "react-router-dom";

const LINKS = [
  { label: "New Flames", to: "/new-flames" },
  { label: "Gammalt Skräp", to: "/trash" },
  { label: "Visit Stuckholm", to: "/contact" },
  { label: "Contact", to: "/about" },
];

export function HamburgerMenu() {
  const [open, setOpen] = React.useState(false);
  const barColor = "bg-black";
  const navBg = "bg-black";
  const linkColor = "text-white hover:opacity-70";

  return (
    <div className="absolute top-4 left-4 z-20">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Menu"
        className="flex flex-col gap-2 p-2"
      >
        <span
          className={`block h-2 w-7 rounded-full ${barColor} transition-transform ${
            open ? "translate-y-4 rotate-45" : ""
          }`}
        />
        <span
          className={`block h-2 w-7 rounded-full ${barColor} transition-opacity ${
            open ? "opacity-0" : ""
          }`}
        />
        <span
          className={`block h-2 w-7 rounded-full ${barColor} transition-transform ${
            open ? "-translate-y-4 -rotate-45" : ""
          }`}
        />
      </button>

      {open && (
        <nav className={`mt-2 flex flex-col gap-2 ${navBg} px-4 py-3 rounded-[2.7px] shadow-lg`}>
          {LINKS.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              onClick={() => setOpen(false)}
              className={`${linkColor} text-lg transition-colors`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}

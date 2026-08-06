import * as React from "react";
import { Link } from "react-router-dom";

const LINKS = [
  { label: "Spend", to: "/shop" },
  { label: "About", to: "/about" },
  { label: "Visit Stuckholm", to: "/contact" },
];

export function HamburgerMenu() {
  const [open, setOpen] = React.useState(false);
  const barColor = "bg-[#e2c3d3]";
  const navBg = "bg-[#e2c3d3]";
  const linkColor = "text-[#801332] hover:opacity-70";

  return (
    <div className="absolute top-4 left-4 z-20">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Menu"
        className="flex flex-col gap-1.5 p-2"
      >
        <span
          className={`block h-0.5 w-6 ${barColor} transition-transform ${
            open ? "translate-y-2 rotate-45" : ""
          }`}
        />
        <span
          className={`block h-0.5 w-6 ${barColor} transition-opacity ${
            open ? "opacity-0" : ""
          }`}
        />
        <span
          className={`block h-0.5 w-6 ${barColor} transition-transform ${
            open ? "-translate-y-2 -rotate-45" : ""
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

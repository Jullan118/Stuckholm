import * as React from "react";
import { Link } from "react-router-dom";

// Site-wide footer, shown at the bottom of every page. One quiet row,
// modelled on teenage engineering's store footer: location on the left,
// links in the middle, copyright on the right. Stacks on mobile.
const linkClass =
  "text-black/70 hover:text-black transition-colors whitespace-nowrap";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full font-manrope text-xs sm:text-sm text-black mt-40 mb-10 px-4">
      <div className="border-t border-black/20 pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <span className="text-black/50">Stockholm, Sweden</span>

        <nav className="flex flex-wrap gap-x-5 gap-y-2 uppercase tracking-wide">
          <Link to="/shipping" className={linkClass}>Shipping</Link>
          <Link to="/refund" className={linkClass}>Returns</Link>
          <Link to="/cookies" className={linkClass}>Cookies</Link>
          <Link to="/privacy" className={linkClass}>Privacy</Link>
          <Link to="/terms" className={linkClass}>Terms</Link>
          <a href="mailto:stuck@stuckholm.se" className={linkClass}>Contact</a>
          <a
            href="https://www.instagram.com/stuckholm.se/"
            target="_blank"
            rel="noreferrer"
            className={linkClass}
          >
            Instagram
          </a>
          <Link to="/login" className={linkClass}>Login</Link>
        </nav>

        <span className="text-black/50">© {year} Stuck in Stuckholm</span>
      </div>
    </footer>
  );
}

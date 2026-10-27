import * as React from "react";
import { Link } from "react-router-dom";

// Site-wide footer, shown at the bottom of every page (in normal document
// flow — it sits after whatever the current route renders, not pinned to
// the viewport). Three link columns (INFO, LEGAL, STUCKHOLM), each with a
// grey rule under its heading, followed by a thin copyright bar. "Login"
// sits in the bottom bar, stacked right above "Stockholm, Sweden".
const headingClass =
  "mb-2 text-black uppercase tracking-wide text-xs sm:text-sm";
const linkClass =
  "uppercase tracking-wide text-black/70 hover:opacity-70 transition-opacity break-words";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full font-manrope text-black mt-64 mb-14">
      <div className="w-full">
        <div className="ml-4 border-t border-black/20" />
        <div className="px-4 pt-6 pb-10 grid grid-cols-2 gap-x-6 gap-y-10 sm:flex sm:gap-32 text-xs sm:text-sm">
          <div className="flex flex-col gap-3 leading-tight">
            <span className={headingClass}>Info</span>
            <Link to="/shipping" className={linkClass}>Shipping</Link>
            <Link to="/refund" className={linkClass}>Return & Refunds</Link>
          </div>

          <div className="flex flex-col gap-3 leading-tight">
            <span className={headingClass}>Legal</span>
            <Link to="/cookies" className={linkClass}>Cookies</Link>
            <Link to="/privacy" className={linkClass}>Privacy Policy</Link>
            <Link to="/terms" className={linkClass}>Terms of Use</Link>
          </div>

          <div className="flex flex-col gap-3 leading-tight">
            <span className={headingClass}>Stuckholm</span>
            <a href="mailto:stuck@stuckholm.se" className={linkClass}>Contact</a>
            <a
              href="https://www.instagram.com/stuckholm.se/"
              target="_blank"
              rel="noreferrer"
              className={linkClass}
            >
              Instagram
            </a>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 flex flex-col sm:flex-row items-center sm:items-end justify-between gap-1 text-xs sm:text-sm text-black/50 w-full">
        <span>© {year} Stuck in Stuckholm — all rights reserved</span>
        <div className="flex flex-col items-center sm:items-end gap-1">
          <Link
            to="/login"
            className="text-black/50 hover:text-black uppercase tracking-wide transition-colors"
          >
            Login
          </Link>
          <span>Stockholm, Sweden</span>
        </div>
      </div>
    </footer>
  );
}

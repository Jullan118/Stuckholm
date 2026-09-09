import * as React from "react";
import { Link } from "react-router-dom";

// Site-wide footer, shown at the bottom of every page (in normal document
// flow — it sits after whatever the current route renders, not pinned to
// the viewport) rather than only on /about as before. Structured like
// AVAVAV's: a couple of link/info columns, then a thin copyright bar
// underneath. "Login" sits in the bottom bar, stacked right above
// "Stockholm, Sweden" on the right — it's the site's only link to /about,
// replacing the old floating bottom-right ContactCorner link.
export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full font-skarp text-black mt-20 mb-14">
      <div className="w-full px-4 sm:px-8 py-12 grid grid-cols-3 gap-3 sm:gap-10 text-sm sm:text-lg">
        <div className="flex flex-col gap-1 leading-tight">
          <span className="text-black/40 uppercase tracking-wide text-xs sm:text-sm mb-1">
            About
          </span>
          <span>Stuckholm</span>
          <span className="text-black/60">by 2 Stuckholm Kids</span>
        </div>

        <div className="flex flex-col gap-1 leading-tight">
          <span className="text-black/40 uppercase tracking-wide text-xs sm:text-sm mb-1">
            Contact
          </span>
          <a
            href="mailto:stuck@stuckholm.se"
            className="hover:opacity-70 transition-opacity break-words"
          >
            stuck@stuckholm.se
          </a>
          <a
            href="tel:+46768771123"
            className="hover:opacity-70 transition-opacity"
          >
            +46 76 877 11 23
          </a>
        </div>

        <div className="flex flex-col gap-1 leading-tight">
          <span className="text-black/40 uppercase tracking-wide text-xs sm:text-sm mb-1">
            Follow
          </span>
          <a
            href="https://instagram.com/skraqp"
            target="_blank"
            rel="noreferrer"
            className="hover:opacity-70 transition-opacity"
          >
            Instagram
          </a>
        </div>
      </div>

      <div className="px-6 sm:px-8 py-4 flex flex-col sm:flex-row items-center sm:items-end justify-between gap-1 text-sm text-black/50 w-full">
        <span>© {year} Stuck in Stuckholm — all rights reserved</span>
        <div className="flex flex-col items-center sm:items-end gap-1">
          <Link
            to="/about"
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

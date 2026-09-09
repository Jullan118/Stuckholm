import * as React from "react";

// Site-wide footer, shown at the bottom of every page (in normal document
// flow — it sits after whatever the current route renders, not pinned to
// the viewport) rather than only on /about as before. Structured like
// AVAVAV's: a couple of link/info columns, then a thin copyright bar
// underneath.
export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    // Extra bottom margin here isn't decorative — ContactCorner floats
    // "bottom-4" relative to <main>, which now ends with this footer, so
    // without this gap the "Contact" link would sit right on top of the
    // copyright bar. This reserves clear space below the footer for it.
    <footer className="w-full font-skarp text-black mt-20 mb-14">
      <div className="w-full px-6 sm:px-8 py-12 grid grid-cols-2 sm:grid-cols-3 gap-10 text-sm sm:text-base">
        <div className="flex flex-col gap-2">
          <span className="text-black/40 uppercase tracking-wide text-xs mb-1">
            About
          </span>
          <span>Stuckholm</span>
          <span className="text-black/60">by 2 Stuckholm Kids</span>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-black/40 uppercase tracking-wide text-xs mb-1">
            Contact
          </span>
          <a
            href="mailto:stuck@stuckholm.se"
            className="hover:opacity-70 transition-opacity"
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

        <div className="flex flex-col gap-2">
          <span className="text-black/40 uppercase tracking-wide text-xs mb-1">
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

      <div className="px-6 sm:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-1 text-xs text-black/50 w-full">
        <span>© {year} Stuck in Stuckholm — all rights reserved</span>
        <span>Stockholm, Sweden</span>
      </div>
    </footer>
  );
}

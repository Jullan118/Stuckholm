import * as React from "react";
import { Link } from "react-router-dom";

// Site-wide footer, shown at the bottom of every page (in normal document
// flow — it sits after whatever the current route renders, not pinned to
// the viewport). Three link columns (Service, Legal, Stuckholm) followed by
// a thin copyright bar underneath. "Login" sits in the bottom bar, stacked
// right above "Stockholm, Sweden" on the right — it's the site's only link
// to /about.
const headingClass =
  "text-black/40 uppercase tracking-wide text-xs sm:text-sm mb-1";
const linkClass = "hover:opacity-70 transition-opacity break-words";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full font-manrope text-black mt-20 mb-14">
      <div className="w-full px-4 sm:px-8 py-12 grid grid-cols-2 gap-x-6 gap-y-10 sm:flex sm:gap-10 text-xs sm:text-base">
        <div className="flex flex-col gap-1 leading-tight">
          <span className={headingClass}>Service</span>
          <Link to="/shipping" className={linkClass}>Delivery</Link>
          <Link to="/returns" className={linkClass}>Returns &amp; Refunds</Link>
          <Link to="/payments" className={linkClass}>Payments</Link>
          <a href="mailto:stuck@stuckholm.se" className={`${linkClass} break-words`}>
            Contact
          </a>
        </div>

        <div className="flex flex-col gap-1 leading-tight">
          <span className={headingClass}>Legal</span>
          <Link to="/privacy" className={linkClass}>Privacy Policy</Link>
          <Link to="/cookies" className={linkClass}>Cookies</Link>
          <Link to="/terms" className={linkClass}>Terms of Service</Link>
        </div>

        <div className="flex flex-col gap-1 leading-tight">
          <span className={headingClass}>Stuckholm</span>
          <Link to="/about" className={linkClass}>About Us</Link>
          <Link to="/faq" className={linkClass}>FAQ</Link>
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

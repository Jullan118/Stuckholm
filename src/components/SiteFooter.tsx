import * as React from "react";
import { Link } from "react-router-dom";

// Today's date and time in Stockholm, e.g. "15 November 19:41:07". It is the
// same for every visitor, wherever they are.
function stockholmNow() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Stockholm",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return { date: `${get("day")} ${get("month")}`, time: `${get("hour")}:${get("minute")}:${get("second")}` };
}

function stockholmYear() {
  return new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Stockholm", year: "numeric" }).format(new Date());
}

// The info links are in the body font, Cormorant Garamond, in solid black.
const linkClass = "font-cormorant font-semibold hover:opacity-60 transition-opacity";

// Site-wide footer, at the bottom of every page (in normal document flow).
// Left: the live date and time in Stockholm. Middle: the info links.
// Right: "©" and the year. Date and year in the outlined blackletter display
// font; the links small, in Cormorant Garamond semibold.
export function SiteFooter() {
  const [now, setNow] = React.useState(stockholmNow);

  // Update every second, for the seconds.
  React.useEffect(() => {
    const timer = window.setInterval(() => {
      setNow((prev) => {
        const next = stockholmNow();
        return next.date === prev.date && next.time === prev.time ? prev : next;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    // Wide screens: date at the left (at least 40% wide), links after it, year at the right
    // edge. Narrow screens: the three parts stack.
    <footer className="relative z-10 w-full mt-32 sm:mt-48 px-4 sm:px-8 pb-6 sm:pb-8 flex flex-col gap-y-8 lg:grid lg:grid-cols-[minmax(40%,auto)_1fr_auto] lg:gap-x-12 lg:items-end text-black">
      <p className="blackletter-outline footer-date-size leading-none whitespace-nowrap">
        {now.date} <span className="ml-[0.35em] tabular-nums">{now.time}</span>
      </p>

      {/* Small links, two columns. */}
      <div className="flex gap-x-16 sm:gap-x-20 text-[13px] sm:text-sm leading-tight lg:self-center">
        <div className="flex flex-col">
          <Link to="/terms-privacy" className={linkClass}>Terms &amp; Privacy</Link>
          <Link to="/shipping-returns" className={linkClass}>Shipping &amp; Returns</Link>
        </div>
        <div className="flex flex-col">
          <a
            href="https://www.instagram.com/stuckholm.se/"
            target="_blank"
            rel="noreferrer"
            className={linkClass}
          >
            Insta
          </a>
          <Link to="/contact" className={linkClass}>Contact</Link>
        </div>
      </div>

      <p className="blackletter-outline footer-date-size leading-none whitespace-nowrap lg:text-right">©{stockholmYear()}</p>
    </footer>
  );
}

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

// The info links are in the body font, Cormorant Garamond, in light grey (RGB 180, 180, 180).
// Fits the two lines of links to the date: the tops of the first-line words
// (Shipping, Terms, Insta) line up with the top of the clock's digits, and
// the bottom of the "y" in "Privacy" with the bottom of the digits. Measured from the real fonts in
// the browser (after they have loaded), and again when the window resizes.
const LINK_LINE_HEIGHT = 0.95; // line spacing of the links, in their own font size

function useFitLinksToDate(
  dateRef: React.RefObject<HTMLElement>,
  linksRef: React.RefObject<HTMLElement>
) {
  React.useLayoutEffect(() => {
    const ctx = document.createElement("canvas").getContext("2d");
    if (!ctx) return;

    const fit = () => {
      const dateEl = dateRef.current;
      const linksEl = linksRef.current;
      if (!dateEl || !linksEl) return;
      const dateStyle = getComputedStyle(dateEl);
      const D = parseFloat(dateStyle.fontSize);
      const linkFamily = getComputedStyle(linksEl).fontFamily;
      const linkWeight = getComputedStyle(linksEl.querySelector("a") ?? linksEl).fontWeight;

      // Date: where the digits' ink sits inside its one-line box (line height = D).
      ctx.font = `${D}px ${dateStyle.fontFamily}`;
      const digits = ctx.measureText("0123456789");
      const dBaseline = (D - (digits.fontBoundingBoxAscent + digits.fontBoundingBoxDescent)) / 2 + digits.fontBoundingBoxAscent;
      const dInkTop = dBaseline - digits.actualBoundingBoxAscent;
      const dInkBottom = dBaseline + digits.actualBoundingBoxDescent;

      // Links, measured at 100 px and scaled.
      ctx.font = `${linkWeight} 100px ${linkFamily}`;
      const top = ctx.measureText("Shipping Terms Insta");
      const bottom = ctx.measureText("Returns Privacy Contact");
      const cap = top.actualBoundingBoxAscent / 100;
      const desc = bottom.actualBoundingBoxDescent / 100;
      const fAsc = top.fontBoundingBoxAscent / 100;
      const fDesc = top.fontBoundingBoxDescent / 100;

      // Ink height of the two lines = one line step + cap height + descender.
      const L = (dInkBottom - dInkTop) / (LINK_LINE_HEIGHT + cap + desc);
      const lineH = LINK_LINE_HEIGHT * L;
      const lBaseline = (lineH - (fAsc + fDesc) * L) / 2 + fAsc * L;
      const lInkTop = lBaseline - cap * L;

      linksEl.style.fontSize = `${L}px`;
      linksEl.style.lineHeight = `${lineH}px`;
      // Both sit at the top of the same row on wide screens; shift the links
      // down so the ink tops line up. Stacked (narrow) layout: no shift.
      const wide = window.matchMedia("(min-width: 1024px)").matches;
      linksEl.style.marginTop = wide ? `${dInkTop - lInkTop}px` : "";
    };

    fit();
    document.fonts?.ready.then(fit);
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [dateRef, linksRef]);
}

const linkClass = "font-cormorant font-semibold text-[rgb(180,180,180)] hover:opacity-60 transition-opacity";

// Site-wide footer, at the bottom of every page (in normal document flow).
// Left: the live date and time in Stockholm. Middle: the info links.
// Right: "©" and the year. Date and year in the outlined blackletter display
// font; the links small, in Cormorant Garamond semibold.
export function SiteFooter() {
  const [now, setNow] = React.useState(stockholmNow);
  const dateRef = React.useRef<HTMLParagraphElement>(null);
  const linksRef = React.useRef<HTMLDivElement>(null);
  useFitLinksToDate(dateRef, linksRef);

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
    <footer className="relative z-10 w-full mt-32 sm:mt-48 px-4 sm:px-8 pb-6 sm:pb-8 flex flex-col gap-y-8 lg:grid lg:grid-cols-[minmax(40%,auto)_1fr_auto] lg:gap-x-12 lg:items-start text-black">
      <p ref={dateRef} className="blackletter-outline footer-date-size leading-none whitespace-nowrap">
        {now.date}{" "}
        <span className="ml-[0.35em]">
          {/* Each character gets a fixed width, so the clock is always equally
              wide and nothing next to it moves when the seconds change. */}
          {now.time.split("").map((ch, i) => (
            <span
              key={i}
              className="inline-block text-center"
              style={{ width: ch === ":" ? "0.3em" : "0.62em" }}
            >
              {ch}
            </span>
          ))}
        </span>
      </p>

      {/* Links in three columns. Size and position are set by useFitLinksToDate
          so the two lines span exactly the height of the clock's digits. */}
      <div ref={linksRef} className="flex gap-x-[2.5em] footer-link-half leading-none">
        <div className="flex flex-col">
          <Link to="/shipping" className={linkClass}>Shipping</Link>
          <Link to="/returns" className={linkClass}>Returns</Link>
        </div>
        <div className="flex flex-col">
          <Link to="/terms" className={linkClass}>Terms</Link>
          <Link to="/privacy" className={linkClass}>Privacy</Link>
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

      <p className="blackletter-outline footer-date-size leading-none whitespace-nowrap lg:text-right"><span className="text-[0.55em] align-[0.35em] mr-[0.08em]">©</span>{stockholmYear()}</p>
    </footer>
  );
}

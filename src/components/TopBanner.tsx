import * as React from "react";

// Thin banner across the very top of every page. Its text runs from right to
// left in a loop, like a ticker on a belt. The phrase is repeated twice inside
// the track, and the track moves exactly half its width, so the loop is seamless.
const PHRASE = "stuck in stuckholm";
const SEPARATOR = "  ✦  ";

export function TopBanner() {
  const unit = (PHRASE + SEPARATOR).repeat(6);
  return (
    <div
      role="marquee"
      aria-label={PHRASE}
      className="fixed inset-x-0 top-0 z-[25] h-7 overflow-hidden bg-[#8b2c35] text-[#e1c2d1] flex items-center"
    >
      <div className="flex w-max animate-marquee whitespace-nowrap text-xs uppercase tracking-wider">
        <span className="pr-0">{unit}</span>
        <span aria-hidden="true">{unit}</span>
      </div>
    </div>
  );
}

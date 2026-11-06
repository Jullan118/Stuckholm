import * as React from "react";
import { useLocation } from "react-router-dom";
import bannerText from "@/assets/banner-text.png?inline";

// Thin banner across the top of the category pages (/collections/...). The
// text is the drawn "Stuck in Stuckholm" lettering, used as a mask so it takes
// the banner's colour. The lettering runs right to left in a seamless loop.
export function isBannerPath(pathname: string): boolean {
  return pathname.startsWith("/collections/");
}

// One copy of the lettering is 422.5 x 20 px. The track holds two halves of
// identical width, and the animation moves it by exactly one half.
const UNIT_W = 422.5;
const UNIT_H = 20;
const UNITS_PER_HALF = 6;

export function TopBanner() {
  const { pathname } = useLocation();
  if (!isBannerPath(pathname)) return null;

  const unit: React.CSSProperties = {
    width: UNIT_W,
    height: UNIT_H,
    flexShrink: 0,
    backgroundColor: "#e1c2d1",
    WebkitMaskImage: `url(${bannerText})`,
    maskImage: `url(${bannerText})`,
    WebkitMaskSize: "100% 100%",
    maskSize: "100% 100%",
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
  };
  const half = Array.from({ length: UNITS_PER_HALF }, (_, i) => <span key={i} style={unit} />);

  return (
    <div
      role="marquee"
      aria-label="Stuck in Stuckholm"
      className="fixed inset-x-0 top-0 z-[25] h-7 overflow-hidden bg-[#8b2c35] flex items-center"
    >
      <div className="flex w-max animate-marquee">
        <div className="flex">{half}</div>
        <div className="flex" aria-hidden="true">{half}</div>
      </div>
    </div>
  );
}

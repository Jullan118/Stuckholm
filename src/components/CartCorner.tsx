import * as React from "react";
import { useLocation } from "react-router-dom";
import { useCart } from "@/lib/cart";

// Bag icon pinned to the top-right corner on every page, mirroring the
// mini globe logo in the top-left (see MiniGlobe). Shows how many items are
// in the cart and opens the cart drawer (CartDrawer).
// On the home page the hero is a dark starfield, so it switches to white
// there like the rest of the corner UI.
export function CartCorner() {
  const { pathname } = useLocation();
  const isHome = pathname === "/";
  const { totalQuantity, openCart } = useCart();

  return (
    <button
      type="button"
      onClick={openCart}
      className={`absolute top-4 right-4 z-20 flex items-center gap-1 transition-transform duration-200 hover:scale-110 ${
        isHome ? "text-white" : "text-black"
      }`}
      aria-label={`Cart, ${totalQuantity} item${totalQuantity === 1 ? "" : "s"}`}
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 8h12l-1 12.5a1 1 0 0 1-1 .9H8a1 1 0 0 1-1-.9L6 8Z" />
        <path d="M9 8V6a3 3 0 0 1 6 0v2" />
      </svg>
      <sup className="text-[11px] leading-none">{totalQuantity}</sup>
    </button>
  );
}

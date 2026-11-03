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
      className={`fixed top-5 right-24 sm:right-[8.5rem] z-20 transition-transform duration-200 hover:scale-110 ${
        isHome ? "text-white home-ink" : "text-black"
      }`}
      aria-label={`Cart, ${totalQuantity} item${totalQuantity === 1 ? "" : "s"}`}
    >
      Cart{totalQuantity > 0 ? ` (${totalQuantity})` : ""}
    </button>
  );
}

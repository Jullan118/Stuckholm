import { useLocation } from "react-router-dom";
import { CartCorner } from "@/components/CartCorner";
import { HouseHeader } from "@/components/HouseHeader";

// The header.
// Home page: only the cart icon (top right), white over the dark sky. The way
// in to the shop is clicking the globe (see StuckholmGlobe, "Enter" on hover).
// Every other page: the house on the grid, whose portals are the menu (see
// HouseHeader). The header is part of the page and scrolls away with it.
export function SiteHeader() {
  const { pathname } = useLocation();

  if (pathname === "/") {
    return <CartCorner />;
  }

  return <HouseHeader />;
}

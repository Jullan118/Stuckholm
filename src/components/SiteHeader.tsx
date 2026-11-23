import { CartCorner } from "@/components/CartCorner";
import { HouseHeader } from "@/components/HouseHeader";

// The header.
// Home page: only the cart icon (top right), white over the dark sky. The way
// in to the shop is clicking the globe (see StuckholmGlobe, "Enter" on hover).
// Every other page: the house on the grid, whose portals are the menu (see
// HouseHeader). The header is part of the page and scrolls away with it.
// pathname: the page shown (the list stays shown while a product panel is
// open over it).
export function SiteHeader({ pathname }: { pathname: string }) {
  if (pathname === "/") {
    return <CartCorner />;
  }

  return <HouseHeader pathname={pathname} />;
}

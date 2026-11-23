import { Link, useLocation } from "react-router-dom";
import { CATEGORIES } from "@/lib/categories";
import { useCart } from "@/lib/cart";
import { CartCorner } from "@/components/CartCorner";

// The header.
// Home page: only the cart icon (top right), white over the dark sky. The way
// in to the shop is clicking the globe (see StuckholmGlobe, "Enter" on hover).
// Every other page: the wordmark "Stuck in Stuckholm" top left (links home)
// and the menu top right: the shop categories, then "cart". Clicking a
// category opens its page and shows its sub-categories under it; they stay
// open while you are inside that category. The header is part of the page
// and scrolls away with it.
export function SiteHeader() {
  const { pathname } = useLocation();
  const { totalQuantity, openCart } = useCart();

  if (pathname === "/") {
    return (
      <>
        <CartCorner />
      </>
    );
  }

  // The collection in the URL, and the category it belongs to.
  const routeHandle = pathname.startsWith("/collections/")
    ? pathname.slice("/collections/".length)
    : null;
  const currentCategory = CATEGORIES.find(
    (c) => c.handle === routeHandle || c.children?.some((child) => child.handle === routeHandle)
  );

  return (
    <header className="relative z-20 w-full flex items-start justify-between gap-6 px-4 sm:px-8 pt-6 sm:pt-8 pb-8 sm:pb-12">
      <Link to="/" aria-label="Stuck in Stuckholm, home" className="blackletter-outline wordmark-size leading-none">
        Stuck in Stuckholm
      </Link>

      {/* Every line in the menu starts at the same left edge. */}
      <nav className="flex flex-col items-start text-left text-black pt-1 sm:pt-3">
        {CATEGORIES.map((cat) => {
          const isCurrent = currentCategory?.label === cat.label;
          return (
            <div key={cat.label} className="flex flex-col items-start">
              <Link
                to={`/collections/${cat.handle}`}
                aria-current={isCurrent && routeHandle === cat.handle ? "page" : undefined}
                className="uppercase text-sm sm:text-lg leading-snug hover:opacity-60 transition-opacity"
              >
                {cat.label}
              </Link>
              {isCurrent && cat.children && (
                <ul className="flex flex-col items-start pb-1 animate-blur-fade-in">
                  {cat.children.map((child) => (
                    <li key={child.label}>
                      <Link
                        to={`/collections/${child.handle}`}
                        aria-current={routeHandle === child.handle ? "page" : undefined}
                        className={`text-sm sm:text-base leading-snug hover:opacity-60 transition-opacity ${
                          routeHandle === child.handle ? "underline underline-offset-4 decoration-1" : ""
                        }`}
                      >
                        {child.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}

        <button
          type="button"
          onClick={openCart}
          aria-label={`Cart, ${totalQuantity} item${totalQuantity === 1 ? "" : "s"}`}
          className="mt-4 sm:mt-6 text-sm sm:text-lg leading-snug hover:opacity-60 transition-opacity"
        >
          cart{totalQuantity > 0 ? ` (${totalQuantity})` : ""}
        </button>
      </nav>
    </header>
  );
}

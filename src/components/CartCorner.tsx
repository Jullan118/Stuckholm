import { useCart } from "@/lib/cart";

// Bag icon in the top-right corner of the home page, white over the dark
// sky. Shows how many items are in the cart and opens the cart drawer
// (CartDrawer). Other pages have "cart" in the menu instead (see SiteHeader).
export function CartCorner() {
  const { totalQuantity, openCart } = useCart();

  return (
    <button
      type="button"
      onClick={openCart}
      className="fixed top-1 h-16 right-4 sm:right-8 z-20 flex items-center gap-1 transition-transform duration-200 hover:scale-110 text-white home-ink"
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

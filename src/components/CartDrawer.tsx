import * as React from "react";
import { Link } from "react-router-dom";
import { useCart } from "@/lib/cart";
import { formatMoney } from "@/lib/commerce";

// Slide-in cart panel from the right. Opens from the bag icon (CartCorner)
// and automatically after "Add to cart".
export function CartDrawer() {
  const { lines, isOpen, closeCart, updateQuantity, removeLine, subtotal, checkout } =
    useCart();

  // Close on Escape, and stop the page behind from scrolling while open.
  React.useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeCart();
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, closeCart]);

  return (
    <div
      className={`fixed inset-0 z-50 ${isOpen ? "" : "pointer-events-none"}`}
      aria-hidden={!isOpen}
    >
      <div
        onClick={closeCart}
        className={`absolute inset-0 bg-black/20 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      />

      <aside
        role="dialog"
        aria-label="Cart"
        className={`absolute right-0 top-0 h-full w-full sm:w-[420px] bg-white text-black border-l border-black/10 flex flex-col transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-black/10">
          <p className="text-xl">Cart</p>
          <button
            type="button"
            onClick={closeCart}
            className="text-2xl leading-none text-black/60 hover:text-black"
            aria-label="Close cart"
          >
            ×
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-black/50 px-5">
            Your cart is empty.
          </div>
        ) : (
          <ul className="flex-1 overflow-y-auto">
            {lines.map((line) => {
              const atMax =
                line.maxQuantity !== null && line.quantity >= line.maxQuantity;
              return (
                <li
                  key={line.merchandiseId}
                  className="flex gap-4 px-5 py-4 border-b border-black/10"
                >
                  <Link
                    to={line.href}
                    onClick={closeCart}
                    className="w-20 aspect-[4/5] shrink-0 bg-black/5 overflow-hidden"
                  >
                    {line.image && (
                      <img src={line.image} alt="" className="w-full h-full object-cover" />
                    )}
                  </Link>

                  <div className="flex-1 flex flex-col gap-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-3">
                      <Link
                        to={line.href}
                        onClick={closeCart}
                        className="font-skarp-thin truncate hover:underline"
                      >
                        {line.productTitle}
                      </Link>
                      <span className="text-black/60 whitespace-nowrap">
                        {formatMoney(line.price)}
                      </span>
                    </div>
                    {line.variantTitle && (
                      <p className="text-sm text-black/60">Size {line.variantTitle}</p>
                    )}

                    <div className="flex items-center justify-between mt-auto pt-2">
                      {line.maxQuantity === 1 ? (
                        <span className="text-sm text-black/50">One of a kind</span>
                      ) : (
                        <div className="flex items-center border border-black/30">
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(line.merchandiseId, line.quantity - 1)
                            }
                            className="w-8 h-8 hover:bg-black/5"
                            aria-label="Decrease quantity"
                          >
                            −
                          </button>
                          <span className="w-8 text-center">{line.quantity}</span>
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(line.merchandiseId, line.quantity + 1)
                            }
                            disabled={atMax}
                            className="w-8 h-8 hover:bg-black/5 disabled:opacity-30"
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => removeLine(line.merchandiseId)}
                        className="text-sm text-black/50 hover:text-black underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {lines.length > 0 && (
          <div className="px-5 py-5 border-t border-black/10 flex flex-col gap-3">
            {subtotal && (
              <div className="flex items-baseline justify-between">
                <span>Subtotal</span>
                <span>{subtotal}</span>
              </div>
            )}
            <p className="text-xs text-black/50">Shipping calculated at checkout.</p>
            <button
              type="button"
              onClick={checkout}
              className="w-full bg-black text-white py-3 hover:bg-black/80 transition-colors"
            >
              Checkout
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}

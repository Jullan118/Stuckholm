import * as React from "react";
import { useLocation, useParams } from "react-router-dom";
import { useCollectionProducts } from "@/lib/shopProducts";
import { ProductGrid } from "@/components/ProductGrid";
import { CONSUME_HANDLE } from "@/lib/categories";
import { parseSort, sortProducts } from "@/lib/sortProducts";
import { BlurredBackdrop } from "@/components/BlurredBackdrop";

// One Shopify collection as a product grid. /collections/all shows every
// product; /collections/apparel, /collections/descartes etc. show their own.
// Categories live in the header (see SiteHeader).
export function Consume() {
  const { handle = CONSUME_HANDLE } = useParams();
  const state = useCollectionProducts(handle);
  // The entrance (/collections/all, reached from Enter on the home page) is
  // fully blurred over the products; category pages show them on white.
  const isEntrance = handle === CONSUME_HANDLE;
  // With a product panel open, the address is the product's; the list keeps
  // the sort of the list address underneath (state.background).
  const location = useLocation();
  const shown = (location.state as { background?: { search: string } } | null)?.background ?? location;
  const sort = parseSort(shown.search);
  const products = React.useMemo(
    () => (state.status === "ready" ? sortProducts(state.data, handle, sort) : []),
    [state, handle, sort]
  );

  // While the next collection loads, hold the page at the height it had, so
  // the browser doesn't snap the scroll up when the list briefly empties.
  const boxRef = React.useRef<HTMLDivElement>(null);
  const lastHeight = React.useRef(0);
  React.useLayoutEffect(() => {
    if (state.status !== "loading" && boxRef.current) {
      lastHeight.current = boxRef.current.offsetHeight;
    }
  });

  return (
    <>
    <div
      ref={boxRef}
      className="relative z-10 w-full pt-0 pb-16 animate-blur-fade-in"
      style={state.status === "loading" && lastHeight.current ? { minHeight: lastHeight.current } : undefined}
    >
      {state.status === "loading" && <p className="text-center text-black/50 text-xs">Loading…</p>}
      {state.status === "error" && (
        <p className="text-center text-black/50 text-xs">
          Couldn't load products right now. Please try again soon.
        </p>
      )}
      {state.status === "ready" &&
        (state.data.length === 0 ? (
          <p className="text-center text-black/50 text-xs">No products yet.</p>
        ) : (
          <ProductGrid products={products} />
        ))}
    </div>
    {isEntrance && <BlurredBackdrop />}
    </>
  );
}

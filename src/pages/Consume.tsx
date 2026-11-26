import * as React from "react";
import { useParams } from "react-router-dom";
import { useCollectionProducts } from "@/lib/shopProducts";
import { ProductGrid } from "@/components/ProductGrid";
import { CATEGORIES, CONSUME_HANDLE } from "@/lib/categories";
import { BlurredBackdrop } from "@/components/BlurredBackdrop";

// One Shopify collection as a product grid. /collections/all shows every
// product; /collections/apparel, /collections/descartes etc. show their own.
// Categories live in the header (see SiteHeader).
// The 2nd hand collections are shown in a random order instead of newest
// first. The order is drawn once per visit (page load), so going back and
// forth between collections while browsing doesn't reshuffle everything.
const SECOND_HAND = CATEGORIES.find((c) => c.handle === "2ndhand");
const SHUFFLED_HANDLES = new Set([
  "2ndhand",
  ...(SECOND_HAND?.children ?? []).map((c) => c.handle),
]);
const VISIT_SEED = Math.floor(Math.random() * 2 ** 31);

function rank(id: string): number {
  // Small stable hash of (visit seed, product id).
  let h = VISIT_SEED ^ 0x9e3779b9;
  for (let i = 0; i < id.length; i++) {
    h = Math.imul(h ^ id.charCodeAt(i), 0x85ebca6b);
    h ^= h >>> 13;
  }
  return h >>> 0;
}

export function Consume() {
  const { handle = CONSUME_HANDLE } = useParams();
  const state = useCollectionProducts(handle);
  // The entrance (/collections/all, reached from Enter on the home page) is
  // fully blurred over the products; category pages show them on white.
  const isEntrance = handle === CONSUME_HANDLE;
  const products = React.useMemo(() => {
    if (state.status !== "ready") return [];
    if (!SHUFFLED_HANDLES.has(handle)) return state.data;
    return [...state.data].sort((a, b) => rank(a.id) - rank(b.id));
  }, [state, handle]);

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

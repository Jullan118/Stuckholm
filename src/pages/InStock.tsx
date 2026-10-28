import { useSearchParams } from "react-router-dom";
import { useShopProducts } from "@/lib/shopProducts";
import { ProductGrid } from "@/components/ProductGrid";

// Shopify collection handles. Make sure these match the handles in Shopify
// (a collection named "Artwork" gets the handle "artwork").
const CATEGORIES = [
  { handle: "clothing", label: "Clothing" },
  { handle: "artwork", label: "Artwork" },
] as const;

export function InStock() {
  const state = useShopProducts("in-stock");
  const [params, setParams] = useSearchParams();
  const active = CATEGORIES.find((c) => c.handle === params.get("category"))?.handle ?? null;

  return (
    <div className="relative z-10 w-full pt-24 pb-16">
      <nav className="flex justify-center gap-6 px-4 pb-8 text-base">
        <button
          type="button"
          onClick={() => setParams({})}
          className={active === null ? "underline underline-offset-4" : "text-black/50 hover:text-black"}
        >
          All
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c.handle}
            type="button"
            onClick={() => setParams({ category: c.handle })}
            className={
              active === c.handle ? "underline underline-offset-4" : "text-black/50 hover:text-black"
            }
          >
            {c.label}
          </button>
        ))}
      </nav>

      {state.status === "loading" && <p className="text-center text-black/50 text-sm">Loading…</p>}
      {state.status === "error" && (
        <p className="text-center text-black/50 text-sm">
          Couldn't load products right now. Please try again soon.
        </p>
      )}
      {state.status === "ready" &&
        (() => {
          const visible = active
            ? state.data.filter((p) => p.collections.includes(active))
            : state.data;
          if (visible.length === 0) {
            return <p className="text-center text-black/50 text-sm">No products yet.</p>;
          }
          return <ProductGrid products={visible} />;
        })()}
    </div>
  );
}

import { useShopProducts } from "@/lib/shopProducts";
import { ProductGrid } from "@/components/ProductGrid";

export function InStock() {
  const state = useShopProducts("in-stock");

  return (
    <div className="relative z-10 w-full pt-24 pb-16">
      {state.status === "loading" && <p className="text-center text-black/50 text-sm">Loading…</p>}
      {state.status === "error" && (
        <p className="text-center text-black/50 text-sm">
          Couldn't load products right now. Please try again soon.
        </p>
      )}
      {state.status === "ready" &&
        (state.data.length === 0 ? (
          <p className="text-center text-black/50 text-sm">No products yet.</p>
        ) : (
          <ProductGrid products={state.data} />
        ))}
    </div>
  );
}

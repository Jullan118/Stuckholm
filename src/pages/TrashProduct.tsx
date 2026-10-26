import { Link, useParams } from "react-router-dom";
import { ShopProductPage } from "@/components/ShopProductPage";
import { useShopProduct } from "@/lib/shopProducts";

export function TrashProduct() {
  const { slug } = useParams();
  const state = useShopProduct(slug);

  if (state.status === "loading") {
    return <p className="relative z-10 pt-28 text-center text-black/50 text-sm">Loading…</p>;
  }
  if (state.status === "error" || !state.data) {
    return (
      <div className="relative z-10 w-full max-w-3xl px-4 sm:px-8 pt-28 pb-16 text-center">
        <h1 className="text-3xl sm:text-4xl font-cormorant font-light text-black mb-6">
          {state.status === "error" ? "Couldn't load this item" : "Not found"}
        </h1>
        <Link to="/trash" className="text-black underline">
          Back to Trash
        </Link>
      </div>
    );
  }

  return <ShopProductPage product={state.data} backTo="/trash" backLabel="Trash" />;
}

import * as React from "react";
import { useCart } from "@/lib/cart";
import {
  findVariant,
  hasOnlyDefaultVariant,
  isOptionValueAvailable,
  isSoldOut,
  type CommerceProduct,
} from "@/lib/commerce";

// Size boxes (one row per product option) + full-width "Add to cart", shared
// by both product pages. Each size is a box; sold-out sizes are struck
// through and can't be picked. The picked box is filled black.
export function AddToCart({
  product,
  onVariantChange,
}: {
  product: CommerceProduct;
  onVariantChange?: (variantId: string | null) => void;
}) {
  const { addLine, quantityInCart } = useCart();
  const [selected, setSelected] = React.useState<Record<string, string>>({});
  const [error, setError] = React.useState(false);

  // Start fresh when switching to another product.
  React.useEffect(() => {
    setSelected({});
    setError(false);
  }, [product.id]);

  const variant = findVariant(product, selected);

  // Tell the page which colour/size is picked, so it can show that picture.
  React.useEffect(() => {
    onVariantChange?.(variant?.id ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variant?.id]);
  const soldOut = isSoldOut(product);
  const inCart = variant ? quantityInCart(variant.id) : 0;
  const reachedMax =
    variant?.quantityAvailable != null && inCart >= variant.quantityAvailable;

  function handleAdd() {
    if (!variant) {
      setError(true);
      return;
    }
    if (!variant.availableForSale || reachedMax) return;
    setError(false);
    addLine(product, variant);
  }

  let label = "Add to cart";
  if (soldOut) label = "Sold out";
  else if (reachedMax) label = "In your cart";

  const missing = product.options
    .filter((o) => !selected[o.name])
    .map((o) => o.name.toLowerCase());

  return (
    <div className="flex flex-col gap-3">
      {!hasOnlyDefaultVariant(product) &&
        product.options.map((option) => (
          <div key={option.name} className="flex flex-wrap gap-2">
            {option.values.map((value) => {
              const available = isOptionValueAvailable(product, selected, option.name, value);
              const picked = selected[option.name] === value;
              return (
                <button
                  key={value}
                  type="button"
                  disabled={!available || soldOut}
                  aria-pressed={picked}
                  aria-label={available ? value : `${value}, sold out`}
                  onClick={() => {
                    setSelected((s) => ({ ...s, [option.name]: value }));
                    setError(false);
                  }}
                  className={`min-w-[3rem] h-12 px-3 border text-xs transition-colors ${
                    picked
                      ? "bg-black text-white border-black"
                      : available
                      ? "border-black/30 text-black hover:border-black"
                      : "border-black/15 text-black/40 line-through cursor-not-allowed"
                  }`}
                >
                  {value}
                </button>
              );
            })}
          </div>
        ))}

      {error && (
        <p className="text-[#d51f26] text-xs">
          Pick a {missing.join(" and ") || "size"} first.
        </p>
      )}

      <button
        type="button"
        onClick={handleAdd}
        disabled={soldOut || reachedMax}
        className="w-full bg-black text-white px-6 py-3 transition-opacity hover:opacity-80 disabled:bg-black/30 disabled:cursor-not-allowed disabled:hover:opacity-100"
      >
        {label}
      </button>
    </div>
  );
}

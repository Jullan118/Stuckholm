import * as React from "react";
import { useCart } from "@/lib/cart";
import {
  findVariant,
  hasOnlyDefaultVariant,
  isOptionValueAvailable,
  isSoldOut,
  type CommerceProduct,
} from "@/lib/commerce";

// Option dropdown(s) + "Add to cart" button, shared by both product pages.
// Renders one <select> per product option (today just "Size"; a "Color"
// option from Shopify would get its own dropdown automatically). Sizes that
// are sold out stay visible but can't be picked.
export function AddToCart({ product }: { product: CommerceProduct }) {
  const { addLine, quantityInCart } = useCart();
  const [selected, setSelected] = React.useState<Record<string, string>>({});
  const [error, setError] = React.useState(false);

  // Start fresh when switching to another product.
  React.useEffect(() => {
    setSelected({});
    setError(false);
  }, [product.id]);

  const variant = findVariant(product, selected);
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
          <select
            key={option.name}
            value={selected[option.name] ?? ""}
            onChange={(e) => {
              setSelected((s) => ({ ...s, [option.name]: e.target.value }));
              setError(false);
            }}
            disabled={soldOut}
            className="border border-black/30 px-3 py-2 w-full max-w-[10rem] bg-white"
          >
            <option value="" disabled>
              {option.name}
            </option>
            {option.values.map((value) => {
              const available = isOptionValueAvailable(
                product,
                selected,
                option.name,
                value
              );
              return (
                <option key={value} value={value} disabled={!available}>
                  {available ? value : `${value} – sold out`}
                </option>
              );
            })}
          </select>
        ))}

      {error && (
        <p className="text-[#d51f26] text-sm -mt-1">
          Pick a {missing.join(" and ") || "size"} first.
        </p>
      )}

      <button
        type="button"
        onClick={handleAdd}
        disabled={soldOut || reachedMax}
        className="border border-black text-black px-6 py-2 w-fit hover:bg-black hover:text-white transition-colors disabled:border-black/30 disabled:text-black/40 disabled:hover:bg-transparent disabled:cursor-not-allowed"
      >
        {label}
      </button>
    </div>
  );
}

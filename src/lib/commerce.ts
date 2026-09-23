// Shop data model, shaped like Shopify's Storefront API on purpose.
//
// Today every product still comes from Supabase (Flame = In Stock,
// Garment = Trash) and gets converted into this shape by the two adapters
// at the bottom. When the shop moves to Shopify, only those adapters get
// replaced by a Storefront API fetch. The product pages, size dropdown and
// cart all read this shape and shouldn't need to change.
//
// Shopify terms, for reference:
//   product  → has `options` (e.g. Size: S, M, L) and `variants`
//   variant  → one buyable combination (e.g. "M"), with its own id, price and
//              stock. The variant id is what goes into the cart
//              (cartLinesAdd → merchandiseId).
import type { Flame } from "@/lib/flames";
import { formatPrice, type Garment } from "@/lib/garments";

export type Money = {
  amount: number;
  currencyCode: string; // ISO code like Shopify uses: SEK, EUR, USD, GBP
};

export type ProductOption = {
  name: string; // e.g. "Size"
  values: string[]; // e.g. ["S", "M", "L"], in display order
};

export type ProductVariant = {
  id: string; // becomes a Shopify ProductVariant gid later
  title: string; // "M", or "Default Title" when a product has no options
  selectedOptions: { name: string; value: string }[];
  availableForSale: boolean;
  quantityAvailable: number | null; // null = no stock limit known
  price: Money | null;
};

export type CommerceProduct = {
  id: string;
  handle: string; // slug, same as Shopify's product handle
  title: string;
  href: string; // where the product page lives on this site
  image: string;
  options: ProductOption[]; // empty = no pickers shown
  variants: ProductVariant[];
};

export const DEFAULT_VARIANT_TITLE = "Default Title";

// ---------------------------------------------------------------------------
// Money

const CURRENCY_CODES: Record<string, string> = {
  kr: "SEK",
  sek: "SEK",
  "€": "EUR",
  $: "USD",
  "£": "GBP",
};

const CURRENCY_DISPLAY: Record<string, string> = {
  SEK: "kr",
  EUR: "€",
  USD: "$",
  GBP: "£",
};

function toMoney(amount: number | null, currency: string): Money | null {
  if (amount === null || Number.isNaN(amount)) return null;
  return { amount, currencyCode: CURRENCY_CODES[currency] ?? currency.toUpperCase() };
}

export function formatMoney(money: Money | null): string {
  if (!money) return "";
  const symbol = CURRENCY_DISPLAY[money.currencyCode] ?? money.currencyCode;
  return formatPrice(money.amount, symbol);
}

// Sum of several prices. Normally everything is in one currency; if not,
// each currency gets its own total ("300 kr + 20 €").
export function formatTotal(items: { price: Money | null; quantity: number }[]): string {
  const totals = new Map<string, number>();
  for (const { price, quantity } of items) {
    if (!price) continue;
    totals.set(price.currencyCode, (totals.get(price.currencyCode) ?? 0) + price.amount * quantity);
  }
  return Array.from(totals, ([currencyCode, amount]) =>
    formatMoney({ amount, currencyCode })
  ).join(" + ");
}

// ---------------------------------------------------------------------------
// Variant helpers (used by the option dropdowns)

export function hasOnlyDefaultVariant(product: CommerceProduct): boolean {
  return product.options.length === 0;
}

// The variant matching every chosen option value, or null if something
// isn't chosen yet.
export function findVariant(
  product: CommerceProduct,
  selected: Record<string, string>
): ProductVariant | null {
  if (hasOnlyDefaultVariant(product)) return product.variants[0] ?? null;
  return (
    product.variants.find((v) =>
      v.selectedOptions.every((o) => selected[o.name] === o.value)
    ) ?? null
  );
}

// Can this option value still be bought, given what's chosen in the *other*
// options? Used to grey out sold-out sizes in the dropdown.
export function isOptionValueAvailable(
  product: CommerceProduct,
  selected: Record<string, string>,
  optionName: string,
  value: string
): boolean {
  return product.variants.some(
    (v) =>
      v.availableForSale &&
      v.selectedOptions.every((o) =>
        o.name === optionName ? o.value === value : !selected[o.name] || selected[o.name] === o.value
      )
  );
}

export function isSoldOut(product: CommerceProduct): boolean {
  return product.variants.every((v) => !v.availableForSale);
}

// ---------------------------------------------------------------------------
// Adapters: current Supabase data → shop shape.
// Replace these with a Shopify fetch when the store is set up.

export function productFromFlame(flame: Flame): CommerceProduct {
  const price = toMoney(flame.priceAmount, flame.priceCurrency);
  const base = {
    id: `flame:${flame.slug}`,
    handle: flame.slug,
    title: flame.name,
    href: `/off-the-shelf/${flame.slug}`,
    image: flame.images[0] ?? flame.image,
  };

  if (flame.sizes.length === 0) {
    return {
      ...base,
      options: [],
      variants: [
        {
          id: `${base.id}`,
          title: DEFAULT_VARIANT_TITLE,
          selectedOptions: [],
          availableForSale: true,
          quantityAvailable: null,
          price,
        },
      ],
    };
  }

  return {
    ...base,
    options: [{ name: "Size", values: flame.sizes }],
    // Supabase doesn't track stock per size, so every listed size counts as
    // in stock for now. Shopify will fill in availableForSale per size.
    variants: flame.sizes.map((size) => ({
      id: `${base.id}:${size}`,
      title: size,
      selectedOptions: [{ name: "Size", value: size }],
      availableForSale: true,
      quantityAvailable: null,
      price,
    })),
  };
}

// Secondhand garments are one-offs: a single variant, one in stock.
export function productFromGarment(garment: Garment): CommerceProduct {
  const id = `garment:${garment.slug}`;
  return {
    id,
    handle: garment.slug,
    title: garment.name,
    href: `/trash/${garment.slug}`,
    image: garment.images[0] ?? garment.image,
    options: [],
    variants: [
      {
        id,
        title: DEFAULT_VARIANT_TITLE,
        selectedOptions: [],
        availableForSale: true,
        quantityAvailable: 1,
        price: toMoney(garment.priceAmount, garment.priceCurrency),
      },
    ],
  };
}

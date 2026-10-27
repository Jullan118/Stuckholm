// Products from Shopify, in the shape the shop pages use.
//
// How products are sorted in Shopify (set in the Shopify admin, as tags):
//   "trash"          → a secondhand piece, shown on /trash
//   anything else    → a new piece, shown on /in-stock
//   "scale:-2" … "scale:2" → feminine (-2) … masculine (2) for the Trash filter
//   "brand:X", "colour:X", "condition:X" → shown on the product page
// The vendor field is the seller name for Trash pieces.
import * as React from "react";
import { fetchAllProducts, fetchProductByHandle, type ShopifyProduct } from "@/lib/shopify";
import { DEFAULT_VARIANT_TITLE, formatMoney, type CommerceProduct, type Money } from "@/lib/commerce";
import { GENDER_SCALE_MAX, GENDER_SCALE_MIN } from "@/lib/garments";

export type ShopProduct = CommerceProduct & {
  variantImages: Record<string, string>; // variant id -> image url
  description: string;
  vendor: string;
  images: string[];
  isTrash: boolean;
  genderScale: number | null;
  brand: string | null;
  colour: string | null;
  condition: string | null;
  priceText: string; // lowest variant price, formatted ("350 kr")
};

function tagValue(tags: string[], key: string): string | null {
  const prefix = `${key}:`;
  const tag = tags.find((t) => t.toLowerCase().startsWith(prefix));
  return tag ? tag.slice(prefix.length).trim() || null : null;
}

function toMoney(price: { amount: string; currencyCode: string } | null): Money | null {
  if (!price) return null;
  const amount = Number(price.amount);
  return Number.isNaN(amount) ? null : { amount, currencyCode: price.currencyCode };
}

function genderScaleFrom(tags: string[]): number | null {
  const raw = tagValue(tags, "scale");
  if (raw === null) return null;
  const n = Number(raw);
  return Number.isInteger(n) && n >= GENDER_SCALE_MIN && n <= GENDER_SCALE_MAX ? n : null;
}

export function productFromShopify(p: ShopifyProduct): ShopProduct {
  const isTrash = p.tags.some((t) => t.toLowerCase() === "trash");
  const variants = p.variants.nodes.map((v) => ({
    id: v.id,
    title: v.title,
    selectedOptions: v.selectedOptions,
    availableForSale: v.availableForSale,
    // The token has no access to stock counts, so no limit is shown.
    quantityAvailable: null,
    price: toMoney(v.price),
  }));
  const images = p.images.nodes.map((n) => n.url);
  const image = p.featuredImage?.url ?? images[0] ?? "";
  const prices = variants
    .map((v) => v.price)
    .filter((m): m is Money => m !== null)
    .sort((a, b) => a.amount - b.amount);

  return {
    id: p.id,
    handle: p.handle,
    title: p.title,
    href: `${isTrash ? "/trash" : "/in-stock"}/${p.handle}`,
    image,
    // Shopify's placeholder option ("Title: Default Title") isn't a real choice.
    options: p.options
      .filter((o) => o.name !== "Title")
      .map((o) => ({ name: o.name, values: o.values })),
    variantImages: Object.fromEntries(
      p.variants.nodes.flatMap((v) => (v.image?.url ? [[v.id, v.image.url]] : []))
    ),
    variants: variants.length
      ? variants
      : [
          {
            id: p.id,
            title: DEFAULT_VARIANT_TITLE,
            selectedOptions: [],
            availableForSale: false,
            quantityAvailable: null,
            price: null,
          },
        ],
    description: p.description,
    vendor: p.vendor,
    images: images.length ? images : [image].filter(Boolean),
    isTrash,
    genderScale: genderScaleFrom(p.tags),
    brand: tagValue(p.tags, "brand"),
    colour: tagValue(p.tags, "colour"),
    condition: tagValue(p.tags, "condition"),
    priceText: prices[0] ? formatMoney(prices[0]) : "",
  };
}

// One request per page load, shared by the listing pages.
let productsPromise: Promise<ShopProduct[]> | null = null;

function loadProducts(): Promise<ShopProduct[]> {
  if (!productsPromise) {
    productsPromise = fetchAllProducts()
      .then((list) => list.map(productFromShopify))
      .catch((err) => {
        productsPromise = null; // let the next visit try again
        throw err;
      });
  }
  return productsPromise;
}

export type LoadState<T> =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; data: T };

// All products of one kind: "trash" for secondhand, "in-stock" for new.
export function useShopProducts(kind: "trash" | "in-stock"): LoadState<ShopProduct[]> {
  const [state, setState] = React.useState<LoadState<ShopProduct[]>>({ status: "loading" });

  React.useEffect(() => {
    let cancelled = false;
    loadProducts()
      .then((all) => {
        if (!cancelled) {
          setState({ status: "ready", data: all.filter((p) => p.isTrash === (kind === "trash")) });
        }
      })
      .catch(() => {
        if (!cancelled) setState({ status: "error" });
      });
    return () => {
      cancelled = true;
    };
  }, [kind]);

  return state;
}

// One product by its handle (the URL slug). `null` data = not found.
export function useShopProduct(handle: string | undefined): LoadState<ShopProduct | null> {
  const [state, setState] = React.useState<LoadState<ShopProduct | null>>({ status: "loading" });

  React.useEffect(() => {
    if (!handle) return;
    let cancelled = false;
    setState({ status: "loading" });
    fetchProductByHandle(handle)
      .then((p) => {
        if (!cancelled) setState({ status: "ready", data: p ? productFromShopify(p) : null });
      })
      .catch(() => {
        if (!cancelled) setState({ status: "error" });
      });
    return () => {
      cancelled = true;
    };
  }, [handle]);

  return state;
}

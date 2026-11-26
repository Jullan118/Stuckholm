// Sorting of a collection's products. The choice lives in the address
// (?sort=newest etc.), so it stays when you move between sub-categories and
// a link can be shared.
import { CATEGORIES } from "@/lib/categories";
import type { ShopProduct } from "@/lib/shopProducts";

export type SortKey = "default" | "newest" | "price-asc" | "price-desc";

// Only the 2nd hand collections have the Filter (sort) menu.
const SECOND_HAND = CATEGORIES.find((c) => c.label === "2ndhand");
const FILTER_HANDLES = new Set([
  SECOND_HAND?.handle ?? "",
  ...(SECOND_HAND?.children ?? []).map((c) => c.handle),
]);

export function hasFilter(handle: string): boolean {
  return FILTER_HANDLES.has(handle);
}

export function sortOptions(): { key: SortKey; label: string }[] {
  return [
    // "default" = the order set for the collection in Shopify.
    { key: "default", label: "Featured" },
    { key: "newest", label: "Newest" },
    { key: "price-asc", label: "Price low–high" },
    { key: "price-desc", label: "Price high–low" },
  ];
}

export function parseSort(search: string): SortKey {
  const v = new URLSearchParams(search).get("sort");
  return v === "newest" || v === "price-asc" || v === "price-desc" ? v : "default";
}

export function sortProducts(list: ShopProduct[], handle: string, sort: SortKey): ShopProduct[] {
  const out = [...list];
  // Only the 2nd hand collections can be re-sorted; others keep Shopify's order.
  if (!hasFilter(handle)) return out;
  // Products without a price go last in both price orders.
  const price = (p: ShopProduct, missing: number) => p.minPrice ?? missing;
  switch (sort) {
    case "newest":
      return out.sort((a, b) => b.createdAt - a.createdAt);
    case "price-asc":
      return out.sort((a, b) => price(a, Infinity) - price(b, Infinity));
    case "price-desc":
      return out.sort((a, b) => price(b, -Infinity) - price(a, -Infinity));
    default:
      return out;
  }
}

// The address to go to for a given sort, keeping the rest of the query.
export function withSort(search: string, sort: SortKey): string {
  const params = new URLSearchParams(search);
  if (sort === "default") params.delete("sort");
  else params.set("sort", sort);
  const q = params.toString();
  return q ? `?${q}` : "";
}

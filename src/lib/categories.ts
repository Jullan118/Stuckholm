// Category menu shown in the header on collection pages (/collections/...).
// Each `handle` is the Shopify collection handle (the URL name). Please check
// these match your collections exactly; Shopify makes a handle from the title
// (lowercase, spaces become hyphens) unless you changed it.
// Clicking a category or sub-category opens /collections/<handle>. Sub-categories
// appear directly under their parent when it is hovered or clicked.
export type Category = {
  label: string;
  handle: string;
  children?: { label: string; handle: string }[];
};

export const CONSUME_HANDLE = "all"; // Shopify's built-in "all products" collection

export const CATEGORIES: Category[] = [
  {
    label: "Apparel",
    handle: "apparel",
    children: [
      { label: "Descartes", handle: "descartes" },
      { label: "Stuck Royale", handle: "stuck-royale" },
      { label: "Stuck in Stuckholm", handle: "stuck-in-stuckholm" },
      { label: "Breturn", handle: "breturn" },
    ],
  },
  { label: "Artwork", handle: "artwork" },
  {
    label: "2ndhand",
    handle: "2ndhand",
    children: [{ label: "Chasmere Corner", handle: "chasmere-corner" }],
  },
];

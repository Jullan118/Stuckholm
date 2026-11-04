// Category menu shown in the header on collection pages (/collections/...).
// Each `handle` is the Shopify collection handle (the URL name). These are
// placeholders for the preview: once the real collections exist in Shopify,
// check that each handle matches its collection exactly (Shopify makes a
// handle from the title: lowercase, spaces become hyphens, unless changed).
// Clicking a category opens /collections/<handle>.
export type Category = {
  label: string;
  handle: string;
  children?: { label: string; handle: string }[];
};

export const CONSUME_HANDLE = "all"; // Shopify's built-in "all products" collection

export const CATEGORIES: Category[] = [
  { label: "Apparel", handle: "apparel" },
  { label: "Artwork", handle: "artwork" },
  { label: "2nd Hand", handle: "preloved" },
  { label: "E01", handle: "e01" },
];

// The shop menu shown in the header (see SiteHeader).
// Each `handle` is the Shopify collection handle (the URL name). Check that
// each handle matches its collection in Shopify exactly (Shopify makes a
// handle from the title: lowercase, spaces become hyphens, unless changed).
// Clicking a category opens /collections/<handle> and shows its
// sub-categories under it in the menu.
export type Category = {
  label: string;
  handle: string;
  children?: { label: string; handle: string }[];
};

export const CONSUME_HANDLE = "all"; // Shopify's built-in "all products" collection

export const CATEGORIES: Category[] = [
  {
    // "Collections" is the new name for Apparel; the Shopify collection is
    // still called apparel.
    label: "Collections",
    handle: "apparel",
    children: [
      // "All" is the apparel collection itself.
      { label: "All", handle: "apparel" },
      { label: "Descartes", handle: "descartes" },
      { label: "Stuckholm", handle: "stuckholm" },
      { label: "Stuck Royale", handle: "stuck-royale" },
    ],
  },
  {
    label: "Artwork",
    handle: "artwork",
    children: [
      // "All" is the artwork collection itself.
      { label: "All", handle: "artwork" },
      { label: "Wicked problems", handle: "wicked-problems" },
    ],
  },
  {
    label: "2ndhand",
    handle: "2ndhand",
    children: [
      // "all" is the built-in all-products collection, so this one gets its own handle.
      { label: "All", handle: "2ndhand-all" },
      { label: "Accessories", handle: "accessories" },
      { label: "Cashmere Corner", handle: "cashmere-corner" },
    ],
  },
];

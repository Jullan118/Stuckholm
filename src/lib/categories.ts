// Category menu shown in the header next to "Consume" on the /consume page.
// Sub-categories appear directly under their parent when it is hovered or
// clicked, running to the right. Items without a `to` are plain text until
// their destination is decided.
export type Category = {
  label: string;
  to?: string;
  children?: { label: string; to?: string }[];
};

export const CATEGORIES: Category[] = [
  {
    label: "Apparel",
    children: [
      { label: "Descartes" },
      { label: "Stuck Royale" },
      { label: "Stuck in Stuckholm" },
      { label: "Breturn" },
    ],
  },
  { label: "Artwork" },
  {
    label: "2ndhand",
    to: "/trash",
    children: [{ label: "Chasmere Corner" }],
  },
];

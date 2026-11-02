// Category menu shown in the header next to "Consume" on the /consume page.
// Items without a `to` are plain text until their destination is decided.
export type Category = {
  label: string;
  to?: string;
  children?: { label: string; to?: string }[];
};

export const CATEGORIES: Category[] = [
  {
    label: "Apparel",
    children: [
      { label: "Descarte 1" },
      { label: "Descartes 2" },
      { label: "Stuck Royale" },
      { label: "Stuck in Stuckholm" },
      { label: "Breturn" },
    ],
  },
  { label: "Artworks" },
  { label: "2ndHand", to: "/trash" },
  { label: "Candels" },
];

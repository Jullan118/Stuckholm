import * as React from "react";
import { Link } from "react-router-dom";

// Category index behind the single "Consume" header link.
// Items without a `to` are shown as plain text until their destination is decided.
type Category = {
  label: string;
  to?: string;
  children?: { label: string; to?: string }[];
};

const CATEGORIES: Category[] = [
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

export function Consume() {
  return (
    <div className="relative z-10 w-full max-w-3xl px-4 sm:px-8 pt-28 pb-16">
      <ul className="font-manrope text-black text-2xl sm:text-3xl font-light space-y-8">
        {CATEGORIES.map((cat) => (
          <li key={cat.label}>
            {cat.to ? (
              <Link to={cat.to} className="inline-block hover:opacity-60 transition-opacity">
                {cat.label}
              </Link>
            ) : (
              <span>{cat.label}</span>
            )}

            {cat.children && (
              <ul className="mt-3 ml-4 space-y-2 text-lg sm:text-xl text-black/70">
                {cat.children.map((child) => (
                  <li key={child.label}>
                    {child.to ? (
                      <Link to={child.to} className="hover:text-black transition-colors">
                        {child.label}
                      </Link>
                    ) : (
                      <span>{child.label}</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

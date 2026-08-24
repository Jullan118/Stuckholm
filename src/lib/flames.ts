import { CURRENCIES, type Currency, formatPrice } from "@/lib/garments";

export { CURRENCIES };
export type { Currency };

export const MAX_IMAGES = 8;
export const SHORT_DESCRIPTION_MAX = 60;

export type Flame = {
  slug: string;
  name: string;
  image: string; // primary/thumbnail image (first of `images`)
  images: string[]; // all images for this item, up to MAX_IMAGES
  shortDescription: string;
  details: string;
  sellerName: string;
  price: string; // formatted for display, e.g. "400 sek"
  priceAmount: number | null;
  priceCurrency: Currency;
  colorCount: number | null;
  ownerId: string | null; // Supabase auth user id of whoever posted this item
};

// Shape of a row in the Supabase "flames" table.
export type FlameRow = {
  slug: string;
  name: string;
  image_url: string | null;
  image_urls: string[] | null;
  short_description: string;
  details: string;
  seller_name: string | null;
  price: string;
  price_amount: number | null;
  price_currency: string | null;
  color_count: number | null;
  owner_id: string | null;
};

export function formatColorCount(count: number | null): string {
  if (count === null || Number.isNaN(count)) return "";
  return count === 1 ? "1 color" : `${count} colors`;
}

export function flameFromRow(row: FlameRow): Flame {
  const priceCurrency = (row.price_currency as Currency) || "sek";
  const price =
    row.price_amount !== null && row.price_amount !== undefined
      ? formatPrice(row.price_amount, priceCurrency)
      : row.price || "";

  const images =
    row.image_urls && row.image_urls.length > 0
      ? row.image_urls
      : row.image_url
        ? [row.image_url]
        : [];

  return {
    slug: row.slug,
    name: row.name,
    image: images[0] ?? "",
    images,
    shortDescription: row.short_description,
    details: row.details,
    sellerName: row.seller_name ?? "",
    price,
    priceAmount: row.price_amount ?? null,
    priceCurrency,
    colorCount: row.color_count ?? null,
    ownerId: row.owner_id ?? null,
  };
}

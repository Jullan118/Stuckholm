export const SHORT_DESCRIPTION_MAX = 60;
export const MAX_IMAGES = 8;

export const CURRENCIES = ["kr", "sek", "€", "$", "£"] as const;
export type Currency = (typeof CURRENCIES)[number];

export type Garment = {
  slug: string;
  name: string;
  image: string; // primary/thumbnail image (first of `images`)
  images: string[]; // all images for this garment, up to MAX_IMAGES
  brand: string;
  colour: string;
  condition: string;
  shortDescription: string;
  details: string;
  sellerName: string;
  price: string; // formatted for display, e.g. "299 kr"
  priceAmount: number | null;
  priceCurrency: Currency;
  ownerId: string | null; // Supabase auth user id of whoever posted this garment
};

// Shape of a row in the Supabase "garments" table.
export type GarmentRow = {
  slug: string;
  name: string;
  image_url: string | null;
  image_urls: string[] | null;
  brand: string | null;
  colour: string | null;
  condition: string | null;
  short_description: string;
  details: string;
  seller_name: string | null;
  price: string;
  price_amount: number | null;
  price_currency: string | null;
  owner_id: string | null;
};

export function formatPrice(amount: number | null, currency: string): string {
  if (amount === null || Number.isNaN(amount)) return "";
  // Trim trailing ".00" for whole numbers, keep decimals otherwise.
  const amountStr = Number.isInteger(amount) ? String(amount) : amount.toFixed(2);
  return `${amountStr} ${currency}`;
}

export function garmentFromRow(row: GarmentRow): Garment {
  const priceCurrency = (row.price_currency as Currency) || "kr";
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
    brand: row.brand ?? "",
    colour: row.colour ?? "",
    condition: row.condition ?? "",
    shortDescription: row.short_description,
    details: row.details,
    sellerName: row.seller_name ?? "",
    price,
    priceAmount: row.price_amount ?? null,
    priceCurrency,
    ownerId: row.owner_id ?? null,
  };
}

export type Garment = {
  slug: string;
  name: string;
  image: string;
  shortDescription: string;
  price: string;
  details: string;
};

// Shape of a row in the Supabase "garments" table.
export type GarmentRow = {
  slug: string;
  name: string;
  image_url: string;
  short_description: string;
  price: string;
  details: string;
};

export function garmentFromRow(row: GarmentRow): Garment {
  return {
    slug: row.slug,
    name: row.name,
    image: row.image_url,
    shortDescription: row.short_description,
    price: row.price,
    details: row.details,
  };
}

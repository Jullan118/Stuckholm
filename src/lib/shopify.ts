// Shopify Storefront API client. Products, the cart and checkout all go
// through here. The Storefront token is designed to be public (it ships to
// the browser), so it's fine to keep it in the code. Never put the Admin
// API token here.
export const SHOPIFY_DOMAIN = "gep71c-cb.myshopify.com";
const STOREFRONT_TOKEN = "ecca2b01359e9c1fa73a96f2918c92cd";
const API_VERSION = "2025-01";
const ENDPOINT = `https://${SHOPIFY_DOMAIN}/api/${API_VERSION}/graphql.json`;

export async function storefront<T>(
  query: string,
  variables: Record<string, unknown> = {}
): Promise<T> {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": STOREFRONT_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`Shopify request failed (${res.status})`);
  const json = (await res.json()) as { data?: T; errors?: { message: string }[] };
  if (json.errors?.length) throw new Error(json.errors[0].message);
  if (!json.data) throw new Error("Shopify returned no data");
  return json.data;
}

// ---------------------------------------------------------------------------
// Products

const VARIANT_FIELDS = `
  id
  title
  availableForSale
  price { amount currencyCode }
  selectedOptions { name value }
  image { url }
`;

export const PRODUCT_FIELDS = `
  id
  handle
  title
  description
  vendor
  tags
  featuredImage { url altText }
  images(first: 10) { nodes { url altText } }
  options { name values }
  collections(first: 20) { nodes { handle } }
  variants(first: 100) { nodes { ${VARIANT_FIELDS} } }
`;

export type ShopifyMoney = { amount: string; currencyCode: string };

export type ShopifyVariant = {
  id: string;
  title: string;
  availableForSale: boolean;
  price: ShopifyMoney;
  selectedOptions: { name: string; value: string }[];
  image: { url: string } | null;
};

export type ShopifyProduct = {
  id: string;
  handle: string;
  title: string;
  description: string;
  vendor: string;
  tags: string[];
  featuredImage: { url: string; altText: string | null } | null;
  images: { nodes: { url: string; altText: string | null }[] };
  options: { name: string; values: string[] }[];
  collections: { nodes: { handle: string }[] };
  variants: { nodes: ShopifyVariant[] };
};

// Up to 250 products is plenty for this shop. Pagination can be added later.
export async function fetchAllProducts(): Promise<ShopifyProduct[]> {
  const data = await storefront<{ products: { nodes: ShopifyProduct[] } }>(
    `query Products {
      products(first: 250, sortKey: CREATED_AT, reverse: true) {
        nodes { ${PRODUCT_FIELDS} }
      }
    }`
  );
  return data.products.nodes;
}

export async function fetchProductByHandle(handle: string): Promise<ShopifyProduct | null> {
  const data = await storefront<{ product: ShopifyProduct | null }>(
    `query ProductByHandle($handle: String!) {
      product(handle: $handle) { ${PRODUCT_FIELDS} }
    }`,
    { handle }
  );
  return data.product;
}

// ---------------------------------------------------------------------------
// Cart

const CART_FIELDS = `
  id
  checkoutUrl
  totalQuantity
  cost { subtotalAmount { amount currencyCode } }
  lines(first: 100) {
    nodes {
      id
      quantity
      merchandise {
        ... on ProductVariant {
          id
          title
          price { amount currencyCode }
          image { url altText }
          product { handle title tags }
        }
      }
    }
  }
`;

export type ShopifyCartLine = {
  id: string;
  quantity: number;
  merchandise: {
    id: string;
    title: string;
    price: ShopifyMoney;
    image: { url: string; altText: string | null } | null;
    product: { handle: string; title: string; tags: string[] };
  };
};

export type ShopifyCart = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: { subtotalAmount: ShopifyMoney };
  lines: { nodes: ShopifyCartLine[] };
};

type CartPayload = { cart: ShopifyCart | null; userErrors: { message: string }[] };

function cartResult(payload: CartPayload): ShopifyCart {
  if (payload.userErrors.length) throw new Error(payload.userErrors[0].message);
  if (!payload.cart) throw new Error("Cart could not be updated");
  return payload.cart;
}

export async function fetchCart(cartId: string): Promise<ShopifyCart | null> {
  const data = await storefront<{ cart: ShopifyCart | null }>(
    `query Cart($id: ID!) { cart(id: $id) { ${CART_FIELDS} } }`,
    { id: cartId }
  );
  return data.cart;
}

export async function createCart(lines: { merchandiseId: string; quantity: number }[]) {
  const data = await storefront<{ cartCreate: CartPayload }>(
    `mutation CartCreate($input: CartInput!) {
      cartCreate(input: $input) {
        cart { ${CART_FIELDS} }
        userErrors { message }
      }
    }`,
    { input: { lines } }
  );
  return cartResult(data.cartCreate);
}

export async function addCartLines(
  cartId: string,
  lines: { merchandiseId: string; quantity: number }[]
) {
  const data = await storefront<{ cartLinesAdd: CartPayload }>(
    `mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) {
        cart { ${CART_FIELDS} }
        userErrors { message }
      }
    }`,
    { cartId, lines }
  );
  return cartResult(data.cartLinesAdd);
}

// Quantity 0 removes the line.
export async function updateCartLines(
  cartId: string,
  lines: { id: string; quantity: number }[]
) {
  const data = await storefront<{ cartLinesUpdate: CartPayload }>(
    `mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
      cartLinesUpdate(cartId: $cartId, lines: $lines) {
        cart { ${CART_FIELDS} }
        userErrors { message }
      }
    }`,
    { cartId, lines }
  );
  return cartResult(data.cartLinesUpdate);
}

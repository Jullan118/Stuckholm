// The shopping cart, shared by the whole site through React context.
//
// Right now the cart lives in the visitor's browser (localStorage) and
// "Checkout" sends the order by email. When Shopify is connected, the same
// functions will call Shopify's Cart API instead (cartCreate / cartLinesAdd /
// cartLinesUpdate / cartLinesRemove), and checkout() will redirect to the
// cart's checkoutUrl. Components only use useCart(), so they stay unchanged.
import * as React from "react";
import {
  DEFAULT_VARIANT_TITLE,
  formatMoney,
  formatTotal,
  type CommerceProduct,
  type Money,
  type ProductVariant,
} from "@/lib/commerce";

// Where orders go until Shopify checkout is live.
export const ORDER_EMAIL = "hello.stuckholm@gmail.com";

const STORAGE_KEY = "stuckholm-cart-v1";

export type CartLine = {
  merchandiseId: string; // the variant id (Shopify: cartLinesAdd merchandiseId)
  quantity: number;
  productTitle: string;
  variantTitle: string; // "M", or "" when the product has no options
  href: string;
  image: string;
  price: Money | null;
  maxQuantity: number | null; // null = no limit known
};

type CartContextValue = {
  lines: CartLine[];
  totalQuantity: number;
  subtotal: string;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addLine: (product: CommerceProduct, variant: ProductVariant, quantity?: number) => void;
  updateQuantity: (merchandiseId: string, quantity: number) => void;
  removeLine: (merchandiseId: string) => void;
  quantityInCart: (merchandiseId: string) => number;
  checkout: () => void;
};

const CartContext = React.createContext<CartContextValue | null>(null);

function loadLines(): CartLine[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveLines(lines: CartLine[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  } catch {
    // Private mode / blocked storage: the cart still works for this visit.
  }
}

function clampQuantity(quantity: number, max: number | null) {
  const q = Math.max(0, Math.floor(quantity));
  return max === null ? q : Math.min(q, max);
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = React.useState<CartLine[]>(loadLines);
  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => saveLines(lines), [lines]);

  const addLine = React.useCallback(
    (product: CommerceProduct, variant: ProductVariant, quantity = 1) => {
      setLines((prev) => {
        const existing = prev.find((l) => l.merchandiseId === variant.id);
        if (existing) {
          return prev.map((l) =>
            l.merchandiseId === variant.id
              ? { ...l, quantity: clampQuantity(l.quantity + quantity, l.maxQuantity) }
              : l
          );
        }
        return [
          ...prev,
          {
            merchandiseId: variant.id,
            quantity: clampQuantity(quantity, variant.quantityAvailable),
            productTitle: product.title,
            variantTitle: variant.title === DEFAULT_VARIANT_TITLE ? "" : variant.title,
            href: product.href,
            image: product.image,
            price: variant.price,
            maxQuantity: variant.quantityAvailable,
          },
        ];
      });
      setIsOpen(true);
    },
    []
  );

  const updateQuantity = React.useCallback((merchandiseId: string, quantity: number) => {
    setLines((prev) =>
      prev
        .map((l) =>
          l.merchandiseId === merchandiseId
            ? { ...l, quantity: clampQuantity(quantity, l.maxQuantity) }
            : l
        )
        .filter((l) => l.quantity > 0)
    );
  }, []);

  const removeLine = React.useCallback((merchandiseId: string) => {
    setLines((prev) => prev.filter((l) => l.merchandiseId !== merchandiseId));
  }, []);

  const quantityInCart = React.useCallback(
    (merchandiseId: string) =>
      lines.find((l) => l.merchandiseId === merchandiseId)?.quantity ?? 0,
    [lines]
  );

  const subtotal = formatTotal(lines);

  // Temporary checkout: opens an email with the whole order filled in.
  const checkout = React.useCallback(() => {
    if (lines.length === 0) return;
    const body = [
      "Hi Stuckholm, I'd like to order:",
      "",
      ...lines.map((l) => {
        const variant = l.variantTitle ? ` (size ${l.variantTitle})` : "";
        const price = l.price ? ` — ${formatMoney(l.price)}` : "";
        return `${l.quantity} × ${l.productTitle}${variant}${price}`;
      }),
      "",
      `Total: ${subtotal}`,
    ].join("\n");
    window.location.href = `mailto:${ORDER_EMAIL}?subject=${encodeURIComponent(
      "Order from stuckholm.se"
    )}&body=${encodeURIComponent(body)}`;
  }, [lines, subtotal]);

  const value: CartContextValue = {
    lines,
    totalQuantity: lines.reduce((sum, l) => sum + l.quantity, 0),
    subtotal,
    isOpen,
    openCart: () => setIsOpen(true),
    closeCart: () => setIsOpen(false),
    addLine,
    updateQuantity,
    removeLine,
    quantityInCart,
    checkout,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = React.useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}

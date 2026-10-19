// The shopping cart, shared by the whole site through React context.
//
// The cart lives in Shopify (Storefront API). Its id is remembered in the
// visitor's browser, so the cart survives a page reload. Checkout sends the
// visitor to the cart's checkoutUrl, which is Shopify's checkout.
import * as React from "react";
import { formatMoney, type CommerceProduct, type Money, type ProductVariant } from "@/lib/commerce";
import {
  addCartLines,
  createCart,
  fetchCart,
  updateCartLines,
  type ShopifyCart,
} from "@/lib/shopify";

const CART_ID_KEY = "stuckholm-cart-id";

export type CartLine = {
  lineId: string; // Shopify's line id, needed to change quantity
  merchandiseId: string; // the variant id
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
  error: string | null;
  openCart: () => void;
  closeCart: () => void;
  addLine: (product: CommerceProduct, variant: ProductVariant, quantity?: number) => void;
  updateQuantity: (merchandiseId: string, quantity: number) => void;
  removeLine: (merchandiseId: string) => void;
  quantityInCart: (merchandiseId: string) => number;
  checkout: () => void;
};

const CartContext = React.createContext<CartContextValue | null>(null);

function readStoredCartId(): string | null {
  try {
    return window.localStorage.getItem(CART_ID_KEY);
  } catch {
    return null;
  }
}

function storeCartId(id: string | null) {
  try {
    if (id) window.localStorage.setItem(CART_ID_KEY, id);
    else window.localStorage.removeItem(CART_ID_KEY);
  } catch {
    // Blocked storage: the cart still works until the page is reloaded.
  }
}

function linesFrom(cart: ShopifyCart | null): CartLine[] {
  if (!cart) return [];
  return cart.lines.nodes.map((line) => {
    const m = line.merchandise;
    const isTrash = m.product.tags.some((t) => t.toLowerCase() === "trash");
    const price = m.price ? { amount: Number(m.price.amount), currencyCode: m.price.currencyCode } : null;
    return {
      lineId: line.id,
      merchandiseId: m.id,
      quantity: line.quantity,
      productTitle: m.product.title,
      variantTitle: m.title === "Default Title" ? "" : m.title,
      href: `${isTrash ? "/trash" : "/in-stock"}/${m.product.handle}`,
      image: m.image?.url ?? "",
      price,
      maxQuantity: null,
    };
  });
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = React.useState<ShopifyCart | null>(null);
  const [isOpen, setIsOpen] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  // Mirrors the cart id so that quick successive clicks don't use a stale one.
  const cartIdRef = React.useRef<string | null>(null);

  const applyCart = React.useCallback((next: ShopifyCart | null) => {
    cartIdRef.current = next?.id ?? null;
    storeCartId(next?.id ?? null);
    setCart(next);
  }, []);

  // Restore the saved cart on load. An old or expired cart id is dropped.
  React.useEffect(() => {
    const saved = readStoredCartId();
    if (!saved) return;
    cartIdRef.current = saved;
    fetchCart(saved)
      .then((c) => applyCart(c))
      .catch(() => applyCart(null));
  }, [applyCart]);

  const run = React.useCallback(
    async (action: (id: string | null) => Promise<ShopifyCart>) => {
      try {
        setError(null);
        const next = await action(cartIdRef.current);
        applyCart(next);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong with the cart.");
      }
    },
    [applyCart]
  );

  const addLine = React.useCallback(
    (_product: CommerceProduct, variant: ProductVariant, quantity = 1) => {
      setIsOpen(true);
      void run(async (id) => {
        const lines = [{ merchandiseId: variant.id, quantity }];
        if (!id) return createCart(lines);
        try {
          return await addCartLines(id, lines);
        } catch {
          // The saved cart may have expired on Shopify's side: start a new one.
          return createCart(lines);
        }
      });
    },
    [run]
  );

  const updateQuantity = React.useCallback(
    (merchandiseId: string, quantity: number) => {
      const line = linesFrom(cart).find((l) => l.merchandiseId === merchandiseId);
      if (!line || !cartIdRef.current) return;
      const next = Math.max(0, Math.floor(quantity));
      void run((id) => updateCartLines(id!, [{ id: line.lineId, quantity: next }]));
    },
    [cart, run]
  );

  const removeLine = React.useCallback(
    (merchandiseId: string) => updateQuantity(merchandiseId, 0),
    [updateQuantity]
  );

  const lines = React.useMemo(() => linesFrom(cart), [cart]);

  const quantityInCart = React.useCallback(
    (merchandiseId: string) => lines.find((l) => l.merchandiseId === merchandiseId)?.quantity ?? 0,
    [lines]
  );

  const subtotal = cart?.cost.subtotalAmount
    ? formatMoney({
        amount: Number(cart.cost.subtotalAmount.amount),
        currencyCode: cart.cost.subtotalAmount.currencyCode,
      })
    : "";

  const checkout = React.useCallback(() => {
    if (!cart?.checkoutUrl) return;
    window.location.href = cart.checkoutUrl;
  }, [cart]);

  const value: CartContextValue = {
    lines,
    totalQuantity: cart?.totalQuantity ?? 0,
    subtotal,
    isOpen,
    error,
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

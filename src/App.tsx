import { BrowserRouter, HashRouter, Routes, Route, Navigate, useLocation, type Location } from "react-router-dom";

// Vercel (stuckholm.se) uses normal URLs. The Shopify theme build sets
// VITE_USE_HASH_ROUTER, because Shopify can only serve the root page.
const Router = import.meta.env.VITE_USE_HASH_ROUTER ? HashRouter : BrowserRouter;
import { SiteHeader } from "@/components/SiteHeader";
import { ScrollToTop } from "@/components/ScrollToTop";
import { SiteFooter } from "@/components/SiteFooter";
import { CartDrawer } from "@/components/CartDrawer";
import { CartProvider } from "@/lib/cart";
import { Home } from "@/pages/Home";
import { InStockProduct } from "@/pages/InStockProduct";
import { About } from "@/pages/About";
import { Login } from "@/pages/Login";
import { Contact } from "@/pages/Contact";
import { Shipping } from "@/pages/Shipping";
import { Refund } from "@/pages/Refund";
import { Terms } from "@/pages/Terms";
import { Privacy } from "@/pages/Privacy";
import { Cookies } from "@/pages/Cookies";
import { Trash } from "@/pages/Trash";
import { TrashProduct } from "@/pages/TrashProduct";
import { Consume } from "@/pages/Consume";
import { ProductPanel } from "@/components/ProductPanel";

function App() {
  return (
    <Router>
      <CartProvider>
        <Shell />
      </CartProvider>
    </Router>
  );
}

// A product opened from a product list carries the list's location along
// (state.background). Then the list stays rendered underneath and the
// product opens as a panel on top (ProductPanel). A product opened straight
// from a link has no background and shows as a full page.
function Shell() {
  const location = useLocation();
  const background = (location.state as { background?: Location } | null)?.background;
  const shown = background ?? location;

  return (
    <>
      <main className="min-h-screen w-full bg-[#ffffff] flex flex-col items-center relative isolate">
        <ScrollToTop pathname={shown.pathname} />
        <SiteHeader pathname={shown.pathname} />

        <Routes location={shown}>
          <Route path="/" element={<Home />} />
          <Route path="/consume" element={<Navigate to="/collections/1sthand" replace />} />
          {/* The 2nd hand portal's page is the "All" collection of 2nd hand. */}
          {/* The shop's entrance and the old apparel page are the 1st hand collection. */}
          <Route path="/collections/all" element={<Navigate to="/collections/1sthand" replace />} />
          <Route path="/collections/apparel" element={<Navigate to="/collections/1sthand" replace />} />
          <Route path="/collections/2ndhand" element={<Navigate to="/collections/2nd-all" replace />} />
          <Route path="/collections/:handle" element={<Consume />} />
          <Route path="/in-stock" element={<Navigate to="/collections/1sthand" replace />} />
          <Route path="/in-stock/:slug" element={<InStockProduct />} />
          <Route path="/trash" element={<Trash />} />
          <Route path="/trash/:slug" element={<TrashProduct />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/contact" element={<Contact />} />
          {/* Info pages, one per footer link. Cookie information sits under
              Privacy (no separate cookies page). Old addresses redirect. */}
          <Route path="/shipping" element={<Shipping />} />
          <Route path="/returns" element={<Refund />} />
          <Route path="/terms" element={<Terms />} />
          <Route
            path="/privacy"
            element={
              <>
                <Privacy />
                <Cookies />
              </>
            }
          />
          <Route path="/shipping-returns" element={<Navigate to="/shipping" replace />} />
          <Route path="/refund" element={<Navigate to="/returns" replace />} />
          <Route path="/terms-privacy" element={<Navigate to="/terms" replace />} />
          <Route path="/cookies" element={<Navigate to="/privacy" replace />} />
        </Routes>

        <SiteFooter />
      </main>

      {background && (
        <Routes>
          <Route path="/in-stock/:slug" element={<ProductPanel />} />
          <Route path="/trash/:slug" element={<ProductPanel />} />
        </Routes>
      )}

      <CartDrawer />
    </>
  );
}

export default App;

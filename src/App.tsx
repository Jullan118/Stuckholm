import { BrowserRouter, HashRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";

// Vercel (stuckholm.se) uses normal URLs. The Shopify theme build sets
// VITE_USE_HASH_ROUTER, because Shopify can only serve the root page.
const Router = import.meta.env.VITE_USE_HASH_ROUTER ? HashRouter : BrowserRouter;
import { SiteHeader } from "@/components/SiteHeader";
import { ScrollToTop } from "@/components/ScrollToTop";
import { SiteFooter } from "@/components/SiteFooter";
import { CartDrawer } from "@/components/CartDrawer";
import { SpaceBackdrop } from "@/components/SpaceBackdrop";
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

// The faint space background, on every page except home (which has its own).
function PageBackdrop() {
  const { pathname } = useLocation();
  // No space background on the home page (it has the real one) or on the
  // shop pages (product lists and single products), which are plain white.
  const isProductPage = /^\/(collections|in-stock|trash)(\/|$)/.test(pathname);
  return pathname === "/" || isProductPage ? null : <SpaceBackdrop />;
}

function App() {
  return (
    <Router>
      <CartProvider>
      <main className="min-h-screen w-full bg-[#ffffff] flex flex-col items-center relative isolate">
        <PageBackdrop />
        <ScrollToTop />
        <SiteHeader />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/consume" element={<Navigate to="/collections/all" replace />} />
          <Route path="/collections/:handle" element={<Consume />} />
          <Route path="/in-stock" element={<Navigate to="/collections/all" replace />} />
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
      <CartDrawer />
      </CartProvider>
    </Router>
  );
}

export default App;

import { BrowserRouter, HashRouter, Routes, Route, Navigate } from "react-router-dom";

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
import { ShippingReturns } from "@/pages/ShippingReturns";
import { TermsPrivacy } from "@/pages/TermsPrivacy";
import { Trash } from "@/pages/Trash";
import { TrashProduct } from "@/pages/TrashProduct";
import { Consume } from "@/pages/Consume";

function App() {
  return (
    <Router>
      <CartProvider>
      <main className="min-h-screen w-full bg-[#ffffff] flex flex-col items-center relative">
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
          <Route path="/shipping-returns" element={<ShippingReturns />} />
          <Route path="/terms-privacy" element={<TermsPrivacy />} />
          {/* Old addresses of the pages that were merged. */}
          <Route path="/shipping" element={<Navigate to="/shipping-returns" replace />} />
          <Route path="/refund" element={<Navigate to="/shipping-returns" replace />} />
          <Route path="/returns" element={<Navigate to="/shipping-returns" replace />} />
          <Route path="/terms" element={<Navigate to="/terms-privacy" replace />} />
          <Route path="/privacy" element={<Navigate to="/terms-privacy" replace />} />
          <Route path="/cookies" element={<Navigate to="/terms-privacy" replace />} />
        </Routes>

        <SiteFooter />
      </main>
      <CartDrawer />
      </CartProvider>
    </Router>
  );
}

export default App;

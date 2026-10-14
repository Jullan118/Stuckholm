import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainNav } from "@/components/MainNav";
import { MiniGlobe } from "@/components/MiniGlobe";
import { HeaderBar } from "@/components/HeaderBar";
import { CartCorner } from "@/components/CartCorner";
import { SiteFooter } from "@/components/SiteFooter";
import { CartDrawer } from "@/components/CartDrawer";
import { CartProvider } from "@/lib/cart";
import { Home } from "@/pages/Home";
import { InStock } from "@/pages/InStock";
import { InStockProduct } from "@/pages/InStockProduct";
import { InStockUpload } from "@/pages/InStockUpload";
import { About } from "@/pages/About";
import { Contact } from "@/pages/Contact";
import { InfoPage } from "@/pages/InfoPage";
import { Cookies } from "@/pages/Cookies";
import { Terms } from "@/pages/Terms";
import { Shipping } from "@/pages/Shipping";
import { Returns } from "@/pages/Returns";
import { Trash } from "@/pages/Trash";
import { TrashProduct } from "@/pages/TrashProduct";
import { TrashUpload } from "@/pages/TrashUpload";

function App() {
  return (
    <BrowserRouter>
      <CartProvider>
      <main className="min-h-screen w-full bg-[#ffffff] flex flex-col items-center relative">
        <HeaderBar />
        <MiniGlobe />
        <MainNav />
        <CartCorner />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/in-stock" element={<InStock />} />
          <Route path="/in-stock/upload" element={<InStockUpload />} />
          <Route path="/in-stock/edit/:slug" element={<InStockUpload />} />
          <Route path="/in-stock/:slug" element={<InStockProduct />} />
          <Route path="/trash" element={<Trash />} />
          <Route path="/trash/upload" element={<TrashUpload />} />
          <Route path="/trash/edit/:slug" element={<TrashUpload />} />
          <Route path="/trash/:slug" element={<TrashProduct />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/shipping" element={<Shipping />} />
          <Route path="/returns" element={<Returns />} />
          <Route path="/payments" element={<InfoPage title="Betalning" />} />
          <Route path="/faq" element={<InfoPage title="FAQ" />} />
          <Route path="/privacy" element={<InfoPage title="Integritetspolicy" />} />
          <Route path="/cookies" element={<Cookies />} />
          <Route path="/terms" element={<Terms />} />
        </Routes>

        <SiteFooter />
      </main>
      <CartDrawer />
      </CartProvider>
    </BrowserRouter>
  );
}

export default App;

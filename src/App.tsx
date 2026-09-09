import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainNav } from "@/components/MainNav";
import { MiniGlobe } from "@/components/MiniGlobe";
import { ContactCorner } from "@/components/ContactCorner";
import { CartCorner } from "@/components/CartCorner";
import { SiteFooter } from "@/components/SiteFooter";
import { Home } from "@/pages/Home";
import { NewFlames } from "@/pages/NewFlames";
import { NewFlamesProduct } from "@/pages/NewFlamesProduct";
import { NewFlamesUpload } from "@/pages/NewFlamesUpload";
import { About } from "@/pages/About";
import { Contact } from "@/pages/Contact";
import { Trash } from "@/pages/Trash";
import { TrashProduct } from "@/pages/TrashProduct";
import { TrashUpload } from "@/pages/TrashUpload";

function App() {
  return (
    <BrowserRouter>
      <main className="min-h-screen w-full bg-[#ffffff] flex flex-col items-center relative">
        <MiniGlobe />
        <MainNav />
        <CartCorner />
        <ContactCorner />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/off-the-shelf" element={<NewFlames />} />
          <Route path="/off-the-shelf/upload" element={<NewFlamesUpload />} />
          <Route path="/off-the-shelf/edit/:slug" element={<NewFlamesUpload />} />
          <Route path="/off-the-shelf/:slug" element={<NewFlamesProduct />} />
          <Route path="/trash" element={<Trash />} />
          <Route path="/trash/upload" element={<TrashUpload />} />
          <Route path="/trash/edit/:slug" element={<TrashUpload />} />
          <Route path="/trash/:slug" element={<TrashProduct />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>

        <SiteFooter />
      </main>
    </BrowserRouter>
  );
}

export default App;

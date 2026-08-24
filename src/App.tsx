import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { HamburgerMenu } from "@/components/HamburgerMenu";
import { MiniGlobe } from "@/components/MiniGlobe";
import { Home } from "@/pages/Home";
import { NewFlames } from "@/pages/NewFlames";
import { NewFlamesProduct } from "@/pages/NewFlamesProduct";
import { NewFlamesUpload } from "@/pages/NewFlamesUpload";
import { About } from "@/pages/About";
import { Contact } from "@/pages/Contact";
import { Trash } from "@/pages/Trash";
import { TrashProduct } from "@/pages/TrashProduct";
import { TrashUpload } from "@/pages/TrashUpload";

function SiteFooter() {
  const { pathname } = useLocation();
  if (pathname !== "/about") return null;

  return (
    <footer className="absolute bottom-1 w-full px-6 font-skarp text-black text-xl sm:text-2xl leading-none">
      <div className="max-w-[28rem] mx-auto grid grid-cols-2 gap-y-0 gap-x-4 text-center leading-none">
        <span className="sm:text-left sm:pl-3">Stuck in stuckholm</span>
        <span className="sm:text-right">all rights reserved {new Date().getFullYear()}</span>

        <a
          href="mailto:hello.stuckholm@gmail.com"
          className="sm:text-left sm:pl-3 hover:opacity-70 transition-opacity"
        >
          hello.stuckholm@gmail.com
        </a>
        <span className="sm:text-right">2026, STOCKHOLM</span>

        <a
          href="https://instagram.com/stuckholm.se"
          target="_blank"
          rel="noreferrer"
          className="sm:text-left sm:pl-3 hover:opacity-70 transition-opacity"
        >
          INSTAGRAM
        </a>
        <a href="tel:+46011771123" className="sm:text-right hover:opacity-70 transition-opacity">
          +46 011 77 11 23
        </a>
      </div>

      <div className="max-w-2xl mx-auto text-center mt-0">
        <span>By aquam3ss</span>
      </div>
    </footer>
  );
}

function App() {
  return (
    <BrowserRouter>
      <main className="min-h-screen w-full bg-[#ffffff] flex flex-col items-center relative">
        <MiniGlobe />
        <HamburgerMenu />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/new-flames" element={<NewFlames />} />
          <Route path="/new-flames/upload" element={<NewFlamesUpload />} />
          <Route path="/new-flames/edit/:slug" element={<NewFlamesUpload />} />
          <Route path="/new-flames/:slug" element={<NewFlamesProduct />} />
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

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HamburgerMenu } from "@/components/HamburgerMenu";
import { MiniGlobe } from "@/components/MiniGlobe";
import { Home } from "@/pages/Home";
import { Shop } from "@/pages/Shop";
import { About } from "@/pages/About";
import { Contact } from "@/pages/Contact";

function App() {
  return (
    <BrowserRouter>
      <main className="min-h-screen w-full bg-white flex flex-col items-center relative">
        <MiniGlobe />
        <HamburgerMenu />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>

        <footer className="absolute bottom-6 text-zinc-400 text-sm">
          &copy; {new Date().getFullYear()} Stuckholm. All rights reserved.
        </footer>
      </main>
    </BrowserRouter>
  );
}

export default App;

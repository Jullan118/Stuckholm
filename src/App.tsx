import { StuckholmGlobe } from "@/components/StuckholmGlobe";
import { HamburgerMenu } from "@/components/HamburgerMenu";

function App() {
  return (
    <main className="min-h-screen w-full bg-white flex flex-col items-center justify-center overflow-hidden relative">
      <HamburgerMenu />

      <div className="relative z-10 flex flex-col items-center gap-6 px-6 text-center w-full">
        <div className="w-full h-[400px] sm:h-[550px] md:h-[650px]">
          <StuckholmGlobe />
        </div>
      </div>

      <footer className="absolute bottom-6 text-zinc-400 text-sm">
        &copy; {new Date().getFullYear()} Stuckholm. All rights reserved.
      </footer>
    </main>
  );
}

export default App;

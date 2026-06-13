import { GooeyText } from "@/components/ui/gooey-text-morphing";

function App() {
  return (
    <main className="min-h-screen w-full bg-black flex flex-col items-center justify-center overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-black to-zinc-950" />

      <div className="relative z-10 flex flex-col items-center gap-6 px-6 text-center">
        <GooeyText
          texts={["Stuck", "In", "Stuckholm"]}
          morphTime={1}
          cooldownTime={0.5}
          className="h-[140px] sm:h-[200px]"
          textClassName="text-5xl sm:text-7xl md:text-8xl font-bold tracking-tight"
        />

        <p className="text-zinc-400 text-lg sm:text-xl max-w-md">
          Something new is coming. Stay tuned.
        </p>
      </div>

      <footer className="absolute bottom-6 text-zinc-600 text-sm">
        &copy; {new Date().getFullYear()} Stuckholm. All rights reserved.
      </footer>
    </main>
  );
}

export default App;

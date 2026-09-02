import { StuckholmGlobe } from "@/components/StuckholmGlobe";

export function Home() {
  return (
    <div className="relative z-10 flex flex-col items-center justify-center gap-6 px-6 text-center w-full min-h-screen overflow-hidden">
      <div className="w-full h-[400px] sm:h-[550px] md:h-[650px]">
        <StuckholmGlobe />
      </div>
    </div>
  );
}

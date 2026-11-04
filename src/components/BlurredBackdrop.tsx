// Blur laid over the whole screen on the entrance page (/collections/all).
// It blurs the product page underneath and nothing else: no colour of its own,
// just a light, translucent haze. The category menu sits above it in the header.
export function BlurredBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-[15] pointer-events-none"
      style={{
        background: "rgba(255,255,255,0.35)",
        backdropFilter: "blur(28px)",
        WebkitBackdropFilter: "blur(28px)",
      }}
    />
  );
}

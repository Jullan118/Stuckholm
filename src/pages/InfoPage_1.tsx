// Generic placeholder for footer info pages (shipping, returns, payments,
// legal, FAQ). Replace the body with real copy when it's written.
export function InfoPage({ title }: { title: string }) {
  return (
    <div className="relative z-10 w-full max-w-3xl px-6 pt-28 pb-16 text-center">
      <h1 className="text-3xl sm:text-4xl font-manrope font-light text-black mb-6">
        {title}
      </h1>
      <p className="font-manrope text-black/50 text-sm">Kommer snart.</p>
    </div>
  );
}

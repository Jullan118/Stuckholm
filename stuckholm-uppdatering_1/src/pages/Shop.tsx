const PRODUCTS = [
  {
    name: "Stuckholm T-Shirt",
    price: "299 kr",
    image: "",
  },
];

export function Shop() {
  return (
    <div className="relative z-10 w-full max-w-5xl px-6 pt-28 pb-16">
      <h1 className="text-3xl sm:text-4xl font-skarp-italic text-black mb-10 text-center">
        Nytt Skräp
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {PRODUCTS.map((product) => (
          <div key={product.name} className="flex flex-col gap-3">
            <div className="aspect-square bg-[#d51f26]/5 border border-[#d51f26]/20 rounded-lg flex items-center justify-center text-black/60">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                "Bild"
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-black font-medium">{product.name}</span>
              <span className="text-black/70">{product.price}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

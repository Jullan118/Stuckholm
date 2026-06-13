const PRODUCTS = [
  {
    name: "Stuckholm T-Shirt",
    price: "299 kr",
    image: "",
  },
  {
    name: "Stuckholm Hoodie",
    price: "599 kr",
    image: "",
  },
];

export function Shop() {
  return (
    <div className="relative z-10 w-full max-w-5xl px-6 pt-28 pb-16">
      <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-10 text-center">
        Ingång
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {PRODUCTS.map((product) => (
          <div key={product.name} className="flex flex-col gap-3">
            <div className="aspect-square bg-zinc-100 rounded-lg flex items-center justify-center text-zinc-400">
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
              <span className="text-zinc-900 font-medium">{product.name}</span>
              <span className="text-zinc-500">{product.price}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

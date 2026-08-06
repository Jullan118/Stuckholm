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
      <h1 className="text-3xl sm:text-4xl font-skarp-italic text-[#e2c3d3] mb-10 text-center">
        <span className="mr-[-0.07em]">S</span>pend
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {PRODUCTS.map((product) => (
          <div key={product.name} className="flex flex-col gap-3">
            <div className="aspect-square bg-white/10 border border-[#e2c3d3]/20 rounded-lg flex items-center justify-center text-[#e2c3d3]/60">
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
              <span className="text-[#e2c3d3] font-medium">{product.name}</span>
              <span className="text-[#e2c3d3]/70">{product.price}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

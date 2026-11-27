import type { SizeGuideData } from "@/lib/shopProducts";

// "Size guide" under Add to cart, always shown: the product's own size guide
// (table, note, drawing) as text. Each product picks its guide
// in Shopify (product field "Size guide" → a "Size guide" entry), so
// different garments can have different guides. Nothing shows without one.
export function SizeGuide({ guide }: { guide: SizeGuideData | null }) {
  if (!guide) return null;
  const [head, ...body] = guide.rows;
  return (
    <div className="mt-4">
      <p className="text-black">Size guide</p>
        <div className="mt-3 flex flex-col gap-3">
          {guide.drawing && (
            <img src={guide.drawing} alt="" className="w-1/2 max-w-[200px] mx-auto object-contain" />
          )}
          {head && (
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b-[0.75px] border-black/40">
                  {head.map((c, i) => (
                    <th key={i} className={`font-normal py-1.5 ${i ? "text-center" : "text-left"}`}>
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {body.map((row, r) => (
                  <tr key={r} className="border-b-[0.75px] border-black/20">
                    {row.map((c, i) => (
                      <td key={i} className={`py-1.5 ${i ? "text-center" : "text-left"}`}>
                        {c}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {guide.note && <p className="text-sm italic">{guide.note}</p>}
        </div>
    </div>
  );
}

// Returns & exchanges page. Layout matches Shipping.tsx. Text in [brackets] is
// a placeholder for the real policy and should be replaced before launch.
export function Returns() {
  return (
    <div className="relative z-10 w-full max-w-3xl px-4 sm:px-8 pt-28 pb-16 font-manrope text-black text-center text-xs sm:text-sm leading-relaxed">
      <h1 className="text-xl sm:text-2xl font-light mb-10 text-center">
        Returns
      </h1>

      <h2 className="text-sm sm:text-base font-light mb-4">Return Window</h2>
      <p className="mb-10">
        You can return an item within [NUMBER] days of delivery. The item must be
        unworn, unwashed and in its original condition, with tags attached.
      </p>

      <h2 className="text-sm sm:text-base font-light mb-4">How to Return</h2>
      <p className="mb-10">
        To start a return, email us at{" "}
        <a
          href="mailto:stuck@stuckholm.se"
          className="underline hover:opacity-70 transition-opacity"
        >
          stuck@stuckholm.se
        </a>{" "}
        with your order number and the item you want to return. We will reply
        with the return address and instructions.
      </p>

      <h2 className="text-sm sm:text-base font-light mb-4">Return Shipping</h2>
      <p className="mb-10">
        [Who pays return shipping: the customer / Stuckholm, and any conditions
        for free returns.]
      </p>

      <h2 className="text-sm sm:text-base font-light mb-4">Refunds</h2>
      <p className="mb-10">
        Once we receive and inspect your return, we will refund the purchase
        price to your original payment method within [NUMBER] business days.
        Shipping costs are [refunded / not refunded].
      </p>

      <h2 className="text-sm sm:text-base font-light mb-4">Exchanges</h2>
      <p className="mb-10">
        [Whether exchanges are offered, and how they work.]
      </p>

      <h2 className="text-sm sm:text-base font-light mb-4">
        Items That Cannot Be Returned
      </h2>
      <ul className="list-none space-y-1 mb-10">
        <li>– Made-to-order pieces, unless faulty</li>
        <li>– Preloved (second-hand) items, unless [POLICY]</li>
        <li>– Items that have been worn, washed or altered</li>
      </ul>

      <h2 className="text-sm sm:text-base font-light mb-4">
        Damaged or Wrong Items
      </h2>
      <p className="mb-10">
        If your order arrives damaged or is not what you ordered, email us within
        [NUMBER] days of delivery with a photo of the item. We will make it right
        at no cost to you.
      </p>
    </div>
  );
}

export function Shipping() {
  return (
    <div className="relative z-10 w-full max-w-3xl px-6 pt-28 pb-16 font-manrope text-black text-center text-sm sm:text-base leading-relaxed">
      <h1 className="text-3xl sm:text-4xl font-light mb-10 text-center">
        Delivery
      </h1>

      <p className="mb-3">We currently ship to the following regions:</p>
      <ul className="list-none space-y-1 mb-4">
        <li>– United States</li>
        <li>– United Kingdom</li>
        <li>– Europe (EU &amp; non-EU)</li>
        <li>– Canada</li>
        <li>– Select international countries</li>
      </ul>
      <p className="mb-10">
        If your country isn’t listed at checkout, feel free to contact us for
        confirmation.
      </p>

      <h2 className="text-xl sm:text-2xl font-light mb-4">
        Production &amp; Shipping Timeline
      </h2>
      <p className="mb-3">
        Stuckholm pieces are made to order and produced by our partner. Typical
        timelines are:
      </p>
      <ul className="list-none space-y-1 mb-4">
        <li>– Production time: 2–7 business days after the order is placed</li>
      </ul>
      <p className="mb-2">Shipping time:</p>
      <ul className="list-none space-y-1 mb-4 pl-4">
        <li>– USA: 3–7 business days</li>
        <li>– UK/EU: 5–10 business days</li>
        <li>– International: 10–20 business days</li>
      </ul>
      <p className="mb-10">
        Shipping timelines are estimates, not guarantees.
      </p>

      <h2 className="text-xl sm:text-2xl font-light mb-4">
        Tracking Information
      </h2>
      <p className="mb-10">
        You will receive an email with tracking details once your order ships.
        If tracking hasn’t updated within 5 days, please contact us at{" "}
        <a
          href="mailto:stuck@stuckholm.se"
          className="underline hover:opacity-70 transition-opacity"
        >
          stuck@stuckholm.se
        </a>
        .
      </p>

      <h2 className="text-xl sm:text-2xl font-light mb-4">
        Customs, Duties &amp; Import Taxes
      </h2>
      <p className="mb-10">
        Stuckholm is not responsible for any customs fees, import taxes, or
        additional charges imposed by your country. These are the buyer’s
        responsibility.
      </p>

      <h2 className="text-xl sm:text-2xl font-light mb-4">
        Delays and Disclaimers
      </h2>
      <p className="mb-2">We are not liable for delays caused by:</p>
      <ul className="list-none space-y-1 mb-4">
        <li>– Customs processing</li>
        <li>– Postal disruptions</li>
        <li>– Weather conditions</li>
        <li>– Incorrect addresses provided by customers</li>
      </ul>
      <p>Please double-check your shipping information before placing an order.</p>
    </div>
  );
}

import { Shipping } from "@/pages/Shipping";
import { Refund } from "@/pages/Refund";

// Shipping and returns on one page: the two policies, one after the other.
export function ShippingReturns() {
  return (
    <>
      <Shipping />
      <Refund />
    </>
  );
}

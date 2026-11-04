import * as React from "react";
import { useLocation } from "react-router-dom";
import { CONSUME_HANDLE } from "@/lib/categories";

// White strip behind the fixed header (logo, nav, cart) on every page except
// the home page. Without it, product images and text scroll underneath the
// header and show through the gaps between its items.
export function HeaderBar() {
  const { pathname } = useLocation();
  // No white strip on the home page or the blurred entrance page.
  if (pathname === "/" || pathname === `/collections/${CONSUME_HANDLE}`) return null;
  return <div aria-hidden="true" className="fixed inset-x-0 top-0 h-20 z-[15] bg-white" />;
}

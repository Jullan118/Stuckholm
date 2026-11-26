import * as React from "react";

// Jump back to the top of the page whenever the page shown changes, so a new
// page doesn't open where the previous one was scrolled to. Takes the page
// shown (not the address), so opening or closing a product panel over a list
// keeps the list where it was. Moving from one collection to another (the
// portals and the sub-category strip) also keeps the page where it is.
export function ScrollToTop({ pathname }: { pathname: string }) {
  const prev = React.useRef(pathname);
  React.useLayoutEffect(() => {
    const was = prev.current;
    prev.current = pathname;
    const isCollection = (p: string) => p.startsWith("/collections/");
    if (was !== pathname && isCollection(was) && isCollection(pathname)) return;
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

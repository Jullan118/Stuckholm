import * as React from "react";
import { Link, useLocation } from "react-router-dom";
import { CATEGORIES, CONSUME_HANDLE, type Category } from "@/lib/categories";

// Centred navigation. On every page except product pages it shows the
// "Consume" link, which is the way into the shop (like a key to the room). On
// the collection pages the categories slide in on the same row. Hovering (or
// clicking) a category shows its sub-categories directly under it. Moving the
// mouse away, clicking outside, pressing Escape or changing page closes them.
// On product pages "Consume" disappears, since you are already inside.
// On the home page the hero is a dark starfield, so the nav switches to
// white there instead of its usual black-on-white. The mini globe (top-left)
// and the cart (top-right) sit in the corners; the nav keeps clear of them.
export function MainNav() {
  const { pathname } = useLocation();
  const isHome = pathname === "/";
  const isConsume = pathname === "/consume" || pathname.startsWith("/collections/");
  const isProductPage = /^\/(in-stock|trash)\/[^/]+/.test(pathname);
  const isEntrance = pathname === `/collections/${CONSUME_HANDLE}`;
  const [active, setActive] = React.useState<string | null>(null);
  const navRef = React.useRef<HTMLDivElement>(null);

  // Close the sub-row when the page changes.
  React.useEffect(() => setActive(null), [pathname]);

  // Close on outside click or Escape.
  React.useEffect(() => {
    if (!active) return;
    const onDown = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setActive(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [active]);

  // The category the current collection belongs to (or is). Its sub-categories
  // stay visible while you are on one of its pages.
  const routeHandle = pathname.split("/")[2];
  const currentCategory = CATEGORIES.find(
    (c) => c.handle === routeHandle || c.children?.some((ch) => ch.handle === routeHandle)
  );

  const inkClass = isHome
    ? "text-white home-ink hover:opacity-70"
    : "text-black hover:text-black/70";

  return (
    <div
      ref={navRef}
      className="fixed inset-x-0 top-1 z-20 h-16 flex items-center justify-center px-20 sm:px-32 pointer-events-none"
    >
    <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-x-6 sm:gap-x-10">
      {isHome && (
        <Link
          to={`/collections/${CONSUME_HANDLE}`}
          className={`pointer-events-auto fixed top-4 left-4 sm:left-8 z-20 inline-block text-sm sm:text-base transition-opacity duration-200 ${inkClass}`}
        >
          Consume
        </Link>
      )}
      {!isProductPage && !isHome && !isEntrance && (
        <Link
          to={`/collections/${CONSUME_HANDLE}`}
          className={`inline-block text-sm sm:text-base transition-opacity duration-200 ${inkClass}`}
        >
          Consume
        </Link>
      )}

      {isConsume &&
        CATEGORIES.map((cat, i) => (
          <div
            key={cat.label}
            className="relative animate-slide-in-left"
            style={{ animationDelay: `${120 + i * 90}ms` }}
            onMouseEnter={() => cat.children && setActive(cat.label)}
            onMouseLeave={() => setActive(null)}
          >
            <CategoryLink
              category={cat}
              inkClass={inkClass}
              onOpen={() => cat.children && setActive(cat.label)}
            />

            {cat.children && (active === cat.label || currentCategory?.label === cat.label) && (
              <ul className="absolute left-0 top-full pt-3 flex gap-6 sm:gap-8 whitespace-nowrap animate-blur-fade-in">
                {cat.children.map((child) => (
                  <li key={child.label}>
                    <Link
                      to={`/collections/${child.handle}`}
                      className={`text-sm sm:text-base transition-opacity duration-200 ${inkClass}`}
                    >
                      {child.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
    </div>
    </div>
  );
}

function CategoryLink({
  category,
  inkClass,
  onOpen,
}: {
  category: Category;
  inkClass: string;
  onOpen: () => void;
}) {
  const base = `inline-block text-sm sm:text-base transition-opacity duration-200 ${inkClass}`;
  return (
    <Link to={`/collections/${category.handle}`} className={base} onFocus={onOpen}>
      {category.label}
    </Link>
  );
}

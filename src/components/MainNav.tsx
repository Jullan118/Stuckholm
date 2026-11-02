import * as React from "react";
import { Link, useLocation } from "react-router-dom";
import { CATEGORIES, type Category } from "@/lib/categories";

// Top-left navigation. On every page it shows the "Consume" link. On
// /consume the categories slide in from the left on the same row. Hovering
// (or clicking) a category shows its sub-categories directly under it, in a
// row running to the right. Moving the mouse away, clicking outside, pressing
// Escape or changing page closes them.
// On the home page the hero is a dark starfield, so the nav switches to
// white there instead of its usual black-on-white. On every other page the
// mini globe logo (MiniGlobe) sits in the same top-left corner, so the nav
// shifts right to sit beside it instead of underneath it.
export function MainNav() {
  const { pathname } = useLocation();
  const isHome = pathname === "/";
  const isConsume = pathname === "/consume";
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

  const inkClass = isHome
    ? "text-white home-ink hover:opacity-70"
    : "text-black hover:text-black/70";

  return (
    <div
      ref={navRef}
      className={`fixed -top-2 right-4 sm:right-8 z-20 h-16 flex flex-wrap items-center gap-6 sm:gap-10 ${
        isHome ? "left-4 sm:left-8" : "left-24"
      }`}
    >
      <Link
        to="/consume"
        className={`relative z-[13] inline-block text-lg sm:text-xl transition-transform duration-200 ease-out hover:scale-125 ${inkClass}`}
      >
        Consume
      </Link>

      {isConsume && active && (
        <div
          aria-hidden="true"
          onClick={() => setActive(null)}
          className="fixed inset-0 z-[12] bg-white/50 backdrop-blur-sm animate-blur-fade-in"
        />
      )}

      {isConsume &&
        CATEGORIES.map((cat, i) => (
          <div
            key={cat.label}
            className="relative z-[13] animate-slide-in-left"
            style={{ animationDelay: `${120 + i * 90}ms` }}
            onMouseEnter={() => cat.children && setActive(cat.label)}
            onMouseLeave={() => setActive(null)}
          >
            <CategoryLink
              category={cat}
              inkClass={inkClass}
              onOpen={() => cat.children && setActive(cat.label)}
            />

            {cat.children && active === cat.label && (
              <ul className="absolute left-0 top-full pt-3 flex gap-6 sm:gap-8 whitespace-nowrap animate-blur-fade-in">
                {cat.children.map((child) => (
                  <li key={child.label}>
                    {child.to ? (
                      <Link
                        to={child.to}
                        className="text-base sm:text-lg text-black/70 hover:text-black transition-colors"
                      >
                        {child.label}
                      </Link>
                    ) : (
                      <span className="text-base sm:text-lg text-black/70 hover:text-black transition-colors cursor-default">
                        {child.label}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
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
  const base = `inline-block text-lg sm:text-xl transition-transform duration-200 ease-out hover:scale-125 ${inkClass}`;

  if (category.to) {
    return (
      <Link to={category.to} className={base} onFocus={onOpen}>
        {category.label}
      </Link>
    );
  }
  if (category.children) {
    return (
      <button type="button" onClick={onOpen} aria-haspopup="true" className={base}>
        {category.label}
      </button>
    );
  }
  return <span className={`${base} cursor-default`}>{category.label}</span>;
}

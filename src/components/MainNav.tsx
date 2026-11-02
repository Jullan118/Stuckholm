import * as React from "react";
import { Link, useLocation } from "react-router-dom";
import { CATEGORIES, type Category } from "@/lib/categories";

// Top-left navigation. On every page it shows one big "Consume" link. On
// /consume the categories slide in from the left, one after another, on the
// same row. Clicking a category with sub-categories opens a menu centred on
// the page. Click outside, press Escape, or change page to close it.
// On the home page the hero is a dark starfield, so the nav switches to
// white there instead of its usual black-on-white. On every other page the
// mini globe logo (MiniGlobe) sits in the same top-left corner, so the nav
// shifts right to sit beside it instead of underneath it.
export function MainNav() {
  const { pathname } = useLocation();
  const isHome = pathname === "/";
  const isConsume = pathname === "/consume";
  const [openCategory, setOpenCategory] = React.useState<string | null>(null);
  const navRef = React.useRef<HTMLDivElement>(null);

  // Close the sub-menu when the page changes.
  React.useEffect(() => setOpenCategory(null), [pathname]);

  // Close on outside click or Escape.
  React.useEffect(() => {
    if (!openCategory) return;
    const onDown = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpenCategory(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenCategory(null);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [openCategory]);

  const inkClass = isHome
    ? "text-white home-ink hover:opacity-70"
    : "text-black hover:text-black/70";
  const openMenu = CATEGORIES.find((c) => c.label === openCategory && c.children);

  return (
    <>
      <div
        ref={navRef}
        className={`fixed -top-2 right-4 sm:right-8 z-20 h-16 flex flex-wrap items-center gap-6 sm:gap-10 ${
          isHome ? "left-4 sm:left-8" : "left-24"
        }`}
      >
        <Link
          to="/consume"
          className={`inline-block text-2xl sm:text-4xl transition-transform duration-200 ease-out hover:scale-110 ${inkClass}`}
        >
          Consume
        </Link>

        {isConsume &&
          CATEGORIES.map((cat, i) => (
            <div
              key={cat.label}
              className="animate-slide-in-left"
              style={{ animationDelay: `${120 + i * 90}ms` }}
            >
              <CategoryItem
                category={cat}
                inkClass={inkClass}
                open={openCategory === cat.label}
                onToggle={() =>
                  setOpenCategory((cur) => (cur === cat.label ? null : cat.label))
                }
              />
            </div>
          ))}
      </div>

      {isConsume && openMenu && (
        <div className="fixed left-1/2 -translate-x-1/2 top-20 z-30 bg-white text-black border border-black/10 shadow-sm px-8 py-5 min-w-[16rem]">
          <p className="font-manrope text-xs uppercase tracking-widest text-black/50 mb-3 text-center">
            {openMenu.label}
          </p>
          <ul className="space-y-2 text-center font-manrope text-lg">
            {openMenu.children!.map((child) => (
              <li key={child.label}>
                {child.to ? (
                  <Link to={child.to} className="hover:opacity-60 transition-opacity">
                    {child.label}
                  </Link>
                ) : (
                  <span className="text-black/80">{child.label}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}

function CategoryItem({
  category,
  inkClass,
  open,
  onToggle,
}: {
  category: Category;
  inkClass: string;
  open: boolean;
  onToggle: () => void;
}) {
  const base = `inline-block text-lg sm:text-xl transition-transform duration-200 ease-out hover:scale-125 ${inkClass}`;

  if (category.children) {
    return (
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className={`${base} ${open ? "scale-125" : ""}`}
      >
        {category.label}
      </button>
    );
  }
  if (category.to) {
    return (
      <Link to={category.to} className={base}>
        {category.label}
      </Link>
    );
  }
  return <span className={`${base} cursor-default`}>{category.label}</span>;
}

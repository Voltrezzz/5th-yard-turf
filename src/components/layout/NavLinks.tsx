"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/turf", label: "Turf Specs" },
  { href: "/book", label: "Book Now" },
] as const;

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === href : pathname.startsWith(href);
}

export function NavLinks() {
  const pathname = usePathname();

  return (
    <>
      <div className="hidden space-x-8 text-sm font-bold tracking-widest md:flex">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            aria-current={isActive(pathname, link.href) ? "page" : undefined}
            className={`uppercase transition-colors hover:text-[#FC2B24] ${
              isActive(pathname, link.href) ? "text-[#FC2B24]" : "text-white"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>

      <details className="mobile-nav relative md:hidden">
        <summary className="neu-slot cursor-pointer select-none px-4 py-2 font-display text-sm font-bold uppercase tracking-widest text-white">
          Menu
        </summary>
        <div className="neu-surface absolute right-0 mt-3 flex min-w-52 flex-col gap-1 p-3">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(pathname, link.href) ? "page" : undefined}
              className={`rounded-lg px-4 py-3 text-sm font-bold uppercase tracking-wider transition-colors hover:text-[#FC2B24] ${
                isActive(pathname, link.href)
                  ? "bg-[#FC2B24]/10 text-[#FC2B24]"
                  : "text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </details>
    </>
  );
}

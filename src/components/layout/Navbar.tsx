import Link from "next/link";

import { NavLinks } from "@/components/layout/NavLinks";

export function Navbar() {
  return (
    <nav
      className="fixed z-50 w-full border-b border-white/5 bg-[#0A0A0A]/80 py-6 backdrop-blur-md transition-all duration-300"
      id="navbar"
      aria-label="Primary navigation"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
        <Link
          href="/"
          className="font-display text-2xl font-bold tracking-widest text-white sm:text-3xl"
          aria-label="5th Yard Turf home"
        >
          5TH YARD <span className="text-[#FC2B24]">TURF</span>
        </Link>
        <NavLinks />
      </div>
    </nav>
  );
}

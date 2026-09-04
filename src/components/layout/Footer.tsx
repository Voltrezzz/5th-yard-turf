import Link from "next/link";

import { siteConfig } from "@/lib/site-config";

export function Footer() {
  const contactItems = [
    siteConfig.contact.address
      ? { label: `📍 ${siteConfig.contact.address}`, href: siteConfig.contact.mapUrl }
      : null,
    siteConfig.contact.phone
      ? { label: `📞 ${siteConfig.contact.phone}`, href: `tel:${siteConfig.contact.phone}` }
      : null,
    siteConfig.contact.email
      ? { label: `✉️ ${siteConfig.contact.email}`, href: `mailto:${siteConfig.contact.email}` }
      : null,
  ].filter((item): item is { label: string; href: string } => item !== null);

  return (
    <footer className="bg-black pb-10 pt-20">
      <div
        className={`mx-auto mb-12 grid max-w-7xl gap-12 px-6 ${
          contactItems.length > 0 ? "md:grid-cols-3" : "md:grid-cols-2"
        }`}
      >
        <div data-aos="fade-right">
          <Link
            href="/"
            className="mb-6 inline-block font-display text-4xl font-bold tracking-widest text-white"
          >
            5TH YARD <span className="text-[#FC2B24]">TURF</span>
          </Link>
          <p className="text-sm leading-relaxed text-[#A8A8A8]">
            The premium multi-purpose turf arena built for those who take the game seriously.
            Eat. Sleep. Play. Repeat.
          </p>
        </div>

        <div data-aos="fade-up">
          <h2 className="mb-6 font-bold uppercase tracking-widest text-white">Quick Links</h2>
          <ul className="space-y-3 text-sm font-medium text-[#A8A8A8]">
            <li>
              <Link href="/" className="transition hover:text-[#FC2B24]">
                Home
              </Link>
            </li>
            <li>
              <Link href="/turf" className="transition hover:text-[#FC2B24]">
                Turf Specifications
              </Link>
            </li>
            <li>
              <Link href="/book" className="transition hover:text-[#FC2B24]">
                Book Your Slot
              </Link>
            </li>
          </ul>
        </div>

        {contactItems.length > 0 ? (
          <div data-aos="fade-left">
            <h2 className="mb-6 font-bold uppercase tracking-widest text-white">Contact Us</h2>
            <ul className="space-y-3 text-sm font-medium text-[#A8A8A8]">
              {contactItems.map((item) => (
                <li key={item.label}>
                  {item.href ? (
                    <a href={item.href} className="transition hover:text-[#FC2B24]">
                      {item.label}
                    </a>
                  ) : (
                    item.label
                  )}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      <div className="mx-auto max-w-7xl border-t border-white/10 px-6 pt-8 text-center text-sm text-gray-600">
        © {siteConfig.copyrightYear} {siteConfig.name}. All rights reserved. Built for champions.
      </div>
    </footer>
  );
}

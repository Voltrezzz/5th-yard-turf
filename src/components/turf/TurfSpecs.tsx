import Image from "next/image";
import Link from "next/link";

import { siteConfig } from "@/lib/site-config";

const rules = [
  "Wear turf shoes or flat soles; metal studs are not allowed.",
  "Keep food and chewing gum outside the playing arena.",
  "Please clear the pitch promptly when your slot ends.",
] as const;

export function TurfSpecs() {
  const specs = [
    { label: "Arena", value: "1 exclusive multi-sport turf" },
    ...(siteConfig.turf.dimensions ? [{ label: "Dimensions", value: siteConfig.turf.dimensions }] : []),
    { label: "Surface", value: siteConfig.turf.surface },
    { label: "Lighting", value: siteConfig.turf.lighting },
    { label: "Sports", value: siteConfig.turf.sports.join(" + ") },
  ];

  return (
    <div id="turf-details">
      <section className="border-y border-white/[0.06] bg-[#080808] py-20 sm:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-20">
          <div className="relative" data-aos="fade-right">
            <div className="image-frame relative aspect-[4/5] overflow-hidden rounded-[1.75rem] sm:aspect-square lg:aspect-[4/5]">
              <Image
                src="/assets/media_1788502538698.jpg"
                alt="Winning football team celebrating with trophies under 5th Yard floodlights"
                fill
                sizes="(max-width: 1024px) 100vw, 42vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/82 via-transparent to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                <p className="section-label">Venue experience</p>
                <p className="mt-3 font-display text-3xl font-bold uppercase leading-tight text-white sm:text-4xl">
                  Bright lights. Big games. Better memories.
                </p>
              </div>
            </div>
          </div>

          <div data-aos="fade-left">
            <p className="section-label">Performance by design</p>
            <h2 className="section-title mt-4">
              Everything the game needs. <span>Nothing it doesn&apos;t.</span>
            </h2>
            <div className="mt-9 grid gap-3 sm:grid-cols-2">
              {specs.map((spec, index) => (
                <div key={spec.label} className="spec-card" data-aos="fade-up" data-aos-delay={index * 60}>
                  <p>{spec.label}</p>
                  <h3>{spec.value}</h3>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/42">Facilities included</p>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {siteConfig.turf.facilities.map((facility) => (
                  <li key={facility} className="facility-pill">
                    <span aria-hidden="true">✓</span> {facility}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell relative overflow-hidden py-20 sm:py-28">
        <div className="section-orb section-orb-right" aria-hidden="true" />
        <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          <div data-aos="fade-right">
            <p className="section-label">Match-day essentials</p>
            <h2 className="section-title mt-4">
              Easy to scan. <span>Easy to play.</span>
            </h2>

            <div className="mt-9 grid gap-3 sm:grid-cols-2">
              <div className="turf-price-card">
                <span>Weekday</span>
                <strong>₹{siteConfig.pricing.weekday.baseRate.toLocaleString("en-IN")}</strong>
                <small>per 60-minute slot</small>
              </div>
              <div className="turf-price-card turf-price-card-featured">
                <span>Weekend</span>
                <strong>₹{siteConfig.pricing.weekend.baseRate.toLocaleString("en-IN")}</strong>
                <small>per 60-minute slot</small>
              </div>
            </div>

            <p className="mt-5 text-sm leading-7 text-white/48">
              Add 30 or 60 minutes when adjoining time is available. A ₹{siteConfig.pricing.advanceAmount} advance secures the booking.
            </p>
            <p className="mt-2 text-xs leading-6 text-white/35">
              {siteConfig.booking.cancellationPolicy}
            </p>
          </div>

          <div className="rules-panel" data-aos="fade-left">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#FC2B24]">Play clean</p>
            <h2 className="mt-3 font-display text-3xl font-bold uppercase text-white">Three simple turf rules.</h2>
            <ul className="mt-7 space-y-5">
              {rules.map((rule, index) => (
                <li key={rule}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <p>{rule}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="turf-cta mx-auto mb-20 max-w-7xl overflow-hidden rounded-[1.75rem] sm:mb-28" data-aos="zoom-in">
        <Image
          src="/assets/media_1788502538710.jpg"
          alt="Football team posing with their trophies at 5th Yard Turf"
          fill
          sizes="(max-width: 1280px) 100vw, 1280px"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/75 to-black/25" />
        <div className="relative z-10 max-w-2xl px-6 py-16 sm:px-12 sm:py-20">
          <p className="section-label">Your next match</p>
          <h2 className="mt-4 font-display text-4xl font-bold uppercase leading-[0.95] text-white sm:text-6xl">
            Bring the squad. <span className="text-[#FC2B24]">We&apos;ll light the pitch.</span>
          </h2>
          <Link href="/book" className="btn-primary mt-8 inline-block px-8 py-4 font-display text-lg font-bold uppercase tracking-[0.16em]">
            Book the turf now
          </Link>
        </div>
      </section>
    </div>
  );
}

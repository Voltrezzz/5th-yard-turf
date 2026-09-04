import Link from "next/link";

import { siteConfig } from "@/lib/site-config";

const bookingSteps = [
  { number: "01", title: "Pick a date", copy: "Browse the next 30 days." },
  { number: "02", title: "Choose your hour", copy: "See live slot availability." },
  { number: "03", title: "Lock it in", copy: "Pay the ₹500 advance." },
] as const;

export function PricingSection() {
  return (
    <section className="pricing-stage relative overflow-hidden py-20 sm:py-28">
      <div className="pricing-grid" aria-hidden="true" />
      <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:gap-20">
        <div data-aos="fade-right">
          <p className="section-label">Clear pricing</p>
          <h2 className="section-title mt-4">
            More game. <span>No surprise fees.</span>
          </h2>
          <p className="mt-6 max-w-lg text-base leading-8 text-white/55">
            Start with one hour and extend in 30-minute blocks. A ₹500 advance secures the
            slot; the remaining balance is paid at the venue.
          </p>

          <div className="mt-9 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            {bookingSteps.map((step, index) => (
              <div key={step.number} className="booking-step" data-aos="fade-up" data-aos-delay={index * 80}>
                <span>{step.number}</span>
                <h3>{step.title}</h3>
                <p>{step.copy}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="pricing-board" data-aos="fade-left">
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-5 sm:px-8">
            <div>
              <p className="text-[0.62rem] font-bold uppercase tracking-[0.24em] text-[#FC2B24]">
                Match rates
              </p>
              <p className="mt-1 text-sm text-white/42">60-minute base slot</p>
            </div>
            <span className="live-pill"><i /> Booking open</span>
          </div>

          <div className="grid md:grid-cols-2">
            <div className="price-panel border-b border-white/10 md:border-b-0 md:border-r">
              <p>Monday — Friday</p>
              <h3>
                ₹{siteConfig.pricing.weekday.baseRate.toLocaleString("en-IN")}
                <span>/ hour</span>
              </h3>
              <small>
                +₹{siteConfig.pricing.weekday.extensionRate.toLocaleString("en-IN")} per 30 mins
              </small>
            </div>
            <div className="price-panel price-panel-featured">
              <span className="price-badge">Weekend energy</span>
              <p>Saturday — Sunday</p>
              <h3>
                ₹{siteConfig.pricing.weekend.baseRate.toLocaleString("en-IN")}
                <span>/ hour</span>
              </h3>
              <small>
                +₹{siteConfig.pricing.weekend.extensionRate.toLocaleString("en-IN")} per 30 mins
              </small>
            </div>
          </div>

          <div className="flex flex-col gap-5 border-t border-white/10 bg-white/[0.025] px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <p className="text-sm leading-6 text-white/52">
              Secure any slot with a <strong className="text-white">₹500 advance</strong>.
              <span className="mt-1 block text-xs text-white/35">
                The advance is non-refundable if a confirmed booking is cancelled.
              </span>
            </p>
            <Link
              href="/book"
              className="btn-primary min-h-12 whitespace-nowrap px-7 py-3 text-center font-display font-bold uppercase tracking-[0.15em]"
            >
              Find a slot
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

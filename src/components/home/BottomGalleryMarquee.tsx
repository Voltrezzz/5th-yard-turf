"use client";

import Image from "next/image";
import Link from "next/link";

import { siteConfig } from "@/lib/site-config";

function SocialGalleryGroup({ duplicate = false }: { duplicate?: boolean }) {
  return (
    <div className="social-marquee-group" aria-hidden={duplicate || undefined}>
      {siteConfig.bottomGalleryImages.map((image, index) => (
        <figure key={`${duplicate ? "duplicate" : "original"}-${image.src}`} className="social-gallery-card group">
          <Image
            src={image.src}
            alt={duplicate ? "" : image.alt}
            fill
            sizes="(max-width: 640px) 82vw, (max-width: 1024px) 52vw, 460px"
            className="object-cover transition duration-700 group-hover:scale-105 group-hover:saturate-125"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/78 via-transparent to-transparent" />
          <figcaption className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5">
            <div>
              <span className="text-[0.6rem] font-bold uppercase tracking-[0.22em] text-[#FC2B24]">
                5th Yard Stories
              </span>
              <p className="mt-1 font-display text-xl font-bold uppercase text-white sm:text-2xl">
                {index === 2 ? "Every guest is welcome" : index === 0 || index > 2 ? "Champions under the lights" : "Teams that own the night"}
              </p>
            </div>
            <span className="grid size-9 shrink-0 place-items-center rounded-full border border-white/25 bg-black/30 text-white backdrop-blur-md" aria-hidden="true">
              ↗
            </span>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
export function BottomGalleryMarquee() {
  return (
    <section className="social-showcase relative overflow-hidden py-20 sm:py-28" aria-labelledby="social-gallery-title">
      <div className="section-orb section-orb-right" aria-hidden="true" />
      <div className="mx-auto mb-10 flex max-w-7xl flex-col justify-between gap-5 px-5 sm:px-6 md:flex-row md:items-end">
        <div data-aos="fade-up">
          <p className="section-label">Real teams. Real turf.</p>
          <h2 id="social-gallery-title" className="section-title mt-4 max-w-3xl">
            The moments people <span>share after the final whistle.</span>
          </h2>
        </div>
        <p className="max-w-sm text-sm leading-7 text-white/48 md:text-right" data-aos="fade-up" data-aos-delay="100">
          Swipe-worthy nights, trophy frames, and the community that keeps coming back.
        </p>
      </div>

      <div className="social-marquee-window">
        <div className="social-marquee-track">
          <SocialGalleryGroup />
          <SocialGalleryGroup duplicate />
        </div>
      </div>

      <div className="mx-auto mt-12 flex max-w-7xl flex-col items-start justify-between gap-6 px-5 sm:px-6 md:flex-row md:items-center">
        <p className="max-w-2xl font-display text-2xl font-bold uppercase leading-tight text-white sm:text-3xl">
          Your team deserves the next frame. <span className="text-[#FC2B24]">Claim the pitch.</span>
        </p>
        <Link
          href="/book"
          className="btn-primary min-h-14 w-full px-8 py-4 text-center font-display text-lg font-bold uppercase tracking-[0.16em] sm:w-auto"
        >
          Book the turf
        </Link>
      </div>
    </section>
  );
}

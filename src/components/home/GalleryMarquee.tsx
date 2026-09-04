"use client";

import Image from "next/image";

const arenaDetails = [
  { src: "/assets/turf-front-view.jpg", alt: "Full-width sunset view of 5th Yard Turf", label: "Full Arena" },
  { src: "/assets/turf-top-view.png", alt: "Top-down view of the striped playing surface", label: "Pitch Layout" },
  { src: "/assets/cricket-gear.jpg", alt: "Cricket equipment arranged on the turf", label: "Cricket Ready" },
  { src: "/assets/tennis-balls.jpg", alt: "Yellow cricket balls arranged on artificial grass", label: "Game Kit" },
] as const;

function DetailGroup({ duplicate = false }: { duplicate?: boolean }) {
  return (
    <div className="detail-marquee-group" aria-hidden={duplicate || undefined}>
      {arenaDetails.map((item) => (
        <figure key={`${duplicate ? "duplicate" : "original"}-${item.src}`} className="detail-marquee-card">
          <Image
            src={item.src}
            alt={duplicate ? "" : item.alt}
            fill
            sizes="(max-width: 640px) 78vw, 420px"
            className={item.src.endsWith(".png") ? "object-contain p-4" : "object-cover"}
          />
          <figcaption>{item.label}</figcaption>
        </figure>
      ))}
    </div>
  );
}
export function GalleryMarquee() {
  return (
    <section className="overflow-hidden border-y border-white/[0.06] bg-[#111] py-12" aria-label="Arena detail gallery">
      <div className="mb-8 px-5 text-center sm:px-6" data-aos="fade-up">
        <p className="section-label">The details matter</p>
        <h2 className="mt-3 font-display text-3xl font-bold uppercase text-white sm:text-4xl">
          Match-ready from every angle.
        </h2>
      </div>
      <div className="detail-marquee-window">
        <div className="detail-marquee-track">
          <DetailGroup />
          <DetailGroup duplicate />
        </div>
      </div>
    </section>
  );
}

import Image from "next/image";
import Link from "next/link";

const gallery = [
  {
    src: "/assets/turf-front-view.jpg",
    alt: "Wide front view of the striped green 5th Yard Turf",
    label: "Arena Front",
    className: "md:col-span-2 md:row-span-2",
  },
  {
    src: "/assets/turf-top-view.png",
    alt: "Top-down view showing the full football pitch layout",
    label: "Full Layout",
    className: "bg-black",
  },
  {
    src: "/assets/media_1788502538683.jpg",
    alt: "Football team posing together after a match at night",
    label: "Night Matches",
    className: "",
  },
] as const;

export function TurfGallery() {
  return (
    <>
      <header className="turf-hero">
        <Image
          src="/assets/turf-front-view.jpg"
          alt="5th Yard Turf glowing in late-afternoon light"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/68 to-black/15" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-black/35" />
        <div className="hero-grid" aria-hidden="true" />

        <div className="relative z-10 mx-auto flex min-h-[72svh] max-w-7xl items-end px-5 pb-14 pt-28 sm:px-6 sm:pb-20">
          <div className="max-w-4xl">
            <p className="section-label">Inside 5th Yard</p>
            <h1 className="mt-5 font-display text-[clamp(4.4rem,13vw,10rem)] font-bold uppercase leading-[0.82] tracking-[-0.035em] text-white">
              The <span className="block text-[#FC2B24]">Arena</span>
            </h1>
            <p className="mt-7 max-w-2xl text-base font-medium leading-8 text-white/68 sm:text-xl">
              A premium 4G arena designed for fast football, high-energy cricket, and unforgettable floodlit nights.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/book" className="btn-primary px-8 py-4 text-center font-display text-lg font-bold uppercase tracking-[0.16em]">
                Book this arena
              </Link>
              <a href="#turf-details" className="btn-secondary px-8 py-4 text-center font-display text-lg font-bold uppercase tracking-[0.16em]">
                See the details
              </a>
            </div>
          </div>
        </div>
      </header>

      <section className="turf-gallery-section section-shell py-20 sm:py-28" aria-labelledby="arena-gallery-title">
        <div className="mx-auto max-w-7xl px-5 sm:px-6">
          <div className="mb-10 flex flex-col justify-between gap-5 md:mb-14 md:flex-row md:items-end">
            <div data-aos="fade-up">
              <p className="section-label">See the space</p>
              <h2 id="arena-gallery-title" className="section-title mt-4">
                Built to look as good <span>as the game feels.</span>
              </h2>
            </div>
            <dl className="grid grid-cols-3 gap-5 border-t border-white/10 pt-5 md:border-0 md:pt-0" data-aos="fade-up" data-aos-delay="100">
              <div><dt>Surface</dt><dd>4G</dd></div>
              <div><dt>Lights</dt><dd>500L</dd></div>
              <div><dt>Sports</dt><dd>02</dd></div>
            </dl>
          </div>

          <div className="grid auto-rows-[280px] gap-4 md:grid-cols-3 md:auto-rows-[300px]">
            {gallery.map((image, index) => (
              <figure
                key={image.src}
                className={`arena-gallery-card group ${image.className}`}
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes={index === 0 ? "(max-width: 768px) 100vw, 66vw" : "(max-width: 768px) 100vw, 33vw"}
                  className={image.src.endsWith(".png") ? "object-contain p-5 transition duration-700 group-hover:scale-105" : "object-cover transition duration-700 group-hover:scale-105"}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
                <figcaption>{image.label}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

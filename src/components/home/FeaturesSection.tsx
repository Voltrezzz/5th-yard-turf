import Image from "next/image";

const experiences = [
  {
    eyebrow: "Football",
    title: "Fast surface. Clean roll.",
    copy: "Responsive 4G turf made for quick turns, confident tackles, and nonstop five-a-side pace.",
    image: "/assets/media_1788502538683.jpg",
    alt: "Football team celebrating together under the lights at 5th Yard Turf",
    className: "md:col-span-2 md:row-span-2",
  },
  {
    eyebrow: "Cricket",
    title: "Box cricket ready.",
    copy: "A controlled arena and the right equipment for high-energy evening cricket.",
    image: "/assets/cricket-gear.jpg",
    alt: "Cricket bats, stumps and balls arranged on artificial turf",
    className: "",
  },
  {
    eyebrow: "Night Play",
    title: "Floodlit after dark.",
    copy: "Anti-glare lighting keeps every pass and high ball visible.",
    image: "/assets/media_1788502538698.jpg",
    alt: "Tournament-winning football team under bright arena floodlights",
    className: "",
  },
] as const;

export function FeaturesSection() {
  return (
    <section className="section-shell border-y border-white/[0.06] bg-[#080808] py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-6">
        <div className="mb-10 flex flex-col justify-between gap-5 md:mb-14 md:flex-row md:items-end">
          <div data-aos="fade-up">
            <p className="section-label">Choose your energy</p>
            <h2 className="section-title mt-4 max-w-3xl">
              One arena. <span>Every kind of game night.</span>
            </h2>
          </div>
          <p className="max-w-md text-sm leading-7 text-white/50 md:text-right" data-aos="fade-up" data-aos-delay="100">
            From a tight football final to a late-night cricket rivalry, the venue is built to
            keep every frame sharp and every game moving.
          </p>
        </div>

        <div className="grid auto-rows-[270px] gap-4 md:grid-cols-3 md:auto-rows-[260px]">
          {experiences.map((experience, index) => (
            <article
              key={experience.title}
              className={`experience-card group ${experience.className}`}
              data-aos="fade-up"
              data-aos-delay={index * 90}
            >
              <Image
                src={experience.image}
                alt={experience.alt}
                fill
                sizes={index === 0 ? "(max-width: 768px) 100vw, 66vw" : "(max-width: 768px) 100vw, 33vw"}
                className="object-cover transition duration-700 group-hover:scale-105 group-hover:saturate-125"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/15 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-7">
                <p className="text-[0.65rem] font-bold uppercase tracking-[0.24em] text-[#FC2B24]">
                  {experience.eyebrow}
                </p>
                <h3 className="mt-2 font-display text-2xl font-bold uppercase text-white sm:text-3xl">
                  {experience.title}
                </h3>
                <p className="mt-2 max-w-lg text-sm leading-6 text-white/62 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
                  {experience.copy}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

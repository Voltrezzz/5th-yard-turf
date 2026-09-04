import Image from "next/image";
import Link from "next/link";

const highlights = [
  { value: "10K+", label: "Matches played" },
  { value: "100%", label: "Pro surface" },
  { value: "2", label: "Sports, one arena" },
] as const;

export function AboutSection() {
  return (
    <section id="about" className="section-shell relative overflow-hidden py-20 sm:py-28">
      <div className="section-orb section-orb-left" aria-hidden="true" />
      <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:gap-20">
        <div className="relative" data-aos="fade-right">
          <div className="image-frame relative aspect-[4/3] overflow-hidden rounded-[1.75rem]">
            <Image
              src="/assets/turf-front-view.jpg"
              alt="Wide sunset view across the 5th Yard artificial turf arena"
              fill
              sizes="(max-width: 1024px) 100vw, 56vw"
              className="object-cover transition-transform duration-1000 hover:scale-[1.035]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4">
              <div>
                <span className="section-label">The Ground</span>
                <p className="mt-2 font-display text-2xl font-bold uppercase text-white sm:text-3xl">
                  Built for full-send moments.
                </p>
              </div>
              <span className="hidden rounded-full border border-white/20 bg-black/40 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white backdrop-blur-md sm:block">
                Open daily
              </span>
            </div>
          </div>

          <div className="absolute -bottom-7 -right-1 hidden w-44 rounded-2xl border border-[#FC2B24]/30 bg-[#111]/90 p-5 shadow-2xl backdrop-blur-xl sm:block lg:-right-7">
            <p className="font-display text-4xl font-bold text-[#FC2B24]">4G</p>
            <p className="mt-1 text-xs font-bold uppercase leading-relaxed tracking-[0.16em] text-white/60">
              Premium synthetic grass
            </p>
          </div>
        </div>

        <div data-aos="fade-left">
          <p className="section-label">More than a pitch</p>
          <h2 className="section-title mt-4 max-w-xl">
            The city&apos;s next <span>match story</span> starts here.
          </h2>
          <p className="mt-6 max-w-xl text-base leading-8 text-white/58 sm:text-lg">
            Built by people who love the game, 5TH YARD TURF brings tournament-grade energy
            to every kick-off, cricket night, corporate fixture, and friends-only showdown.
          </p>

          <dl className="mt-9 grid grid-cols-3 gap-3">
            {highlights.map((item, index) => (
              <div
                key={item.label}
                className="stat-tile"
                data-aos="fade-up"
                data-aos-delay={index * 90}
              >
                <dt className="font-display text-3xl font-bold text-white sm:text-4xl">
                  {item.value}
                </dt>
                <dd className="mt-2 text-[0.62rem] font-bold uppercase leading-relaxed tracking-[0.14em] text-white/45 sm:text-xs">
                  {item.label}
                </dd>
              </div>
            ))}
          </dl>

          <Link
            href="/turf"
            className="mt-9 inline-flex min-h-12 items-center gap-3 font-bold uppercase tracking-[0.15em] text-white transition-colors hover:text-[#FC2B24]"
          >
            See the complete arena
            <span className="grid size-10 place-items-center rounded-full border border-[#FC2B24]/50 text-[#FC2B24]" aria-hidden="true">
              →
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}

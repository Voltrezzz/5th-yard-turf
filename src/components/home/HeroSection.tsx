"use client";

import type { Engine, ISourceOptions } from "@tsparticles/engine";
import Particles, { ParticlesProvider } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

const videoPlaylist = [
  "https://assets.mixkit.co/videos/preview/mixkit-playing-football-on-a-grass-field-41865-large.mp4",
  "https://videos.pexels.com/video-files/6104273/6104273-uhd_2732_1440_25fps.mp4",
  "https://assets.mixkit.co/videos/preview/mixkit-young-man-playing-soccer-in-a-field-41887-large.mp4",
] as const;

const particlesOptions: ISourceOptions = {
  fullScreen: { enable: false },
  fpsLimit: 45,
  detectRetina: true,
  pauseOnBlur: true,
  interactivity: {
    events: {
      onHover: { enable: true, mode: "bubble" },
    },
    modes: {
      bubble: { distance: 160, duration: 1.5, opacity: 0.7, size: 4 },
    },
  },
  particles: {
    color: { value: "#FC2B24" },
    links: { enable: false },
    move: {
      direction: "top",
      enable: true,
      outModes: { default: "out" },
      random: true,
      speed: 0.45,
      straight: false,
    },
    number: { density: { enable: true, width: 900, height: 900 }, value: 24 },
    opacity: { value: { min: 0.08, max: 0.38 } },
    shape: { type: "circle" },
    size: { value: { min: 1, max: 2.8 } },
  },
};

const initParticles = async (engine: Engine) => {
  await loadSlim(engine);
};

export function HeroSection() {
  const [videoIndex, setVideoIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const mediaRef = useRef<HTMLDivElement>(null);

  const playNextVideo = useCallback(() => {
    setVideoIndex((current) => (current + 1) % videoPlaylist.length);
  }, []);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotionPreference = () => setReducedMotion(motionQuery.matches);
    updateMotionPreference();
    motionQuery.addEventListener("change", updateMotionPreference);

    return () => motionQuery.removeEventListener("change", updateMotionPreference);
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      return;
    }

    let frameId = 0;
    const updateParallax = () => {
      frameId = 0;
      if (!mediaRef.current) {
        return;
      }

      const offset = Math.min(window.scrollY * 0.16, 90);
      mediaRef.current.style.transform = `translate3d(0, ${offset}px, 0) scale(1.04)`;
    };

    const handleScroll = () => {
      if (!frameId) {
        frameId = window.requestAnimationFrame(updateParallax);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, [reducedMotion]);

  return (
    <section className="home-hero" aria-labelledby="home-hero-title">
      <div ref={mediaRef} className="hero-media" aria-hidden="true">
        <video
          key={videoPlaylist[videoIndex]}
          className="hero-video"
          autoPlay={!reducedMotion}
          muted
          playsInline
          poster="/assets/turf-front-view.jpg"
          onEnded={playNextVideo}
          onError={playNextVideo}
        >
          <source src={videoPlaylist[videoIndex]} type="video/mp4" />
        </video>
      </div>

      <div className="hero-vignette" aria-hidden="true" />
      <div className="hero-grid" aria-hidden="true" />

      {!reducedMotion ? (
        <ParticlesProvider init={initParticles}>
          <div aria-hidden="true">
            <Particles id="hero-particles" options={particlesOptions} />
          </div>
        </ParticlesProvider>
      ) : null}

      <div className="relative z-10 mx-auto grid w-full max-w-7xl items-end gap-10 px-5 pb-10 pt-20 sm:px-6 sm:pb-14 lg:grid-cols-[minmax(0,1fr)_300px] lg:pb-16">
        <div className="max-w-4xl">
          <p className="hero-kicker mb-5 font-bold uppercase tracking-[0.28em] text-white/80">
            Football <span aria-hidden="true">•</span> Cricket <span aria-hidden="true">•</span> Night Play
          </p>

          <h1
            id="home-hero-title"
            className="hero-title font-display font-bold uppercase leading-[0.82] tracking-[-0.035em] text-white"
          >
            <span className="block">5TH YARD</span>
            <span className="hero-title-accent block text-[#FC2B24]">TURF</span>
          </h1>

          <div className="mt-7 grid gap-7 lg:grid-cols-[minmax(0,610px)_auto] lg:items-end">
            <div>
              <p className="max-w-2xl text-base font-medium leading-relaxed text-white/78 sm:text-lg md:text-xl">
                Premium football and cricket arena. Pro-grade 4G turf, floodlit nights,
                and the energy your team came for.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/book"
                  className="btn-primary min-h-14 px-8 py-4 text-center font-display text-lg font-bold uppercase tracking-[0.16em]"
                >
                  Book Your Game
                </Link>
                <Link
                  href="/turf"
                  className="btn-secondary min-h-14 px-8 py-4 text-center font-display text-lg font-bold uppercase tracking-[0.16em]"
                >
                  Explore Arena
                </Link>
              </div>
            </div>
          </div>

          <dl className="hero-stats mt-9 grid grid-cols-3 gap-2 border-t border-white/15 pt-5 sm:max-w-2xl sm:gap-6">
            <div>
              <dt>Open Daily</dt>
              <dd>9AM–10PM</dd>
            </div>
            <div>
              <dt>Surface</dt>
              <dd>Premium 4G</dd>
            </div>
            <div>
              <dt>Lighting</dt>
              <dd>500 Lux</dd>
            </div>
          </dl>
        </div>

        <aside className="hero-social-card hidden lg:block" aria-label="Real 5th Yard tournament moment">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[1.25rem]">
            <Image
              src="/assets/media_1788502538698.jpg"
              alt="Tournament winners holding their trophy at 5th Yard Turf"
              fill
              priority
              sizes="300px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/5 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5">
              <span className="mb-2 inline-flex rounded-full border border-white/20 bg-black/45 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-white backdrop-blur-md">
                Real turf. Real teams.
              </span>
              <p className="font-display text-2xl font-bold uppercase leading-tight text-white">
                Built for the winning frame.
              </p>
            </div>
          </div>
        </aside>
      </div>

      <a href="#about" className="hero-scroll-cue" aria-label="Scroll to discover the arena">
        <span>Scroll</span>
        <span className="hero-scroll-line" aria-hidden="true" />
      </a>
    </section>
  );
}

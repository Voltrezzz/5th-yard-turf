"use client";

import AOS from "aos";
import { useEffect } from "react";

export function AOSProvider() {
  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    AOS.init({
      duration: reducedMotion ? 0 : 1000,
      once: true,
      easing: "ease-out-cubic",
      offset: 100,
      disable: reducedMotion,
    });

    return () => AOS.refreshHard();
  }, []);

  return null;
}

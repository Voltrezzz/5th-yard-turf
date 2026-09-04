"use client";

import { useEffect, useRef } from "react";

export function MouseGlow() {
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const glow = glowRef.current;
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!glow || !finePointer || reducedMotion) {
      return;
    }

    const handlePointerMove = (event: PointerEvent) => {
      glow.style.left = `${event.clientX}px`;
      glow.style.top = `${event.clientY}px`;
    };

    const handlePointerLeave = () => {
      glow.style.left = "-1000px";
      glow.style.top = "-1000px";
    };

    document.addEventListener("pointermove", handlePointerMove, { passive: true });
    document.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, []);

  return (
    <div
      ref={glowRef}
      className="mouse-glow"
      style={{ top: -1000, left: -1000 }}
      aria-hidden="true"
    />
  );
}

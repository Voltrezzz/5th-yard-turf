"use client";

import { useEffect, useState } from "react";

import { TOAST_EVENT, type ToastDetail } from "@/hooks/useToast";

export function Toast() {
  const [toast, setToast] = useState<ToastDetail | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const handleToast = (event: Event) => {
      const customEvent = event as CustomEvent<ToastDetail>;
      setToast(customEvent.detail);
      setVisible(true);

      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(() => setVisible(false), customEvent.detail.duration ?? 3500);
    };

    window.addEventListener(TOAST_EVENT, handleToast);

    return () => {
      window.removeEventListener(TOAST_EVENT, handleToast);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  if (!toast) {
    return null;
  }

  const toneClasses = {
    success: "border-emerald-500/50 text-emerald-100",
    error: "border-[#FC2B24]/60 text-red-100",
    info: "border-white/15 text-white",
  }[toast.tone ?? "info"];

  return (
    <div
      id="toast"
      className={`${visible ? "show" : ""} neu-surface max-w-[calc(100vw-2rem)] border px-6 py-4 ${toneClasses}`}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <p className="text-sm font-bold">{toast.message}</p>
    </div>
  );
}

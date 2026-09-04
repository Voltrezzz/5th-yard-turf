"use client";

import { useCallback } from "react";

export const TOAST_EVENT = "5th-yard:toast";

export interface ToastDetail {
  message: string;
  tone?: "success" | "error" | "info";
  duration?: number;
}

export function showToast(detail: ToastDetail) {
  window.dispatchEvent(new CustomEvent<ToastDetail>(TOAST_EVENT, { detail }));
}

export function useToast() {
  return useCallback((detail: ToastDetail) => showToast(detail), []);
}

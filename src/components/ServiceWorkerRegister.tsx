"use client";

import { useEffect } from "react";

/**
 * Registers the hand-written service worker (see /public/sw.js).
 *
 * We register from a client component (not a <script> in <head>) so it
 * only ever runs in the browser, after hydration, and can't block the
 * initial render on Cloudflare Pages' static export.
 *
 * There's no Background Sync registration here on purpose — Safari on iOS
 * doesn't implement it. Instead, the `online` listener below just asks the
 * service worker to refresh its cache the next time the device reconnects,
 * which is enough for a content app that has no server writes to reconcile.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    let registration: ServiceWorkerRegistration | undefined;

    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        registration = reg;
      })
      .catch((err) => {
        console.warn("Service worker registration failed:", err);
      });

    const handleOnline = () => {
      registration?.active?.postMessage({ type: "REFRESH_CACHE" });
    };
    window.addEventListener("online", handleOnline);

    return () => window.removeEventListener("online", handleOnline);
  }, []);

  return null;
}

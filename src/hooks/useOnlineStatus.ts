"use client";

import { useEffect, useState } from "react";

/**
 * Tracks connectivity using the plain `online`/`offline` window events.
 *
 * We deliberately do NOT use the Background Sync API here — it isn't
 * supported in iOS Safari, and this app needs to behave identically across
 * Windows, macOS, and iOS. Everything the learner does is written straight
 * to IndexedDB the moment it happens, so "syncing when back online" isn't
 * needed for progress data; this hook exists purely to drive the UI
 * indicator and to let pages re-check content freshness when the device
 * reconnects.
 */
export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState<boolean>(true);

  useEffect(() => {
    setIsOnline(typeof navigator !== "undefined" ? navigator.onLine : true);
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  return isOnline;
}

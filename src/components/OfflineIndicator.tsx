"use client";

import { useOnlineStatus } from "@/hooks/useOnlineStatus";

export function OfflineIndicator() {
  const isOnline = useOnlineStatus();

  return (
    <div
      className={[
        "flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
        isOnline
          ? "bg-owl-50 text-owl-700 dark:bg-owl-500/10 dark:text-owl-300"
          : "bg-gold-300/40 text-ink dark:bg-gold-500/20 dark:text-gold-300",
      ].join(" ")}
      role="status"
    >
      <span
        className={["h-1.5 w-1.5 rounded-full", isOnline ? "bg-owl-500" : "bg-gold-500"].join(" ")}
        aria-hidden
      />
      {isOnline ? "Saved on this device" : "Offline — saving on this device"}
    </div>
  );
}

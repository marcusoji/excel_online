import Dexie, { type EntityTable } from "dexie";
import type { BadgeRecord, LessonProgress, Preferences } from "@/types";

/**
 * All progress lives on-device, in IndexedDB, via Dexie.
 *
 * Nothing here ever talks to a network. There is no account and no sync —
 * "your device" is the entire source of truth. That has two consequences
 * we design around elsewhere in the app:
 *   1. iOS Safari can evict IndexedDB data after ~7 days of inactivity
 *      (Intelligent Tracking Prevention). We can't prevent that from a web
 *      app, so we surface it honestly (see OfflineIndicator) rather than
 *      pretend progress is guaranteed forever.
 *   2. There's no Background Sync on iOS. We don't need it — everything is
 *      written synchronously to IndexedDB the moment it happens — but any
 *      "retry when back online" logic elsewhere uses the plain `online`
 *      window event, not the Background Sync API.
 */
export class ExcelMagicDB extends Dexie {
  lessonProgress!: EntityTable<LessonProgress, "lessonId">;
  badges!: EntityTable<BadgeRecord, "badgeId">;
  preferences!: EntityTable<Preferences, "id">;
  xpLog!: EntityTable<{ id?: number; amount: number; source: string; day: string; at: number }, "id">;

  constructor() {
    super("excel-magic-academy");
    this.version(1).stores({
      lessonProgress: "lessonId, completed, lastVisitedAt",
      badges: "badgeId, earnedAt",
      preferences: "id",
      xpLog: "++id, day, at",
    });
    // The app used to offer "kid"/"pro" visual modes. It's now a single adult
    // curriculum with two density modes, so any stored preference is migrated
    // to the equivalent new value rather than silently rendering an unknown mode.
    this.version(2)
      .stores({
        lessonProgress: "lessonId, completed, lastVisitedAt",
        badges: "badgeId, earnedAt",
        preferences: "id",
        xpLog: "++id, day, at",
      })
      .upgrade(async (tx) => {
        await tx
          .table("preferences")
          .toCollection()
          .modify((prefs: { mode?: string }) => {
            if (prefs.mode === "kid") prefs.mode = "focus";
            else if (prefs.mode === "pro") prefs.mode = "analyst";
          });
      });
  }
}

// A single shared instance. Dexie handles the IndexedDB connection lifecycle
// for us, including reconnecting after the tab is backgrounded.
export const db = new ExcelMagicDB();

export const DEFAULT_PREFERENCES: Preferences = {
  id: "singleton",
  mode: "focus",
  theme: "system",
  reducedMotion: false,
  soundOn: true,
  hasOnboarded: false,
  displayName: "Learner",
  streakDays: 0,
};

/** True once we've confirmed IndexedDB is actually writable on this device. */
export async function verifyStorageIsWritable(): Promise<boolean> {
  try {
    await db.preferences.get("singleton");
    return true;
  } catch (err) {
    console.warn("IndexedDB unavailable, progress will not persist:", err);
    return false;
  }
}

export function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

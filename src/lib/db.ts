import Dexie, { type EntityTable } from "dexie";
import type { LessonProgress, Preferences } from "@/types";

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
export class AcademyDB extends Dexie {
  lessonProgress!: EntityTable<LessonProgress, "lessonId">;
  preferences!: EntityTable<Preferences, "id">;

  constructor() {
    // The IndexedDB name is deliberately left as the legacy string. It is a
    // stable key for every user's saved progress, so renaming it would orphan
    // existing data even though the product is now called "Excel Academy".
    super("excel-magic-academy");
    this.version(1).stores({
      lessonProgress: "lessonId, completed, lastVisitedAt",
      badges: "badgeId, earnedAt",
      preferences: "id",
      xpLog: "++id, day, at",
    });
    // v2: "kid"/"pro" visual modes became density modes (focus/analyst).
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
    // v3: dropped XP, streaks, and badges — this is a professional curriculum,
    // not a game. The tables and the now-unused fields are removed.
    this.version(3)
      .stores({
        lessonProgress: "lessonId, completed, lastVisitedAt",
        preferences: "id",
      })
      .upgrade(async (tx) => {
        await tx
          .table("preferences")
          .toCollection()
          .modify((prefs: Record<string, unknown>) => {
            delete prefs.soundOn;
            delete prefs.streakDays;
            delete prefs.lastActiveDay;
          });
      });
  }
}

// A single shared instance. Dexie handles the IndexedDB connection lifecycle
// for us, including reconnecting after the tab is backgrounded.
export const db = new AcademyDB();

export const DEFAULT_PREFERENCES: Preferences = {
  id: "singleton",
  mode: "focus",
  theme: "system",
  reducedMotion: false,
  hasOnboarded: false,
  displayName: "Learner",
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

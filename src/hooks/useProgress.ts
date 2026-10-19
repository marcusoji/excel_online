"use client";

import { useCallback } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, DEFAULT_PREFERENCES, todayKey } from "@/lib/db";
import { computeNewlyEarnedBadges } from "@/lib/badges";
import type { AppMode, BadgeDefinition, Preferences, ThemePreference } from "@/types";

export function usePreferences() {
  const stored = useLiveQuery(() => db.preferences.get("singleton"), []);
  const preferences: Preferences = stored ?? DEFAULT_PREFERENCES;
  const ready = stored !== undefined;

  const update = useCallback(async (patch: Partial<Preferences>) => {
    const current = (await db.preferences.get("singleton")) ?? DEFAULT_PREFERENCES;
    await db.preferences.put({ ...current, ...patch, id: "singleton" });
  }, []);

  const setMode = useCallback((mode: AppMode) => update({ mode }), [update]);
  const setTheme = useCallback((theme: ThemePreference) => update({ theme }), [update]);
  const completeOnboarding = useCallback(
    (mode: AppMode, displayName: string) => update({ mode, displayName, hasOnboarded: true }),
    [update]
  );

  return { preferences, ready, update, setMode, setTheme, completeOnboarding };
}

export function useAllLessonProgress() {
  return useLiveQuery(() => db.lessonProgress.toArray(), []);
}

export function useLessonProgress(lessonId: string) {
  return useLiveQuery(() => db.lessonProgress.get(lessonId), [lessonId]);
}

export function useTotalXp(): number {
  const log = useLiveQuery(() => db.xpLog.toArray(), []);
  return (log ?? []).reduce((sum, entry) => sum + entry.amount, 0);
}

export function useBadges() {
  return useLiveQuery(() => db.badges.toArray(), []);
}

async function bumpStreak(): Promise<void> {
  const prefs = (await db.preferences.get("singleton")) ?? DEFAULT_PREFERENCES;
  const today = todayKey();
  if (prefs.lastActiveDay === today) return; // already counted today

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yKey = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;

  const nextStreak = prefs.lastActiveDay === yKey ? prefs.streakDays + 1 : 1;
  await db.preferences.put({ ...prefs, id: "singleton", streakDays: nextStreak, lastActiveDay: today });
}

/**
 * Marks a lesson complete, logs XP (once per lesson — replaying a finished
 * lesson doesn't farm XP), bumps the daily streak, and returns any badges
 * newly earned so the UI can celebrate them.
 */
export async function completeLesson(lessonId: string, xpAward: number): Promise<BadgeDefinition[]> {
  const now = Date.now();
  const existing = await db.lessonProgress.get(lessonId);
  const wasAlreadyCompleted = existing?.completed ?? false;

  await db.lessonProgress.put({
    lessonId,
    completed: true,
    stars: 3,
    bestStepIndex: existing?.bestStepIndex ?? 0,
    completedAt: existing?.completedAt ?? now,
    lastVisitedAt: now,
  });

  await bumpStreak();

  if (wasAlreadyCompleted) return [];

  await db.xpLog.add({ amount: xpAward, source: lessonId, day: todayKey(), at: now });

  const allProgress = await db.lessonProgress.toArray();
  const completedIds = allProgress.filter((p) => p.completed).map((p) => p.lessonId);
  const ownedBadges = (await db.badges.toArray()).map((b) => b.badgeId);
  const newlyEarned = computeNewlyEarnedBadges(completedIds, ownedBadges);

  for (const badge of newlyEarned) {
    await db.badges.add({ badgeId: badge.id, earnedAt: now });
  }

  return newlyEarned;
}

export async function touchLessonVisit(lessonId: string): Promise<void> {
  const existing = await db.lessonProgress.get(lessonId);
  await db.lessonProgress.put({
    lessonId,
    completed: existing?.completed ?? false,
    stars: existing?.stars ?? 0,
    bestStepIndex: existing?.bestStepIndex ?? 0,
    completedAt: existing?.completedAt,
    lastVisitedAt: Date.now(),
  });
}

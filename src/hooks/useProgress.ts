"use client";

import { useCallback } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, DEFAULT_PREFERENCES } from "@/lib/db";
import type { AppMode, Preferences, ThemePreference } from "@/types";

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

/** Marks a lesson complete. Replaying a finished lesson is a no-op for progress. */
export async function completeLesson(lessonId: string): Promise<void> {
  const now = Date.now();
  const existing = await db.lessonProgress.get(lessonId);
  await db.lessonProgress.put({
    lessonId,
    completed: true,
    bestStepIndex: existing?.bestStepIndex ?? 0,
    completedAt: existing?.completedAt ?? now,
    lastVisitedAt: now,
  });
}

export async function touchLessonVisit(lessonId: string): Promise<void> {
  const existing = await db.lessonProgress.get(lessonId);
  await db.lessonProgress.put({
    lessonId,
    completed: existing?.completed ?? false,
    bestStepIndex: existing?.bestStepIndex ?? 0,
    completedAt: existing?.completedAt,
    lastVisitedAt: Date.now(),
  });
}

/**
 * Remembers the furthest step a learner has reached so a part-finished lesson
 * can be resumed later. Only ever moves forward, so revisiting an earlier step
 * doesn't erase progress.
 */
export async function recordStepProgress(lessonId: string, stepIndex: number): Promise<void> {
  const existing = await db.lessonProgress.get(lessonId);
  const best = Math.max(existing?.bestStepIndex ?? 0, stepIndex);
  if (existing && existing.bestStepIndex === best && existing.lastVisitedAt) return;
  await db.lessonProgress.put({
    lessonId,
    completed: existing?.completed ?? false,
    bestStepIndex: best,
    completedAt: existing?.completedAt,
    lastVisitedAt: Date.now(),
  });
}

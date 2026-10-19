import type { BadgeDefinition } from "@/types";
import { LESSONS, LEVELS } from "@/lib/curriculum";

export const LESSON_BADGES: Record<string, BadgeDefinition> = Object.fromEntries(
  Object.values(LESSONS).map((lesson) => [
    `lesson-${lesson.id}`,
    {
      id: `lesson-${lesson.id}`,
      name: `${lesson.title}`,
      icon: lesson.icon,
      description: `Completed "${lesson.title}"`,
    } satisfies BadgeDefinition,
  ])
);

export const LEVEL_BADGES: Record<string, BadgeDefinition> = Object.fromEntries(
  LEVELS.filter((l) => l.lessonIds.length > 0).map((level) => [
    `level-${level.id}`,
    {
      id: `level-${level.id}`,
      name: `${level.title} Graduate`,
      icon: "🏆",
      description: `Completed every lesson in ${level.title}`,
    } satisfies BadgeDefinition,
  ])
);

export const ALL_BADGES: Record<string, BadgeDefinition> = { ...LESSON_BADGES, ...LEVEL_BADGES };

/** Given the full set of completed lesson ids, which new badges (not already owned) were just earned? */
export function computeNewlyEarnedBadges(completedLessonIds: string[], alreadyOwnedBadgeIds: string[]): BadgeDefinition[] {
  const owned = new Set(alreadyOwnedBadgeIds);
  const earned: BadgeDefinition[] = [];

  for (const lessonId of completedLessonIds) {
    const badgeId = `lesson-${lessonId}`;
    if (!owned.has(badgeId) && LESSON_BADGES[badgeId]) earned.push(LESSON_BADGES[badgeId]);
  }

  for (const level of LEVELS) {
    if (level.lessonIds.length === 0) continue;
    const complete = level.lessonIds.every((id) => completedLessonIds.includes(id));
    const badgeId = `level-${level.id}`;
    if (complete && !owned.has(badgeId) && LEVEL_BADGES[badgeId]) earned.push(LEVEL_BADGES[badgeId]);
  }

  return earned;
}

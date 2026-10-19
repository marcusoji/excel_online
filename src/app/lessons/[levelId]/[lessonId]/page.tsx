import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { LESSONS, LEVELS, getLevel } from "@/lib/curriculum";
import { LessonPlayer } from "@/components/LessonPlayer";

export function generateStaticParams() {
  return LEVELS.flatMap((level) => level.lessonIds.map((lessonId) => ({ levelId: level.id, lessonId })));
}

export const dynamicParams = false;

interface LessonPageProps {
  params: Promise<{ levelId: string; lessonId: string }>;
}

export async function generateMetadata({ params }: LessonPageProps): Promise<Metadata> {
  const { lessonId } = await params;
  const lesson = LESSONS[lessonId];
  if (!lesson) return {};
  return { title: lesson.title, description: lesson.tagline };
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { levelId, lessonId } = await params;
  const lesson = LESSONS[lessonId];
  if (!lesson || lesson.levelId !== levelId) notFound();

  const level = getLevel(levelId);

  return (
    <div>
      {level && (
        <div className="max-w-6xl mx-auto px-4 pt-6">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-400">
            Level {level.order} · {level.title}
          </p>
        </div>
      )}
      <LessonPlayer key={lesson.id} lesson={lesson} />
    </div>
  );
}

import { notFound } from "next/navigation";
import { LESSONS, LEVELS } from "@/lib/curriculum";
import { LessonPlayer } from "@/components/LessonPlayer";

export function generateStaticParams() {
  return LEVELS.flatMap((level) => level.lessonIds.map((lessonId) => ({ levelId: level.id, lessonId })));
}

export const dynamicParams = false;

interface LessonPageProps {
  params: Promise<{ levelId: string; lessonId: string }>;
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { levelId, lessonId } = await params;
  const lesson = LESSONS[lessonId];
  if (!lesson || lesson.levelId !== levelId) notFound();

  return <LessonPlayer key={lesson.id} lesson={lesson} />;
}

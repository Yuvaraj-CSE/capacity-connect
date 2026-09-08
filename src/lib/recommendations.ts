import type { Competency, Course } from '../types';

export function getCourseRecommendations(competencies: Competency[], courses: Course[], completedCourseIds: string[] = []) {
  const gaps = competencies
    .map(competency => ({ competency, gap: Math.max(0, competency.required - competency.current) }))
    .filter(item => item.gap > 0)
    .sort((left, right) => right.gap - left.gap);
  const activeGap = gaps[0];
  if (!activeGap) return [];
  return courses
    .filter(course => course.competencyIds.includes(activeGap.competency.id) && !completedCourseIds.includes(course.id))
    .slice(0, 3)
    .map(course => ({ course, competency: activeGap.competency, gap: activeGap.gap }));
}
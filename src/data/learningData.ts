import type { Course, CourseWeek, Question } from '../types';

const quizQuestions = (prefix: string, topics: string[]): Question[] => topics.map((topic, index) => ({
  id: `${prefix}-q${index + 1}`,
  text: `Which statement best describes ${topic}?`,
  options: [
    `It supports evidence-based workplace decisions`,
    'It is only useful for annual reporting',
    'It removes the need for professional judgement',
    'It applies only to technical specialists',
  ],
  correctIndex: 0,
  explanation: `${topic} is most valuable when applied to practical, evidence-based work decisions.`,
}));

export const structuredCourses: Course[] = [
  {
    id: 'co1', title: 'Data Fundamentals for Professionals',
    description: 'Build practical data-analysis capability through a guided six-week programme.',
    category: 'Data Analytics', duration: '6 Weeks', durationMinutes: 1080,
    level: 'Intermediate', tags: ['data', 'analytics', 'fundamentals', 'excel'],
    thumbnail: 'DA', instructor: 'Dr. Anita Rao', modules: 6, enrolledCount: 48, rating: 4.7,
    competencyIds: ['c2'], weeks: 6, weeklyEffort: '3-4 hours/week',
    prerequisites: ['Basic spreadsheet familiarity'],
    outcomes: ['Clean and interpret workplace datasets', 'Build a decision-ready visual summary', 'Explain analytical findings clearly'],
    published: true,
  },
  {
    id: 'co4', title: 'Leadership Essentials',
    description: 'Develop practical leadership habits for communication, delegation, and team development.',
    category: 'Leadership', duration: '4 Weeks', durationMinutes: 720,
    level: 'Intermediate', tags: ['leadership', 'management', 'communication'],
    thumbnail: 'LE', instructor: 'Pradeep Iyengar', modules: 4, enrolledCount: 31, rating: 4.6,
    competencyIds: ['c3'], weeks: 4, weeklyEffort: '3 hours/week',
    prerequisites: ['Current team or project responsibility'],
    outcomes: ['Use structured feedback', 'Delegate with accountability', 'Create a practical team action plan'],
    published: true,
  },
  {
    id: 'co6', title: 'Project Management Professional (PMP) Prep',
    description: 'Apply planning, delivery, agile, and risk-management practices across public programmes.',
    category: 'Project Management', duration: '8 Weeks', durationMinutes: 1440,
    level: 'Advanced', tags: ['pmp', 'agile', 'risk', 'projects'],
    thumbnail: 'PM', instructor: 'Vinay Goswami', modules: 8, enrolledCount: 52, rating: 4.9,
    competencyIds: ['c5'], weeks: 8, weeklyEffort: '3-4 hours/week',
    prerequisites: ['Experience contributing to a project'],
    outcomes: ['Plan milestones and dependencies', 'Manage delivery risks', 'Present a delivery close-out'],
    published: true,
  },
];

function week(courseId: string, number: number, title: string, topics: string[]): CourseWeek {
  const start = new Date(2026, 8, 7 + (number - 1) * 7);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const iso = (date: Date) => date.toISOString().slice(0, 10);
  const videoId = `${courseId}-w${number}-video`;
  return {
    id: `${courseId}-w${number}`,
    courseId,
    weekNumber: number,
    title,
    startsOn: iso(start),
    endsOn: iso(end),
    resources: [
      {
        id: videoId,
        type: 'video',
        title: `${title}: guided session`,
        description: 'A short, focused video lesson with practical examples and a ready-to-use transcript summary.',
        durationMinutes: 28,
        url: 'https://www.youtube.com/watch?v=5qap5aO4i9A',
        transcript: `This weekly learning module is designed to help learners apply the concept in real public-service work. Review the guided video, reflect on the examples, and complete the check for understanding before moving to the next module.`,
        transcriptLanguage: 'en',
      },
      { id: `${courseId}-w${number}-reading`, type: 'reading', title: `${title}: field notes`, description: 'Supporting reading and a workplace reflection prompt.', durationMinutes: 20 },
    ],
    quiz: { id: `${courseId}-w${number}-quiz`, title: `Week ${number} knowledge check`, questions: quizQuestions(`${courseId}-w${number}`, topics), passingScore: 70 },
    assignment: { id: `${courseId}-w${number}-assignment`, title: `${title} workplace task`, description: 'Apply this week\'s learning to a realistic work scenario.', instructions: 'Submit a short response describing the action you would take and the evidence you would use.', deadline: iso(end) },
  };
}

export const courseWeeks: CourseWeek[] = [
  ...[
    'Introduction to data analytics', 'Data collection and cleaning', 'Excel and data processing', 'Data visualisation', 'Analytics and interpretation', 'Capstone project',
  ].map((title, index) => week('co1', index + 1, title, [title])),
  ...[
    'Leadership mindset', 'Feedback and communication', 'Delegation and coaching', 'Team action plan',
  ].map((title, index) => week('co4', index + 1, title, [title])),
  ...[
    'Project initiation', 'Scope and planning', 'Scheduling and dependencies', 'Agile delivery', 'Risk management', 'Stakeholder governance', 'Quality and change', 'Close-out and lessons learned',
  ].map((title, index) => week('co6', index + 1, title, [title])),
];

export function getCourseWeeks(courseId: string) {
  return courseWeeks.filter(courseWeek => courseWeek.courseId === courseId);
}

export function createFallbackCourseWeeks(courseId: string, courseTitle: string, weekCount: number): CourseWeek[] {
  return Array.from({ length: weekCount }, (_, index) => {
    const number = index + 1;
    return week(courseId, number, `${courseTitle}: module ${number}`, [courseTitle]);
  });
}

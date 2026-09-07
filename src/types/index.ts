// ─── Core types ───────────────────────────────────────────────────────────────

export type UserRole = 'learner' | 'manager' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  position: string;
  avatar: string;
  joinedDate: string;
  managerId?: string;
}

export interface Competency {
  id: string;
  name: string;
  category: string;
  description: string;
  current: number;   // 0-100
  required: number;  // 0-100
}

export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: string;   // e.g. "2h 30m"
  durationMinutes: number;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  tags: string[];
  thumbnail: string;
  instructor: string;
  modules: number;
  enrolledCount: number;
  rating: number;
  competencyIds: string[];
  weeks?: number;
  weeklyEffort?: string;
  prerequisites?: string[];
  outcomes?: string[];
  published?: boolean;
  createdBy?: string;
}

export type LearningResourceType = 'video' | 'reading' | 'resource';

export interface LearningResource {
  id: string;
  type: LearningResourceType;
  title: string;
  description: string;
  durationMinutes?: number;
  url?: string;
  completed?: boolean;
}

export interface WeeklyQuiz {
  id: string;
  title: string;
  questions: Question[];
  passingScore: number;
}

export interface WeeklyAssignment {
  id: string;
  title: string;
  description: string;
  instructions: string;
  deadline: string;
  submission?: AssignmentSubmission;
}

export interface AssignmentSubmission {
  weekNumber: number;
  text: string;
  fileName?: string;
  submittedAt: string;
}

export interface CourseWeek {
  id: string;
  courseId: string;
  weekNumber: number;
  title: string;
  startsOn: string;
  endsOn: string;
  resources: LearningResource[];
  quiz: WeeklyQuiz;
  assignment: WeeklyAssignment;
}

export interface QuizAttempt {
  quizId: string;
  score: number;
  passed: boolean;
  answers: Record<string, number>;
  completedAt: string;
}

export interface LearningProgress {
  userId: string;
  courseId: string;
  completedResourceIds: string[];
  quizAttempts: QuizAttempt[];
  assignmentSubmissions: AssignmentSubmission[];
  completedWeeks: number[];
  finalAssessmentScore?: number;
  completedAt?: string;
}

export interface Enrollment {
  courseId: string;
  userId: string;
  progress: number;  // 0-100
  startedAt: string;
  completedAt?: string;
  score?: number;
}

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  targetCompetency: string;
  steps: LearningStep[];
  estimatedHours: number;
}

export interface LearningStep {
  id: string;
  type: 'course' | 'assessment' | 'certification';
  title: string;
  duration: string;
  status: 'completed' | 'in_progress' | 'locked' | 'available';
  courseId?: string;
}

export interface Assessment {
  id: string;
  title: string;
  competencyId: string;
  questions: Question[];
  duration: number; // minutes
  passingScore: number;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Certificate {
  id: string;
  userId: string;
  courseId: string;
  title: string;
  issuedDate: string;
  expiryDate?: string;
}

export interface Department {
  id: string;
  name: string;
  headId: string;
  capabilityScore: number;
  employeeCount: number;
  criticalGap: boolean;
}

export interface KnowledgeResource {
  id: string;
  title: string;
  description: string;
  category: string;
  type: 'document' | 'video' | 'guide' | 'policy' | 'sop' | 'faq' | 'case_study';
  tags: string[];
  views: number;
  updatedAt: string;
  content: string;
}

export interface RiskAlert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  affectedDepartment?: string;
  affectedUserId?: string;
  recommendation: string;
  createdAt: string;
}

export interface OrgMetric {
  label: string;
  value: number;
  change: number; // positive = improvement
}

export interface TrainingImpact {
  competency: string;
  before: number;
  after: number;
  participants: number;
  date: string;
}

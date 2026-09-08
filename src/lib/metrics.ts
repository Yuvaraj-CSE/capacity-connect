import type { Certificate, Competency, Course, Department, Enrollment, User } from '../types';

type MetricEnrollment = Pick<Enrollment, 'userId' | 'courseId' | 'progress' | 'completedAt'>;
type MetricCertificate = Pick<Certificate, 'userId' | 'verificationStatus'>;
type MetricCompetency = Pick<Competency, 'id' | 'current' | 'required'>;
type MetricAttempt = { userId: string; score: number };

export interface PlatformStats {
  totalUsers: number;
  totalCourses: number;
  activeLearners: number;
  courseEnrollments: number;
  courseCompletions: number;
  certificates: number;
  skills: number;
  teams: number;
  capability: number | null;
  completionRate: number | null;
  averageAssessment: number | null;
}

export interface TeamStats {
  teamMembers: number;
  activeLearners: number;
  teamLearningCompletion: number | null;
  teamCapability: number | null;
  skillGaps: number;
  teamCertificates: number;
  courseAssignments: number;
  assessmentPerformance: number | null;
}

export interface LearnerStats {
  myCourses: number;
  myProgress: number | null;
  myQuizzes: number;
  myAssignments: number;
  myCertificates: number;
  myCompetencies: number;
  capability: number | null;
  skillGaps: number;
}

function average(values: number[]) {
  return values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : null;
}

function capabilityFromCompetencies(competencies: MetricCompetency[]) {
  return competencies.length
    ? Math.round(competencies.reduce((sum, competency) => sum + Math.min(competency.current / Math.max(competency.required, 1), 1) * 100, 0) / competencies.length)
    : null;
}

export function getPlatformStats(input: {
  users: Pick<User, 'id' | 'role' | 'department'>[];
  courses: Pick<Course, 'id'>[];
  enrollments: MetricEnrollment[];
  certificates: MetricCertificate[];
  competencies: Array<MetricCompetency & { userId: string }>;
  departments?: Pick<Department, 'id' | 'name'>[];
  attempts?: MetricAttempt[];
}): PlatformStats {
  const learnerIds = new Set(input.users.filter(user => user.role === 'learner').map(user => user.id));
  const activeLearners = new Set(input.enrollments.filter(enrollment => learnerIds.has(enrollment.userId)).map(enrollment => enrollment.userId)).size;
  const validCertificates = input.certificates.filter(certificate => certificate.verificationStatus !== 'revoked').length;
  const courseCompletions = input.enrollments.filter(enrollment => Boolean(enrollment.completedAt) || enrollment.progress >= 100).length;

  return {
    totalUsers: input.users.length,
    totalCourses: input.courses.length,
    activeLearners,
    courseEnrollments: input.enrollments.length,
    courseCompletions,
    certificates: validCertificates,
    skills: new Set(input.competencies.map(competency => competency.id)).size,
    teams: input.departments?.length ?? new Set(input.users.map(user => user.department).filter(Boolean)).size,
    capability: capabilityFromCompetencies(input.competencies.filter(competency => competency.userId)),
    completionRate: input.enrollments.length ? Math.round((courseCompletions / input.enrollments.length) * 100) : null,
    averageAssessment: average((input.attempts || []).map(attempt => attempt.score)),
  };
}

export function getManagerTeamStats(input: {
  memberIds: string[];
  enrollments: MetricEnrollment[];
  competencies: Array<MetricCompetency & { userId: string }>;
  certificates: MetricCertificate[];
  attempts: MetricAttempt[];
}): TeamStats {
  const memberIds = new Set(input.memberIds);
  const teamEnrollments = input.enrollments.filter(enrollment => memberIds.has(enrollment.userId));
  const teamCompetencies = input.competencies.filter(competency => memberIds.has(competency.userId));
  const teamCertificates = input.certificates.filter(certificate => memberIds.has(certificate.userId));
  const teamAttempts = input.attempts.filter(attempt => memberIds.has(attempt.userId));
  const completedEnrollments = teamEnrollments.filter(enrollment => Boolean(enrollment.completedAt) || enrollment.progress >= 100).length;

  return {
    teamMembers: input.memberIds.length,
    activeLearners: new Set(teamEnrollments.map(enrollment => enrollment.userId)).size,
    teamLearningCompletion: teamEnrollments.length ? Math.round((completedEnrollments / teamEnrollments.length) * 100) : null,
    teamCapability: capabilityFromCompetencies(teamCompetencies),
    skillGaps: teamCompetencies.filter(competency => competency.current < competency.required).length,
    teamCertificates: teamCertificates.filter(certificate => certificate.verificationStatus !== 'revoked').length,
    courseAssignments: teamEnrollments.length,
    assessmentPerformance: average(teamAttempts.map(attempt => attempt.score)),
  };
}

export function getLearnerStats(input: {
  userId: string;
  enrollments: MetricEnrollment[];
  competencies: MetricCompetency[];
  certificates: MetricCertificate[];
  quizCount?: number;
  assignmentCount?: number;
}): LearnerStats {
  const enrollments = input.enrollments.filter(enrollment => enrollment.userId === input.userId);
  const capability = capabilityFromCompetencies(input.competencies);

  return {
    myCourses: enrollments.length,
    myProgress: enrollments.length ? Math.round(enrollments.reduce((sum, enrollment) => sum + enrollment.progress, 0) / enrollments.length) : null,
    myQuizzes: input.quizCount || 0,
    myAssignments: input.assignmentCount || 0,
    myCertificates: input.certificates.filter(certificate => certificate.userId === input.userId && certificate.verificationStatus !== 'revoked').length,
    myCompetencies: input.competencies.length,
    capability,
    skillGaps: input.competencies.filter(competency => competency.current < competency.required).length,
  };
}

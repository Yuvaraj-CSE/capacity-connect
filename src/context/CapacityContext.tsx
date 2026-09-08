import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Competency, Enrollment, Certificate, RiskAlert, Department, LearningProgress, QuizAttempt, AssignmentSubmission, Course, CourseWeek } from '../types';
import {
  competenciesByUser as initialComps,
  enrollments as initialEnrollments,
  certificates as initialCerts,
  riskAlerts as initialAlerts,
  departments as initialDepts,
  courses,
  users,
} from '../data/mockData';
import toast from 'react-hot-toast';
import { translate, type LanguageMode } from '../translations';
import { structuredCourses, getCourseWeeks } from '../data/learningData';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

export type { LanguageMode };
export type TextScale = 'normal' | 'large' | 'larger';
export type ThemeMode = 'light' | 'dark' | 'system';

interface ClosedLoopStep {
  stepNumber: number;
  title: string;
  titleHi: string;
  status: 'pending' | 'in_progress' | 'completed';
  description: string;
}

interface CapacityContextValue {
  // Live Data
  competenciesByUser: Record<string, Competency[]>;
  enrollments: Enrollment[];
  certificates: Certificate[];
  riskAlerts: RiskAlert[];
  departments: Department[];

  // Closed Loop Actions
  improveCompetencyAfterAssessment: (userId: string, competencyId: string, assessmentScore: number) => {
    oldScore: number;
    newScore: number;
    certificate: Certificate;
  };
  advanceCourseProgress: (userId: string, courseId: string, delta?: number) => void;
  enrollInCourse: (userId: string, courseId: string) => void;
  resolveRiskAlert: (alertId: string) => void;
  resetSimulation: () => void;
  ensureUserProfile: (userId: string) => void;
  learningProgress: LearningProgress[];
  completeResource: (userId: string, courseId: string, resourceId: string) => void;
  submitWeeklyQuiz: (userId: string, courseId: string, attempt: QuizAttempt) => void;
  submitAssignment: (userId: string, courseId: string, weekNumber: number, submission: AssignmentSubmission) => void;
  completeCourse: (userId: string, courseId: string, finalScore: number) => { oldScore: number; newScore: number; certificate: Certificate } | null;
  customCourses: Course[];
  customCourseWeeks: CourseWeek[];
  createCourse: (course: Course, weeks: CourseWeek[]) => void;
  registerCourseWeeks: (weeks: CourseWeek[]) => void;
  getWeeksForCourse: (courseId: string) => CourseWeek[];

  // Closed Loop Stepper Tracking
  workflowSteps: ClosedLoopStep[];
  isLoopCompleted: boolean;

  // Accessibility & Government GIGW Settings
  language: LanguageMode;
  setLanguage: (lang: LanguageMode) => void;
  t: (path: string, fallback?: string) => string;
  textScale: TextScale;
  setTextScale: (scale: TextScale) => void;
  highContrast: boolean;
  setHighContrast: (v: boolean | ((prev: boolean) => boolean)) => void;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  colorAccessibility: boolean;
  setColorAccessibility: (enabled: boolean | ((prev: boolean) => boolean)) => void;
}

const CapacityContext = createContext<CapacityContextValue | null>(null);

export function CapacityProvider({ children }: { children: ReactNode }) {
  const isDemoMode = typeof window !== 'undefined' && Boolean(localStorage.getItem('capacity_connect_demo_user'));
  const [comps, setComps] = useState<Record<string, Competency[]>>(() => isSupabaseConfigured && !isDemoMode ? {} : JSON.parse(JSON.stringify(initialComps)));
  const [userEnrollments, setUserEnrollments] = useState<Enrollment[]>(JSON.parse(JSON.stringify(initialEnrollments)));
  const [userCerts, setUserCerts] = useState<Certificate[]>(JSON.parse(JSON.stringify(initialCerts)));
  const [alerts, setAlerts] = useState<RiskAlert[]>(JSON.parse(JSON.stringify(initialAlerts)));
  const [depts, setDepts] = useState<Department[]>(JSON.parse(JSON.stringify(initialDepts)));
  const [learningProgress, setLearningProgress] = useState<LearningProgress[]>(() => {
    try {
      const saved = localStorage.getItem('capacity_connect_learning_progress');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [customCourses, setCustomCourses] = useState<Course[]>(() => {
    try { return JSON.parse(localStorage.getItem('capacity_connect_custom_courses') || '[]'); } catch { return []; }
  });
  const [customCourseWeeks, setCustomCourseWeeks] = useState<CourseWeek[]>(() => {
    try { return JSON.parse(localStorage.getItem('capacity_connect_custom_course_weeks') || '[]'); } catch { return []; }
  });
  const [registeredCourseWeeks, setRegisteredCourseWeeks] = useState<CourseWeek[]>([]);

  useEffect(() => {
    async function loadPersistedLearning() {
      if (!isSupabaseConfigured || !supabase) return;
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id;
      if (!userId) return;

      const [{ data: remoteEnrollments }, { data: remoteVideoProgress }, { data: remoteAttempts }, { data: remoteSubmissions }, { data: videos }, { data: weeks }, { data: quizzes }, { data: assignments }, { data: remoteCompetencies }, { data: remoteDefinitions }, { data: remoteCertificates }] = await Promise.all([
        supabase.from('enrollments').select('*').eq('user_id', userId),
        supabase.from('video_progress').select('*').eq('user_id', userId),
        supabase.from('quiz_attempts').select('*').eq('user_id', userId).order('attempted_at'),
        supabase.from('assignment_submissions').select('*').eq('user_id', userId).order('submitted_at'),
        supabase.from('course_videos').select('id, week_id'),
        supabase.from('course_weeks').select('id, course_id, week_number'),
        supabase.from('quizzes').select('id, week_id'),
        supabase.from('assignments').select('id, week_id'),
        supabase.from('user_competencies').select('user_id, competency_id, current_score, required_score').eq('user_id', userId),
        supabase.from('competencies').select('id, name, category, description, default_required'),
        supabase.from('certificates').select('*').eq('user_id', userId).order('issued_date', { ascending: false }),
      ]);

      if (remoteCompetencies && remoteCompetencies.length > 0) {
        const definitions = new Map((remoteDefinitions || []).map(item => [item.id, item]));
        setComps(previous => ({
          ...previous,
          [userId]: remoteCompetencies.map(item => ({
            id: item.competency_id,
            name: definitions.get(item.competency_id)?.name || item.competency_id,
            category: definitions.get(item.competency_id)?.category || 'Persisted competency',
            description: definitions.get(item.competency_id)?.description || 'Competency loaded from the platform record.',
            current: item.current_score,
            required: item.required_score,
          })),
        }));
      }
      if (remoteCertificates && remoteCertificates.length > 0) {
        setUserCerts(previous => [...previous.filter(certificate => certificate.userId !== userId), ...remoteCertificates.map(certificate => ({ id: certificate.id, userId: certificate.user_id, courseId: certificate.course_id, title: certificate.title, issuedDate: certificate.issued_date, expiryDate: certificate.expiry_date || undefined, verificationStatus: certificate.verification_status }))]);
      }

      const weekById = new Map((weeks || []).map(week => [week.id, week]));
      const videoById = new Map((videos || []).map(video => [video.id, video]));
      const quizById = new Map((quizzes || []).map(quiz => [quiz.id, quiz]));
      const assignmentById = new Map((assignments || []).map(assignment => [assignment.id, assignment]));
      const progressByCourse = new Map<string, LearningProgress>();
      const getRemoteProgress = (courseId: string) => {
        const existing = progressByCourse.get(courseId);
        if (existing) return existing;
        const created: LearningProgress = { userId, courseId, completedResourceIds: [], quizAttempts: [], assignmentSubmissions: [], completedWeeks: [] };
        progressByCourse.set(courseId, created);
        return created;
      };

      for (const progress of remoteVideoProgress || []) {
        const video = videoById.get(progress.video_id);
        const week = video && weekById.get(video.week_id);
        if (week && progress.completed) getRemoteProgress(week.course_id).completedResourceIds.push(progress.video_id);
      }
      for (const attempt of remoteAttempts || []) {
        const quiz = quizById.get(attempt.quiz_id);
        const week = quiz && weekById.get(quiz.week_id);
        if (week) {
          const current = getRemoteProgress(week.course_id);
          current.quizAttempts.push({ quizId: attempt.quiz_id, score: attempt.score, passed: attempt.passed, answers: attempt.answers, completedAt: attempt.attempted_at });
          if (attempt.passed) current.completedWeeks.push(week.week_number);
        }
      }
      for (const submission of remoteSubmissions || []) {
        const assignment = assignmentById.get(submission.assignment_id);
        const week = assignment && weekById.get(assignment.week_id);
        if (week) {
          const current = getRemoteProgress(week.course_id);
          current.assignmentSubmissions.push({ weekNumber: week.week_number, text: submission.response, submittedAt: submission.submitted_at });
          if (current.quizAttempts.some(attempt => attempt.quizId === (quizzes || []).find(quiz => quiz.week_id === week.id)?.id && attempt.passed)) current.completedWeeks.push(week.week_number);
        }
      }

      setUserEnrollments(previous => [
        ...previous.filter(enrollment => enrollment.userId !== userId),
        ...(remoteEnrollments || []).map(enrollment => ({ userId: enrollment.user_id, courseId: enrollment.course_id, progress: enrollment.completed_at ? 100 : 10, startedAt: enrollment.enrolled_at, completedAt: enrollment.completed_at || undefined })),
      ]);
      if (progressByCourse.size > 0) setLearningProgress(previous => [...previous.filter(progress => progress.userId !== userId), ...Array.from(progressByCourse.values()).map(progress => ({ ...progress, completedWeeks: Array.from(new Set(progress.completedWeeks)) }))]);
    }

    void loadPersistedLearning();
  }, []);

  const getWeeksForCourse = (courseId: string) => [...getCourseWeeks(courseId), ...customCourseWeeks, ...registeredCourseWeeks].filter(item => item.courseId === courseId);

  const registerCourseWeeks = useCallback((weeks: CourseWeek[]) => {
    const courseIds = new Set(weeks.map(courseWeek => courseWeek.courseId));
    setRegisteredCourseWeeks(previous => [
      ...previous.filter(courseWeek => !courseIds.has(courseWeek.courseId)),
      ...weeks,
    ]);
  }, []);

  function createCourse(course: Course, weeks: CourseWeek[]) {
    setCustomCourses(previous => {
      const next = [...previous, course];
      try { localStorage.setItem('capacity_connect_custom_courses', JSON.stringify(next)); } catch { /* unavailable */ }
      return next;
    });
    setCustomCourseWeeks(previous => {
      const next = [...previous, ...weeks];
      try { localStorage.setItem('capacity_connect_custom_course_weeks', JSON.stringify(next)); } catch { /* unavailable */ }
      return next;
    });
  }

  function updateLearningProgress(updater: (previous: LearningProgress[]) => LearningProgress[]) {
    setLearningProgress(previous => {
      const next = updater(previous);
      try {
        localStorage.setItem('capacity_connect_learning_progress', JSON.stringify(next));
      } catch {
        // localStorage may be unavailable
      }
      return next;
    });
  }

  function getProgress(userId: string, courseId: string): LearningProgress {
    return learningProgress.find(item => item.userId === userId && item.courseId === courseId) || {
      userId, courseId, completedResourceIds: [], quizAttempts: [], assignmentSubmissions: [], completedWeeks: [],
    };
  }

  // GIGW Accessibility & Language with LocalStorage Persistence
  const [language, setLanguageState] = useState<LanguageMode>(() => {
    try {
      const saved = localStorage.getItem('capacity_connect_lang');
      if (saved === 'en' || saved === 'hi') return saved;
    } catch {
      // localStorage may be unavailable
    }
    return 'en';
  });

  const setLanguage = (lang: LanguageMode) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('capacity_connect_lang', lang);
      document.documentElement.lang = lang;
    } catch {
      // localStorage may be unavailable
    }
  };

  const t = (path: string, fallback?: string) => {
    return translate(language, path, fallback);
  };

  const [textScale, setTextScale] = useState<TextScale>('normal');
  const [highContrast, setHighContrast] = useState(false);
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem('capacity_connect_theme');
      if (saved === 'light' || saved === 'dark' || saved === 'system') return saved;
    } catch {
      // localStorage may be unavailable
    }
    return 'light';
  });
  const [colorAccessibility, setColorAccessibilityState] = useState(() => {
    try {
      return localStorage.getItem('capacity_connect_color_accessibility') === 'true';
    } catch {
      return false;
    }
  });

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    try {
      localStorage.setItem('capacity_connect_theme', mode);
    } catch {
      // localStorage may be unavailable
    }
  };

  const setColorAccessibility = (enabled: boolean | ((prev: boolean) => boolean)) => {
    setColorAccessibilityState(prev => {
      const next = typeof enabled === 'function' ? enabled(prev) : enabled;
      try {
        localStorage.setItem('capacity_connect_color_accessibility', String(next));
      } catch {
        // localStorage may be unavailable
      }
      return next;
    });
  };

  useEffect(() => {
    const root = document.documentElement;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    const applyTheme = () => {
      const resolvedTheme = themeMode === 'system' ? (prefersDark.matches ? 'dark' : 'light') : themeMode;
      root.dataset.theme = resolvedTheme;
      root.dataset.themeMode = themeMode;
    };
    applyTheme();
    prefersDark.addEventListener('change', applyTheme);
    return () => prefersDark.removeEventListener('change', applyTheme);
  }, [themeMode]);

  useEffect(() => {
    document.documentElement.dataset.colorAccessible = String(colorAccessibility);
  }, [colorAccessibility]);

  // Track the 5-step closed-loop progress
  const [isLoopCompleted, setIsLoopCompleted] = useState(false);

  // Workflow steps status
  const learnerComps = comps['u1'] || [];
  const priorityComp = learnerComps.reduce<Competency | undefined>((largest, competency) => {
    if (!largest) return competency;
    return competency.required - competency.current > largest.required - largest.current ? competency : largest;
  }, undefined);
  const isPriorityGapClosed = (priorityComp?.current ?? 0) >= (priorityComp?.required ?? 0);
  const priorityCourseIds = courses
    .filter(course => priorityComp && course.competencyIds.includes(priorityComp.id))
    .map(course => course.id);
  const isPriorityLearningAdvanced = userEnrollments.some(
    enrollment => priorityCourseIds.includes(enrollment.courseId) && enrollment.progress > 65
  );

  const workflowSteps: ClosedLoopStep[] = [
    {
      stepNumber: 1,
      title: 'Skill Gap Identified',
      titleHi: 'दक्षता अंतराल पहचान',
      status: 'completed',
      description: `${priorityComp?.name || 'Priority competency'} is the largest role gap at ${priorityComp ? priorityComp.required - priorityComp.current : 0} points below benchmark.`,
    },
    {
      stepNumber: 2,
      title: 'Targeted e-Learning',
      titleHi: 'लक्षित ई-लर्निंग',
      status: isPriorityLearningAdvanced || isPriorityGapClosed ? 'completed' : 'in_progress',
      description: `Progress in the recommended ${priorityComp?.name || 'capability'} learning modules.`,
    },
    {
      stepNumber: 3,
      title: 'Proctored Assessment',
      titleHi: 'प्रमाणित मूल्यांकन',
      status: isPriorityGapClosed ? 'completed' : isPriorityLearningAdvanced ? 'in_progress' : 'pending',
      description: `Take the ${priorityComp?.name || 'competency'} proficiency assessment.`,
    },
    {
      stepNumber: 4,
      title: 'Competency Certified',
      titleHi: 'योग्यता प्रमाणीकरण',
      status: isPriorityGapClosed ? 'completed' : 'pending',
      description: `${priorityComp?.name || 'Competency'} score is verified against the role benchmark.`,
    },
    {
      stepNumber: 5,
      title: 'Admin & Team Lift',
      titleHi: 'प्रशासनिक व टीम प्रभाव',
      status: isPriorityGapClosed ? 'completed' : 'pending',
      description: 'Team and organizational capability indexes reflect the verified improvement.',
    },
  ];

  function improveCompetencyAfterAssessment(userId: string, competencyId: string, assessmentScore: number) {
    const currentCompetencies = comps[userId] || [];
    const competency = currentCompetencies.find(c => c.id === competencyId);
    const oldScore = competency?.current ?? 0;
    const newScore = Math.max(oldScore, Math.min(100, assessmentScore));
    const relatedCourse = courses.find(course => course.competencyIds.includes(competencyId));
    const learner = users.find(candidate => candidate.id === userId);

    // 1. Upgrade user competency score
    setComps(prev => {
      const userList = prev[userId] || [];
      const updated = userList.map(c => {
        if (c.id === competencyId) {
          return { ...c, current: newScore };
        }
        return c;
      });
      return { ...prev, [userId]: updated };
    });
    if (isSupabaseConfigured && supabase && competency) {
      void supabase.from('user_competencies').upsert({ user_id: userId, competency_id: competencyId, current_score: newScore, required_score: competency.required });
    }

    // 2. Mint new official GoI Certificate
    const newCert: Certificate = {
      id: `CERT-GOI-${Date.now().toString().slice(-6)}`,
      userId,
      courseId: relatedCourse?.id || '',
      title: `Certified ${competency?.name || 'Competency'} Specialist`,
      issuedDate: new Date().toISOString().slice(0, 10),
      expiryDate: '2029-12-31',
      verificationStatus: 'valid',
    };
    setUserCerts(prev => [newCert, ...prev]);
    if (isSupabaseConfigured && supabase) {
      void supabase.from('certificates').upsert({ id: newCert.id, user_id: newCert.userId, course_id: newCert.courseId, title: newCert.title, issued_date: newCert.issuedDate, expiry_date: newCert.expiryDate, verification_status: 'valid' });
    }

    // 3. Resolve the critical risk alert related to this competency
    setAlerts(prev =>
      prev.map(a =>
        competency && a.affectedUserId === userId && a.title.toLowerCase().includes(competency.name.toLowerCase())
          ? {
              ...a,
              severity: 'info',
              title: `Resolved: ${competency?.name || 'Competency'} gap closed`,
              description: `Target benchmark updated through certified assessment (Score: ${newScore}%). Risk mitigated.`,
            }
          : a
      )
    );

    // 4. Apply the learner's verified improvement to their department index.
    setDepts(prev =>
      prev.map(d =>
        learner && d.name === learner.department
          ? {
              ...d,
              capabilityScore: Math.min(
                100,
                Math.round(d.capabilityScore + (newScore - oldScore) / Math.max(d.employeeCount, 1))
              ),
              criticalGap: d.capabilityScore + (newScore - oldScore) / Math.max(d.employeeCount, 1) < 65,
            }
          : d
      )
    );

    setIsLoopCompleted(true);

    return { oldScore, newScore, certificate: newCert };
  }

  function advanceCourseProgress(userId: string, courseId: string, delta = 25) {
    setUserEnrollments(prev => {
      const exists = prev.find(e => e.userId === userId && e.courseId === courseId);
      if (exists) {
        return prev.map(e =>
          e.userId === userId && e.courseId === courseId
            ? {
                ...e,
                progress: Math.min(100, e.progress + delta),
                completedAt: e.progress + delta >= 100 ? new Date().toISOString().slice(0, 10) : e.completedAt,
              }
            : e
        );
      }
      return [
        ...prev,
        {
          userId,
          courseId,
          progress: delta,
          startedAt: new Date().toISOString().slice(0, 10),
        },
      ];
    });
  }

  function enrollInCourse(userId: string, courseId: string) {
    setUserEnrollments(prev => {
      if (prev.some(e => e.userId === userId && e.courseId === courseId)) return prev;
      return [
        ...prev,
        {
          userId,
          courseId,
          progress: 10,
          startedAt: new Date().toISOString().slice(0, 10),
        },
      ];
    });
    updateLearningProgress(previous => previous.some(item => item.userId === userId && item.courseId === courseId)
      ? previous
      : [...previous, { userId, courseId, completedResourceIds: [], quizAttempts: [], assignmentSubmissions: [], completedWeeks: [] }]);
    if (isSupabaseConfigured && supabase) {
      void supabase.from('enrollments').upsert({ user_id: userId, course_id: courseId }, { onConflict: 'user_id,course_id' });
    }
  }

  function completeResource(userId: string, courseId: string, resourceId: string) {
    updateLearningProgress(previous => {
      const current = previous.find(item => item.userId === userId && item.courseId === courseId) || getProgress(userId, courseId);
      const updated = { ...current, completedResourceIds: Array.from(new Set([...current.completedResourceIds, resourceId])) };
      return [...previous.filter(item => !(item.userId === userId && item.courseId === courseId)), updated];
    });
    if (isSupabaseConfigured && supabase) {
      void supabase.from('video_progress').upsert({ user_id: userId, video_id: resourceId, completed: true, completed_at: new Date().toISOString() }, { onConflict: 'user_id,video_id' });
    }
  }

  function submitWeeklyQuiz(userId: string, courseId: string, attempt: QuizAttempt) {
    updateLearningProgress(previous => {
      const current = previous.find(item => item.userId === userId && item.courseId === courseId) || getProgress(userId, courseId);
      const quizAttempts = [...current.quizAttempts.filter(item => item.quizId !== attempt.quizId), attempt];
      const currentWeek = getWeeksForCourse(courseId).find(item => item.quiz.id === attempt.quizId);
      const assignment = currentWeek && current.assignmentSubmissions.find(item => item.weekNumber === currentWeek.weekNumber);
      const completedWeeks = currentWeek && attempt.passed && assignment
        ? Array.from(new Set([...current.completedWeeks, currentWeek.weekNumber]))
        : current.completedWeeks;
      const updated = { ...current, quizAttempts, completedWeeks };
      return [...previous.filter(item => !(item.userId === userId && item.courseId === courseId)), updated];
    });
    if (isSupabaseConfigured && supabase) {
      void supabase.from('quiz_attempts').insert({ quiz_id: attempt.quizId, user_id: userId, score: attempt.score, passed: attempt.passed, answers: attempt.answers });
    }
  }

  function submitAssignment(userId: string, courseId: string, weekNumber: number, submission: AssignmentSubmission) {
    updateLearningProgress(previous => {
      const current = previous.find(item => item.userId === userId && item.courseId === courseId) || getProgress(userId, courseId);
      const courseWeek = getWeeksForCourse(courseId).find(item => item.weekNumber === weekNumber);
      const quiz = courseWeek && current.quizAttempts.find(item => item.quizId === courseWeek.quiz.id && item.passed);
      const completedWeeks = quiz ? Array.from(new Set([...current.completedWeeks, weekNumber])) : current.completedWeeks;
      const updated = { ...current, assignmentSubmissions: [...current.assignmentSubmissions.filter(item => item.submittedAt !== submission.submittedAt), submission], completedWeeks };
      return [...previous.filter(item => !(item.userId === userId && item.courseId === courseId)), updated];
    });
    if (isSupabaseConfigured && supabase) {
      const courseWeek = getWeeksForCourse(courseId).find(item => item.weekNumber === weekNumber);
      if (courseWeek) void supabase.from('assignment_submissions').insert({ assignment_id: courseWeek.assignment.id, user_id: userId, response: submission.text });
    }
  }

  function completeCourse(userId: string, courseId: string, finalScore: number) {
    const course = structuredCourses.find(item => item.id === courseId);
    if (!course) return null;
    const weeks = getWeeksForCourse(courseId);
    const progress = getProgress(userId, courseId);
    const allActivitiesComplete = weeks.every(courseWeek => {
      const resourcesComplete = courseWeek.resources.every(resource => progress.completedResourceIds.includes(resource.id));
      const quizPassed = progress.quizAttempts.some(attempt => attempt.quizId === courseWeek.quiz.id && attempt.passed);
      const assignmentSubmitted = progress.assignmentSubmissions.length >= courseWeek.weekNumber;
      return resourcesComplete && quizPassed && assignmentSubmitted;
    });
    if (!allActivitiesComplete || finalScore < 70) return null;
    updateLearningProgress(previous => previous.map(item => item.userId === userId && item.courseId === courseId
      ? { ...item, finalAssessmentScore: finalScore, completedAt: new Date().toISOString() } : item));
    const competencyId = course.competencyIds[0];
    return improveCompetencyAfterAssessment(userId, competencyId, finalScore);
  }

  function resolveRiskAlert(alertId: string) {
    setAlerts(prev =>
      prev.map(a => (a.id === alertId ? { ...a, severity: 'info', title: `✓ RESOLVED: ${a.title}` } : a))
    );
    toast.success('Action logged. Alert successfully marked as resolved.');
  }

  function ensureUserProfile(userId: string) {
    if (comps[userId]) return;
    const starterProfile = (initialComps.u1 || []).map(competency => ({
      ...competency,
      current: Math.max(35, competency.current - 8),
    }));
    setComps(previous => (previous[userId] ? previous : { ...previous, [userId]: starterProfile }));
  }

  function resetSimulation() {
    setComps(JSON.parse(JSON.stringify(initialComps)));
    setUserEnrollments(JSON.parse(JSON.stringify(initialEnrollments)));
    setUserCerts(JSON.parse(JSON.stringify(initialCerts)));
    setAlerts(JSON.parse(JSON.stringify(initialAlerts)));
    setDepts(JSON.parse(JSON.stringify(initialDepts)));
    setIsLoopCompleted(false);
    setLearningProgress([]);
    try { localStorage.removeItem('capacity_connect_learning_progress'); } catch { /* unavailable */ }
    toast.success('Simulation reset! Ready to test closed-loop flow again.', { icon: '🔄' });
  }

  return (
    <CapacityContext.Provider
      value={{
        competenciesByUser: comps,
        enrollments: userEnrollments,
        certificates: userCerts,
        riskAlerts: alerts,
        departments: depts,
        improveCompetencyAfterAssessment,
        advanceCourseProgress,
        enrollInCourse,
        resolveRiskAlert,
        resetSimulation,
        ensureUserProfile,
        learningProgress,
        completeResource,
        submitWeeklyQuiz,
        submitAssignment,
        completeCourse,
        customCourses,
        customCourseWeeks,
        createCourse,
        registerCourseWeeks,
        getWeeksForCourse,
        workflowSteps,
        isLoopCompleted,
        language,
        setLanguage,
        t,
        textScale,
        setTextScale,
        highContrast,
        setHighContrast,
        themeMode,
        setThemeMode,
        colorAccessibility,
        setColorAccessibility,
      }}
    >
      <div
        className={`${highContrast ? 'high-contrast-mode' : ''} ${
          textScale === 'large' ? 'text-scale-lg' : textScale === 'larger' ? 'text-scale-xl' : ''
        }`}
      >
        {children}
      </div>
    </CapacityContext.Provider>
  );
}

export function useCapacity() {
  const ctx = useContext(CapacityContext);
  if (!ctx) throw new Error('useCapacity must be used within CapacityProvider');
  return ctx;
}

export function useTranslation() {
  const { language, setLanguage, t } = useCapacity();
  return { language, setLanguage, t };
}


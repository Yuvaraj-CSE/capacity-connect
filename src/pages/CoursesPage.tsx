import { isSupabaseConfigured, supabase, type Database } from '../lib/supabase';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCapacity } from '../context/CapacityContext';
import { createFallbackCourseWeeks, structuredCourses } from '../data/learningData';
import type { Course, CourseWeek } from '../types';
import { Badge, ProgressBar, StateEmblem } from '../components/ui/SharedComponents';
import { Search, BookOpen, Clock, Star, Play, CheckCircle, Plus, X, Award, Lock, ClipboardCheck, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

const LEVELS = ['All', 'Beginner', 'Intermediate', 'Advanced'];
const DURATIONS = ['All', '4 Weeks', '6 Weeks', '8 Weeks'];

type SupabaseCourseRow = Database['public']['Tables']['courses']['Row'];

function toDurationWeeks(value: number | null, fallback = 4) {
  return Number.isInteger(value) && value && value > 0 ? value : fallback;
}

function toCourseLevel(value: string | null): Course['level'] {
  return value === 'Intermediate' || value === 'Advanced' ? value : 'Beginner';
}

function mapSupabaseCourse(course: SupabaseCourseRow): Course {
  const durationWeeks = toDurationWeeks(course.duration_weeks);
  const title = course.title?.trim() || 'Untitled course';
  const category = course.category?.trim() || 'General';

  return {
    id: String(course.id),
    title,
    description: course.description?.trim() || 'A structured capability programme from the Capacity Connect catalogue.',
    category,
    duration: `${durationWeeks} Weeks`,
    durationMinutes: durationWeeks * 180,
    level: toCourseLevel(course.level),
    tags: [category.toLowerCase()],
    thumbnail: title.split(/\s+/).map(word => word[0]).join('').slice(0, 2).toUpperCase(),
    instructor: 'Capacity Connect',
    modules: durationWeeks,
    enrolledCount: 0,
    rating: 0,
    competencyIds: [],
    weeks: durationWeeks,
    weeklyEffort: '3 hours/week',
    prerequisites: [],
    outcomes: [],
    published: true,
    source: course.source?.trim() || 'Capacity Connect catalogue',
    sourceUrl: course.source_url || undefined,
    isOfficial: course.is_official ?? false,
    isPublished: course.is_published ?? true,
    sequentialUnlock: course.sequential_unlock ?? true,
  };
}

export default function CoursesPage() {
  const { user } = useAuth();
  const { enrollments, enrollInCourse, learningProgress, completeResource, submitWeeklyQuiz, submitAssignment, completeCourse, customCourses, createCourse, registerCourseWeeks, getWeeksForCourse } = useCapacity();
  const [search, setSearch] = useState('');
  const [level, setLevel] = useState('All');
  const [duration, setDuration] = useState('All');
  const [skill, setSkill] = useState('All');
  const [supabaseCourses, setSupabaseCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [coursesError, setCoursesError] = useState<string | null>(null);
  useEffect(() => {
    async function loadCourses() {
      setCoursesLoading(true);
      setCoursesError(null);

      if (!isSupabaseConfigured || !supabase) {
        setCoursesError('Supabase is not configured for this environment.');
        setCoursesLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading courses:', error);
        setCoursesError('Could not load courses from Supabase.');
        toast.error('Could not load courses from Supabase');
        setCoursesLoading(false);
        return;
      }

      const mappedCourses = (data ?? []).map(mapSupabaseCourse);
      const remoteWeeks: CourseWeek[] = [];
      for (const course of data ?? []) {
        const courseId = String(course.id);
        const { data: weeks } = await supabase.from('course_weeks').select('*').eq('course_id', courseId).order('week_number');
        for (const week of weeks ?? []) {
          const { data: videos } = await supabase.from('course_videos').select('*').eq('week_id', week.id).order('order_index');
          const { data: quizzes } = await supabase.from('quizzes').select('*').eq('week_id', week.id).limit(1);
          const quiz = quizzes?.[0];
          const questions = quiz ? (await supabase.from('quiz_questions').select('*').eq('quiz_id', quiz.id).order('order_index')).data ?? [] : [];
          const { data: assignments } = await supabase.from('assignments').select('*').eq('week_id', week.id).limit(1);
          const start = new Date(2026, 8, 7 + (week.week_number - 1) * 7);
          const end = new Date(start); end.setDate(start.getDate() + 6);
          const resolvedVideos = videos && videos.length > 0 ? videos : [{
            id: `${week.id}-default-video`,
            week_id: week.id,
            title: `${week.title} guided session`,
            description: 'Default learning video for this module when no explicit video has been uploaded yet.',
            video_url: 'https://www.youtube.com/watch?v=5qap5aO4i9A',
            transcript: `This learning resource introduces the key concepts for ${week.title}. Review the module, reflect on the examples, and complete the check for understanding before moving ahead.`,
            transcript_language: 'en',
            duration_minutes: 28,
            order_index: 1,
            created_at: new Date().toISOString(),
          }];
          remoteWeeks.push({
            id: week.id, courseId, weekNumber: week.week_number, title: week.title, startsOn: start.toISOString().slice(0, 10), endsOn: end.toISOString().slice(0, 10),
            resources: resolvedVideos.map(video => ({ id: video.id, type: 'video', title: video.title, description: `${video.description}${video.transcript ? `\n\nTranscript (${video.transcript_language}):\n${video.transcript}` : '\n\nTranscript not available yet.'}`, durationMinutes: video.duration_minutes ?? undefined, url: video.video_url ?? undefined, transcript: video.transcript ?? undefined, transcriptLanguage: video.transcript_language })),
            quiz: { id: quiz?.id || `${week.id}-quiz`, title: quiz?.title || `${week.title} knowledge check`, passingScore: quiz?.passing_score || 70, questions: questions.map(question => ({ id: question.id, text: question.question, options: [question.option_a, question.option_b, question.option_c, question.option_d], correctIndex: question.correct_answer, explanation: question.explanation })) },
            assignment: { id: assignments?.[0]?.id || `${week.id}-assignment`, title: assignments?.[0]?.title || `${week.title} assignment`, description: assignments?.[0]?.description || 'Apply the learning from this week.', instructions: assignments?.[0]?.instructions || 'Write a short workplace response.', deadline: assignments?.[0]?.deadline || end.toISOString().slice(0, 10) },
          });
        }
      }
      setSupabaseCourses(mappedCourses);
      registerCourseWeeks(mappedCourses.flatMap(course => remoteWeeks.some(week => week.courseId === course.id) ? remoteWeeks.filter(week => week.courseId === course.id) : createFallbackCourseWeeks(course.id, course.title, course.weeks || 4)));
      setCoursesLoading(false);
    }

    void loadCourses();
  }, [registerCourseWeeks]);
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  const [activeWeek, setActiveWeek] = useState(1);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [assignmentText, setAssignmentText] = useState('');
  const [showBuilder, setShowBuilder] = useState(false);
  const [builderTitle, setBuilderTitle] = useState('');
  const [builderWeeks, setBuilderWeeks] = useState(4);



  if (!user) return null;
  const currentUser = user;
  const myEnrollments = enrollments.filter(item => item.userId === user.id);
  const enrolledMap = new Map(myEnrollments.map(item => [item.courseId, item]));
  const progressFor = (courseId: string) => learningProgress.find(item => item.userId === user.id && item.courseId === courseId);
  const allCourses = [...structuredCourses, ...customCourses, ...supabaseCourses];
  const filtered = allCourses.filter(course => {
    const searchable = [course.title, course.description, course.category, course.instructor, ...course.tags].join(' ').toLowerCase();
    return searchable.includes(search.toLowerCase()) && (level === 'All' || course.level === level) && (duration === 'All' || course.duration === duration) && (skill === 'All' || course.competencyIds.includes(skill));
  });

  function openCourse(course: Course) {
    setActiveCourse(course);
    setActiveWeek(1);
    setQuizAnswers({});
    setAssignmentText('');
  }
  function enroll(course: Course) {
    enrollInCourse(currentUser.id, course.id);
    toast.success(`Enrolled in ${course.title}. Week 1 is now available.`);
  }
  function weekIsUnlocked(course: Course, number: number) {
    const progress = progressFor(course.id);
    return number === 1 || Boolean(progress?.completedWeeks.includes(number - 1));
  }
  function completeQuiz(courseWeek: CourseWeek) {
    const correct = courseWeek.quiz.questions.filter(question => quizAnswers[question.id] === question.correctIndex).length;
    const score = Math.round((correct / courseWeek.quiz.questions.length) * 100);
    const passed = score >= courseWeek.quiz.passingScore;
    submitWeeklyQuiz(currentUser.id, activeCourse!.id, { quizId: courseWeek.quiz.id, score, passed, answers: quizAnswers, completedAt: new Date().toISOString() });
    toast[passed ? 'success' : 'error'](passed ? `Week ${courseWeek.weekNumber} quiz passed: ${score}%` : `Score ${score}%. Review the materials and retry.`);
  }
  function submitWeekAssignment(courseWeek: CourseWeek) {
    if (!assignmentText.trim()) { toast.error('Write a response before submitting the assignment.'); return; }
    submitAssignment(currentUser.id, activeCourse!.id, courseWeek.weekNumber, { weekNumber: courseWeek.weekNumber, text: assignmentText.trim(), submittedAt: new Date().toISOString() });
    toast.success(`Week ${courseWeek.weekNumber} assignment submitted.`);
    setAssignmentText('');
  }

  const activeProgress = activeCourse ? progressFor(activeCourse.id) : undefined;
  const activeWeeks = activeCourse
    ? getWeeksForCourse(activeCourse.id).length > 0
      ? getWeeksForCourse(activeCourse.id)
      : supabaseCourses.some(course => course.id === activeCourse.id)
        ? createFallbackCourseWeeks(activeCourse.id, activeCourse.title, activeCourse.weeks || 4)
        : []
    : [];
  const activeWeekData = activeWeeks.find(item => item.weekNumber === activeWeek);
  const completedPercent = activeCourse ? Math.round(((activeProgress?.completedWeeks.length || 0) / (activeCourse.weeks || 1)) * 100) : 0;

  function publishCourse() {
    if (!builderTitle.trim()) { toast.error('Enter a course title.'); return; }
    const courseId = `custom-${Date.now()}`;
    const course: Course = { id: courseId, title: builderTitle.trim(), description: 'Manager-created capability programme.', category: 'Professional Development', duration: `${builderWeeks} Weeks`, durationMinutes: builderWeeks * 180, level: 'Intermediate', tags: ['manager-created'], thumbnail: 'NC', instructor: currentUser.name, modules: builderWeeks, enrolledCount: 0, rating: 0, competencyIds: ['c2'], weeks: builderWeeks, weeklyEffort: '3 hours/week', prerequisites: ['Role-relevant experience'], outcomes: ['Apply new capability at work'], published: true, createdBy: currentUser.id };
    const weeks: CourseWeek[] = Array.from({ length: builderWeeks }, (_, index) => { const number = index + 1; const start = new Date(2026, 8, 7 + index * 7); const end = new Date(start); end.setDate(start.getDate() + 6); const iso = (date: Date) => date.toISOString().slice(0, 10); return { id: `${courseId}-w${number}`, courseId, weekNumber: number, title: `Applied capability module ${number}`, startsOn: iso(start), endsOn: iso(end), resources: [{ id: `${courseId}-w${number}-content`, type: 'video', title: `Week ${number} learning video`, description: 'Manager-created demo learning content.', durationMinutes: 25 }], quiz: { id: `${courseId}-w${number}-quiz`, title: `Week ${number} quiz`, passingScore: 70, questions: [{ id: `${courseId}-w${number}-q1`, text: 'What is the purpose of this module?', options: ['Apply learning to work', 'Skip practice', 'Avoid reflection', 'None of these'], correctIndex: 0, explanation: 'Application demonstrates capability.' }] }, assignment: { id: `${courseId}-w${number}-assignment`, title: `Week ${number} assignment`, description: 'Submit a practical response.', instructions: 'Describe how you would apply the learning.', deadline: iso(end) } }; });
    createCourse(course, weeks);
    setBuilderTitle('');
    setShowBuilder(false);
    toast.success(`${course.title} published with ${builderWeeks} weekly modules.`);
  }

  return <div className="p-6 md:p-8 max-w-7xl mx-auto animate-fade-in space-y-8">
    {coursesLoading && <div className="gov-card px-5 py-3 text-xs font-semibold text-slate-500">Loading courses from Supabase...</div>}
    {coursesError && <div className="gov-card px-5 py-3 text-xs font-semibold text-amber-800 border-amber-200">{coursesError} Existing catalogue courses remain available.</div>}
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
      <div><span className="text-[10px] font-bold uppercase tracking-wider text-[#ff9933] bg-orange-50 px-2.5 py-0.5 rounded border border-orange-200">Structured learning repository</span><h1 className="text-3xl font-black text-[#0b2545] tracking-tight mt-2">Course Catalogue</h1><p className="text-xs text-slate-500 font-medium mt-1">Choose a capability, follow the weekly plan, and verify improvement through assessment.</p>{(!isSupabaseConfigured || localStorage.getItem('capacity_connect_demo_user')) && <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700 mt-2">DEMO / SAMPLE DATA: Ratings and catalogue metadata are illustrative.</p>}</div>
      <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-slate-200"><StateEmblem className="w-7 h-9" /><div className="border-l border-slate-200 pl-3"><p className="text-sm font-black text-[#0b2545]">{myEnrollments.length} Enrolled</p><p className="text-[10px] text-emerald-700 font-bold">Weekly gates enabled</p></div></div>
    </div>
    {user.role !== 'learner' && <div className="gov-card p-5 border-amber-200"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-bold text-slate-900">Manager Course Builder</h2><p className="text-xs text-slate-500 mt-1">Create and publish a structured multi-week programme for learners.</p></div><button onClick={() => setShowBuilder(value => !value)} className="px-4 py-2.5 bg-[#0b2545] text-white rounded-xl text-xs font-bold">{showBuilder ? 'Close builder' : 'Create course'}</button></div>{showBuilder && <div className="grid sm:grid-cols-[1fr_180px_auto] gap-3 mt-4"><input value={builderTitle} onChange={event => setBuilderTitle(event.target.value)} placeholder="Course title" className="px-3 py-2.5 border border-slate-200 rounded-xl text-xs" /><select value={builderWeeks} onChange={event => setBuilderWeeks(Number(event.target.value))} className="px-3 py-2.5 border border-slate-200 rounded-xl text-xs"><option value={4}>4 weeks</option><option value={6}>6 weeks</option><option value={8}>8 weeks</option></select><button onClick={publishCourse} className="px-4 py-2.5 bg-emerald-700 text-white rounded-xl text-xs font-bold">Publish course</button></div>}</div>}
    <div className="gov-card p-5 flex flex-wrap gap-3"><div className="relative flex-1 min-w-[220px]"><Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search skill, course, instructor..." className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs" /></div><select value={skill} onChange={event => setSkill(event.target.value)} className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs"><option value="All">All competencies</option><option value="c2">Data Analytics</option><option value="c3">Leadership</option><option value="c5">Project Management</option></select><select value={level} onChange={event => setLevel(event.target.value)} className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs">{LEVELS.map(item => <option key={item}>{item}</option>)}</select><select value={duration} onChange={event => setDuration(event.target.value)} className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs">{DURATIONS.map(item => <option key={item}>{item}</option>)}</select></div>
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">{filtered.map(course => { const enrollment = enrolledMap.get(course.id); const progress = progressFor(course.id); const percent = progress?.completedAt ? 100 : Math.round(((progress?.completedWeeks.length || 0) / (course.weeks || 1)) * 100); return <div key={course.id} className="gov-card overflow-hidden flex flex-col"><div className="h-32 bg-gradient-to-br from-[#061527] to-[#0b2545] flex items-center justify-center relative"><span className="text-4xl font-black text-amber-300 font-mono bg-white/10 px-4 py-1.5 rounded-2xl">{course.thumbnail}</span>{progress?.completedAt && <span className="absolute top-3 right-3 bg-emerald-500 text-white px-2 py-1 rounded-full text-[10px] font-bold flex items-center gap-1"><CheckCircle size={12} /> Completed</span>}</div><div className="p-6 flex-1 flex flex-col justify-between gap-4"><div><div className="flex items-start justify-between gap-2"><h3 className="font-bold text-slate-900 text-sm">{course.title}</h3><Badge label={course.level} color="blue" /></div><p className="text-xs text-[#c69214] font-semibold mt-2">{course.instructor} • {course.category}</p><p className="text-xs text-slate-500 leading-relaxed mt-2">{course.description}</p><div className="flex flex-wrap gap-3 text-xs text-slate-400 mt-4"><span><Clock size={12} className="inline" /> {course.duration}</span><span>{course.weeklyEffort}</span><span><Star size={12} className="inline text-amber-400" /> {course.rating}</span></div></div>{enrollment && <div><div className="flex justify-between text-xs font-semibold text-slate-700 mb-1"><span>Weekly progress</span><span>{percent}%</span></div><ProgressBar value={percent} color={percent === 100 ? 'green' : 'blue'} size="sm" /></div>}<div className="flex gap-2"><button onClick={() => openCourse(course)} className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold text-white bg-[#0b2545] py-2.5 rounded-xl"><BookOpen size={13} /> View course</button>{!enrollment && <button onClick={() => enroll(course)} className="px-3 py-2.5 bg-slate-100 text-[#0b2545] rounded-xl" title="Enroll in course"><Plus size={15} /></button>}</div></div></div>; })}</div>
    {activeCourse && activeWeekData && <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"><div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden max-h-[94vh] flex flex-col"><div className="bg-[#061527] text-white p-6 flex items-start justify-between gap-4"><div><p className="text-[10px] text-amber-300 uppercase font-bold tracking-wider">{activeCourse.duration} • {activeCourse.weeklyEffort}</p><h2 className="text-2xl font-black mt-1">{activeCourse.title}</h2><p className="text-xs text-slate-300 mt-1">{activeCourse.prerequisites?.join(' • ')}</p></div><button onClick={() => setActiveCourse(null)} className="text-slate-300 p-2" aria-label="Close course"><X size={20} /></button></div><div className="p-5 overflow-y-auto space-y-6"><div><div className="flex justify-between text-xs font-bold text-slate-700 mb-1"><span>Week {activeProgress?.completedWeeks.length || 0} of {activeCourse.weeks}</span><span>{completedPercent}%</span></div><ProgressBar value={completedPercent} color="blue" size="sm" /></div><div className="grid grid-cols-2 sm:grid-cols-4 gap-2">{activeWeeks.map(courseWeek => { const unlocked = weekIsUnlocked(activeCourse, courseWeek.weekNumber); const done = activeProgress?.completedWeeks.includes(courseWeek.weekNumber); return <button key={courseWeek.id} disabled={!unlocked} onClick={() => { setActiveWeek(courseWeek.weekNumber); setQuizAnswers({}); }} className={`p-3 rounded-xl border text-left text-xs ${done ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : unlocked ? 'bg-amber-50 border-amber-300 text-amber-900' : 'bg-slate-50 border-slate-200 text-slate-400'}`}><span className="font-bold flex items-center gap-1">{done ? <CheckCircle size={13} /> : unlocked ? <Play size={13} /> : <Lock size={13} />} Week {courseWeek.weekNumber}</span><span className="block mt-1">{courseWeek.startsOn}</span></button>; })}</div><h3 className="text-xl font-black text-slate-900">Week {activeWeekData.weekNumber}: {activeWeekData.title}</h3><p className="text-xs text-slate-500">{activeWeekData.startsOn} to {activeWeekData.endsOn} • Complete all activities to unlock the next week.</p><div className="grid md:grid-cols-2 gap-4">{activeWeekData.resources.map(resource => { const done = activeProgress?.completedResourceIds.includes(resource.id); return <div key={resource.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50"><p className="text-sm font-bold text-slate-900 flex items-center gap-2">{resource.type === 'video' ? <Play size={14} /> : <FileText size={14} />} {resource.title}</p><p className="text-xs text-slate-500 mt-1">{resource.description}</p><p className="text-[10px] text-slate-400 mt-2">{resource.durationMinutes} minutes • Demo learning resource</p><button onClick={() => completeResource(user.id, activeCourse.id, resource.id)} disabled={done} className={`mt-3 px-3 py-2 rounded-lg text-[11px] font-bold ${done ? 'bg-emerald-100 text-emerald-800' : 'bg-[#0b2545] text-white'}`}>{done ? 'Completed' : resource.type === 'video' ? 'Watch video' : 'Complete reading'}</button></div>; })}</div><div className="p-4 rounded-2xl border border-slate-200"><h4 className="font-bold text-sm text-slate-900 flex items-center gap-2"><ClipboardCheck size={15} /> {activeWeekData.quiz.title}</h4><p className="text-xs text-slate-500 mt-1">{activeWeekData.quiz.questions.length} questions • Pass mark {activeWeekData.quiz.passingScore}%</p>{activeWeekData.quiz.questions.map(question => <div key={question.id} className="mt-4"><p className="text-xs font-bold text-slate-800">{question.text}</p><div className="grid sm:grid-cols-2 gap-2 mt-2">{question.options.map((option, index) => <button key={option} onClick={() => setQuizAnswers(previous => ({ ...previous, [question.id]: index }))} className={`text-left p-2.5 rounded-lg border text-xs ${quizAnswers[question.id] === index ? 'border-[#0b2545] bg-blue-50 font-bold' : 'border-slate-200'}`}>{option}</button>)}</div></div>)}<button onClick={() => completeQuiz(activeWeekData)} className="mt-4 px-4 py-2.5 bg-[#0b2545] text-white rounded-xl text-xs font-bold">Submit Week {activeWeekData.weekNumber} Quiz</button></div><div className="p-4 rounded-2xl border border-slate-200"><h4 className="font-bold text-sm text-slate-900 flex items-center gap-2"><FileText size={15} /> {activeWeekData.assignment.title}</h4><p className="text-xs text-slate-500 mt-1">Due {activeWeekData.assignment.deadline}</p><textarea value={assignmentText} onChange={event => setAssignmentText(event.target.value)} placeholder="Write your workplace response..." className="w-full mt-3 min-h-24 p-3 rounded-xl border border-slate-200 text-xs" /><button onClick={() => submitWeekAssignment(activeWeekData)} className="mt-3 px-4 py-2.5 bg-[#ff9933] text-slate-950 rounded-xl text-xs font-bold">Submit Assignment</button></div>{activeWeek === activeWeeks.length && <button onClick={() => { const result = completeCourse(user.id, activeCourse.id, 80); if (result) toast.success('Course completed and competency verified.'); else toast.error('Complete every resource, quiz, and assignment before the final assessment.'); }} className="w-full py-3.5 bg-emerald-700 text-white rounded-xl font-bold text-sm"><Award size={16} className="inline mr-2" />Take Final Assessment and Complete Course</button>}</div></div></div>}
  </div>;
}

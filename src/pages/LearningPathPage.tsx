import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCapacity } from '../context/CapacityContext';
import { learningPaths } from '../data/mockData';
import { structuredCourses } from '../data/learningData';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { getCourseRecommendations } from '../lib/recommendations';
import type { Course } from '../types';
import { CheckCircle, Circle, Lock, BookOpen, ClipboardCheck, Award, ChevronRight, Clock } from 'lucide-react';
import { StateEmblem } from '../components/ui/SharedComponents';

const STATUS_CONFIG = {
  completed:   { icon: CheckCircle, color: 'text-emerald-700', bg: 'bg-emerald-100', line: 'bg-emerald-400', label: 'Completed' },
  in_progress: { icon: Circle,      color: 'text-[#ff9933]',   bg: 'bg-amber-100',   line: 'bg-[#ff9933]',   label: 'In Progress' },
  available:   { icon: Circle,      color: 'text-[#0b2545]',   bg: 'bg-blue-100',    line: 'bg-slate-300',   label: 'Available' },
  locked:      { icon: Lock,        color: 'text-slate-400',   bg: 'bg-slate-100',   line: 'bg-slate-200',   label: 'Locked' },
};

const TYPE_ICONS = {
  course:        <BookOpen size={15} />,
  assessment:    <ClipboardCheck size={15} />,
  certification: <Award size={15} />,
};

export default function LearningPathPage() {
  const { user } = useAuth();
  const { isLoopCompleted, competenciesByUser, enrollments } = useCapacity();
  const navigate = useNavigate();
  const [mappedCourses, setMappedCourses] = useState<Course[]>(isSupabaseConfigured ? [] : structuredCourses);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;
    const client = supabase;
    async function loadMappedCourses() {
      const { data } = await client.from('course_competencies').select('course_id, competency_id');
      const ids = Array.from(new Set((data || []).map(item => item.course_id)));
      if (ids.length === 0) return;
      const { data: courses } = await client.from('courses').select('*').in('id', ids).in('content_status', ['Approved', 'Published']);
      setMappedCourses((courses || []).map(course => ({ id: String(course.id), title: course.title || 'Untitled course', description: course.description || '', category: course.category || 'General', duration: `${course.duration_weeks || 1} Weeks`, durationMinutes: (course.duration_weeks || 1) * 180, level: course.level === 'Advanced' || course.level === 'Intermediate' ? course.level : 'Beginner', tags: [], thumbnail: 'CC', instructor: 'Capacity Connect', modules: course.duration_weeks || 1, enrolledCount: 0, rating: 0, competencyIds: (data || []).filter(item => item.course_id === course.id).map(item => item.competency_id), weeks: course.duration_weeks || 1, weeklyEffort: '3 hours/week', published: true })));
    }
    void loadMappedCourses();
  }, []);

  if (!user) return null;
  const competencies = competenciesByUser[user.id] || [];
  const priority = [...competencies].sort((a, b) => (b.required - b.current) - (a.required - a.current))[0];
  const completedCourseIds = enrollments.filter(enrollment => enrollment.userId === user.id && enrollment.completedAt).map(enrollment => enrollment.courseId);
  const recommendations = getCourseRecommendations(competencies, mappedCourses, completedCourseIds);

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto animate-fade-in space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#ff9933] bg-orange-50 px-2.5 py-0.5 rounded border border-orange-200">
              Structured Capability Pathways • Mission Karmayogi
            </span>
          </div>
          <h1 className="text-3xl font-black text-[#0b2545] tracking-tight">
            Personalized Capability Journey
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Standardized multi-step progression sequences tailored to resolve your detected skill gaps
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
          <StateEmblem className="w-7 h-9 flex-shrink-0" />
          <div className="border-l border-slate-200 pl-3">
            <p className="text-sm font-black text-[#0b2545]">iGOT Karmayogi</p>
            <p className="text-[10px] text-emerald-700 font-bold">Standard Track</p>
          </div>
        </div>
      </div>

      {/* Journey Milestone Banner */}
      <div className="gov-hero-gradient rounded-3xl p-8 text-white border-2 border-amber-400/30 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="max-w-xl">
            <p className="text-[#ff9933] text-xs font-bold uppercase tracking-wider mb-1">
              National Priority Track
            </p>
            <h2 className="text-2xl md:text-3xl font-black text-white font-serif">
              {priority?.name || 'Capability Development'} Learning Path
            </h2>
            <p className="text-slate-300 text-xs mt-2 leading-relaxed">
              Recommended because your current {priority?.name || 'capability'} score is {priority?.current || 0}% against a {priority?.required || 0}% role benchmark. Follow the weekly sequence and verify improvement through assessment.
            </p>
          </div>

          <div className="text-left md:text-right flex-shrink-0">
            <p className="text-4xl font-black text-amber-300">{isLoopCompleted ? '100%' : `${priority ? Math.max(0, priority.required - priority.current) : 0} pt`}</p>
            <p className="text-xs text-emerald-400 font-bold mt-1">
              {isLoopCompleted ? '✓ Pathway Certified' : 'In Active Progress'}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">{isLoopCompleted ? 'Completed' : '~15h estimated'}</p>
          </div>
        </div>

        {/* Milestone Steps Bar */}
        <div className="mt-8 grid grid-cols-6 gap-2 text-center text-xs relative z-10">
          {['Foundation', 'Skill Build', 'Practice', 'Assessment', 'Advanced', 'Certified'].map((stage, i) => {
            const isCompletedStage = isLoopCompleted || i === 0;
            const isCurrentStage = !isLoopCompleted && i === 1;

            return (
              <div key={stage}>
                <div
                  className={`w-9 h-9 rounded-2xl mx-auto flex items-center justify-center font-bold text-xs transition-all ${
                    isCompletedStage
                      ? 'bg-emerald-500 text-white shadow-xs'
                      : isCurrentStage
                      ? 'bg-[#ff9933] text-slate-950 ring-4 ring-[#ff9933]/30 font-black'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {isCompletedStage ? '✓' : i + 1}
                </div>
                <p className={`mt-1.5 text-[11px] font-bold ${
                  isCompletedStage ? 'text-emerald-300' : isCurrentStage ? 'text-amber-300' : 'text-slate-400'
                }`}>
                  {stage}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="gov-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Choose your capability</h2>
            <p className="text-xs text-slate-500 mt-1">Recommendations are linked to your current competency gap.</p>
          </div>
          <span className="text-xs font-bold text-[#0b2545]">Current: {priority?.current || 0}% • Target: {priority?.required || 0}%</span>
        </div>
        <div className="flex flex-wrap gap-2 mb-5">
          {competencies.map(competency => <button key={competency.id} onClick={() => document.getElementById(`recommendation-${competency.id}`)?.scrollIntoView({ behavior: 'smooth' })} className={`px-3 py-2 rounded-xl border text-xs font-bold ${competency.id === priority?.id ? 'bg-[#0b2545] text-white border-[#0b2545]' : 'bg-slate-50 text-slate-700 border-slate-200'}`}>{competency.name}</button>)}
        </div>
        <div id={`recommendation-${priority?.id || 'none'}`} className="grid md:grid-cols-3 gap-3">
              {recommendations.length > 0 ? recommendations.map(({ course, competency, gap }) => <div key={course.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50"><p className="text-sm font-bold text-slate-900">{course.title}</p><p className="text-[11px] text-slate-500 mt-1">{course.duration} • {course.weeklyEffort}</p><p className="text-[11px] text-[#0b2545] font-semibold mt-2">Recommended for your {competency.name} gap ({gap} points)</p><button onClick={() => navigate('/courses')} className="mt-3 px-3 py-2 rounded-lg bg-[#0b2545] text-white text-[11px] font-bold">View course</button></div>) : <div className="md:col-span-3 p-5 rounded-2xl border border-dashed border-slate-300 text-sm text-slate-500">Complete more learning activities to receive personalized recommendations.</div>}
        </div>
      </div>

      {/* Pathways List */}
      {learningPaths.map(lp => (
        <div key={lp.id} className="gov-card overflow-hidden border-slate-200">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <h2 className="text-base font-bold text-slate-900">{lp.title}</h2>
              <p className="text-xs text-slate-500 mt-0.5">{lp.description}</p>
            </div>
            <div className="text-right flex-shrink-0 ml-4">
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Total Duration</p>
              <p className="text-xs font-bold text-[#0b2545] flex items-center gap-1">
                <Clock size={12} /> {lp.estimatedHours}h
              </p>
            </div>
          </div>

          <div className="px-6 py-6">
            <div className="relative">
              {lp.steps.map((step, idx) => {
                const effectiveStatus = isLoopCompleted && lp.id === 'lp1' ? 'completed' : step.status;
                const cfg = STATUS_CONFIG[effectiveStatus];
                const Icon = cfg.icon;
                const TypeIcon = TYPE_ICONS[step.type];
                const isLast = idx === lp.steps.length - 1;

                return (
                  <div key={step.id} className="relative flex gap-5">
                    <div className="flex flex-col items-center">
                      <div className={`w-9 h-9 rounded-2xl ${cfg.bg} flex items-center justify-center flex-shrink-0 z-10 border border-slate-200`}>
                        <Icon size={16} className={cfg.color} />
                      </div>
                      {!isLast && <div className={`w-0.5 flex-1 my-1 ${cfg.line} min-h-[44px]`} />}
                    </div>

                    <div className={`flex-1 pb-6 ${effectiveStatus === 'locked' ? 'opacity-50' : ''}`}>
                      <div
                        className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                          effectiveStatus === 'in_progress'
                            ? 'bg-amber-50/60 border-amber-300'
                            : effectiveStatus === 'completed'
                            ? 'bg-emerald-50/50 border-emerald-200'
                            : effectiveStatus === 'available'
                            ? 'bg-white border-slate-200 hover:border-slate-300'
                            : 'bg-slate-50 border-slate-200/60'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-xl ${cfg.bg}`}>
                            <span className={cfg.color}>{TypeIcon}</span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-xs md:text-sm text-slate-900">{step.title}</p>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                effectiveStatus === 'completed'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : effectiveStatus === 'in_progress'
                                  ? 'bg-amber-100 text-amber-900'
                                  : 'bg-slate-100 text-slate-600'
                              }`}>
                                {cfg.label}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                              <span className="flex items-center gap-1"><Clock size={11} /> {step.duration}</span>
                              <span>•</span>
                              <span className="capitalize">{step.type}</span>
                            </p>
                          </div>
                        </div>

                        {effectiveStatus === 'in_progress' && (
                          <button
                            onClick={() => navigate('/courses')}
                            className="px-3.5 py-1.5 bg-[#0b2545] text-amber-300 rounded-xl text-xs font-bold hover:bg-[#13315c] flex items-center gap-1 flex-shrink-0 shadow-xs"
                          >
                            <span>Resume</span>
                            <ChevronRight size={12} />
                          </button>
                        )}
                        {effectiveStatus === 'available' && (
                          <button
                            onClick={() => (step.type === 'assessment' ? navigate('/assessments') : navigate('/courses'))}
                            className="px-3.5 py-1.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-[#0b2545] hover:text-white flex items-center gap-1 flex-shrink-0"
                          >
                            <span>Start</span>
                            <ChevronRight size={12} />
                          </button>
                        )}
                        {effectiveStatus === 'completed' && (
                          <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 flex-shrink-0">
                            <CheckCircle size={14} /> Passed
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCapacity } from '../context/CapacityContext';
import { courses } from '../data/mockData';
import { getLearnerStats } from '../lib/metrics';
import { StatCard, CircularScore, ProgressBar, SectionHeader, Avatar, OfficialCertificate } from '../components/ui/SharedComponents';
import {
  Brain, BookOpen, Award, ArrowRight,
  Play, Target, CheckCircle2, ShieldCheck
} from 'lucide-react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip
} from 'recharts';
import { useState } from 'react';

function getHour(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { competenciesByUser, enrollments, certificates, learningProgress } = useCapacity();
  const navigate = useNavigate();
  const [showCertModal, setShowCertModal] = useState(false);

  if (!user) return null;

  const comps = competenciesByUser[user.id] || [];
  const userEnrollments = enrollments.filter(e => e.userId === user.id);
  const userCerts = certificates.filter(c => c.userId === user.id);
  const learnerProgress = learningProgress.filter(progress => progress.userId === user.id);
  const learnerStats = getLearnerStats({
    userId: user.id,
    enrollments: userEnrollments,
    competencies: comps,
    certificates: userCerts,
    quizCount: learnerProgress.reduce((sum, progress) => sum + progress.quizAttempts.length, 0),
    assignmentCount: learnerProgress.reduce((sum, progress) => sum + progress.assignmentSubmissions.length, 0),
  });

  // Dynamic capability score calculation
  const capabilityScore = comps.length
    ? Math.round((comps.reduce((sum, c) => sum + Math.min(c.current / c.required, 1), 0) / comps.length) * 100)
    : 0;

  const inProgressCourses = userEnrollments
    .filter(e => e.progress > 0 && e.progress < 100)
    .map(e => ({ enrollment: e, course: courses.find(c => c.id === e.courseId)! }))
    .filter(x => x.course);

  const gaps = comps
    .filter(c => c.required - c.current > 0)
    .sort((a, b) => (b.required - b.current) - (a.required - a.current));

  const dataAnalyticsComp = comps.find(c => c.id === 'c2');
  const roleBenchmark = comps.length ? Math.round(comps.reduce((sum, competency) => sum + competency.required, 0) / comps.length) : null;
  const isDataGapResolved = dataAnalyticsComp ? dataAnalyticsComp.current >= dataAnalyticsComp.required : false;

  const radarData = comps.map(c => ({
    subject: c.name.length > 12 ? c.name.split(' ')[0] : c.name,
    Current: c.current,
    Required: c.required,
    fullMark: 100,
  }));

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto animate-fade-in space-y-8">
      {/* 1. Header with Government Rank & Date */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#ff9933] bg-[#ff9933]/10 px-2.5 py-0.5 rounded border border-[#ff9933]/30">
              Department of {user.department} • Civil Service Tier
            </span>
          </div>
          <h1 className="text-3xl font-black text-[#0b2545] tracking-tight">
            {getHour()}, {user.name} 👋
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            {user.position} • Officer ID: <span className="font-mono text-slate-700">{user.id.toUpperCase()}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 shadow-xs">
            {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
          <Avatar initials={user.avatar} size="lg" />
        </div>
      </div>

      {/* 2. Priority Closed-Loop Action Banner */}
      {!dataAnalyticsComp ? (
        <div className="bg-slate-100 rounded-3xl p-6 text-slate-700 border border-slate-200">
          <h3 className="text-lg font-bold text-slate-900">No personal competency data yet</h3>
          <p className="text-xs mt-1">Complete a competency assessment when data becomes available to see your learning priorities.</p>
        </div>
      ) : !isDataGapResolved ? (
        <div className="bg-gradient-to-r from-[#0b2545] via-[#13315c] to-[#0b2545] rounded-3xl p-6 text-white border-2 border-[#ff9933]/60 shadow-lg flex flex-col lg:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#ff9933]/20 border border-[#ff9933]/40 flex items-center justify-center text-[#ff9933] flex-shrink-0 mt-1">
              <Target size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/40">
                  Priority Action Required
                </span>
                <span className="text-xs text-amber-300 font-bold">FRAC Benchmark Deficit: −{(dataAnalyticsComp?.required || 0) - (dataAnalyticsComp?.current || 0)} pts</span>
              </div>
              <h3 className="text-xl font-bold text-white mt-1">
                Data Analytics Competency Deficit Detected
              </h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed max-w-2xl">
                Your current score is <strong className="text-white">{dataAnalyticsComp?.current || 0}%</strong> vs role benchmark of <strong className="text-white">{dataAnalyticsComp?.required || 0}%</strong>. Complete the prescribed learning modules and clear the proctored assessment to upgrade your competency.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={() => navigate('/courses')}
              className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/20 transition-all flex items-center gap-1.5"
            >
              <BookOpen size={14} />
              <span>1. Complete Course</span>
            </button>
            <button
              onClick={() => navigate('/assessments')}
              className="px-6 py-3 bg-[#ff9933] hover:bg-[#e06d00] text-slate-950 text-xs font-black rounded-xl transition-all shadow-md shadow-orange-950/40 flex items-center gap-1.5"
            >
              <span>2. Take Assessment</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-emerald-950 via-[#0b2545] to-emerald-950 rounded-3xl p-6 text-white border-2 border-emerald-400/50 shadow-lg flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 flex-shrink-0 mt-1">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/40">
                  Closed-Loop Cycle Complete
                </span>
                <span className="text-xs text-emerald-300 font-bold">Target Met: {dataAnalyticsComp?.current || 0}% Verified ✓</span>
              </div>
              <h3 className="text-xl font-bold text-white mt-1">
                Data Analytics Competency Accredited
              </h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed max-w-2xl">
                Assessment successfully cleared! The critical skill gap has been resolved, an official Government of India certificate has been minted, and your manager’s Team Matrix is updated.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowCertModal(true)}
            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black rounded-xl transition-all shadow-md flex items-center gap-2 flex-shrink-0"
          >
            <Award size={15} />
            <span>View GoI Certificate</span>
          </button>
        </div>
      )}

      {/* 3. High-Impact Government Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        <StatCard
          label="My Capability Index"
          value={learnerStats.capability === null ? 'No data yet' : `${learnerStats.capability}%`}
          sub="Calculated from my competencies"
          icon={<Brain size={20} />}
          color="blue"
          badge="FRAC Tier II"
        />
        <StatCard
          label="Learning Completion"
          value={learnerStats.myProgress === null ? 'No data yet' : `${learnerStats.myProgress}%`}
          sub={`${userEnrollments.filter(e => e.progress === 100).length} courses completed`}
          icon={<BookOpen size={20} />}
          color="teal"
          badge="iGOT Aligned"
        />
        <StatCard
          label="Remaining Skill Gaps"
          value={comps.length === 0 ? 'No data yet' : learnerStats.skillGaps}
          sub={gaps.length > 0 ? `Priority: ${gaps[0]?.name}` : 'All targets achieved!'}
          icon={<Target size={20} />}
          color={gaps.length > 2 ? 'red' : gaps.length > 0 ? 'saffron' : 'green'}
          badge={gaps.length === 0 ? 'Fully Qualified' : 'Action Required'}
        />
        <StatCard
          label="Verified Credentials"
          value={learnerStats.myCertificates}
          sub="Government signed"
          icon={<Award size={20} />}
          color="gold"
          badge="Tamper Evident"
        />
      </div>

      {/* 4. Main Diagnostic Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Competency Radar Analysis */}
        <div className="lg:col-span-2 gov-card p-6">
          <SectionHeader
            title="Competency Radar & FRAC Mapping"
            titleHi="दक्षता विश्लेषण"
            subtitle="Real-time capability index measured against role requirements"
            action={
              <Link
                to="/competency"
                className="text-xs text-[#0b2545] font-bold hover:underline flex items-center gap-1"
              >
                <span>Full Profile</span>
                <ArrowRight size={12} />
              </Link>
            }
          />
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#64748b' }} />
                <Radar name="Required Benchmark" dataKey="Required" stroke="#cbd5e1" fill="#cbd5e1" fillOpacity={0.4} />
                <Radar
                  name="Verified Capability"
                  dataKey="Current"
                  stroke="#0b2545"
                  fill="#ff9933"
                  fillOpacity={0.35}
                  strokeWidth={2}
                />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
                  formatter={(v, n) => [`${v}%`, n]}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-6 justify-center mt-2 text-xs font-bold">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-[#ff9933] rounded-full" /> Verified Level
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-slate-300 rounded-full" /> Required Benchmark
            </div>
          </div>
        </div>

        {/* Readiness Dial & Top Gaps */}
        <div className="space-y-6">
          <div className="gov-hero-gradient rounded-3xl p-6 text-white flex flex-col items-center text-center shadow-md relative overflow-hidden">
            <CircularScore value={capabilityScore} size={110} color="#ff9933" />
            <p className="text-[#ff9933] text-[11px] font-bold mt-3 uppercase tracking-wider">
              Composite Readiness Index
            </p>
            <p className="text-xs text-slate-300 mt-0.5">Average role benchmark: {roleBenchmark === null ? 'No data yet' : `${roleBenchmark}%`}</p>
            <div className="mt-4 w-full bg-white/10 rounded-2xl px-4 py-2.5 text-xs text-amber-200 font-semibold border border-white/10">
              {isDataGapResolved ? '✓ Data Analytics target met' : 'Active remediation in progress 🎯'}
            </div>
          </div>

          <div className="gov-card p-5">
            <p className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Top Priority Skill Gaps
            </p>
            <div className="space-y-3">
              {gaps.slice(0, 3).map(c => {
                const gap = c.required - c.current;
                return (
                  <div key={c.id}>
                    <div className="flex justify-between text-xs mb-1 font-semibold">
                      <span className="text-slate-700">{c.name}</span>
                      <span className="text-red-600">−{gap} pts</span>
                    </div>
                    <ProgressBar
                      value={c.current}
                      required={c.required}
                      color={gap > 20 ? 'red' : 'orange'}
                      size="sm"
                    />
                  </div>
                );
              })}
              {gaps.length === 0 && (
                <div className="text-center py-4 text-emerald-700 text-xs font-bold flex items-center justify-center gap-1.5">
                  <CheckCircle2 size={16} /> All role competency thresholds met!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 5. In Progress & Recommended Learning */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Continue Learning */}
        <div className="gov-card p-6">
          <SectionHeader
            title="Active Learning Interventions"
            titleHi="सक्रिय पाठ्यक्रम"
            subtitle="Prescribed learning to close identified capability gaps"
            action={
              <Link to="/courses" className="text-xs text-[#0b2545] font-bold hover:underline flex items-center gap-1">
                <span>All Courses</span>
                <ArrowRight size={12} />
              </Link>
            }
          />
          <div className="space-y-3">
            {inProgressCourses.slice(0, 3).map(({ enrollment, course }) => (
              <div
                key={course.id}
                onClick={() => navigate('/courses')}
                className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl hover:bg-amber-50/40 transition-colors cursor-pointer border border-slate-200/60"
              >
                <div className="w-12 h-12 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-[#0b2545] font-black text-sm flex-shrink-0 shadow-xs">
                  {course.thumbnail}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">{course.title}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <ProgressBar value={enrollment.progress} color="blue" size="sm" />
                    <span className="text-xs text-slate-500 font-bold whitespace-nowrap">{enrollment.progress}%</span>
                  </div>
                </div>
                <div className="w-8 h-8 bg-[#0b2545] rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-xs">
                  <Play size={13} />
                </div>
              </div>
            ))}
            {inProgressCourses.length === 0 && (
              <div className="text-center py-8 text-slate-400">
                <BookOpen size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-xs font-semibold">No learning in progress. Check course recommendations!</p>
              </div>
            )}
          </div>
        </div>

        {/* Verified Credentials Shelf */}
        <div className="gov-card p-6">
          <SectionHeader
            title="National Verified Credentials"
            titleHi="प्रमाण-पत्र सूची"
            subtitle="Accredited Government of India competency certificates"
          />
          <div className="space-y-3">
            {userCerts.slice(0, 3).map(cert => (
              <div
                key={cert.id}
                onClick={() => setShowCertModal(true)}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between hover:bg-slate-100/60 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-[#c69214]">
                    <Award size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 leading-tight">{cert.title}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">UID: {cert.id} • Issued: {cert.issuedDate}</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck size={11} /> Verified
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Official Certificate Modal */}
      {showCertModal && (
        <OfficialCertificate
          title="Certified Data Analytics Specialist"
          recipientName={user.name}
          recipientPosition={user.position}
              score={dataAnalyticsComp?.current || 0}
          issuedDate={new Date().toISOString().slice(0, 10)}
          uid={`GOI-CBC-${Date.now().toString().slice(-6)}`}
          onClose={() => setShowCertModal(false)}
        />
      )}
    </div>
  );
}

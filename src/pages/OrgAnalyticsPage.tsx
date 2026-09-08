import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCapacity } from '../context/CapacityContext';
import {
  departmentTrend, trainingImpactData
} from '../data/mockData';
import { users as demoUsers, courses as demoCourses, enrollments as demoEnrollments, certificates as demoCertificates, competenciesByUser as demoCompetencies, departments as demoDepartments } from '../data/mockData';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { getPlatformStats, type PlatformStats } from '../lib/metrics';
import { StatCard, SectionHeader, ScorePill } from '../components/ui/SharedComponents';
import {
  BarChart3, TrendingUp, Building2, Award, Download,
  CheckCircle2, AlertTriangle, ArrowUpRight
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import toast from 'react-hot-toast';

export default function OrgAnalyticsPage() {
  const { user } = useAuth();
  const { departments, isLoopCompleted } = useCapacity();
  const [timeRange, setTimeRange] = useState<'6m' | '1y' | 'all'>('6m');
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null);
  const demoMode = Boolean(localStorage.getItem('capacity_connect_demo_user'));

  useEffect(() => {
    async function loadStats() {
      if (demoMode) {
        setPlatformStats(getPlatformStats({
          users: demoUsers,
          courses: demoCourses,
          enrollments: demoEnrollments,
          certificates: demoCertificates,
          competencies: Object.entries(demoCompetencies).flatMap(([userId, competencies]) => competencies.map(competency => ({ ...competency, userId }))),
          departments: demoDepartments,
        }));
        return;
      }
      if (!supabase || !isSupabaseConfigured) return;
      const [{ data: profiles }, { data: courses }, { data: enrollments }, { data: certificates }, { data: attempts }, { data: userCompetencies }, { data: definitions }] = await Promise.all([
        supabase.from('profiles').select('id, role, department'),
        supabase.from('courses').select('id'),
        supabase.from('enrollments').select('user_id, course_id, completed_at'),
        supabase.from('certificates').select('user_id, verification_status'),
        supabase.from('quiz_attempts').select('user_id, score'),
        supabase.from('user_competencies').select('user_id, competency_id, current_score, required_score'),
        supabase.from('competencies').select('id, default_required'),
      ]);
      const users = (profiles || []).map(profile => ({ id: profile.id, role: profile.role as 'learner' | 'manager' | 'admin', department: profile.department }));
      setPlatformStats(getPlatformStats({
        users,
        courses: (courses || []).map(course => ({ id: String(course.id) })),
        enrollments: (enrollments || []).map(enrollment => ({ userId: enrollment.user_id, courseId: String(enrollment.course_id), progress: enrollment.completed_at ? 100 : 0, completedAt: enrollment.completed_at || undefined })),
        certificates: (certificates || []).map(certificate => ({ userId: certificate.user_id, verificationStatus: certificate.verification_status })),
        competencies: [
          ...(userCompetencies || []).map(item => ({ id: item.competency_id, userId: item.user_id, current: item.current_score, required: item.required_score })),
          ...(definitions || []).map(item => ({ id: item.id, userId: '', current: 0, required: item.default_required })),
        ],
        departments: Array.from(new Set(users.map(user => user.department).filter(Boolean))).map(name => ({ id: name, name })),
        attempts: (attempts || []).map(attempt => ({ userId: attempt.user_id, score: attempt.score })),
      }));
    }
    void loadStats();
  }, [demoMode]);

  if (!user) return null;

  const enterpriseCapability = platformStats?.capability;
  const displayMetric = (value: number | null, suffix = '') => value === null || value === 0 ? 'No data available yet' : `${value}${suffix}`;
  const visibleDepartments = demoMode ? departments : [];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto animate-fade-in space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#c69214] bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200">
              Cabinet Secretariat & CBC Oversight
            </span>
          </div>
          <h1 className="text-3xl font-black text-[#0b2545] tracking-tight">
            National Enterprise Capability Intelligence
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Macro-level organizational readiness indices, training Return-on-Investment (ROI), and division benchmarks
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
            {(['6m', '1y', 'all'] as const).map(r => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-3 py-1.5 rounded-lg uppercase transition-all ${
                  timeRange === r ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <button
            onClick={() => toast.success('National Capability Dossier exported as PDF.')}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-[#0b2545] text-amber-300 rounded-xl text-xs font-bold hover:bg-[#13315c] transition-colors shadow-xs"
          >
            <Download size={14} />
            <span>Export Executive Dossier</span>
          </button>
        </div>
      </div>

      {/* Closed Loop Notification for Director */}
      {demoMode && <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-xs font-semibold text-amber-900">DEMO / SAMPLE DATA: Analytics are calculated from the shared Capacity Connect demo records.</div>}
      {isLoopCompleted && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 flex items-start gap-3">
          <CheckCircle2 size={20} className="text-emerald-700 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
              Executive Impact: Closed-Loop Capability Lift Detected
            </p>
            <p className="text-xs text-emerald-800 mt-0.5 leading-relaxed">
              Verified assessment activity is reflected in the shared capability and completion calculations used across the portal.
            </p>
          </div>
        </div>
      )}

      {/* Top Level KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        <StatCard
          label="Enterprise Capability Index"
          value={displayMetric(enterpriseCapability ?? null, '%')}
          sub="Calculated from competency records"
          icon={<BarChart3 size={20} />}
          color="blue"
          trend={isLoopCompleted ? 7.4 : 5.2}
          badge="Live National Avg"
        />
        <StatCard
          label="Personnel Monitored"
          value={displayMetric(platformStats?.totalUsers || null)}
          sub="Users in the selected data source"
          icon={<Building2 size={20} />}
          color="teal"
          badge="Civil Servants"
        />
        <StatCard
          label="Training Capability Lift"
          value={displayMetric(platformStats?.completionRate || null, '%')}
          sub="Course completion rate"
          icon={<TrendingUp size={20} />}
          color="green"
          trend={14}
          badge="ROI Verified"
        />
        <StatCard
          label="Accredited Certificates"
          value={displayMetric(platformStats?.certificates || null)}
          sub="Valid certificates"
          icon={<Award size={20} />}
          color="gold"
          badge="GoI Ledger"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Department Trajectory */}
        <div className="gov-card p-6">
          <SectionHeader
            title="Divisional Capability Trajectory"
            titleHi="विभागीय प्रगति"
            subtitle="Monthly capability index tracking across ministries & divisions"
          />
          <div className="h-72">
            {demoMode ? <ResponsiveContainer width="100%" height="100%">
              <LineChart data={departmentTrend} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis domain={[40, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
                  formatter={v => [`${v}%`]}
                />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                <Line type="monotone" dataKey="Engineering" stroke="#0b2545" strokeWidth={3} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="HR" stroke="#14b8a6" strokeWidth={2} strokeDasharray="3 3" />
                <Line type="monotone" dataKey="Operations" stroke="#ff9933" strokeWidth={2} />
                <Line type="monotone" dataKey="Finance" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer> : <p className="h-full flex items-center justify-center text-xs text-slate-500">No platform analytics data yet.</p>}
          </div>
        </div>

        {/* Training Impact Evaluation */}
        <div className="gov-card p-6">
          <SectionHeader
            title="Measurable Training Impact (ROI Proof)"
            titleHi="प्रशिक्षण प्रभाव"
            subtitle="Pre-training vs Post-training proctored competency scores"
          />
          <div className="h-72">
            {demoMode ? <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trainingImpactData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="competency" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
                  formatter={(v, name) => [`${v}%`, name === 'before' ? 'Pre-Training Score' : 'Post-Training Verified']}
                />
                <Legend
                  wrapperStyle={{ fontSize: 11, paddingTop: 10 }}
                  formatter={value => (value === 'before' ? 'Pre-Intervention Baseline' : 'Post-Intervention Verified')}
                />
                <Bar dataKey="before" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="after" fill="#138808" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer> : <p className="h-full flex items-center justify-center text-xs text-slate-500">No training impact data yet.</p>}
          </div>
        </div>
      </div>

      {/* Department Capability Scorecard Table */}
      <div className="gov-card p-6">
        <SectionHeader
          title="National Divisional Capability Scorecard"
          titleHi="मंत्रालय व विभाग स्कोरकार्ड"
          subtitle="Real-time compliance against required readiness standards"
        />
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50/50">
                <th className="py-3 px-4">Division / Department</th>
                <th className="py-3 px-4">Verified Capability Index</th>
                <th className="py-3 px-4">Monitored Personnel</th>
                <th className="py-3 px-4">National Compliance Status</th>
                <th className="py-3 px-4 text-right">Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {visibleDepartments.length === 0 && <tr><td colSpan={5} className="py-8 text-center text-xs text-slate-500">No divisional data available yet.</td></tr>}
              {visibleDepartments.map(dept => {
                const isCritical = dept.criticalGap;

                return (
                  <tr key={dept.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#0b2545]/10 border border-[#0b2545]/20 flex items-center justify-center font-bold text-[#0b2545] text-xs">
                          {dept.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{dept.name} Division</p>
                          <p className="text-[11px] text-slate-400">Under Mission Karmayogi</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <ScorePill value={dept.capabilityScore} />
                        <span className="text-xs text-slate-400">/ 80% Benchmark</span>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-slate-600 font-semibold text-xs">
                      {dept.employeeCount} Officers
                    </td>

                    <td className="py-4 px-4">
                      {isCritical ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-3 py-1 rounded-full">
                          <AlertTriangle size={13} /> Deficit Warning Flagged
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                          <CheckCircle2 size={13} /> On National Target
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => toast.success(`Divisional audit dossier downloaded for ${dept.name}.`)}
                        className="text-xs font-bold text-[#0b2545] hover:underline flex items-center gap-1 ml-auto"
                      >
                        Audit Dossier <ArrowUpRight size={13} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

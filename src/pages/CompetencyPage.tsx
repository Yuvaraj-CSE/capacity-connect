import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCapacity } from '../context/CapacityContext';
import { ProgressBar, Badge, SectionHeader, ScorePill, StateEmblem } from '../components/ui/SharedComponents';
import { Brain, AlertCircle, CheckCircle, ArrowRight, Sparkles } from 'lucide-react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';

export default function CompetencyPage() {
  const { user } = useAuth();
  const { competenciesByUser } = useCapacity();

  if (!user) return null;

  const comps = competenciesByUser[user.id] || [];
  const gaps = comps.map(c => ({ ...c, gap: c.required - c.current }));
  const criticalGaps = gaps.filter(g => g.gap > 15);
  const metTargets = gaps.filter(g => g.gap <= 0);

  const radarData = comps.map(c => ({
    subject: c.name.length > 12 ? c.name.split(' ')[0] : c.name,
    Current: c.current,
    Required: c.required,
    fullMark: 100,
  }));

  const barData = comps.map(c => ({
    name: c.name.length > 14 ? c.name.split(' ').slice(0, 2).join(' ') : c.name,
    Current: c.current,
    Required: c.required,
  }));

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto animate-fade-in space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#ff9933] bg-orange-50 px-2.5 py-0.5 rounded border border-orange-200">
              FRAC Competency Framework • Mission Karmayogi
            </span>
          </div>
          <h1 className="text-3xl font-black text-[#0b2545] tracking-tight">
            Competency Profile & Capability Gap Analysis
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Individual capabilities evaluated against national civil services & enterprise role benchmarks
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
          <StateEmblem className="w-7 h-9 flex-shrink-0" />
          <div className="border-l border-slate-200 pl-3 text-right">
            <p className="text-sm font-black text-[#0b2545]">{comps.length} Dimensions</p>
            <p className="text-[10px] text-slate-400 font-semibold">Tracked on Portal</p>
          </div>
        </div>
      </div>

      {/* Summary KPI Trio */}
      <div className="grid grid-cols-3 gap-5">
        <div className="gov-card p-6 text-center border-slate-200">
          <div className="w-12 h-12 bg-[#0b2545]/10 rounded-2xl flex items-center justify-center mx-auto mb-3 text-[#0b2545]">
            <Brain size={24} />
          </div>
          <p className="text-3xl font-black text-slate-900">{comps.length}</p>
          <p className="text-xs text-slate-500 font-semibold mt-1">Competencies Evaluated</p>
        </div>

        <div className="gov-card p-6 text-center border-red-200/80 bg-red-50/20">
          <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-3 text-red-600">
            <AlertCircle size={24} />
          </div>
          <p className="text-3xl font-black text-red-600">{criticalGaps.length}</p>
          <p className="text-xs text-slate-500 font-semibold mt-1">Critical Deficits (&gt;15 pts)</p>
        </div>

        <div className="gov-card p-6 text-center border-emerald-200/80 bg-emerald-50/20">
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-3 text-emerald-700">
            <CheckCircle size={24} />
          </div>
          <p className="text-3xl font-black text-emerald-700">{metTargets.length}</p>
          <p className="text-xs text-slate-500 font-semibold mt-1">Role Benchmarks Met</p>
        </div>
      </div>

      {/* Radar and Bar Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="gov-card p-6">
          <SectionHeader
            title="Competency Radar Dispersion"
            titleHi="दक्षता रडार"
            subtitle="Current level vs Required Government Benchmark"
          />
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
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
                  dot={{ r: 4, fill: '#0b2545' }}
                />
                <Tooltip formatter={v => [`${v}%`]} contentStyle={{ borderRadius: 12, fontSize: 12 }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="gov-card p-6">
          <SectionHeader
            title="Competency Gap Deficit Analysis"
            titleHi="अंतराल विश्लेषण"
            subtitle="Direct side-by-side comparison per domain"
          />
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, bottom: 25, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} angle={-20} textAnchor="end" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} formatter={v => [`${v}%`]} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Current" fill="#0b2545" name="Verified Level" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Required" fill="#cbd5e1" name="Target Benchmark" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detailed Gap Table */}
      <div className="gov-card p-6">
        <SectionHeader
          title="FRAC Detailed Competency Audit"
          titleHi="विस्तृत विश्लेषण"
          subtitle="Detailed breakdown with prescribed remediation actions"
        />
        <div className="space-y-4">
          {gaps.sort((a, b) => b.gap - a.gap).map(comp => {
            const gapColor = comp.gap > 20 ? 'red' : comp.gap > 0 ? 'orange' : 'green';
            return (
              <div
                key={comp.id}
                className="p-5 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-slate-900 text-base">{comp.name}</h3>
                      <Badge label={comp.category} color="gold" />
                    </div>
                    <p className="text-xs text-slate-500 max-w-xl leading-relaxed">{comp.description}</p>
                  </div>

                  <div className="text-left sm:text-right flex-shrink-0">
                    <ScorePill value={comp.current} />
                    <p className="text-[11px] text-slate-500 mt-1">
                      {comp.gap > 0 ? (
                        <strong className="text-red-600">Deficit: −{comp.gap} pts</strong>
                      ) : (
                        <strong className="text-emerald-700">✓ Benchmark Met (+{Math.abs(comp.gap)})</strong>
                      )}
                    </p>
                  </div>
                </div>

                <ProgressBar
                  value={comp.current}
                  required={comp.required}
                  color={gapColor === 'green' ? 'green' : gapColor === 'orange' ? 'orange' : 'red'}
                  size="md"
                />

                {comp.gap > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-xs text-slate-600 font-medium flex items-center gap-1.5">
                      <Sparkles size={13} className="text-[#c69214]" />
                      Prescribed Action: Enroll in official learning pathway and clear proctored assessment.
                    </span>
                    <Link
                      to="/assessments"
                      className="px-4 py-1.5 bg-[#0b2545] text-amber-300 rounded-xl text-xs font-bold hover:bg-[#13315c] transition-colors flex items-center gap-1 w-fit"
                    >
                      <span>Take Assessment</span>
                      <ArrowRight size={12} />
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

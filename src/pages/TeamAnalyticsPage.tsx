import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCapacity } from '../context/CapacityContext';
import { users, courses } from '../data/mockData';
import { StatCard, ProgressBar, Avatar, ScorePill, StateEmblem } from '../components/ui/SharedComponents';
import {
  Users, Brain, AlertTriangle, BookOpen, Send,
  Search, Award, ShieldCheck
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function TeamAnalyticsPage() {
  const { user } = useAuth();
  const { competenciesByUser, enrollments, departments, isLoopCompleted } = useCapacity();
  const [selectedMemberId, setSelectedMemberId] = useState<string>('u1');
  const [searchMember, setSearchMember] = useState('');

  if (!user) return null;

  const currentDept = departments.find(d => d.headId === user.id) || departments[0];
  const teamMembers = users.filter(u => u.department === currentDept.name && u.role === 'learner');

  const filteredMembers = teamMembers.filter(m =>
    m.name.toLowerCase().includes(searchMember.toLowerCase()) ||
    m.position.toLowerCase().includes(searchMember.toLowerCase())
  );

  const selectedMember = users.find(u => u.id === selectedMemberId) || teamMembers[0] || users[0];
  const memberComps = competenciesByUser[selectedMember.id] || [];
  const memberEnrollments = enrollments.filter(e => e.userId === selectedMember.id);

  // Compute live team capability average
  const teamCapabilityAvg = Math.round(
    teamMembers.reduce((sum, member) => {
      const comps = competenciesByUser[member.id] || [];
      if (!comps.length) return sum;
      const memScore = comps.reduce((acc, c) => acc + Math.min(c.current / c.required, 1), 0) / comps.length;
      return sum + memScore * 100;
    }, 0) / Math.max(teamMembers.length, 1)
  );

  const matrixCompetencies = [
    'Digital Readiness',
    'Data Analytics',
    'Leadership',
    'Communication',
    'Cyber Security',
    'Project Management',
  ];

  function handleRecommendCourse(memberName: string, courseTitle: string) {
    toast.success(`Learning prescription for "${courseTitle}" assigned to ${memberName}!`, { icon: '📋' });
  }

  function handleScheduleReview(memberName: string) {
    toast.success(`1-on-1 Capability Audit scheduled with ${memberName}!`);
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto animate-fade-in space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#ff9933] bg-orange-50 px-2.5 py-0.5 rounded border border-orange-200">
              Divisional Oversight • {currentDept.name} Department
            </span>
          </div>
          <h1 className="text-3xl font-black text-[#0b2545] tracking-tight">
            Team Capability Intelligence & Heatmap
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Department-level competency matrix, member gap analysis, and training interventions
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
          <StateEmblem className="w-7 h-9 flex-shrink-0" />
          <div className="border-l border-slate-200 pl-3">
            <p className="text-sm font-black text-[#0b2545]">{teamMembers.length} Direct Reports</p>
            <p className="text-[10px] text-slate-400 font-semibold">Under Manager Review</p>
          </div>
        </div>
      </div>

      {/* Closed-Loop Verification Note for Manager */}
      {isLoopCompleted && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 flex items-start gap-3">
          <ShieldCheck size={20} className="text-emerald-700 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
              Closed-Loop Impact Reflected Live
            </p>
            <p className="text-xs text-emerald-800 mt-0.5 leading-relaxed">
              Arjun Sharma has successfully completed his Data Analytics assessment. Notice how his cell in the matrix below has turned <strong>Green (85% Proficient)</strong>, and your division’s capability score has elevated from <strong>82% to 88%</strong>!
            </p>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        <StatCard
          label="Division Capability Score"
          value={`${teamCapabilityAvg}%`}
          sub="Benchmark: 75% required"
          icon={<Brain size={20} />}
          color="blue"
          trend={isLoopCompleted ? 6 : 2}
          badge="Live Index"
        />
        <StatCard
          label="Managed Staff"
          value={teamMembers.length}
          sub="Engineers & Officers"
          icon={<Users size={20} />}
          color="teal"
        />
        <StatCard
          label="Critical Deficits"
          value={
            teamMembers.reduce((count, m) => {
              const comps = competenciesByUser[m.id] || [];
              return count + comps.filter(c => c.required - c.current > 20).length;
            }, 0)
          }
          sub="Deficits > 20 points"
          icon={<AlertTriangle size={20} />}
          color={isLoopCompleted ? 'green' : 'red'}
          badge={isLoopCompleted ? 'Zero Critical' : 'Deficits Present'}
        />
        <StatCard
          label="Active Training Programs"
          value={enrollments.filter(e => teamMembers.some(m => m.id === e.userId)).length}
          sub="Courses in progress"
          icon={<BookOpen size={20} />}
          color="gold"
        />
      </div>

      {/* Team Competency Heatmap / Matrix */}
      <div className="gov-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">National Competency Matrix (FRAC)</h3>
            <p className="text-xs text-slate-500 mt-0.5">Real-time competency scores per direct report across key operational dimensions</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative w-48">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchMember}
                onChange={e => setSearchMember(e.target.value)}
                placeholder="Search staff..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0b2545]"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50/50">
                <th className="py-3.5 px-4">Staff Member</th>
                {matrixCompetencies.map(c => (
                  <th key={c} className="py-3.5 px-4 text-center">{c}</th>
                ))}
                <th className="py-3.5 px-4 text-right">Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredMembers.map(member => {
                const comps = competenciesByUser[member.id] || [];
                const isSelected = member.id === selectedMember.id;

                return (
                  <tr
                    key={member.id}
                    onClick={() => setSelectedMemberId(member.id)}
                    className={`hover:bg-slate-50 transition-colors cursor-pointer ${
                      isSelected ? 'bg-amber-50/40 font-semibold' : ''
                    }`}
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <Avatar initials={member.avatar} size="sm" />
                        <div>
                          <p className="text-slate-900 font-bold leading-tight">{member.name}</p>
                          <p className="text-[11px] text-slate-400">{member.position}</p>
                        </div>
                      </div>
                    </td>

                    {matrixCompetencies.map(compName => {
                      const found = comps.find(c =>
                        c.name.toLowerCase().includes(compName.toLowerCase().slice(0, 5))
                      );
                      const score = found ? found.current : 60;
                      const isTargetMet = found ? found.current >= found.required : score >= 75;

                      const colorClass = isTargetMet
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : score >= 55
                        ? 'bg-amber-50 text-amber-800 border-amber-300'
                        : 'bg-red-50 text-red-800 border-red-300 animate-pulse';

                      return (
                        <td key={compName} className="py-4 px-4 text-center">
                          <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold border ${colorClass}`}>
                            {score}%
                          </span>
                        </td>
                      );
                    })}

                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          setSelectedMemberId(member.id);
                        }}
                        className="text-xs font-bold text-[#0b2545] hover:underline"
                      >
                        Inspect →
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Member Detail View */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 gov-card p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 mb-6">
            <div className="flex items-center gap-4">
              <Avatar initials={selectedMember.avatar} size="lg" />
              <div>
                <h3 className="text-xl font-black text-slate-900">{selectedMember.name}</h3>
                <p className="text-xs text-slate-500 font-medium">
                  {selectedMember.position} • {selectedMember.department} Division
                </p>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">{selectedMember.email}</p>
              </div>
            </div>

            <button
              onClick={() => handleScheduleReview(selectedMember.name)}
              className="px-4 py-2 bg-[#0b2545] text-white rounded-xl text-xs font-bold hover:bg-[#13315c] transition-colors shadow-xs"
            >
              Conduct Performance Audit
            </button>
          </div>

          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
            Individual Competency Gap Scorecard
          </h4>
          <div className="space-y-4">
            {memberComps.map(c => {
              const gap = c.required - c.current;
              return (
                <div key={c.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="font-bold text-sm text-slate-900">{c.name}</span>
                      <span className="text-xs text-slate-400 ml-2">({c.category})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ScorePill value={c.current} />
                      <span className="text-xs text-slate-500">Benchmark: {c.required}%</span>
                    </div>
                  </div>
                  <ProgressBar
                    value={c.current}
                    required={c.required}
                    color={gap > 20 ? 'red' : gap > 0 ? 'orange' : 'green'}
                    size="sm"
                  />
                  {gap > 15 && (
                    <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-200">
                      <span className="text-[11px] text-slate-600 font-semibold">
                        Critical deficit requires immediate learning prescription
                      </span>
                      <button
                        onClick={() => handleRecommendCourse(selectedMember.name, c.name + ' Acceleration')}
                        className="text-xs font-bold text-[#0b2545] hover:underline flex items-center gap-1"
                      >
                        <Send size={12} /> Prescribe Pathway
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Member Enrolled Interventions */}
        <div className="space-y-6">
          <div className="gov-card p-6">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
              Active e-Learning Modules
            </h4>
            <div className="space-y-3">
              {memberEnrollments.map(e => {
                const c = courses.find(course => course.id === e.courseId);
                if (!c) return null;

                return (
                  <div key={e.courseId} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-xs font-bold text-slate-900 truncate">{c.title}</p>
                      <span className="text-xs font-bold text-[#0b2545]">{e.progress}%</span>
                    </div>
                    <ProgressBar value={e.progress} color={e.progress === 100 ? 'green' : 'blue'} size="sm" />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="gov-hero-gradient rounded-3xl p-6 text-white border border-amber-300/30">
            <div className="w-10 h-10 bg-[#ff9933]/20 border border-[#ff9933]/40 rounded-xl flex items-center justify-center text-[#ff9933] mb-3">
              <Award size={20} />
            </div>
            <h4 className="text-base font-bold">Executive Recommendation</h4>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              {isLoopCompleted
                ? 'Arjun Sharma has successfully closed his Data Analytics gap. The division is currently meeting all critical FRAC capability baselines.'
                : 'Arjun Sharma is enrolled in Excel for Business Analysis. Ensure he completes the upcoming proctored assessment to clear the division deficit.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCapacity } from '../context/CapacityContext';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { users as demoUsers, enrollments as demoEnrollments, courses as demoCourses, competenciesByUser as demoCompetencies } from '../data/mockData';
import { StatCard, ProgressBar, Avatar, ScorePill, StateEmblem } from '../components/ui/SharedComponents';
import {
  Users, Brain, AlertTriangle, BookOpen, Send,
  Search, Award, ShieldCheck
} from 'lucide-react';
import toast from 'react-hot-toast';

type TeamMember = { id: string; name: string; email: string; role: 'learner'; department: string; position: string; avatar: string };
type TeamEnrollment = { user_id: string; course_id: string; enrolled_at: string; completed_at: string | null };
type TeamAttempt = { user_id: string; score: number; passed: boolean };
type TeamCompetency = { user_id: string; competency_id: string; current_score: number; required_score: number };

export default function TeamAnalyticsPage() {
  const { user } = useAuth();
  const { departments, isLoopCompleted } = useCapacity();
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [searchMember, setSearchMember] = useState('');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [teamEnrollments, setTeamEnrollments] = useState<TeamEnrollment[]>([]);
  const [teamAttempts, setTeamAttempts] = useState<TeamAttempt[]>([]);
  const [teamCompetencies, setTeamCompetencies] = useState<TeamCompetency[]>([]);
  const [courseNames, setCourseNames] = useState<Record<string, string>>({});
  const [competencyNames, setCompetencyNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const currentDept = user ? departments.find(d => d.headId === user.id) : undefined;

  useEffect(() => {
    async function loadTeamData() {
      if (localStorage.getItem('capacity_connect_demo_user') === 'meera@capacityconnect.in') {
        const demoDepartment = demoUsers.find(candidate => candidate.id === 'u6')?.department || 'Engineering';
        const members = demoUsers.filter(candidate => candidate.department === demoDepartment && candidate.role === 'learner').map(member => ({ id: member.id, name: member.name, email: member.email, role: 'learner' as const, department: member.department, position: member.position, avatar: member.avatar }));
        setTeamMembers(members);
        setSelectedMemberId(previous => previous || members[0]?.id || '');
        setTeamEnrollments(demoEnrollments.filter(enrollment => members.some(member => member.id === enrollment.userId)).map(enrollment => ({ user_id: enrollment.userId, course_id: enrollment.courseId, enrolled_at: enrollment.startedAt, completed_at: enrollment.completedAt || null })));
        setTeamCompetencies(members.flatMap(member => (demoCompetencies[member.id] || []).map(competency => ({ user_id: member.id, competency_id: competency.id, current_score: competency.current, required_score: competency.required }))));
        setCourseNames(Object.fromEntries(demoCourses.map(course => [course.id, course.title])));
        setCompetencyNames(Object.fromEntries(Object.values(demoCompetencies).flat().map(competency => [competency.id, competency.name])));
        setLoading(false);
        return;
      }
      if (!supabase || !isSupabaseConfigured || !user || !currentDept) {
        setLoading(false);
        return;
      }
      setLoading(true);
      const { data: profiles } = await supabase.from('profiles').select('id, full_name, email, role, department, position, avatar').eq('department', currentDept.name).eq('role', 'learner');
      const members = (profiles || []).map(profile => ({ id: profile.id, name: profile.full_name, email: profile.email || '', role: 'learner' as const, department: profile.department, position: profile.position, avatar: profile.avatar }));
      const memberIds = members.map(member => member.id);
      setTeamMembers(members);
      setSelectedMemberId(previous => previous || members[0]?.id || '');
      if (memberIds.length === 0) {
        setTeamEnrollments([]); setTeamAttempts([]); setTeamCompetencies([]); setLoading(false); return;
      }
      const [{ data: enrollments }, { data: attempts }, { data: competencies }, { data: courses }, { data: competencyDefinitions }] = await Promise.all([
        supabase.from('enrollments').select('user_id, course_id, enrolled_at, completed_at').in('user_id', memberIds),
        supabase.from('quiz_attempts').select('user_id, score, passed').in('user_id', memberIds),
        supabase.from('user_competencies').select('user_id, competency_id, current_score, required_score').in('user_id', memberIds),
        supabase.from('courses').select('id, title'),
        supabase.from('competencies').select('id, name'),
      ]);
      setTeamEnrollments(enrollments || []);
      setTeamAttempts(attempts || []);
      setTeamCompetencies(competencies || []);
      setCourseNames(Object.fromEntries((courses || []).map(course => [String(course.id), course.title || 'Untitled course'])));
      setCompetencyNames(Object.fromEntries((competencyDefinitions || []).map(competency => [competency.id, competency.name])));
      setLoading(false);
    }
    void loadTeamData();
  }, [currentDept, user]);

  if (!user) return null;

  const filteredMembers = teamMembers.filter(m =>
    m.name.toLowerCase().includes(searchMember.toLowerCase()) ||
    m.position.toLowerCase().includes(searchMember.toLowerCase())
  );

  const selectedMember = teamMembers.find(member => member.id === selectedMemberId) || teamMembers[0];
  const selectedCompetencies = selectedMember ? teamCompetencies.filter(item => item.user_id === selectedMember.id) : [];
  const memberEnrollments = selectedMember ? teamEnrollments.filter(item => item.user_id === selectedMember.id) : [];

  // Compute live team capability average
  const teamCapabilityScores = teamMembers.map(member => {
    const comps = teamCompetencies.filter(item => item.user_id === member.id);
    return comps.length ? comps.reduce((sum, item) => sum + Math.min(item.current_score / Math.max(item.required_score, 1), 1) * 100, 0) / comps.length : null;
  }).filter((score): score is number => score !== null);
  const teamCapabilityAvg = teamCapabilityScores.length ? Math.round(teamCapabilityScores.reduce((sum, score) => sum + score, 0) / teamCapabilityScores.length) : null;
  const averageAssessment = teamAttempts.length ? Math.round(teamAttempts.reduce((sum, attempt) => sum + attempt.score, 0) / teamAttempts.length) : null;

  const matrixCompetencies = [
    'Digital Readiness',
    'Data Analytics',
    'Leadership',
    'Communication',
    'Cyber Security',
    'Project Management',
  ];

  function handleRecommendCourse(memberName: string, courseTitle: string) {
    toast.success(`Recommendation recorded for ${memberName}: ${courseTitle}.`);
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
              Divisional Oversight {currentDept ? `• ${currentDept.name} Department` : ''}
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
            <p className="text-sm font-black text-[#0b2545]">{teamMembers.length || 'No'} Direct Reports</p>
            <p className="text-[10px] text-slate-400 font-semibold">Under Manager Review</p>
          </div>
        </div>
      </div>

      {/* Closed-Loop Verification Note for Manager */}
    {isLoopCompleted && teamMembers.length > 0 && (
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
          value={teamCapabilityAvg === null ? 'No data yet' : `${teamCapabilityAvg}%`}
          sub="Calculated from persisted competencies"
          icon={<Brain size={20} />}
          color="blue"
          badge="Live Index"
        />
        <StatCard
          label="Managed Staff"
          value={teamMembers.length || 'No team data available yet'}
          sub="Persisted learner profiles"
          icon={<Users size={20} />}
          color="teal"
        />
        <StatCard
          label="Critical Deficits"
          value={teamCompetencies.length === 0 ? 'No data yet' :
            teamMembers.reduce((count, m) => {
              const comps = teamCompetencies.filter(item => item.user_id === m.id);
              return count + comps.filter(item => item.required_score - item.current_score > 20).length;
            }, 0)}
          sub="Deficits > 20 points"
          icon={<AlertTriangle size={20} />}
          color={isLoopCompleted ? 'green' : 'red'}
          badge={isLoopCompleted ? 'Zero Critical' : 'Deficits Present'}
        />
        <StatCard
          label="Active Training Programs"
          value={teamEnrollments.length || 'No data yet'}
          sub="Persisted course enrollments"
          icon={<BookOpen size={20} />}
          color="gold"
        />
      </div>
      <div className="gov-card p-5 flex items-center justify-between gap-4">
        <div><p className="text-[10px] uppercase font-bold text-slate-400">Average assessment score</p><p className="text-2xl font-black text-[#0b2545] mt-1">{averageAssessment === null ? 'No data yet' : `${averageAssessment}%`}</p></div>
        <p className="text-xs text-slate-500">Calculated from persisted team quiz attempts</p>
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
              {loading && <tr><td colSpan={8} className="py-8 text-center text-xs text-slate-500">Loading team data...</td></tr>}
              {!loading && filteredMembers.length === 0 && <tr><td colSpan={8} className="py-8 text-center text-xs text-slate-500">No team data available yet</td></tr>}
              {!loading && filteredMembers.map(member => {
                const comps = teamCompetencies.filter(item => item.user_id === member.id);
                const isSelected = member.id === selectedMember?.id;

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
                      const found = comps.find(c => (competencyNames[c.competency_id] || c.competency_id).toLowerCase().includes(compName.toLowerCase().slice(0, 5)));
                      const score = found?.current_score;
                      const isTargetMet = found ? found.current_score >= found.required_score : false;

                      const colorClass = score === undefined
                        ? 'bg-slate-50 text-slate-500 border-slate-200'
                        : isTargetMet
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : score >= 55
                        ? 'bg-amber-50 text-amber-800 border-amber-300'
                        : 'bg-red-50 text-red-800 border-red-300 animate-pulse';

                      return (
                        <td key={compName} className="py-4 px-4 text-center">
                          <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold border ${colorClass}`}>
                            {score === undefined ? 'No data' : `${score}%`}
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
              <Avatar initials={selectedMember?.avatar || 'NA'} size="lg" />
              <div>
                <h3 className="text-xl font-black text-slate-900">{selectedMember?.name || 'No team member selected'}</h3>
                <p className="text-xs text-slate-500 font-medium">
                  {selectedMember ? `${selectedMember.position} • ${selectedMember.department} Division` : 'No team data available yet'}
                </p>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">{selectedMember?.email || ''}</p>
              </div>
            </div>

            <button
              onClick={() => selectedMember && handleScheduleReview(selectedMember.name)}
              disabled={!selectedMember}
              className="px-4 py-2 bg-[#0b2545] text-white rounded-xl text-xs font-bold hover:bg-[#13315c] transition-colors shadow-xs"
            >
              Conduct Performance Audit
            </button>
          </div>

          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
            Individual Competency Gap Scorecard
          </h4>
          <div className="space-y-4">
            {selectedCompetencies.map(c => {
              const gap = c.required_score - c.current_score;
              return (
                <div key={`${c.user_id}-${c.competency_id}`} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="font-bold text-sm text-slate-900">{competencyNames[c.competency_id] || c.competency_id}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ScorePill value={c.current_score} />
                      <span className="text-xs text-slate-500">Benchmark: {c.required_score}%</span>
                    </div>
                  </div>
                  <ProgressBar
                    value={c.current_score}
                    required={c.required_score}
                    color={gap > 20 ? 'red' : gap > 0 ? 'orange' : 'green'}
                    size="sm"
                  />
                  {gap > 15 && (
                    <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-200">
                      <span className="text-[11px] text-slate-600 font-semibold">
                        Critical deficit requires immediate learning prescription
                      </span>
                      <button
                        onClick={() => selectedMember && handleRecommendCourse(selectedMember.name, `${competencyNames[c.competency_id] || c.competency_id} Acceleration`)}
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
                return (
                  <div key={e.course_id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-xs font-bold text-slate-900 truncate">{courseNames[e.course_id] || e.course_id}</p>
                      <span className="text-xs font-bold text-[#0b2545]">{e.completed_at ? 'Completed' : 'Active'}</span>
                    </div>
                    <ProgressBar value={e.completed_at ? 100 : 0} color={e.completed_at ? 'green' : 'blue'} size="sm" />
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
              {averageAssessment === null
                ? 'No assessment data available yet.'
                : `Team average assessment score: ${averageAssessment}%. Review members with persistent competency gaps and recommend targeted learning.`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

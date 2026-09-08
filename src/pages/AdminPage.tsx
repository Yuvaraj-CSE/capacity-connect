import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCapacity } from '../context/CapacityContext';
import type { User, Competency } from '../types';
import { Badge, Avatar } from '../components/ui/SharedComponents';
import {
  Users, Sliders, Plus, Brain, RefreshCw,
  RotateCcw, Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { users as initialUsers } from '../data/mockData';

export default function AdminPage() {
  const { user } = useAuth();
  const { departments, resetSimulation, isLoopCompleted } = useCapacity();
  const [activeTab, setActiveTab] = useState<'competencies' | 'users' | 'thresholds'>('competencies');
  const [userList, setUserList] = useState<User[]>(() => localStorage.getItem('capacity_connect_demo_user') ? initialUsers : []);
  const [metrics, setMetrics] = useState({ learners: 0, managers: 0, courses: 0, published: 0, enrollments: 0, averageQuiz: 0, activeLearners: 0 });
  const [managerAccounts, setManagerAccounts] = useState<Array<{ id: string; full_name: string; email: string | null; manager_approved: boolean; is_active: boolean }>>([]);
  const [approvalCourses, setApprovalCourses] = useState<Array<{ id: string; title: string; content_status: string; created_by: string | null }>>([]);

  // New Competency Form State
  const [showAddCompModal, setShowAddCompModal] = useState(false);
  const [compName, setCompName] = useState('');
  const [compCategory, setCompCategory] = useState('Functional');
  const [compDesc, setCompDesc] = useState('');
  const [compRequired, setCompRequired] = useState(80);

  const [allComps, setAllComps] = useState<Competency[]>(isSupabaseConfigured && !localStorage.getItem('capacity_connect_demo_user') ? [] : [
    { id: 'c1', name: 'Digital Readiness', category: 'Domain / Technology', description: 'Ability to adapt and leverage national digital platforms', current: 78, required: 85 },
    { id: 'c2', name: 'Data Analytics', category: 'Functional', description: 'Interpreting evidence and public datasets for policy decisions', current: 42, required: 75 },
    { id: 'c3', name: 'Leadership & Ethics', category: 'Behavioral', description: 'Ethical public leadership, delegation, and inspiring teams', current: 65, required: 70 },
    { id: 'c4', name: 'Citizen Communication', category: 'Behavioral', description: 'Clear and empathetic citizen and stakeholder communication', current: 81, required: 80 },
    { id: 'c5', name: 'Project & Mission Governance', category: 'Functional', description: 'End-to-end execution of public projects and PM Gati Shakti workflows', current: 72, required: 80 },
    { id: 'c6', name: 'Cyber Security & Privacy', category: 'Domain / Technology', description: 'Understanding CERT-In protocols and data privacy compliance', current: 55, required: 75 },
  ]);

  useEffect(() => {
    async function loadMetrics() {
      if (!supabase || !isSupabaseConfigured) return;
      const [learners, managerCount, courses, published, enrollments, attempts, active] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'learner'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'manager'),
        supabase.from('courses').select('id', { count: 'exact', head: true }),
        supabase.from('courses').select('id', { count: 'exact', head: true }).eq('is_published', true),
        supabase.from('enrollments').select('id', { count: 'exact', head: true }),
        supabase.from('quiz_attempts').select('score'),
        supabase.from('enrollments').select('user_id').is('completed_at', null),
      ]);
      const scores = attempts.data || [];
      const uniqueActive = new Set((active.data || []).map(item => item.user_id)).size;
      setMetrics({ learners: learners.count || 0, managers: managerCount.count || 0, courses: courses.count || 0, published: published.count || 0, enrollments: enrollments.count || 0, averageQuiz: scores.length ? Math.round(scores.reduce((sum, item) => sum + item.score, 0) / scores.length) : 0, activeLearners: uniqueActive });
      const { data: managerProfiles } = await supabase.from('profiles').select('id, full_name, email, manager_approved, is_active').eq('role', 'manager').order('created_at', { ascending: false });
      setManagerAccounts(managerProfiles || []);
      const { data: profiles } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      setUserList((profiles || []).map(profile => ({
        id: profile.id, name: profile.full_name, email: profile.email || '', role: profile.role as User['role'], department: profile.department,
        position: profile.position, avatar: profile.avatar, joinedDate: profile.created_at.slice(0, 10),
      })));
      const { data: pendingCourses } = await supabase.from('courses').select('id, title, content_status, created_by').in('content_status', ['Submitted', 'Under Review']).order('created_at', { ascending: false });
      setApprovalCourses((pendingCourses || []).map(course => ({ id: String(course.id), title: course.title || 'Untitled course', content_status: course.content_status, created_by: course.created_by })));
      const { data: competencyDefinitions } = await supabase.from('competencies').select('*').order('name');
      if (competencyDefinitions && competencyDefinitions.length > 0) {
        setAllComps(competencyDefinitions.map(comp => ({ id: comp.id, name: comp.name, category: comp.category, description: comp.description, current: 0, required: comp.default_required })));
      }
    }
    void loadMetrics();
  }, []);

  async function updateManager(id: string, changes: { manager_approved?: boolean; is_active?: boolean }) {
    if (!supabase) return;
    const { error } = await supabase.from('profiles').update(changes).eq('id', id);
    if (error) toast.error(error.message);
    else { setManagerAccounts(previous => previous.map(manager => manager.id === id ? { ...manager, ...changes } : manager)); toast.success('Manager access updated.'); }
  }

  async function updateCourseApproval(id: string, status: 'Approved' | 'Rejected') {
    if (!supabase) return;
    const { error } = await supabase.from('courses').update({ content_status: status, is_published: status === 'Approved' }).eq('id', id);
    if (error) toast.error(error.message);
    else {
      setApprovalCourses(previous => previous.filter(course => course.id !== id));
      toast.success(`Course ${status.toLowerCase()}.`);
    }
  }

  async function updateManagerRole(target: User) {
    if (!supabase || target.role === 'admin') return;
    const nextRole = target.role === 'manager' ? 'learner' : 'manager';
    const { error } = await supabase.from('profiles').update({ role: nextRole, manager_approved: nextRole === 'manager' }).eq('id', target.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    setUserList(previous => previous.map(item => item.id === target.id ? { ...item, role: nextRole } : item));
    toast.success(nextRole === 'manager' ? `${target.name} is now a manager.` : `Manager access revoked for ${target.name}.`);
  }

  if (!user) return null;

  function handleAddCompetency(e: React.FormEvent) {
    e.preventDefault();
    if (!compName.trim()) return;

    const newComp: Competency = {
      id: `c-${Date.now()}`,
      name: compName,
      category: compCategory,
      description: compDesc || `Institutional civil service competency for ${compName}.`,
      current: 50,
      required: Number(compRequired) || 80,
    };

    if (isSupabaseConfigured && supabase) {
      void supabase.from('competencies').insert({ id: newComp.id, name: newComp.name, category: newComp.category, description: newComp.description, default_required: newComp.required }).then(({ error }) => {
        if (error) toast.error(error.message);
        else setAllComps(prev => [...prev, newComp]);
      });
    } else {
      setAllComps(prev => [...prev, newComp]);
    }
    setShowAddCompModal(false);
    setCompName('');
    setCompDesc('');
    toast.success(`Competency "${compName}" registered in national FRAC dictionary!`);
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto animate-fade-in space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {[['Learners', metrics.learners], ['Managers', metrics.managers], ['Courses', metrics.courses], ['Published', metrics.published], ['Enrollments', metrics.enrollments], ['Avg quiz', `${metrics.averageQuiz}%`], ['Active learners', metrics.activeLearners]].map(([label, value]) => <div key={String(label)} className="gov-card p-4"><p className="text-[10px] uppercase font-bold text-slate-400">{label}</p><p className="text-xl font-black text-[#0b2545] mt-1">{value}</p></div>)}
      </div>
      {managerAccounts.length > 0 && <div className="gov-card p-5"><div className="flex items-center justify-between mb-3"><div><h2 className="font-bold text-slate-900">Manager access review</h2><p className="text-xs text-slate-500 mt-1">Approval and active status are enforced by Supabase RLS.</p></div></div><div className="space-y-2">{managerAccounts.map(manager => <div key={manager.id} className="flex flex-wrap items-center justify-between gap-3 border border-slate-200 rounded-xl p-3"><div><p className="text-xs font-bold text-slate-900">{manager.full_name}</p><p className="text-[11px] text-slate-500">{manager.email || 'No email'}</p></div><div className="flex items-center gap-2"><span className={`text-[10px] font-bold px-2 py-1 rounded-full ${manager.manager_approved ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{manager.manager_approved ? 'Approved' : 'Pending'}</span><button onClick={() => void updateManager(manager.id, { manager_approved: !manager.manager_approved })} className="text-xs font-bold text-[#0b2545] hover:underline">{manager.manager_approved ? 'Revoke' : 'Approve'}</button><button onClick={() => void updateManager(manager.id, { is_active: !manager.is_active })} className="text-xs font-bold text-red-700 hover:underline">{manager.is_active ? 'Disable' : 'Enable'}</button></div></div>)}</div></div>}
      {approvalCourses.length > 0 && <div className="gov-card p-5"><div className="mb-3"><h2 className="font-bold text-slate-900">Content approval queue</h2><p className="text-xs text-slate-500 mt-1">Only approved content is visible to normal learners.</p></div><div className="space-y-2">{approvalCourses.map(course => <div key={course.id} className="flex flex-wrap items-center justify-between gap-3 border border-slate-200 rounded-xl p-3"><div><p className="text-xs font-bold text-slate-900">{course.title}</p><p className="text-[11px] text-amber-700">{course.content_status}</p></div><div className="flex items-center gap-3"><button onClick={() => void updateCourseApproval(course.id, 'Approved')} className="text-xs font-bold text-emerald-700 hover:underline">Approve</button><button onClick={() => void updateCourseApproval(course.id, 'Rejected')} className="text-xs font-bold text-red-700 hover:underline">Reject</button></div></div>)}</div></div>}
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#c69214] bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200">
              Capacity Building Commission (CBC) • National Administrator
            </span>
          </div>
          <h1 className="text-3xl font-black text-[#0b2545] tracking-tight">
            Governance & FRAC Framework Architecture
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Institutional framework dictionary, personnel registry, and divisional benchmark controls
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={resetSimulation}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-amber-50 border border-amber-300 text-amber-950 rounded-xl text-xs font-bold hover:bg-amber-100 transition-colors shadow-xs"
            title="Reset closed-loop simulation back to initial deficit baseline"
          >
            <RotateCcw size={14} />
            <span>Reset Demo Simulation</span>
          </button>
          <button
            onClick={() => toast.success('National framework registry synchronized with NIC!')}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-[#0b2545] text-white rounded-xl text-xs font-bold hover:bg-[#13315c] transition-colors shadow-xs"
          >
            <RefreshCw size={14} />
            <span>Sync Registry</span>
          </button>
        </div>
      </div>

      {/* Closed-Loop Status Notice for Admin */}
      {isLoopCompleted && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Sparkles size={20} className="text-emerald-700" />
            <div>
              <p className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                Full Closed-Loop Cycle Verified
              </p>
              <p className="text-xs text-emerald-900 mt-0.5">
                All 5 stages of the employee competency cycle have been successfully executed and validated across the portal!
              </p>
            </div>
          </div>
          <button
            onClick={resetSimulation}
            className="px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold hover:bg-emerald-800 transition-colors flex-shrink-0"
          >
            Restart Flow for New Evaluation
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('competencies')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'competencies' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Brain size={16} /> FRAC Dictionary ({allComps.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'users' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users size={16} /> Personnel Registry ({userList.length})
        </button>
        <button
          onClick={() => setActiveTab('thresholds')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'thresholds' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sliders size={16} /> Divisional Baselines ({departments.length})
        </button>
      </div>

      {/* Tab 1: Competencies */}
      {activeTab === 'competencies' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200">
            <div>
              <h3 className="text-base font-bold text-slate-900">National Competency Dictionary</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Accredited Behavioral, Functional, and Domain competencies codified under Mission Karmayogi
              </p>
            </div>
            <button
              onClick={() => setShowAddCompModal(true)}
              className="flex items-center gap-2 bg-[#0b2545] text-amber-300 px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#13315c] transition-colors shadow-xs"
            >
              <Plus size={15} /> Codify New Competency
            </button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allComps.map(comp => (
              <div key={comp.id} className="gov-card p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="font-bold text-slate-900 text-sm">{comp.name}</h4>
                    <Badge label={comp.category} color="gold" />
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed mb-4">{comp.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">National Baseline:</span>
                  <span className="font-black text-[#0b2545] text-sm">{comp.required}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Users */}
      {activeTab === 'users' && (
        <div className="gov-card overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Registered Civil Service Personnel</h3>
              <p className="text-xs text-slate-500 mt-0.5">Officer credentials, departments, and government access tiers</p>
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {userList.length} Active Officers
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50/50">
                  <th className="py-3 px-6">Officer & Position</th>
                  <th className="py-3 px-6">Division</th>
                  <th className="py-3 px-6">Administrative Tier</th>
                  <th className="py-3 px-6">Induction Date</th>
                  <th className="py-3 px-6 text-right">Access</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {userList.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <Avatar initials={u.avatar} size="sm" />
                        <div>
                          <p className="font-bold text-slate-900 leading-tight">{u.name}</p>
                          <p className="text-xs text-slate-400">{u.position}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6 text-slate-600 font-semibold text-xs">{u.department}</td>

                    <td className="py-4 px-6">
                      <span
                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold capitalize ${
                          u.role === 'admin'
                            ? 'bg-purple-50 text-purple-800 border border-purple-200'
                            : u.role === 'manager'
                            ? 'bg-teal-50 text-teal-800 border border-teal-200'
                            : 'bg-blue-50 text-[#0b2545] border border-blue-200'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-slate-500 text-xs font-mono">{u.joinedDate}</td>

                    <td className="py-4 px-6 text-right">
                      {u.role !== 'admin' && <button onClick={() => void updateManagerRole(u)} className="text-xs font-bold text-[#0b2545] hover:underline">
                        {u.role === 'manager' ? 'Revoke manager' : 'Promote to manager'}
                      </button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Department Baselines */}
      {activeTab === 'thresholds' && (
        <div className="grid md:grid-cols-2 gap-6">
          {departments.map(dept => (
            <div key={dept.id} className="gov-card p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-bold text-slate-900 text-base">{dept.name} Division</h3>
                  {dept.criticalGap ? (
                    <span className="px-2.5 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                      Deficit Flagged
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
                      Target Met
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mb-4">{dept.employeeCount} active personnel</p>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 mb-4">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-600 font-bold">Current Readiness Index</span>
                    <span className="font-black text-[#0b2545] text-base">{dept.capabilityScore}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#0b2545] rounded-full transition-all duration-700"
                      style={{ width: `${dept.capabilityScore}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-semibold">
                <span>National Target: 80%</span>
                <button
                  onClick={() => toast.success(`Threshold recalibrated for ${dept.name}.`)}
                  className="text-xs font-bold text-[#0b2545] hover:underline"
                >
                  Configure Baseline
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Competency Modal */}
      {showAddCompModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 border border-slate-200 animate-scale-in">
            <h3 className="text-xl font-bold text-slate-900 mb-1">Codify New Competency</h3>
            <p className="text-xs text-slate-400 mb-5">
              Register a measurable skill attribute under Mission Karmayogi FRAC
            </p>

            <form onSubmit={handleAddCompetency} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">Competency Title</label>
                <input
                  type="text"
                  value={compName}
                  onChange={e => setCompName(e.target.value)}
                  placeholder="e.g. AI Governance & Ethics"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0b2545]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">FRAC Category</label>
                  <select
                    value={compCategory}
                    onChange={e => setCompCategory(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0b2545] font-semibold"
                  >
                    <option>Behavioral</option>
                    <option>Functional</option>
                    <option>Domain / Technology</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">Baseline (%)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={compRequired}
                    onChange={e => setCompRequired(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0b2545]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">Description & Scope</label>
                <textarea
                  value={compDesc}
                  onChange={e => setCompDesc(e.target.value)}
                  rows={3}
                  placeholder="Observable behavioral indicators and functional proficiencies..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0b2545]"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddCompModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0b2545] text-amber-300 text-xs font-bold rounded-xl hover:bg-[#13315c] transition-colors"
                >
                  Save to Registry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCapacity } from '../../context/CapacityContext';
import GovTopBar from './GovTopBar';
import { Avatar, StateEmblem } from '../ui/SharedComponents';
import {
  LayoutDashboard, Brain, BookOpen, Map, Library,
  BarChart3, Users, Settings, LogOut, ChevronRight,
  Shield, Target, ChevronDown, CheckCircle2, RotateCcw,
  Sparkles, ArrowRight
} from 'lucide-react';

interface NavItem {
  to: string;
  icon: React.ReactNode;
  translationKey: string;
  roles: string[];
}

const navItems: NavItem[] = [
  { to: '/dashboard',   icon: <LayoutDashboard size={18} />, translationKey: 'navigation.dashboard',          roles: ['learner', 'manager', 'admin'] },
  { to: '/competency',  icon: <Brain size={18} />,           translationKey: 'navigation.competencyProfile',   roles: ['learner', 'manager', 'admin'] },
  { to: '/learning',    icon: <Map size={18} />,             translationKey: 'navigation.capabilityJourney',   roles: ['learner', 'manager'] },
  { to: '/courses',     icon: <BookOpen size={18} />,        translationKey: 'navigation.courseCatalogue',     roles: ['learner', 'manager', 'admin'] },
  { to: '/knowledge',   icon: <Library size={18} />,         translationKey: 'navigation.knowledgeHub',        roles: ['learner', 'manager', 'admin'] },
  { to: '/assessments', icon: <Target size={18} />,          translationKey: 'navigation.assessments',         roles: ['learner', 'manager', 'admin'] },
  { to: '/team',        icon: <Users size={18} />,           translationKey: 'navigation.teamAnalytics',       roles: ['manager', 'admin'] },
  { to: '/analytics',   icon: <BarChart3 size={18} />,       translationKey: 'navigation.orgAnalytics',        roles: ['admin', 'manager'] },
  { to: '/alerts',      icon: <Shield size={18} />,          translationKey: 'navigation.capabilityAlerts',    roles: ['manager', 'admin'] },
  { to: '/admin',       icon: <Settings size={18} />,        translationKey: 'navigation.administration',      roles: ['admin'] },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, switchRole } = useAuth();
  const { workflowSteps, resetSimulation, isLoopCompleted, language, t } = useCapacity();
  const navigate = useNavigate();
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 768);
  const [showWorkflowBanner, setShowWorkflowBanner] = useState(true);

  if (!user) return null;

  function handleLogout() {
    logout();
    navigate('/');
  }

  const filtered = navItems.filter(n => n.roles.includes(user!.role));

  return (
    <div className="flex flex-col h-screen bg-[#f4f6f9] overflow-hidden">
      {/* 1. Official Government of India Top Strip */}
      <GovTopBar onMenuToggle={() => setSidebarOpen(true)} />

      <div className="flex flex-1 overflow-hidden relative">
        {/* 2. Official Sidebar */}
        <aside
          className={`${
            sidebarOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full md:w-20 md:translate-x-0'
          } fixed md:relative inset-y-0 left-0 z-40 flex-shrink-0 bg-[#061527] text-white flex flex-col transition-all duration-300 border-r border-slate-800/80 overflow-hidden`}
        >
          {/* Official Emblem & Portal Title */}
          <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-800/80 bg-[#07192f]">
            <StateEmblem className="w-8 h-10 flex-shrink-0" color="#e2ba47" />
            {sidebarOpen && (
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold text-[#ff9933] uppercase tracking-wider">
                  {t('common.govtOfIndia')}
                </p>
                <h1 className="font-black text-sm text-white tracking-tight leading-none mt-0.5">
                  CAPACITY CONNECT
                </h1>
                <p className="text-[9.5px] text-amber-300/80 font-medium truncate mt-0.5">
                  {t('common.cbc')}
                </p>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(v => !v)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors ml-auto"
              title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              <ChevronRight size={16} className={`transition-transform ${sidebarOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
            {filtered.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-[#13315c] to-[#0b2545] text-amber-300 border border-amber-400/30 shadow-md shadow-black/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`
                }
              >
                <span className="flex-shrink-0">{item.icon}</span>
                {sidebarOpen && (
                  <div className="flex items-center justify-between flex-1 truncate">
                    <span>{t(item.translationKey)}</span>
                    {item.to === '/alerts' && (
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                    )}
                  </div>
                )}
              </NavLink>
            ))}
          </nav>

          {/* User Footer with Government Role Switcher */}
          <div className="border-t border-slate-800/80 p-3 bg-[#07192f]">
            <div className="relative">
              <button
                onClick={() => setShowRoleSwitcher(v => !v)}
                className="w-full flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-slate-800 transition-all text-left"
              >
                <Avatar initials={user.avatar} size="sm" />
                {sidebarOpen && (
                  <>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white truncate">{user.name}</p>
                      <p className="text-[10px] text-amber-300/90 capitalize flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                        {user.role === 'admin'
                          ? t('roles.chiefAdministrator')
                          : user.role === 'manager'
                          ? t('roles.headOfDepartment')
                          : t('roles.gazettedOfficer')}
                      </p>
                    </div>
                    <ChevronDown size={14} className="text-slate-400 flex-shrink-0" />
                  </>
                )}
              </button>

              {/* Role Switcher Menu */}
              {showRoleSwitcher && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-[#0b2545] rounded-2xl shadow-2xl border border-slate-700/80 overflow-hidden z-50 animate-scale-in">
                  <div className="p-3 border-b border-slate-800">
                    <p className="text-[10px] text-amber-300/80 font-bold uppercase tracking-wider">
                      {t('common.switchDemoPersona')}
                    </p>
                    <p className="text-[10px] text-slate-400">{t('common.testAccessTiers')}</p>
                  </div>
                  <div className="p-2 space-y-1">
                    {[
                      { id: 'u1', label: 'Arjun Sharma', rank: t('roles.learner'), tier: t('roles.gazettedBadge') },
                      { id: 'u6', label: 'Meera Nair', rank: t('roles.manager'), tier: t('roles.hodBadge') },
                      { id: 'u9', label: 'Admin User', rank: t('roles.admin'), tier: t('roles.adminBadge') },
                    ].map(u => (
                      <button
                        key={u.id}
                        onClick={() => {
                          switchRole(u.id);
                          setShowRoleSwitcher(false);
                          navigate('/dashboard');
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-colors flex items-center justify-between ${
                          user.id === u.id
                            ? 'bg-[#13315c] text-amber-300 font-bold'
                            : 'text-slate-300 hover:bg-slate-800/80'
                        }`}
                      >
                        <div>
                          <p className="leading-tight">{u.label}</p>
                          <p className="text-[10px] text-slate-400">{u.rank}</p>
                        </div>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900/60 text-slate-300 border border-slate-700">
                          {u.tier}
                        </span>
                      </button>
                    ))}
                  </div>
                  <div className="border-t border-slate-800 p-2">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-red-400 hover:bg-red-900/20 transition-colors"
                    >
                      <LogOut size={14} />
                      <span>{t('common.signOut')}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </aside>

        {sidebarOpen && (
          <button
            aria-label="Close navigation menu"
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-30 bg-slate-950/45 md:hidden"
          />
        )}

        {/* 3. Main Body */}
        <main className="flex-1 overflow-y-auto flex flex-col">
          {/* Closed-Loop Competency Lifecycle Banner (Visible to all evaluators) */}
          {showWorkflowBanner && (
            <div className="bg-gradient-to-r from-[#061527] via-[#0b2545] to-[#13315c] text-white px-6 py-3 border-b border-amber-400/20 flex flex-wrap items-center justify-between gap-4 select-none">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#ff9933]/20 border border-[#ff9933]/40 flex items-center justify-center text-[#ff9933] flex-shrink-0">
                  <Sparkles size={15} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#ff9933]">
                      {t('common.nationalCompetencyLifecycle')}
                    </span>
                    {isLoopCompleted ? (
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/40 flex items-center gap-1">
                        <CheckCircle2 size={11} /> {t('common.closedLoopVerified')}
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-500/40">
                        {t('common.liveSimulationReady')}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-300">
                    {t('common.lifecycleSummary')}
                  </p>
                </div>
              </div>

              {/* Stepper Pill Indicators */}
              <div className="hidden xl:flex items-center gap-1.5 text-[11px]">
                {workflowSteps.map((step, idx) => (
                  <div key={step.stepNumber} className="flex items-center gap-1.5">
                    <div
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10.5px] font-bold ${
                        step.status === 'completed'
                          ? 'bg-emerald-900/40 text-emerald-300 border-emerald-500/40'
                          : step.status === 'in_progress'
                          ? 'bg-[#ff9933]/20 text-amber-300 border-[#ff9933]/40 animate-pulse'
                          : 'bg-slate-900/40 text-slate-400 border-slate-700/60'
                      }`}
                    >
                      <span>{step.status === 'completed' ? '✓' : step.stepNumber}</span>
                      <span>{language === 'hi' ? step.titleHi : step.title}</span>
                    </div>
                    {idx < workflowSteps.length - 1 && (
                      <ArrowRight size={11} className="text-slate-500" />
                    )}
                  </div>
                ))}
              </div>

              {/* Reset / Hide Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={resetSimulation}
                  className="flex items-center gap-1 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-amber-300 text-xs font-bold rounded-xl border border-white/20 transition-all shadow-xs"
                  title="Reset competency scores back to baseline for repeat testing"
                >
                  <RotateCcw size={12} />
                  <span>{t('common.resetFlow')}</span>
                </button>
                <button
                  onClick={() => setShowWorkflowBanner(false)}
                  className="text-slate-400 hover:text-white text-xs px-2 py-1"
                  title={t('common.hideBanner')}
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* Inner Content */}
          <div className="flex-1 overflow-y-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

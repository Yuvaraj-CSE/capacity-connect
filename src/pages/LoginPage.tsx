import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { isSupabaseConfigured } from '../lib/supabase';
import { StateEmblem } from '../components/ui/SharedComponents';
import GovTopBar from '../components/layout/GovTopBar';
import { Mail, Lock, ArrowRight, Eye, EyeOff, ShieldCheck, UserPlus, UserRound } from 'lucide-react';

const QUICK_LOGINS = [
  {
    email: 'arjun@capacityconnect.in',
    label: 'Arjun Sharma',
    role: 'Learner (Engineer)',
    tier: 'राजपत्रित',
    badge: 'Has -33 Data Gap',
    bg: 'border-blue-300 hover:bg-blue-50/50',
    btnBg: 'bg-[#0b2545]',
  },
  {
    email: 'meera@capacityconnect.in',
    label: 'Meera Nair',
    role: 'Manager (Eng Head)',
    tier: 'विभागाध्यक्ष',
    badge: 'Manages Team Matrix',
    bg: 'border-teal-300 hover:bg-teal-50/50',
    btnBg: 'bg-teal-700',
  },
  {
    email: 'admin@capacityconnect.in',
    label: 'Admin User',
    role: 'Executive Director',
    tier: 'मुख्य प्रशासक',
    badge: 'National Readiness Analytics',
    bg: 'border-amber-300 hover:bg-amber-50/50',
    btnBg: 'bg-[#c69214]',
  },
];

export default function LoginPage() {
  const { login, demoLogin, register, resetPassword } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [position, setPosition] = useState('');
  const [role, setRole] = useState<'learner' | 'manager'>('learner');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('arjun@capacityconnect.in');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (mode === 'register') {
        if (password !== confirmPassword) {
          setError('Passwords do not match.');
          setLoading(false);
          return;
        }
        const result = await register({ name, email, password, department, position, role });
        if (result.ok) {
          navigate(result.role === 'manager' ? '/manager' : '/dashboard');
        } else {
          setError(result.message || 'Unable to create account.');
        }
      } else {
        const result = await login(email, password);
        if (result.ok) {
          navigate(result.role === 'admin' ? '/admin' : result.role === 'manager' ? '/manager' : '/dashboard');
        } else {
          setError(result.message || 'Unable to sign in.');
        }
      }
    } finally {
      setLoading(false);
    }
  }

  function switchMode(nextMode: 'login' | 'register') {
    setMode(nextMode);
    setError('');
    if (nextMode === 'register') {
      setEmail('');
      setPassword('');
    } else {
      setEmail('arjun@capacityconnect.in');
      setPassword('');
      setConfirmPassword('');
    }
  }

  function quickLogin(em: string) {
    setEmail(em);
    setPassword('demo123');
    setLoading(true);
    void demoLogin(em).then(success => {
      if (success) {
        const destination = em === 'admin@capacityconnect.in' ? '/admin' : em === 'meera@capacityconnect.in' ? '/team' : '/dashboard';
        navigate(destination);
      } else setError('Demo persona is unavailable.');
      setLoading(false);
    });
  }

  async function handleForgotPassword() {
    if (!email.trim()) { setError('Enter your email address first.'); return; }
    setLoading(true);
    const result = await resetPassword(email);
    setError(result.ok ? 'Password reset instructions sent if the account exists.' : result.message || 'Unable to send reset instructions.');
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#f4f6f9] flex flex-col justify-between">
      {/* Top Bar */}
      <GovTopBar />

      {/* Main Login Frame */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-xl">
          {/* Official Emblem & Portal Title */}
          <div className="text-center mb-8">
            <div className="inline-flex flex-col items-center justify-center mb-3">
              <StateEmblem className="w-12 h-14" />
            </div>
            <p className="text-[11px] font-bold text-[#c69214] uppercase tracking-widest font-serif">
              भारत सरकार | Government of India
            </p>
            <h1 className="text-2xl md:text-3xl font-black text-[#0b2545] tracking-tight mt-1">
              CAPACITY CONNECT
            </h1>
            <p className="text-xs text-slate-500 font-semibold mt-1">
              Jan Parichay (National Single Sign-On) Authentication Gate
            </p>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-200 relative overflow-hidden">
            {/* National Tricolor micro-accent top */}
            <div className="tricolor-ribbon absolute top-0 left-0 right-0" />

            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {mode === 'login' ? 'Sign in to National Portal' : 'Create a demo learner account'}
                </h2>
                <p className="text-xs text-slate-400">
                  {mode === 'login' ? 'Enter government email and credential password' : 'Create a local prototype account for the capacity-building workflow'}
                </p>
              </div>
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full flex items-center gap-1">
                <ShieldCheck size={13} />
                <span>NIC Verified</span>
              </span>
            </div>

            <div className="flex gap-2 p-1 bg-slate-100 rounded-xl mb-6" role="tablist" aria-label="Account access">
              <button
                type="button"
                role="tab"
                aria-selected={mode === 'login'}
                onClick={() => switchMode('login')}
                className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${mode === 'login' ? 'bg-white text-[#0b2545] shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Sign in
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mode === 'register'}
                onClick={() => switchMode('register')}
                className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${mode === 'register' ? 'bg-white text-[#0b2545] shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                <UserPlus size={14} /> Create account
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <div>
                  <label htmlFor="account-name" className="text-xs font-bold text-slate-700 mb-1.5 block">Full name</label>
                  <div className="relative">
                    <UserRound size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      id="account-name"
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Your full name"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0b2545] focus:bg-white transition-all font-medium"
                      required
                    />
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="account-email" className="text-xs font-bold text-slate-700 mb-1.5 block">Official Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="account-email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="officer@capacityconnect.in"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0b2545] focus:bg-white transition-all font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="account-password" className="text-xs font-bold text-slate-700 mb-1.5 block">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="account-password"
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0b2545] focus:bg-white transition-all font-medium"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(v => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {mode === 'register' && (
                <>
                  <div>
                    <label htmlFor="account-confirm-password" className="text-xs font-bold text-slate-700 mb-1.5 block">Confirm password</label>
                    <input
                      id="account-confirm-password"
                      type={showPass ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0b2545] focus:bg-white transition-all font-medium"
                      minLength={6}
                      required
                    />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="account-department" className="text-xs font-bold text-slate-700 mb-1.5 block">Department</label>
                      <input
                        id="account-department"
                        type="text"
                        value={department}
                        onChange={e => setDepartment(e.target.value)}
                        placeholder="e.g. Engineering"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0b2545] focus:bg-white transition-all font-medium"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="account-position" className="text-xs font-bold text-slate-700 mb-1.5 block">Position</label>
                      <input
                        id="account-position"
                        type="text"
                        value={position}
                        onChange={e => setPosition(e.target.value)}
                        placeholder="e.g. Analyst"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0b2545] focus:bg-white transition-all font-medium"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="account-role" className="text-xs font-bold text-slate-700 mb-1.5 block">Account role</label>
                    <select id="account-role" value={role} onChange={e => setRole(e.target.value as 'learner' | 'manager')} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium">
                      <option value="learner">Learner</option>
                      {!isSupabaseConfigured && <option value="manager">Manager (pending approval)</option>}
                    </select>
                  </div>
                </>
              )}

              {error && (
                <div className="bg-red-50 text-red-700 text-xs font-semibold px-4 py-3 rounded-xl border border-red-200">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-[#0b2545] text-white py-3.5 rounded-xl font-bold text-sm hover:bg-[#13315c] transition-all disabled:opacity-60 shadow-md shadow-[#0b2545]/20"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{mode === 'login' ? 'Authenticate with Jan Parichay' : 'Create account and continue'}</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
              {mode === 'login' && <button type="button" onClick={() => void handleForgotPassword()} className="w-full text-xs font-bold text-[#0b2545] hover:underline">Forgot password?</button>}
            </form>

            {/* Quick Demo Access Tiers */}
            {mode === 'login' && <div className="mt-8 pt-6 border-t border-slate-100">
              <p className="text-xs font-bold text-[#c69214] uppercase tracking-wider mb-3">
                1-Click Presentation Demo Personas
              </p>
              <p className="text-[11px] text-slate-500 mb-3">Demo mode uses clearly labelled sample data and does not create a Supabase session.</p>
              <div className="space-y-2">
                {QUICK_LOGINS.map(q => (
                  <div
                    key={q.email}
                    onClick={() => quickLogin(q.email)}
                    className={`p-3 rounded-2xl border ${q.bg} cursor-pointer transition-all flex items-center justify-between group`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">{q.label}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                          {q.tier}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{q.role} • <span className="text-[#e06d00] font-semibold">{q.badge}</span></p>
                    </div>

                    <button
                      type="button"
                      className={`px-3 py-1.5 rounded-xl text-white text-[11px] font-bold ${q.btnBg} group-hover:scale-105 transition-transform flex items-center gap-1 shadow-xs`}
                    >
                      <span>Sign In</span>
                      <ArrowRight size={12} />
                    </button>
                  </div>
                ))}
              </div>
              <p className="text-center text-[11px] text-slate-400 mt-4">
                Global test password: <span className="font-mono font-bold text-[#0b2545]">demo123</span>
              </p>
            </div>}
          </div>

          <div className="text-center mt-4">
            <button
              onClick={() => navigate('/')}
              className="text-xs text-slate-500 font-bold hover:text-[#0b2545] transition-colors"
            >
              ← Return to National Capacity Connect Portal
            </button>
          </div>
        </div>
      </div>

      {/* Footer Notice */}
      <footer className="py-4 text-center text-xs text-slate-500 border-t border-slate-200/80 bg-white">
        Ministry of Personnel, Public Grievances and Pensions • National Programme for Civil Services Capacity Building
      </footer>
    </div>
  );
}

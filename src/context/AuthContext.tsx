import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import type { User, UserRole } from '../types';
import { users as demoUsers } from '../data/mockData';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  authError: string | null;
  login: (email: string, password: string) => Promise<{ ok: boolean; role?: UserRole; message?: string }>;
  demoLogin: (email: string) => Promise<boolean>;
  register: (input: RegisterInput) => Promise<{ ok: boolean; role?: UserRole; message?: string }>;
  resetPassword: (email: string) => Promise<{ ok: boolean; message?: string }>;
  logout: () => Promise<void>;
  switchRole: (role: UserRole) => Promise<boolean>;
  availableRoles: UserRole[];
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  department: string;
  position: string;
  role: Extract<UserRole, 'learner' | 'manager'>;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const MOCK_PASSWORD = 'demo123';

function mapProfile(profile: Record<string, unknown>): User {
  const rawRole = String(profile.role || 'learner');
  const role: UserRole = rawRole === 'admin'
    ? 'admin'
    : rawRole === 'manager' && profile.manager_approved === true
      ? 'manager'
      : 'learner';
  return {
    id: String(profile.id),
    name: String(profile.full_name || 'Capacity Connect User'),
    email: String(profile.email || ''),
    role,
    department: String(profile.department || ''),
    position: String(profile.position || ''),
    avatar: String(profile.avatar || 'CC'),
    joinedDate: String(profile.created_at || new Date().toISOString()).slice(0, 10),
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  async function loadProfile(userId: string) {
    if (!supabase) return;
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
    if (data) setUser(mapProfile(data));
  }

  useEffect(() => {
    const demoEmail = localStorage.getItem('capacity_connect_demo_user');
    const demoUser = demoEmail && demoUsers.find(candidate => candidate.email === demoEmail);
    if (demoUser) {
      setUser({ ...demoUser });
      setLoading(false);
      return;
    }
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      return;
    }
    let mounted = true;
    void supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      if (data.session) await loadProfile(data.session.user.id);
      setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (nextSession) void loadProfile(nextSession.user.id);
      else setUser(null);
    });
    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function login(email: string, password: string): Promise<{ ok: boolean; role?: UserRole; message?: string }> {
    setAuthError(null);
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) {
        setAuthError(error.message); return { ok: false, message: error.message };
      }
      setSession(data.session);
      if (data.user) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).maybeSingle();
        const signedInUser = profile ? mapProfile(profile) : null;
        if (signedInUser) setUser(signedInUser);
        return { ok: true, role: signedInUser?.role || 'learner' };
      }
      return { ok: true, role: 'learner' };
    }
    const found = demoUsers.find(candidate => candidate.email.toLowerCase() === email.trim().toLowerCase());
    if (found && password === MOCK_PASSWORD) { setUser({ ...found }); return { ok: true, role: found.role }; }
    return { ok: false, message: 'Invalid demo credentials.' };
  }

  async function demoLogin(email: string) {
    const demoUser = demoUsers.find(candidate => candidate.email === email);
    if (!demoUser) return false;
    await supabase?.auth.signOut();
    localStorage.setItem('capacity_connect_demo_user', demoUser.email);
    setSession(null);
    setUser({ ...demoUser });
    return true;
  }

  async function register(input: RegisterInput): Promise<{ ok: boolean; role?: UserRole; message?: string }> {
    setAuthError(null);
    if (!supabase) return { ok: false, message: 'Supabase authentication is not configured.' };
    const { data, error } = await supabase.auth.signUp({
      email: input.email.trim(),
      password: input.password,
      options: { data: { full_name: input.name.trim(), role: input.role, department: input.department.trim(), position: input.position.trim() } },
    });
    if (error) { setAuthError(error.message); return { ok: false, message: error.message }; }
    if (data.user) {
      const profile = { id: data.user.id, full_name: input.name.trim(), email: input.email.trim(), department: input.department.trim(), position: input.position.trim(), avatar: input.name.split(/\s+/).map(part => part[0]).join('').slice(0, 2).toUpperCase() };
      const { error: profileError } = await supabase.from('profiles').update(profile).eq('id', data.user.id);
      if (profileError) return { ok: false, message: profileError.message };
      setUser(mapProfile({ ...profile, role: 'learner', created_at: new Date().toISOString() }));
    }
    return { ok: true, role: 'learner' };
  }

  async function resetPassword(email: string) {
    if (!supabase) return { ok: false, message: 'Supabase authentication is not configured.' };
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/login` });
    return error ? { ok: false, message: error.message } : { ok: true };
  }

  async function logout() {
    if (supabase) await supabase.auth.signOut();
    localStorage.removeItem('capacity_connect_demo_user');
    setUser(null);
    setSession(null);
  }

  async function switchRole(role: UserRole) {
    if (!user || !availableRoles.includes(role)) return false;
    if (supabase && session) return role === user.role;
    const found = demoUsers.find(candidate => candidate.role === role);
    if (found) setUser({ ...found });
    return Boolean(found);
  }

  const availableRoles: UserRole[] = session && user
    ? [user.role]
    : user?.role === 'admin'
    ? ['learner', 'manager', 'admin']
    : user?.role === 'manager'
      ? ['learner', 'manager']
      : ['learner'];

  return (
    <AuthContext.Provider value={{ user, session, loading, authError, login, demoLogin, register, resetPassword, logout, switchRole, availableRoles }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

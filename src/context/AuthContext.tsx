import { createContext, useContext, useState, type ReactNode } from 'react';
import type { User } from '../types';
import { users } from '../data/mockData';

interface AuthContextValue {
  user: User | null;
  login: (email: string, password: string) => boolean;
  register: (input: RegisterInput) => { ok: boolean; message?: string };
  logout: () => void;
  switchRole: (userId: string) => void;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  department: string;
  position: string;
}

interface RegisteredAccount {
  user: User;
  password: string;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const MOCK_PASSWORD = 'demo123';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [registeredAccounts, setRegisteredAccounts] = useState<RegisteredAccount[]>(() => {
    try {
      const saved = localStorage.getItem('capacity_connect_accounts');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const allUsers = () => [...users, ...registeredAccounts.map(account => account.user)];

  function login(email: string, password: string): boolean {
    const account = registeredAccounts.find(item => item.user.email.toLowerCase() === email.trim().toLowerCase());
    if (account) {
      if (account.password !== password) return false;
      setUser(account.user);
      return true;
    }
    if (password !== MOCK_PASSWORD) return false;
    const found = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!found) return false;
    setUser(found);
    return true;
  }

  function register(input: RegisterInput) {
    const name = input.name.trim();
    const email = input.email.trim().toLowerCase();
    const department = input.department.trim();
    const position = input.position.trim();

    if (!name || !email || !department || !position) {
      return { ok: false, message: 'Complete all required fields.' };
    }
    if (input.password.length < 6) {
      return { ok: false, message: 'Password must contain at least 6 characters.' };
    }
    if (allUsers().some(candidate => candidate.email.toLowerCase() === email)) {
      return { ok: false, message: 'An account with this email already exists.' };
    }

    const user: User = {
      id: `demo-${Date.now()}`,
      name,
      email,
      role: 'learner',
      department,
      position,
      avatar: name.split(/\s+/).map(part => part[0]).join('').slice(0, 2).toUpperCase(),
      joinedDate: new Date().toISOString().slice(0, 10),
    };
    const account = { user, password: input.password };
    setRegisteredAccounts(previous => {
      const next = [...previous, account];
      try {
        localStorage.setItem('capacity_connect_accounts', JSON.stringify(next));
      } catch {
        // localStorage may be unavailable
      }
      return next;
    });
    setUser(user);
    return { ok: true };
  }

  function logout() {
    setUser(null);
  }

  function switchRole(userId: string) {
    const found = allUsers().find(u => u.id === userId);
    if (found) setUser(found);
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

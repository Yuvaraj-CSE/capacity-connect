import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CapacityProvider, useCapacity } from './context/CapacityContext';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';

import AppLayout from './components/layout/AppLayout';
import CapacityAI from './components/CapacityAI';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CompetencyPage from './pages/CompetencyPage';
import LearningPathPage from './pages/LearningPathPage';
import CoursesPage from './pages/CoursesPage';
import KnowledgeHubPage from './pages/KnowledgeHubPage';
import AssessmentsPage from './pages/AssessmentsPage';
import TeamAnalyticsPage from './pages/TeamAnalyticsPage';
import OrgAnalyticsPage from './pages/OrgAnalyticsPage';
import AlertsPage from './pages/AlertsPage';
import AdminPage from './pages/AdminPage';
import ManagerPage from './pages/ManagerPage';
import ProfilePage from './pages/ProfilePage';
import CertificateVerificationPage from './pages/CertificateVerificationPage';

function ProtectedLayout({ children, roles }: { children: React.ReactNode; roles?: Array<'learner' | 'manager' | 'admin'> }) {
  const { user, loading } = useAuth();
  const { ensureUserProfile } = useCapacity();

  useEffect(() => {
    if (user) ensureUserProfile(user.id);
  }, [user, ensureUserProfile]);

  if (loading) {
    return null;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (roles && !roles.includes(user.role)) {
    if (user.role === 'manager') return <Navigate to="/manager" replace />;
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <AppLayout>
      {children}
      <CapacityAI />
    </AppLayout>
  );
}

export default function App() {
  return (
    <CapacityProvider>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: '#071526',
              color: '#fff',
              borderRadius: '16px',
              fontSize: '13px',
              fontWeight: 600,
              border: '1px solid rgba(255, 153, 51, 0.3)',
            },
          }}
        />
        <BrowserRouter>
          <Routes>
            {/* Public National Portal & Jan Parichay Auth */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/verify-certificate" element={<CertificateVerificationPage />} />

            {/* Authenticated Government Portal Applications */}
            <Route path="/dashboard" element={<ProtectedLayout roles={['learner']}><DashboardPage /></ProtectedLayout>} />
            <Route path="/competency" element={<ProtectedLayout><CompetencyPage /></ProtectedLayout>} />
            <Route path="/learning" element={<ProtectedLayout roles={['learner', 'manager', 'admin']}><LearningPathPage /></ProtectedLayout>} />
            <Route path="/courses" element={<ProtectedLayout roles={['learner', 'manager', 'admin']}><CoursesPage /></ProtectedLayout>} />
            <Route path="/knowledge" element={<ProtectedLayout roles={['learner', 'manager', 'admin']}><KnowledgeHubPage /></ProtectedLayout>} />
            <Route path="/assessments" element={<ProtectedLayout roles={['learner']}><AssessmentsPage /></ProtectedLayout>} />
            <Route path="/team" element={<ProtectedLayout roles={['manager', 'admin']}><TeamAnalyticsPage /></ProtectedLayout>} />
            <Route path="/analytics" element={<ProtectedLayout roles={['manager', 'admin']}><OrgAnalyticsPage /></ProtectedLayout>} />
            <Route path="/alerts" element={<ProtectedLayout roles={['manager', 'admin']}><AlertsPage /></ProtectedLayout>} />
            <Route path="/manager" element={<ProtectedLayout roles={['manager', 'admin']}><TeamAnalyticsPage /></ProtectedLayout>} />
            <Route path="/manager/content" element={<ProtectedLayout roles={['manager', 'admin']}><ManagerPage /></ProtectedLayout>} />
            <Route path="/profile" element={<ProtectedLayout roles={['manager', 'admin']}><ProfilePage /></ProtectedLayout>} />
            <Route path="/admin" element={<ProtectedLayout roles={['admin']}><AdminPage /></ProtectedLayout>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </CapacityProvider>
  );
}

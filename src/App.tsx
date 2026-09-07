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

function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { ensureUserProfile } = useCapacity();

  useEffect(() => {
    if (user) ensureUserProfile(user.id);
  }, [user, ensureUserProfile]);

  if (!user) {
    return <Navigate to="/login" replace />;
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

            {/* Authenticated Government Portal Applications */}
            <Route path="/dashboard" element={<ProtectedLayout><DashboardPage /></ProtectedLayout>} />
            <Route path="/competency" element={<ProtectedLayout><CompetencyPage /></ProtectedLayout>} />
            <Route path="/learning" element={<ProtectedLayout><LearningPathPage /></ProtectedLayout>} />
            <Route path="/courses" element={<ProtectedLayout><CoursesPage /></ProtectedLayout>} />
            <Route path="/knowledge" element={<ProtectedLayout><KnowledgeHubPage /></ProtectedLayout>} />
            <Route path="/assessments" element={<ProtectedLayout><AssessmentsPage /></ProtectedLayout>} />
            <Route path="/team" element={<ProtectedLayout><TeamAnalyticsPage /></ProtectedLayout>} />
            <Route path="/analytics" element={<ProtectedLayout><OrgAnalyticsPage /></ProtectedLayout>} />
            <Route path="/alerts" element={<ProtectedLayout><AlertsPage /></ProtectedLayout>} />
            <Route path="/admin" element={<ProtectedLayout><AdminPage /></ProtectedLayout>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </CapacityProvider>
  );
}

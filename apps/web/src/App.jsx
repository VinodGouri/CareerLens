import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CareerProvider } from './context/CareerContext';
import Navbar from './components/layout/Navbar';
import AuthGuard from './components/auth/AuthGuard';
import AIChatbotModal from './components/ai/AIChatbotModal';

// Auth Pages (no navbar)
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import OnboardingPage from './pages/OnboardingPage';

// App Pages (with navbar)
import DashboardPage from './pages/DashboardPage';
import ExploreJobsPage from './pages/ExploreJobsPage';
import JobDetailPage from './pages/JobDetailPage';
import ProfilePage from './pages/ProfilePage';
import ResumeBuilderPage from './pages/ResumeBuilderPage';
import ResumeAnalyzerPage from './pages/ResumeAnalyzerPage';
import ApplicationTrackerPage from './pages/ApplicationTrackerPage';
import LearningRoadmapPage from './pages/LearningRoadmapPage';
import SavedJobsPage from './pages/SavedJobsPage';
import SettingsPage from './pages/SettingsPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

// Admin Portal Components (Dedicated layout, guard, & login)
import AdminGuard from './components/admin/AdminGuard';
import AdminLayout from './components/admin/AdminLayout';
import AdminLoginPage from './pages/admin/AdminLoginPage';

/* ─── Layout wrapper for authenticated pages ─── */
function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#080c15] text-slate-100 flex flex-col font-sans selection:bg-brand-500/30 selection:text-brand-200">
      {/* Ambient Lighting Accents */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 radial-glow pointer-events-none z-0" />
      <div className="fixed top-1/3 -right-40 w-96 h-96 radial-glow-emerald pointer-events-none z-0" />

      {/* Sticky Navbar */}
      <Navbar />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {children}
      </main>

      {/* Global AI Career Assistant Modal */}
      <AIChatbotModal />

      {/* Global Footer */}
      <footer className="border-t border-white/5 py-8 mt-12 relative z-10 glass-panel">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-white">CareerLens AI</span>
            <span>•</span>
            <span>Job Discovery, Compatibility Matching & Skill-Gap Intelligence</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Initial Market: India (Hyderabad, Bangalore, Pune)</span>
            <span>•</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Systems Operational
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <CareerProvider>
      <BrowserRouter>
        <Routes>
          {/* ─── Public Auth Routes (no navbar, full-screen) ─── */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* ─── Onboarding (no navbar, full-screen) ─── */}
          <Route path="/onboarding" element={
            <AuthGuard>
              <OnboardingPage />
            </AuthGuard>
          } />

          {/* ─── Protected App Routes (with navbar + layout) ─── */}
          <Route path="/" element={
            <AuthGuard>
              <AppLayout><DashboardPage /></AppLayout>
            </AuthGuard>
          } />
          <Route path="/jobs" element={
            <AuthGuard>
              <AppLayout><ExploreJobsPage /></AppLayout>
            </AuthGuard>
          } />
          <Route path="/jobs/:id" element={
            <AuthGuard>
              <AppLayout><JobDetailPage /></AppLayout>
            </AuthGuard>
          } />
          <Route path="/profile" element={
            <AuthGuard>
              <AppLayout><ProfilePage /></AppLayout>
            </AuthGuard>
          } />
          <Route path="/resume" element={
            <AuthGuard>
              <AppLayout><ResumeBuilderPage /></AppLayout>
            </AuthGuard>
          } />
          <Route path="/resume-analyzer" element={
            <AuthGuard>
              <AppLayout><ResumeAnalyzerPage /></AppLayout>
            </AuthGuard>
          } />
          <Route path="/applications" element={
            <AuthGuard>
              <AppLayout><ApplicationTrackerPage /></AppLayout>
            </AuthGuard>
          } />
          <Route path="/learning" element={
            <AuthGuard>
              <AppLayout><LearningRoadmapPage /></AppLayout>
            </AuthGuard>
          } />
          <Route path="/saved" element={
            <AuthGuard>
              <AppLayout><SavedJobsPage /></AppLayout>
            </AuthGuard>
          } />
          <Route path="/settings" element={
            <AuthGuard>
              <AppLayout><SettingsPage /></AppLayout>
            </AuthGuard>
          } />
          {/* Dedicated Administrator Portal */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin" element={
            <AdminGuard>
              <AdminLayout>
                <AdminDashboardPage />
              </AdminLayout>
            </AdminGuard>
          } />
        </Routes>
      </BrowserRouter>
    </CareerProvider>
  );
}

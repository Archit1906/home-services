import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore.js';
import ToastContainer from './components/ui/Toast.jsx';

// Pages
import LandingPage from './pages/LandingPage.jsx';
import RoleSelection from './pages/RoleSelection.jsx';
import AuthPage from './pages/AuthPage.jsx';
import HomeownerDashboard from './pages/HomeownerDashboard.jsx';
import PostJob from './pages/PostJob.jsx';
import JobMatches from './pages/JobMatches.jsx';
import WorkerDashboard from './pages/WorkerDashboard.jsx';
import BrowseJobs from './pages/BrowseJobs.jsx';
import WorkerProfile from './pages/WorkerProfile.jsx';
import ChatMessages from './pages/ChatMessages.jsx';
import MapExplorer from './pages/MapExplorer.jsx';
import AdminPanel from './pages/AdminPanel.jsx';

// Route Guards
function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuthStore();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/auth" replace />;
}

function GuestRoute({ children }) {
  const { isAuthenticated, user, loading } = useAuthStore();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    if (user?.role === 'worker') {
      return <Navigate to="/dashboard/worker" replace />;
    } else if (user?.role === 'admin') {
      return <Navigate to="/admin" replace />;
    } else {
      return <Navigate to="/dashboard/home" replace />;
    }
  }

  return children;
}


function AdminRoute({ children }) {
  const { user, isAuthenticated, loading } = useAuthStore();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return isAuthenticated && user?.role === 'admin' ? children : <Navigate to="/" replace />;
}

export default function App() {
  const { fetchMe, token } = useAuthStore();

  useEffect(() => {
    if (token) {
      fetchMe();
    }
  }, [token]);

  return (
    <BrowserRouter>
      {/* Toast Alert System overlay */}
      <ToastContainer />

      <Routes>
        {/* Public Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Guest Routes (Redirects to dashboard if logged in) */}
        <Route
          path="/get-started"
          element={
            <GuestRoute>
              <RoleSelection />
            </GuestRoute>
          }
        />
        <Route
          path="/auth"
          element={
            <GuestRoute>
              <AuthPage />
            </GuestRoute>
          }
        />

        {/* Private Homeowner Dashboard Routes */}
        <Route
          path="/dashboard/home"
          element={
            <PrivateRoute>
              <HomeownerDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard/home/post-job"
          element={
            <PrivateRoute>
              <PostJob />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard/home/matches/:jobId"
          element={
            <PrivateRoute>
              <JobMatches />
            </PrivateRoute>
          }
        />

        {/* Private Worker Dashboard Routes */}
        <Route
          path="/dashboard/worker"
          element={
            <PrivateRoute>
              <WorkerDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard/worker/jobs"
          element={
            <PrivateRoute>
              <BrowseJobs />
            </PrivateRoute>
          }
        />

        {/* Shared Private Routes */}
        <Route
          path="/profile/:workerId"
          element={
            <PrivateRoute>
              <WorkerProfile />
            </PrivateRoute>
          }
        />
        <Route
          path="/messages/:conversationId"
          element={
            <PrivateRoute>
              <ChatMessages />
            </PrivateRoute>
          }
        />
        <Route
          path="/explore"
          element={
            <PrivateRoute>
              <MapExplorer />
            </PrivateRoute>
          }
        />

        {/* Admin Route */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminPanel />
            </AdminRoute>
          }
        />

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}


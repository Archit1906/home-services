import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore.js';
import ToastContainer from './components/ui/Toast.jsx';

// Pages
import LandingPage from './pages/LandingPage.jsx';
import RoleSelection from './pages/RoleSelection.jsx';
import AuthPage from './pages/AuthPage.jsx';
import HomeownerDashboard from './pages/HomeownerDashboard.jsx';

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
  const { isAuthenticated, loading } = useAuthStore();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return !isAuthenticated ? children : <Navigate to="/dashboard/home" replace />;
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

        {/* Private Homeowner Dashboard Route */}
        <Route
          path="/dashboard/home"
          element={
            <PrivateRoute>
              <HomeownerDashboard />
            </PrivateRoute>
          }
        />

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}


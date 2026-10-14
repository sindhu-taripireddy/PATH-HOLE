import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ adminOnly = false }) => {
  const { user, token, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-screen bg-[#0B0F17] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-mono text-slate-400">Loading PotholeGuard Engine...</p>
        </div>
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/signin" replace />;
  }

  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;

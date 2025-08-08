import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import AppShell from '@/components/AppShell';

export default function ProtectedRoutes() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? (
    <AppShell>
      <Outlet />
    </AppShell>
  ) : (
    <Navigate to="/login" />
  );
}

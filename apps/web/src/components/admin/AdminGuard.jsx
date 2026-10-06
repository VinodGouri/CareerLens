import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

/**
 * AdminGuard restricts access strictly to verified administrators.
 * Verifies that 'careerlens_admin_token' exists in localStorage.
 * If unauthenticated, securely redirects to the dedicated /admin/login portal.
 */
export default function AdminGuard({ children }) {
  const location = useLocation();
  const adminToken = localStorage.getItem('careerlens_admin_token');

  if (!adminToken) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
}

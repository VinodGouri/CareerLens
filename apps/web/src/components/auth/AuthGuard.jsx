import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

/**
 * AuthGuard wraps protected routes.
 * Checks for a JWT token in localStorage. 
 * Redirects to /login if not authenticated.
 * Passes through if authenticated.
 */
export default function AuthGuard({ children }) {
  const location = useLocation();
  const token = localStorage.getItem('careerlens_token');

  if (!token) {
    // Redirect to login, preserving the intended destination
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

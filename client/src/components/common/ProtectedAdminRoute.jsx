import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function ProtectedAdminRoute({ children }) {
  const { isAuthenticated, isAdmin } = useAuth();

  // Check if user is authenticated
  if (!isAuthenticated()) {
    return <Navigate to="/login" />;
  }

  // Check if user is admin
  if (!isAdmin()) {
    return <Navigate to="/" />;
  }

  return children;
}

export default ProtectedAdminRoute;
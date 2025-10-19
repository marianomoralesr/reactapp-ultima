import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PublicRoute: React.FC = () => {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen w-full bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (session) {
    // User is logged in, redirect them from the public-only page to the dashboard.
    return <Navigate to="/escritorio" replace />;
  }

  // User is not logged in, render the child route content (e.g., the login page).
  return <Outlet />;
};

export default PublicRoute;

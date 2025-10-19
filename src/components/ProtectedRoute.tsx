import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute: React.FC = () => {
  const { session, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    // Show a loading spinner while checking for session
    return (
      <div className="flex justify-center items-center h-screen w-full bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!session) {
    // User is not logged in, redirect to login page
    // Store the current location to redirect back after login
    localStorage.setItem('loginRedirect', location.pathname + location.search);
    // Redirect to the base login page. This fixes a blank screen issue by ensuring a clean
    // navigation state. The AuthHandler will use the stored 'loginRedirect' value.
    return <Navigate to="/acceder" replace />;
  }

  // User is logged in, render the child route content
  return <Outlet />;
};

export default ProtectedRoute;
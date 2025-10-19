import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { Profile } from '../types/types';

export const checkApplicationProfileCompleteness = (p: Profile | null): boolean => {
    if (!p) return false;
    const requiredApplicationFields: (keyof Profile)[] = ['first_name', 'last_name', 'mother_last_name', 'phone', 'birth_date', 'homoclave', 'fiscal_situation', 'civil_status', 'address', 'city', 'state', 'zip_code', 'rfc'];
    return requiredApplicationFields.every(field => {
        const value = p[field];
        return value !== null && value !== undefined && String(value).trim() !== '';
    });
};

const AuthHandler: React.FC = () => {
  const { session, profile, loading } = useAuth();
  const navigate = useNavigate();
  const hasRedirectedRef = useRef(false);

  useEffect(() => {
    // Wait until the authentication status is resolved.
    if (loading) {
      return;
    }

    // If there's a session and we haven't performed the initial redirect yet.
    if (session && profile && !hasRedirectedRef.current) {
      const redirectPath = localStorage.getItem('loginRedirect');
      localStorage.removeItem('loginRedirect');

      // Special check for the application page.
      if (redirectPath && redirectPath.startsWith('/escritorio/aplicacion')) {
        const isProfileComplete = checkApplicationProfileCompleteness(profile);
        if (!isProfileComplete) {
          navigate('/escritorio/profile', { replace: true });
          hasRedirectedRef.current = true;
          return;
        }
      }
      
      // Perform the main redirect.
      navigate(redirectPath || '/escritorio', { replace: true });
      hasRedirectedRef.current = true;
    }

    // If the session is lost (logout), reset the redirect flag.
    if (!session) {
      hasRedirectedRef.current = false;
    }

  }, [session, profile, loading, navigate]);

  return null;
};

export default AuthHandler;
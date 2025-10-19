import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getRedirects, Redirect } from '../services/RedirectService';

const RedirectManager: React.FC = () => {
  const [redirects, setRedirects] = useState<Redirect[]>([]);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    getRedirects().then(setRedirects).catch(() => {
      // Silently fail if CSV can't be loaded
      console.warn('Could not load redirects CSV');
    });
  }, []);

  useEffect(() => {
    // Skip redirect logic for Google AI Studio preview paths
    const isGoogleStudioPreview = window.location.hostname.includes('scf.usercontent.goog');
    if (isGoogleStudioPreview && location.pathname.match(/^\/[a-f0-9-]{36}$/)) {
      navigate('/', { replace: true });
      return;
    }

    if (redirects.length > 0) {
      const currentPath = location.pathname;
      const redirect = redirects.find(r => r.from === currentPath);
      if (redirect) {
        navigate(redirect.to, { replace: true });
      }
    }
  }, [location, redirects, navigate]);

  return null;
};

export default RedirectManager;
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getRedirects, Redirect } from '../services/RedirectService';

const RedirectManager: React.FC = () => {
  const [redirects, setRedirects] = useState<Redirect[]>([]);
  const location = useLocation();
  const navigate = useNavigate();
  const [isReady, setIsReady] = useState(false);

  const fetchRedirects = useCallback(async () => {
    const data = await getRedirects();
    setRedirects(data);
    setIsReady(true);
  }, []);

  useEffect(() => {
    fetchRedirects();
  }, [fetchRedirects]);

  useEffect(() => {
    if (!isReady) return;

    // Check for 404 redirect path from sessionStorage, set by 404.html
    const pathFrom404 = sessionStorage.getItem('redirect404');
    if (pathFrom404) {
      sessionStorage.removeItem('redirect404');
      // Create a dummy URL to easily parse the pathname
      const targetPath = new URL(`http://localhost${pathFrom404}`).pathname;
      const redirect = redirects.find(r => r.from === targetPath);
      
      if (redirect) {
        navigate(redirect.to, { replace: true });
        return; // Redirect handled
      }
      
      // If no specific redirect rule, navigate to the path so the router can show a 404
      navigate(targetPath, { replace: true });
      return;
    }
    
    // Regular client-side redirect check for internal navigation
    const currentPath = location.pathname.endsWith('/') && location.pathname.length > 1 
      ? location.pathname.slice(0, -1) 
      : location.pathname;
      
    // *** FIX: Do not attempt to redirect if we are already at the root path ***
    if (currentPath === '/') {
      return;
    }

    const redirect = redirects.find(r => r.from === currentPath);
    if (redirect) {
      navigate(redirect.to, { replace: true });
    }
    
  }, [location, redirects, navigate, isReady]);

  return null;
};

export default RedirectManager;
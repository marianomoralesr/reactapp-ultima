import { useEffect } from 'react';

/**
 * A custom hook to dynamically update SEO meta tags.
 * @param title - The title for the page.
 * @param description - The meta description for the page.
 * @param keywords - The meta keywords for the page.
 */
const useSEO = ({ title, description, keywords }: { title: string; description: string; keywords: string }) => {
  useEffect(() => {
    // Set document title
    if (title) {
        document.title = title;
    }

    // Helper to find and update or create a meta tag
    const setMetaTag = (name: string, content: string) => {
      if (!content) return;
      let element = document.querySelector(`meta[name="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute('name', name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Helper for Open Graph tags
    const setOgMetaTag = (property: string, content: string) => {
        if (!content) return;
        let element = document.querySelector(`meta[property="${property}"]`);
        if (!element) {
            element = document.createElement('meta');
            element.setAttribute('property', property);
            document.head.appendChild(element);
        }
        element.setAttribute('content', content);
    };

    setMetaTag('description', description);
    setMetaTag('keywords', keywords);
    
    setOgMetaTag('og:title', title);
    setOgMetaTag('og:description', description);
    
  }, [title, description, keywords]);
};

export default useSEO;
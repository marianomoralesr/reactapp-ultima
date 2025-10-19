import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

const LeadSourceHandler: React.FC = () => {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // This effect runs once on initial load to capture URL parameters.
    const utm_source = searchParams.get('utm_source');
    const utm_medium = searchParams.get('utm_medium');
    const utm_campaign = searchParams.get('utm_campaign');
    const rfdm = searchParams.get('rfdm');
    const ordencompra = searchParams.get('ordencompra');

    const leadSourceData: Record<string, string> = {};

    if (utm_source) leadSourceData.utm_source = utm_source;
    if (utm_medium) leadSourceData.utm_medium = utm_medium;
    if (utm_campaign) leadSourceData.utm_campaign = utm_campaign;
    if (rfdm) leadSourceData.rfdm = rfdm;
    if (ordencompra) leadSourceData.ordencompra = ordencompra;

    if (Object.keys(leadSourceData).length > 0) {
      // Only set the item if there is data to save.
      // We use sessionStorage to ensure it's cleared when the session ends.
      sessionStorage.setItem('leadSourceData', JSON.stringify(leadSourceData));
    }
  }, [searchParams]); // Dependency array ensures this runs only when search params change.

  return null; // This component does not render anything.
};

export default LeadSourceHandler;

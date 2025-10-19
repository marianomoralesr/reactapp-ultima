import Papa from 'papaparse';

export interface Redirect {
  from: string;
  to: string;
}

export async function getRedirects(): Promise<Redirect[]> {
  // Manual redirects as requested to ensure critical paths work
  const manualRedirects: Redirect[] = [
    { from: '/vende-tu-auto', to: '/vende-mi-auto' },
    { from: '/unete-al-equipo', to: '/vacantes' },
    { from: '/financiamiento-en-trefa', to: '/escritorio/aplicacion' },
    { from: '/obten-financiamiento-100-en-linea', to: '/escritorio/aplicacion' },
    { from: '/registro-para-financiamiento', to: '/escritorio/aplicacion' },
    { from: '/portal-de-clientes', to: '/escritorio' },
    { from: '/faqs', to: '/faq' }, // This requires a route change in App.tsx
  ];

  try {
    const response = await fetch('/internal_all2.csv');
    if (!response.ok) {
      console.warn("Could not fetch redirects CSV, using manual redirects only.");
      return manualRedirects;
    }
    const csvText = await response.text();
    
    return new Promise((resolve) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const redirectsFromCsv: Redirect[] = [];
          if(Array.isArray(results.data)) {
            results.data.forEach((row: any) => {
              if (row['Status Code'] === '301' && row['Address'] && row['Redirect URL']) {
                try {
                  const fromPath = new URL(row['Address']).pathname;
                  const toPath = new URL(row['Redirect URL']).pathname;
                  if (fromPath !== toPath) {
                    redirectsFromCsv.push({ from: fromPath, to: toPath });
                  }
                } catch (e) {
                  // Ignore parsing errors for invalid URLs in the CSV
                }
              }
            });
          }
          // Combine and deduplicate, giving manual redirects priority
          const allRedirects = [...manualRedirects, ...redirectsFromCsv];
          const uniqueRedirects = Array.from(new Map(allRedirects.map(item => [item.from, item])).values());
          resolve(uniqueRedirects);
        },
        error: (err: Error) => {
            console.error("Error parsing redirects CSV:", err);
            resolve(manualRedirects); // Resolve with manual redirects on parse error
        }
      });
    });
  } catch (error) {
    console.error("Error fetching redirects CSV:", error);
    return manualRedirects; // Return manual redirects on fetch error
  }
}
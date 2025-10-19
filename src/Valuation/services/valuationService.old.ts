import type { Vehicle, IntelimotorValuation } from '../../types/types';
import { config } from '../../config';

export class ValuationFailedError extends Error {
  public response: any;
  constructor(message: string, response?: any) {
    super(message);
    this.name = 'ValuationFailedError';
    this.response = response;
  }
}

interface FetchVehicleValuationParams {
    vehicle: Vehicle;
    mileage: number;
    businessUnitId: string;
    apiKey: string;
    apiSecret: string;
    proxyUrl?: string;
}

export const searchVehiclesWithAI = async (
  query: string,
  airtableApiKey: string,
  airtableBaseId: string,
  airtableTableId: string,
  airtableTableView: string,
): Promise<Vehicle[]> => {
  if (query.length < 3) return [];

  if (!airtableApiKey || !airtableBaseId || !airtableTableId || !airtableTableView) {
    const errorMsg = "La configuración de Airtable está incompleta (API Key, Base ID, Table ID/Name, or View Name). Por favor, ve a la pestaña de 'Configuración' para añadirlos.";
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  const cleanApiKey = airtableApiKey.trim();
  const cleanBaseId = airtableBaseId.trim();

  const formula = `SEARCH(LOWER("${query.replace(/"/g, '""')}"), LOWER({Vehicle Name}))`;
  const baseUrl = `https://api.airtable.com/v0/${cleanBaseId}/${airtableTableId}?view=${encodeURIComponent(airtableTableView)}&filterByFormula=${encodeURIComponent(formula)}&maxRecords=5`;
  const url = baseUrl;

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${cleanApiKey}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Error fetching from Airtable:", errorData);
      
      let detailedMessage = 'Ocurrió un error desconocido';
      if (errorData?.error) {
        if (typeof errorData.error === 'string') {
          detailedMessage = errorData.error;
        } else if (typeof errorData.error.message === 'string') {
          detailedMessage = errorData.error.message;
        }
      } else if (response.statusText) {
        detailedMessage = response.statusText;
      }

       if (response.status === 401) {
          const newErrorMessage = `Error de autenticación con Airtable (401). Tu API Key es inválida. Por favor, verifica que:\n- El token sea un 'Personal Access Token' de Airtable (debe empezar con 'pat').\n- El token esté copiado correctamente, sin espacios extra.\n- El token no haya expirado o sido revocado.\n\nDetalles del servidor: ${detailedMessage}`;
          throw new Error(newErrorMessage);
      }
      if (response.status === 403) {
          throw new Error(`Error de permisos con Airtable (403). Por favor, verifica los siguientes puntos:\n- Que tu API Key (token) tenga los scopes 'data.records:read' y 'data.records:write'.\n- Que el token tenga acceso explícito a la base de datos que configuraste.\n- Que el API Key, Base ID, Table ID/Name y View Name estén escritos correctamente.`);
      }
      if (response.status === 404) {
          throw new Error(`No se encontró la base, la tabla o la vista en Airtable (404). Revisa tu Base ID, el nombre/ID de la tabla y el View Name. (Detalles: ${detailedMessage})`);
      }
      throw new Error(`Error de Airtable API (${response.status}): ${detailedMessage}`);
    }

    const data = await response.json();

    const vehicles: Vehicle[] = data.records.map((record: any) => {
      const fields = record.fields;
      const vehicleName = fields['Vehicle Name'] || '';

      const nameParts = vehicleName.split(' ');
      const brand = nameParts[0] || 'N/A';
      const model = nameParts[1] || 'N/A';
      const yearStr = nameParts.find((p: string) => /^\d{4}$/.test(p));
      const year = yearStr ? parseInt(yearStr, 10) : new Date().getFullYear();
      
      let allOffers: number[] = [];
      const fieldsToProcess = [
        fields['historicalOffers'], 
        fields['Historical Offers'], 
        fields['Autos Ofertados'], 
        fields['Ofertas Historicas TREFA'],
        fields['Monto Ofertas Historicas']
      ];

      for (const offersData of fieldsToProcess) {
          if (typeof offersData === 'string' && offersData.trim() !== '') {
              const parsed = offersData.split(',')
                .map(s => {
                    const cleaned = s.trim().replace(/[$,]/g, ''); // Remove $ and commas
                    return parseInt(cleaned, 10); // parseInt will stop at '.' if it exists
                })
                .filter(n => !isNaN(n));
              allOffers.push(...parsed);
          } else if (Array.isArray(offersData)) {
              const numbers = offersData.filter((n): n is number => typeof n === 'number' && !isNaN(n));
              allOffers.push(...numbers);
          }
      }

      return {
        id: record.id,
        label: vehicleName,
        brand,
        model,
        year,
        trim: fields['Trim Name'] || 'N/A',
        brandId: fields.brandId || '',
        modelId: fields.modelId || '',
        trimId: fields.trimId || '',
        yearId: fields.yearId || '',
        historicalOffers: [...new Set(allOffers)], // Remove duplicates
      };
    });

    return vehicles;

  } catch (error) {
    console.error(`Error searching for vehicles via Airtable. URL: ${url}`, error);
    if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
             throw new Error("Falló la conexión de red. Revisa tu proxy (CORS) y conexión a internet.");
        }
        throw error;
    }
    throw new Error("No se pudieron obtener los datos. Verifique la conexión o la configuración del sistema.");
  }
};

export const findVehicleVariations = async (
  vehicle: Vehicle,
  airtableApiKey: string,
  airtableBaseId: string,
  airtableTableId: string,
  airtableTableView: string
): Promise<Vehicle[]> => {
  if (!vehicle.brandId || !vehicle.modelId || !vehicle.yearId) {
    console.warn('Cannot find variations for vehicle without brand, model, or year ID.');
    return [];
  }

  if (!airtableApiKey || !airtableBaseId || !airtableTableId || !airtableTableView) {
    console.error("Airtable config is incomplete for finding variations.");
    return [];
  }

  const formula = `AND({brandId} = '${vehicle.brandId}', {modelId} = '${vehicle.modelId}', {yearId} = '${vehicle.yearId}', NOT({trimId} = '${vehicle.trimId}'))`;
  const baseUrl = `https://api.airtable.com/v0/${airtableBaseId.trim()}/${airtableTableId.trim()}?view=${encodeURIComponent(airtableTableView)}&filterByFormula=${encodeURIComponent(formula)}&maxRecords=3`;
  const url = `${config.proxy.url}${baseUrl}`;

  try {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${airtableApiKey.trim()}` },
    });
    if (!response.ok) {
      console.error("Error fetching variations from Airtable:", await response.json().catch(() => ({})));
      return [];
    }
    const data = await response.json();
    
    return data.records.map((record: any) => {
      const fields = record.fields;
      const vehicleName = fields['Vehicle Name'] || '';
      const nameParts = vehicleName.split(' ');
      const brand = nameParts[0] || 'N/A';
      const model = nameParts[1] || 'N/A';
      const yearStr = nameParts.find((p: string) => /^\d{4}$/.test(p));
      const year = yearStr ? parseInt(yearStr, 10) : new Date().getFullYear();
      
      let allOffers: number[] = [];
      const fieldsToProcess = [
        fields['historicalOffers'], fields['Historical Offers'], fields['Autos Ofertados'], 
        fields['Ofertas Historicas TREFA'], fields['Monto Ofertas Historicas']
      ];

      for (const offersData of fieldsToProcess) {
          if (typeof offersData === 'string' && offersData.trim() !== '') {
              const parsed = offersData.split(',').map(s => parseInt(s.trim().replace(/[$,]/g, ''), 10)).filter(n => !isNaN(n));
              allOffers.push(...parsed);
          } else if (Array.isArray(offersData)) {
              allOffers.push(...offersData.filter((n): n is number => typeof n === 'number' && !isNaN(n)));
          }
      }

      return {
        id: record.id, label: vehicleName, brand, model, year,
        trim: fields['Trim Name'] || 'N/A',
        brandId: fields.brandId || '', modelId: fields.modelId || '',
        trimId: fields.trimId || '', yearId: fields.yearId || '',
        historicalOffers: [...new Set(allOffers)],
      };
    });
  } catch (error) {
    console.error("Error finding vehicle variations:", error);
    return [];
  }
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const robustParseFloat = (value: any): number => {
    if (typeof value === 'number') return isNaN(value) ? 0 : value;
    if (typeof value === 'string') {
        const cleaned = value.replace(/[$,]/g, '').trim();
        const num = parseFloat(cleaned);
        return isNaN(num) ? 0 : num;
    }
    return 0;
};

export const fetchIntelimotorValuation = async (params: FetchVehicleValuationParams): Promise<{ valuation: IntelimotorValuation; rawResponse: any }> => {
    const { vehicle, mileage, businessUnitId, apiKey, apiSecret, proxyUrl } = params;

    const valuationProcess = async () => {
        if (!apiKey || !apiSecret) throw new Error("La API Key y/o API Secret de Intelimotor no están configurados.");
        if (!businessUnitId) throw new Error("El ID de la unidad de negocio no está configurado.");
        if (!vehicle.brandId || !vehicle.modelId || !vehicle.yearId || !vehicle.trimId) {
            throw new Error("El auto seleccionado no tiene todos los IDs necesarios (brand, model, year, trim).");
        }

        const getUrlWithProxy = (baseUrl: string) => (proxyUrl ? `${proxyUrl.trim()}${baseUrl}` : baseUrl);

        // Step 1: POST to create a new valuation.
        const postAuthParams = new URLSearchParams({ apiKey: apiKey.trim(), apiSecret: apiSecret.trim() });
        const postBaseUrl = `/intelimotor-api/api/valuations?${postAuthParams.toString()}`;
        const finalPostUrl = getUrlWithProxy(postBaseUrl);

        const postBody = {
            businessUnitId: businessUnitId.trim(),
            brandIds: [vehicle.brandId],
            modelIds: [vehicle.modelId],
            yearIds: [vehicle.yearId],
            trimIds: [vehicle.trimId],
            kms: mileage
        };

        let postResponseData;
        try {
            const postResponse = await fetch(finalPostUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(postBody),
            });
            postResponseData = await postResponse.json();
            if (!postResponse.ok) {
                let errorMsg = `Error de Intelimotor API (POST ${postResponse.status})`;
                if (postResponse.status === 401) errorMsg = "Error de autenticación con Intelimotor (401). Verifica tu API Key y API Secret.";
                else if (Array.isArray(postResponseData?.message)) errorMsg = [...new Set(postResponseData.message)].join('\n');
                else if (typeof postResponseData?.message === 'string') errorMsg = postResponseData.message;
                
                const error = new Error(errorMsg);
                (error as any).response = postResponseData;
                throw error;
            }
        } catch (e) {
            if (e instanceof Error && e.message.includes('Failed to fetch')) throw new Error("Falló la conexión de red. Revisa tu proxy y conexión a internet.");
            throw e;
        }

        // Step 2: Efficiently check for an immediate offer in the POST response
        const postDataContainer = postResponseData.data || postResponseData;
        const suggestedOffer = robustParseFloat(postDataContainer?.suggestedOffer ?? postDataContainer?.offer?.suggestedOffer);
        const ofertaAutomatica = robustParseFloat(postDataContainer?.ofertaAutomatica ?? postDataContainer?.automaticOffer);

        if (suggestedOffer > 0 || ofertaAutomatica > 0) {
            console.log("Offer found in initial POST response. Skipping polling.");
            const regionStats = postDataContainer?.stats?.[0]?.values;
            const valuation: IntelimotorValuation = {
                suggestedOffer: suggestedOffer > 0 ? suggestedOffer : ofertaAutomatica,
                ofertaAutomatica: ofertaAutomatica,
                highMarketValue: robustParseFloat(regionStats?.highMarketValue),
                lowMarketValue: robustParseFloat(regionStats?.lowMarketValue),
                avgDaysOnMarket: regionStats?.avgDaysOnMarket,
                avgKms: regionStats?.avgKms,
            };
            return { valuation, rawResponse: { initialPostResponse: postResponseData } };
        }

        const valuationId = postDataContainer?.id || postDataContainer?.valuationId;
        if (!valuationId) throw new Error("Respuesta de Intelimotor (POST) inválida: no se encontró el ID de la cotización para continuar.");
        
        // Step 3: Poll the GET endpoint if no immediate offer was found
        let finalValuationData = null;
        const maxAttempts = 6;
        const pollInterval = 5000;

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            await sleep(pollInterval);

            const getAuthParams = new URLSearchParams({ apiKey: apiKey.trim(), apiSecret: apiSecret.trim() });
            const getBaseUrl = `/intelimotor-api/api/valuations/${valuationId}?${getAuthParams.toString()}`;
            const finalGetUrl = getUrlWithProxy(getBaseUrl);

            try {
                const getResponse = await fetch(finalGetUrl);
                if (getResponse.ok) {
                    const getResponseData = await getResponse.json();
                    finalValuationData = getResponseData;
                    const dataToInspect = getResponseData.data || getResponseData;
                    const getSuggested = dataToInspect?.suggestedOffer ?? dataToInspect?.offer?.suggestedOffer;
                    const getAutomatica = dataToInspect?.ofertaAutomatica ?? dataToInspect?.automaticOffer;
                    const stats = dataToInspect?.stats;

                    const hasDirectOffer = robustParseFloat(getSuggested) > 0 || robustParseFloat(getAutomatica) > 0;
                    const hasMarketStats = Array.isArray(stats) && stats.length > 0 && robustParseFloat(stats[0]?.values?.avgMarketValue) > 0;

                    if (hasDirectOffer || hasMarketStats) {
                        break; // Success
                    }
                } else {
                    console.warn(`Polling attempt ${attempt} failed with status ${getResponse.status}. Continuing...`);
                }
            } catch (err) {
                 console.warn(`Polling attempt ${attempt} failed with network error. Continuing...`, err);
            }
        }

        // Step 4: Process final data with robust fallbacks
        const finalDataContainer = finalValuationData ? (finalValuationData.data || finalValuationData) : postDataContainer;
        const regionStats = finalDataContainer?.stats?.[0]?.values;

        let bestOffer = 0;
        
        // 1. Check for suggestedOffer
        const suggested = robustParseFloat(finalDataContainer?.suggestedOffer ?? finalDataContainer?.offer?.suggestedOffer);
        if (suggested > 0) {
            bestOffer = suggested;
        }

        // 2. If no suggestedOffer, check for ofertaAutomatica
        if (bestOffer <= 0) {
            const automatica = robustParseFloat(finalDataContainer?.ofertaAutomatica ?? finalDataContainer?.automaticOffer);
            if (automatica > 0) {
                bestOffer = automatica;
            }
        }

        // 3. If still no offer, use fallbacks based on market values
        if (bestOffer <= 0 && regionStats) {
            const avgMarketValue = robustParseFloat(regionStats.avgMarketValue);
            const lowMarketValue = robustParseFloat(regionStats.lowMarketValue);
            const highMarketValue = robustParseFloat(regionStats.highMarketValue);

            if (avgMarketValue > 0) {
                bestOffer = Math.max(0, avgMarketValue - 5000);
                console.warn(`No direct offer found. Falling back to avgMarketValue - 5000: ${bestOffer}`);
            } else if (lowMarketValue > 0 && highMarketValue > 0) {
                const avgFromRange = (lowMarketValue + highMarketValue) / 2;
                bestOffer = Math.max(0, avgFromRange - 5000);
                console.warn(`No avgMarketValue. Falling back to (low+high)/2 - 5000: ${bestOffer}`);
            } else if (lowMarketValue > 0) {
                // If only low is available, it's risky, but better than nothing. Offer a bit below.
                bestOffer = Math.max(0, lowMarketValue - 7500);
                console.warn(`No avg/high market value. Falling back to lowMarketValue - 7500: ${bestOffer}`);
            } else if (highMarketValue > 0) {
                // If only high is available, offer significantly below.
                bestOffer = Math.max(0, highMarketValue - 15000);
                console.warn(`Only highMarketValue available. Falling back to highMarketValue - 15000: ${bestOffer}`);
            }
        }
        
        if (bestOffer <= 0) {
            throw new ValuationFailedError(
                "No pudimos generar una oferta para esta versión específica. Esto suele ocurrir con autos poco comunes.",
                { initialPostResponse: postResponseData, finalGetResponse: finalValuationData }
            );
        }

        const valuation: IntelimotorValuation = {
            suggestedOffer: bestOffer,
            ofertaAutomatica: robustParseFloat(finalDataContainer?.ofertaAutomatica ?? finalDataContainer?.automaticOffer),
            highMarketValue: robustParseFloat(regionStats?.highMarketValue),
            lowMarketValue: robustParseFloat(regionStats?.lowMarketValue),
            avgDaysOnMarket: regionStats?.avgDaysOnMarket,
            avgKms: regionStats?.avgKms,
        };

        return { 
            valuation, 
            rawResponse: { initialPostResponse: postResponseData, finalGetResponse: finalValuationData } 
        };
    };

    const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() =>
            reject(new Error("La cotización está tardando más de lo esperado. Por favor, intenta de nuevo o prueba con una versión o año diferente del auto.")),
            40000 // 40s timeout
        )
    );

    return Promise.race([valuationProcess(), timeoutPromise as any]);
};

export const saveValuationToAirtable = async (
  valuationData: Record<string, any>,
  airtableApiKey: string,
  airtableBaseId: string,
  valuationsTableId: string
): Promise<any> => {
  if (!airtableApiKey || !airtableBaseId || !valuationsTableId) {
    throw new Error("La configuración de Airtable está incompleta. Se requiere API Key, Base ID y el nombre de la tabla de cotizaciones.");
  }

  const cleanApiKey = airtableApiKey.trim();
  const cleanBaseId = airtableBaseId.trim();
  const url = `https://api.airtable.com/v0/${cleanBaseId}/${valuationsTableId}`;
  
  const payload = {
    records: [
      {
        fields: valuationData,
      },
    ],
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cleanApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const responseData = await response.json();

    if (!response.ok) {
      const errorMessage = responseData?.error?.message || response.statusText || 'Ocurrió un error desconocido';
       if (response.status === 403) {
          throw new Error(`Error de permisos con Airtable (403). Asegúrate de que tu API token tenga el scope 'data.records:write' y acceso a la base.`);
      }
      if (response.status === 422) {
          const fieldError = responseData?.error?.message || '';
          if (fieldError.includes("Value is not an array of record IDs")) {
              throw new Error(
                `Error Crítico de Configuración en Airtable (422):\n\n` +
                `El campo 'Inventario' en tu tabla '${valuationsTableId}' está mal configurado.\n\n` +
                `==> SOLUCIÓN: Cambia el tipo de la columna a "Link to another record" y apúntalo a tu tabla de vehículos.`
              );
          }
          throw new Error(`Error al guardar en Airtable (422): ${errorMessage}. Revisa la guía de configuración en el código.`);
      }
      throw new Error(`Error de Airtable API (${response.status}): ${errorMessage}`);
    }

    return responseData;

  } catch (error) {
    console.error("Error saving valuation to Airtable:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("No se pudo guardar la cotización en Airtable.");
  }
};
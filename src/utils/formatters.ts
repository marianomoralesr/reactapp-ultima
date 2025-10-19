// =============================================================================
// utils/formatters.ts
import type { WordPressVehicle } from '../types/types';
import { DEFAULT_PLACEHOLDER_IMAGE, TREFA_WHATSAPP } from './constants';

/**
 * Proxies or processes image URLs. Currently returns URLs as-is.
 * Can be extended to add CDN, compression, or CORS proxy logic.
 */
export function proxyImageUrl(url: string | null | undefined): string {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return DEFAULT_PLACEHOLDER_IMAGE;
  }
  // Return URL as-is for now. Can add CDN/proxy logic here later.
  return url.trim();
}

/**
 * Formatea precio a MXN
 */

export const formatPrice = (price: number, options?: { showZeroAsCurrency?: boolean }): string => {
  if (typeof price !== 'number' || isNaN(price)) {
    return '$0';
  }
  
  if (price === 0 && !options?.showZeroAsCurrency) {
    return 'Por definir';
  }

  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

/**
 * Formatea kilometraje
 */
export function formatMileage(kms: number): string {
  return new Intl.NumberFormat('es-MX').format(kms) + ' km';
}

/**
 * Formatea año
 */
export function formatYear(year: number): string {
  return year.toString();
}

/**
 * Obtiene imagen placeholder según vehículo
 */
const placeholders: Record<string, string> = {
  "suv": "https://jjepfehmuybpctdzipnu.supabase.co/storage/v1/object/public/fotos_airtable/app/suv-2Artboard-12-trefa.png",
  "pick-up": "https://jjepfehmuybpctdzipnu.supabase.co/storage/v1/object/public/fotos_airtable/app/pickup-2Artboard-12-trefa-1.png",
  "sedan": "https://jjepfehmuybpctdzipnu.supabase.co/storage/v1/object/public/fotos_airtable/app/sedan-2Artboard-12-trefa.png",
  "sedán": "https://jjepfehmuybpctdzipnu.supabase.co/storage/v1/object/public/fotos_airtable/app/sedan-2Artboard-12-trefa.png",
  "hatchback": "https://jjepfehmuybpctdzipnu.supabase.co/storage/v1/object/public/fotos_airtable/app/hbArtboard-12-trefa.png"
};

export function getPlaceholderImage(vehicle: WordPressVehicle): string {
  const value = Array.isArray(vehicle.clasificacionid)
    ? vehicle.clasificacionid[0]
    : vehicle.clasificacionid;

  const clasificacion = typeof value === "string" ? value.toLowerCase().replace(/ /g, '-') : "";
  return placeholders[clasificacion] ?? DEFAULT_PLACEHOLDER_IMAGE;
}

/**
 * Convierte URL de video a formato embed
 */
export function getVideoEmbedUrl(url: string): string | null {
  if (!url) return null;

  // YouTube
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    const videoId = url.match(
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/ 
    )?.[1];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  }

  // Vimeo
  if (url.includes('vimeo.com')) {
    const videoId = url.match(/vimeo\.com\/(\d+)/)?.[1];
    return videoId ? `https://player.vimeo.com/video/${videoId}` : null;
  }

  // Google Drive
  if (url.includes('drive.google.com')) {
    const fileId = url.match(/[-\w]{25,}/)?.[0];
    return fileId 
      ? `https://drive.google.com/file/d/${fileId}/preview` 
      : null;
  }

  return url;
}

/**
 * Formatea texto de promoción
 */
export function formatPromotion(promo: string): string {
  if (!promo) return '';

  const promoKey = promo.toLowerCase();

  // Mapeo de promociones comunes y record IDs de Airtable
  const promoMap: Record<string, string> = {
    // Tipos generales
    'bonus': 'Bono Especial',
    'reduction': 'Precio Reducido',
    'financing': 'Financiamiento 0%',
    'warranty': 'Garantía Extendida',
    'trade-in': 'Recibimos tu Auto',

    // Record IDs específicos - Reducciones de precio
    'recha7euvz646ndhy': 'Precio Reducido',
    'reczmcmfh9lyhzdo3': 'Precio Reducido',
    'recd7wszx7tqwz5hz': 'Precio Reducido',
    'recvdbvddwfgrtwj': 'Precio Reducido',
    'recmsz9yfta3chzoq': 'Precio Reducido',

    // Record IDs específicos - Bonos
    'recuxe81piewnqxbl': 'Bono de $5,000',
    'recuxe81': 'Bono de $5,000',

    // Record IDs específicos - Promociones overlay (beneficios extras)
    'recpaihek7gpdg2dw': 'Placas Gratis',
    'rec9ipgzplpjw2xp0': 'Placas Gratis', // Corrected from 'Tanque Lleno'
    'rec9ip': 'Placas Gratis',
    'rechw5rphjdb4c2mm': 'Tanque Lleno',
    'rechw5': 'Tanque Lleno',

    // Promociones textuales (ya están en formato legible)
    'placas gratis': 'Placas Gratis',
    'tanque lleno de gasolina': 'Tanque Lleno',
    'tanque de gasolina lleno': 'Tanque Lleno',
    'lavado gratis': 'Lavado Gratis',
  };

  return promoMap[promoKey] || promo;
}

/**
 * Obtiene tipo de promoción
 */
export function getPromotionType(promo: string): string {
  if (!promo) return 'default';
  
  const lowerPromo = promo.toLowerCase();
  
  if (lowerPromo.includes('bonus') || lowerPromo.includes('bono')) return 'bonus';
  if (lowerPromo.includes('reducción') || lowerPromo.includes('reduction')) return 'reduction';
  if (lowerPromo.includes('financ')) return 'financing';
  if (lowerPromo.includes('garantía') || lowerPromo.includes('warranty')) return 'warranty';
  
  // New mappings - Bonos
  if (lowerPromo === 'recuxe81piewnqxbl' || lowerPromo === 'recuxe81') return 'bonus';

  // New mappings - Overlay promotions (extras)
  if (['recpaihek7gpdg2dw', 'rec9ipgzplpjw2xp0', 'rec9ip', 'rechw5rphjdb4c2mm', 'rechw5'].includes(lowerPromo)) return 'overlay';

  // All new mappings are price reductions.
  if (['recha7euvz646ndhy', 'reczmcmfh9lyhzdo3', 'recd7wszx7tqwz5hz', 'recvdbvddwfgrtwj', 'recmsz9yfta3chzoq'].includes(lowerPromo)) {
    return 'reduction';
  }

  // Legacy mappings from previous implementation
  if (lowerPromo.startsWith('recvdbdd')) {
    return 'reduction';
  }
  if (lowerPromo.startsWith('recha7e') || lowerPromo.startsWith('recd7w') || lowerPromo === 'reczmcmfh9lyhzdo3') {
    return 'bonus';
  }

  // General promotions
  const overlayPromos = ['placas gratis', 'tanque lleno de gasolina', 'tanque de gasolina lleno', 'lavado gratis'];
  if (overlayPromos.includes(lowerPromo)) {
    return 'overlay';
  }
  return 'default';
}

/**
 * Obtiene estilos CSS para badge de promoción
 */
export function getPromotionStyles(promo: string): string {
  const type = getPromotionType(promo);

  const styles: Record<string, string> = {
    'bonus': 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border border-gray-300',
    'reduction': 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border border-gray-300',
    'financing': 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border border-gray-300',
    'warranty': 'bg-gradient-to-r from-yellow-100 via-yellow-200 to-amber-200 text-amber-800 border border-yellow-400',
    'overlay': 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border border-gray-300',
    'default': 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border border-gray-300',
  };

  return styles[type] || styles.default;
}

/**
 * Calcula mensualidad aproximada
 */
export function calculateMonthlyPayment(
  price: number,
  downPayment: number,
  termMonths: number,
  annualRate: number = 17.9
): number {
  const loanAmount = price - downPayment;
  
  if (loanAmount <= 0 || termMonths <= 0) return 0;
  
  const monthlyRate = annualRate / 12 / 100;
  
  if (monthlyRate === 0) return loanAmount / termMonths;
  
  const numerator = loanAmount * monthlyRate * Math.pow(1 + monthlyRate, termMonths);
  const denominator = Math.pow(1 + monthlyRate, termMonths) - 1;
  
  if (denominator === 0) return 0;
  
  return numerator / denominator;
}

/**
 * Trunca texto con ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Limpia HTML de tags
 */
export function stripHtml(html: string): string {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

/**
 * Genera slug desde texto
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remueve acentos
    .replace(/[^\w\s-]/g, '') // Remueve caracteres especiales
    .replace(/\s+/g, '-') // Espacios a guiones
    .replace(/-+/g, '-') // Múltiples guiones a uno
    .trim();
}

/**
 * Valida formato de email
 */
export function isValidEmail(email: string): boolean {
  const regex = /^[^\\s@]+@[^\\s@]+\\[^\\s@]+$/;
  return regex.test(email);
}

/**
 * Valida formato de teléfono mexicano
 */
export function isValidMexicanPhone(phone: string): boolean {
  const cleaned = phone.replace(/\\D/g, '');
  return cleaned.length === 10 || cleaned.length === 12;
}

/**
 * Formatea teléfono mexicano
 */
export function formatMexicanPhone(phone: string): string {
  const cleaned = phone.replace(/\\D/g, '');
  
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  
  if (cleaned.length === 12) {
    return cleaned.replace(/(\d{2})(\d{2})(\d{4})(\d{4})/, '+$1 ($2) $3-$4');
  }
  
  return phone;
}

/**
 * Obtiene mensaje de WhatsApp pre-formateado
 */
export function getWhatsAppMessage(vehicle: WordPressVehicle): string {
  return encodeURIComponent(
    `Hola, me interesa el ${vehicle.titulo} (${vehicle.ano}). ` +
    `¿Está disponible?\n\n` +
    `Orden: ${vehicle.ordencompra}\n` +
    `Precio: ${formatPrice(vehicle.precio)}`
  );
}

/**
 * Genera URL de WhatsApp
 */
export function getWhatsAppUrl(vehicle: WordPressVehicle): string {
  return `https://wa.me/${TREFA_WHATSAPP}?text=${getWhatsAppMessage(vehicle)}`;
}

/**
 * Formatea rango de fechas
 */
export function formatDateRange(startDate: Date, endDate: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  
  const start = startDate.toLocaleDateString('es-MX', options);
  const end = endDate.toLocaleDateString('es-MX', options);
  
  return `${start} - ${end}`;
}

/**
 * Obtiene tiempo relativo (hace X tiempo)
 */
export function getRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(months / 12);
  
  if (years > 0) return `hace ${years} año${years > 1 ? 's' : ''}`;
  if (months > 0) return `hace ${months} mes${months > 1 ? 'es' : ''}`;
  if (days > 0) return `hace ${days} día${days > 1 ? 's' : ''}`;
  if (hours > 0) return `hace ${hours} hora${hours > 1 ? 's' : ''}`;
  if (minutes > 0) return `hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
  return 'hace unos segundos';
}

/**
 * Filtra vehículos según criterios
 */
export function filterVehicles(
  vehicles: WordPressVehicle[],
  filters: import('../types/types').VehicleFilters
): WordPressVehicle[] {
  let filteredVehicles = vehicles;

  if (filters.recienLlegados) {
    const maxId = Math.max(...vehicles.map(v => v.id));
    const threshold = maxId * 0.95; // Consider top 5% of IDs as "new" 
    filteredVehicles = filteredVehicles.filter(vehicle => vehicle.id > threshold);
  }

  return filteredVehicles.filter(vehicle => {
    // Ocultar separados
    if (filters.hideSeparado && vehicle.separado) return false;
    
    // Búsqueda de texto
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = 
        vehicle.titulo.toLowerCase().includes(searchLower) ||
        vehicle.marca.toLowerCase().includes(searchLower) ||
        vehicle.modelo.toLowerCase().includes(searchLower);
      
      if (!matchesSearch) return false;
    }
    
    // Marca
    if (filters.marca?.length && !filters.marca.includes(vehicle.marca)) {
      return false;
    }
    
    // Año
    if (filters.autoano?.length && !filters.autoano.includes(vehicle.autoano)) {
      return false;
    }
    
    // Garantía
    if (filters.garantia?.length && !filters.garantia.includes(vehicle.garantia)) {
      return false;
    }
    
    // Promociones
    if (filters.promotion?.length) {
      const hasPromo = vehicle.promociones?.some(p => 
        filters.promotion?.includes(p)
      );
      if (!hasPromo) return false;
    }
    
    // Clasificación
    if (filters.carroceria?.length) {
      if (!vehicle.clasificacionid?.some(c => filters.carroceria?.includes(c))) {
        return false;
      }
    }
    
    // Transmisión
    if (filters.transmision?.length && 
        !filters.transmision.includes(vehicle.transmision)) {
      return false;
    }
    
    // Combustible
    if (filters.combustible?.length && 
        !filters.combustible.includes(vehicle.combustible)) {
      return false;
    }
    
    // Rango de precio
    if (filters.minPrice && vehicle.precio < filters.minPrice) {
      return false;
    }
    if (filters.maxPrice && vehicle.precio > filters.maxPrice) {
      return false;
    }
    
    // Rango de enganche
    if (filters.enganchemin && vehicle.enganche_minimo < filters.enganchemin) {
      return false;
    }
    if (filters.maxEnganche && vehicle.enganche_minimo > filters.maxEnganche) {
      return false;
    }

    // Sucursal / Location
    if (filters.ubicacion && filters.ubicacion.length > 0) {
        const vehicleLocations = (vehicle.sucursal || []).map(loc => loc.toLowerCase());
        const filterLocations = filters.ubicacion.map(loc => loc.toLowerCase());
        const hasMatchingLocation = vehicleLocations.some(loc => filterLocations.includes(loc));
        
        if (!hasMatchingLocation) {
            return false;
        }
    }
    
    return true;
  });
}

/**
 * Obtiene opciones únicas de filtros desde vehículos
 */
export function getFilterOptions(
  allVehicles: WordPressVehicle[],
  filteredVehicles: WordPressVehicle[]
) {
  const options = {
    marcas: new Set<string>(),
    autoano: new Set<number>(),
    garantia: new Set<string>(),
    promociones: new Set<string>(),
    carroceria: new Set<string>(),
    transmision: new Set<string>(),
    combustible: new Set<string>(),
    ubicacion: new Set<string>(),
    precio: [] as number[],
    downPayments: [] as number[],
  };

  const counts = {
    marcas: {} as Record<string, number>,
    autoano: {} as Record<string, number>,
    garantia: {} as Record<string, number>,
    promociones: {} as Record<string, number>,
    carroceria: {} as Record<string, number>,
    transmision: {} as Record<string, number>,
    combustible: {} as Record<string, number>,
    ubicacion: {} as Record<string, number>,
  };

  // First, get all possible options from the complete vehicle list
  allVehicles.forEach(v => {
    if (v.marca) options.marcas.add(v.marca);
    if (v.autoano) options.autoano.add(v.autoano);
    if (v.garantia && v.garantia !== 'N/A') options.garantia.add(v.garantia);
    v.promociones?.forEach(p => options.promociones.add(p));
    if (v.carroceria) options.carroceria.add(v.carroceria);
    if (v.transmision && v.transmision !== 'N/A') options.transmision.add(v.transmision);
    if (v.combustible && v.combustible !== 'N/A') options.combustible.add(v.combustible);
    if (v.precio > 0) options.precio.push(v.precio);
    if (v.enganche_minimo > 0) options.downPayments.push(v.enganche_minimo);
    v.sucursal?.forEach(s => { if (s) options.ubicacion.add(s); });
  });

  // Then, calculate counts based on the currently filtered vehicles
  filteredVehicles.forEach(v => {
    if (v.marca) counts.marcas[v.marca] = (counts.marcas[v.marca] || 0) + 1;
    if (v.autoano) counts.autoano[v.autoano] = (counts.autoano[v.autoano] || 0) + 1;
    if (v.garantia) counts.garantia[v.garantia] = (counts.garantia[v.garantia] || 0) + 1;
    v.promociones?.forEach(p => counts.promociones[p] = (counts.promociones[p] || 0) + 1);
    if (v.carroceria) counts.carroceria[v.carroceria] = (counts.carroceria[v.carroceria] || 0) + 1;
    if (v.transmision) counts.transmision[v.transmision] = (counts.transmision[v.transmision] || 0) + 1;
    if (v.combustible) counts.combustible[v.combustible] = (counts.combustible[v.combustible] || 0) + 1;
    v.sucursal?.forEach(s => { if (s) counts.ubicacion[s] = (counts.ubicacion[s] || 0) + 1; });
  });

  return {
    marcas: Array.from(options.marcas).sort().map(m => ({ name: m, count: counts.marcas[m] || 0 })),
    autoano: Array.from(options.autoano).sort((a, b) => b - a).map(y => ({ name: y.toString(), count: counts.autoano[y] || 0 })),
    garantia: Array.from(options.garantia).sort().map(g => ({ name: g, count: counts.garantia[g] || 0 })),
    promociones: Array.from(options.promociones).map(p => ({ name: p, count: counts.promociones[p] || 0 })),
    carroceria: Array.from(options.carroceria).map(c => ({ name: c, count: counts.carroceria[c] || 0 })),
    transmision: Array.from(options.transmision).map(t => ({ name: t, count: counts.transmision[t] || 0 })),
    combustible: Array.from(options.combustible).map(f => ({ name: f, count: counts.combustible[f] || 0 })),
    ubicacion: Array.from(options.ubicacion).sort().map(s => ({ name: s, count: counts.ubicacion[s] || 0 })),
    minPrice: options.precio.length > 0 ? Math.min(...options.precio) : 0,
    maxPrice: options.precio.length > 0 ? Math.max(...options.precio) : 0,
    minEnganche: options.downPayments.length > 0 ? Math.min(...options.downPayments) : 0,
    maxEnganche: options.downPayments.length > 0 ? Math.max(...options.downPayments) : 0,
    counts,
  };
}


/**
 * Pagina array de vehículos
 */
export function paginateVehicles(
  vehicles: WordPressVehicle[],
  page: number,
  perPage: number = 12
): { vehicles: WordPressVehicle[]; totalPages: number } {
  const startIndex = (page - 1) * perPage;
  const endIndex = startIndex + perPage;
  
  return {
    vehicles: vehicles.slice(startIndex, endIndex),
    totalPages: Math.ceil(vehicles.length / perPage),
  };
}

/**
 * Genera meta tags para SEO
 */
export function generateVehicleMetaTags(vehicle: WordPressVehicle) {
  const title = `${vehicle.titulo} en Venta | TREFA`;
  const description = vehicle.descripcion 
    ? stripHtml(vehicle.descripcion).slice(0, 160)
    : `Encuentra el ${vehicle.titulo}, año ${vehicle.ano} con ${formatMileage(vehicle.kilometraje)} en TREFA. Financiamiento disponible.`;
  
  const keywords = [
    vehicle.marca,
    vehicle.modelo,
    vehicle.autoano.toString(),
    'seminuevo',
    'en venta',
    'TREFA',
    'financiamiento',
    vehicle.carroceria,
  ].filter(Boolean).join(', ');

  return {
    title,
    description,
    keywords,
    ogTitle: title,
    ogDescription: description,
    ogImage: vehicle.feature_image || DEFAULT_PLACEHOLDER_IMAGE,
    ogUrl: `trefa.mx/autos/${vehicle.slug}`,
    twitterCard: 'summary_large_image',
  };
}

/**
 * Calcula descuento porcentual
 */
export function calculateDiscount(
  originalPrice: number,
  currentPrice: number
): number {
  if (originalPrice <= 0 || currentPrice >= originalPrice) return 0;
  return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
}

/**
 * Formatea descuento
 */
export function formatDiscount(discount: number): string {
  return discount > 0 ? `-${discount}%` : '';
}

/**
 * Valida si un vehículo está disponible
 */
export function isVehicleAvailable(vehicle: WordPressVehicle): boolean {
  return !vehicle.vendido && !vehicle.separado;
}

/**
 * Obtiene estado del vehículo en texto
 */
export function getVehicleStatusText(vehicle: WordPressVehicle): string {
  if (vehicle.vendido) return 'Vendido';
  if (vehicle.separado) return 'Apartado';
  return 'Disponible';
}

/**
 * Obtiene clase CSS para estado del vehículo
 */
export function getVehicleStatusClass(vehicle: WordPressVehicle): string {
  if (vehicle.vendido) return 'bg-red-100 text-red-800';
  if (vehicle.separado) return 'bg-yellow-100 text-yellow-800';
  return 'bg-green-100 text-green-800';
}

/**
 * Calcula popularidad del vehículo
 */
export function getVehiclePopularity(viewCount: number): 'low' | 'medium' | 'high' | 'very-high' {
  if (viewCount >= 3000) return 'very-high';
  if (viewCount >= 2000) return 'high';
  if (viewCount >= 1000) return 'medium';
  return 'low';
}

/**
 * Obtiene emoji de popularidad
 */
export function getPopularityEmoji(viewCount: number): string {
  const popularity = getVehiclePopularity(viewCount);
  
  const emojis: Record<typeof popularity, string> = {
    'very-high': '🔥🔥🔥',
    'high': '🔥🔥',
    'medium': '🔥',
    'low': '',
  };
  
  return emojis[popularity];
}

/**
 * Genera structured data para SEO (JSON-LD)
 */
export function generateVehicleStructuredData(vehicle: WordPressVehicle) {
  return {
    "@context": "https://schema.org",
    "@type": "Car",
    "name": vehicle.titulo,
    "brand": {
      "@type": "Brand",
      "name": vehicle.marca
    },
    "model": vehicle.modelo,
    "vehicleModelDate": vehicle.ano,
    "mileageFromOdometer": {
      "@type": "QuantitativeValue",
      "value": vehicle.kilometraje,
      "unitCode": "KMT"
    },
    "vehicleTransmission": vehicle.transmision,
    "fuelType": vehicle.combustible,
    "vehicleEngine": {
      "@type": "EngineSpecification",
      "name": vehicle.motor
    },
    "offers": {
      "@type": "Offer",
      "price": vehicle.precio,
      "priceCurrency": "MXN",
      "availability": isVehicleAvailable(vehicle) 
        ? "https://schema.org/InStock" 
        : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": "TREFA"
      }
    },
    "image": vehicle.feature_image,
    "url": `trefa.mx/autos/${vehicle.slug}`,
    "description": stripHtml(vehicle.descripcion).slice(0, 200)
  };
}

/**
 * Extrae año de fecha string
 */
export function extractYear(dateString: string): number | null {
  const match = dateString.match(/\d{4}/);
  return match ? parseInt(match[0], 10) : null;
}

/**
 * Compara dos vehículos para ordenamiento
 */
export function compareVehicles(
  a: WordPressVehicle,
  b: WordPressVehicle,
  sortBy: string
): number {
  switch (sortBy) {
    case 'price-asc': return a.precio - b.precio;
    case 'price-desc': return b.precio - a.precio;
    case 'year-desc': return b.ano - a.ano;
    case 'year-asc': return a.ano - b.ano;
    case 'mileage-asc': return a.autokilometraje - b.autokilometraje;
    case 'mileage-desc': return b.autokilometraje - a.autokilometraje;
    case 'relevance': return (b.view_count || 0) - (a.view_count || 0);
    default: return (typeof b.id === 'number' && typeof a.id === 'number') ? b.id - a.id : String(b.id).localeCompare(String(a.id)); // más recientes primero
  }
}

export function sortVehicles(
  vehicles: WordPressVehicle[],
  sortBy: string
): WordPressVehicle[] {
  const withImage = vehicles.filter(v => v.feature_image && v.feature_image !== DEFAULT_PLACEHOLDER_IMAGE);
  const withoutImage = vehicles.filter(v => !v.feature_image || v.feature_image === DEFAULT_PLACEHOLDER_IMAGE);

  const sortedWithImage = [...withImage].sort((a, b) => compareVehicles(a, b, sortBy));
  const sortedWithoutImage = [...withoutImage].sort((a, b) => compareVehicles(a, b, sortBy));

  return [...sortedWithImage, ...sortedWithoutImage];
}


/**
 * Agrupa vehículos por marca
 */
export function groupVehiclesByBrand(vehicles: WordPressVehicle[]): Record<string, WordPressVehicle[]> {
  return vehicles.reduce((acc, vehicle) => {
    const brand = vehicle.marca || 'Sin Marca';
    if (!acc[brand]) acc[brand] = [];
    acc[brand].push(vehicle);
    return acc;
  }, {} as Record<string, WordPressVehicle[]>);
}

/**
 * Agrupa vehículos por año
 */
export function groupVehiclesByYear(vehicles: WordPressVehicle[]): Record<number, WordPressVehicle[]> {
  return vehicles.reduce((acc, vehicle) => {
    const year = vehicle.ano || 0;
    if (!acc[year]) acc[year] = [];
    acc[year].push(vehicle);
    return acc;
  }, {} as Record<number, WordPressVehicle[]>);
}

/**
 * Obtiene vehículos similares
 */
export function getSimilarVehicles(
  vehicle: WordPressVehicle,
  allVehicles: WordPressVehicle[],
  limit: number = 4
): WordPressVehicle[] {
  // All vehicles are already filtered by ordenstatus='Comprado' in the backend
  return allVehicles
    .filter(v =>
      v.id !== vehicle.id &&
      (
        v.marca === vehicle.marca ||
        v.carroceria === vehicle.carroceria ||
        Math.abs(v.precio - vehicle.precio) < vehicle.precio * 0.2
      )
    )
    .slice(0, limit);
}

/**
 * Genera resumen de financiamiento
 */
export function getFinancingSummary(vehicle: WordPressVehicle) {
  const minDownPayment = vehicle.enganche_minimo || vehicle.precio * 0.15;
  const recommendedDownPayment = vehicle.enganche_recomendado || vehicle.precio * 0.35;
  const term = vehicle.plazomax || 60;
  
  const minMonthly = calculateMonthlyPayment(
    vehicle.precio,
    minDownPayment,
    term
  );
  
  const recommendedMonthly = calculateMonthlyPayment(
    vehicle.precio,
    recommendedDownPayment,
    term
  );
  
  return {
    minDownPayment,
    recommendedDownPayment,
    minMonthly,
    recommendedMonthly,
    term,
    totalWithMinDown: minDownPayment + (minMonthly * term),
    totalWithRecommendedDown: recommendedDownPayment + (recommendedMonthly * term),
  };
}

/**
 * Valida datos mínimos de vehículo
 */
export function isValidVehicle(vehicle: Partial<WordPressVehicle>): boolean {
  return !!(
    vehicle.id &&
    vehicle.slug &&
    vehicle.titulo &&
    vehicle.precio &&
    vehicle.ano &&
    vehicle.marca
  );
}

/**
 * Limpia datos de vehículo para export
 */
export function sanitizeVehicleForExport(vehicle: WordPressVehicle): Partial<WordPressVehicle> {
  const {
    // Remover campos computados o redundantes
    title, label, brand, model, year, price, kms,
    transmission, fuel, engine, warranty,
    minDownPayment, recommendedDownPayment,
    monthlyPayment, recommendedMonthlyPayment,
    maxTerm, featureImage, exteriorImages,
    interiorImages, videoUrl, reelId,
    location, isSold, isReserved,
    classification, promotions, viewCount,
    whatsappLink,
    ...rest
  } = vehicle;
  
  return rest;
}

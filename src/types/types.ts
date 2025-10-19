// types/types.ts

// =============================================================================
// VEHÍCULO - INTERFAZ UNIFICADA
// =============================================================================
export interface Vehicle {
  // ========== IDENTIFICADORES ==========
  id: number;
  slug: string;
  ordencompra: string;
  record_id: string | null;
  
  // ========== TÍTULO Y DESCRIPCIÓN ==========
  titulo: string;
  descripcion: string;
  metadescripcion: string;

  // ========== MARCA Y MODELO ==========
  marca: string;
  modelo: string;
  
  // ========== ESPECIFICACIONES TÉCNICAS ==========
  autoano: number;
  precio: number;
  kilometraje: number;
  transmision: string;
  combustible: string;
  AutoMotor: string;
  cilindros: number;
  
  // ========== FINANCIAMIENTO ==========
  enganchemin: number;
  enganche_recomendado: number;
  mensualidad_minima: number;
  mensualidad_recomendada: number;
  plazomax: number;
  
  // ========== IMÁGENES ==========
  feature_image: string[];
  galeria_exterior: string[];
  fotos_exterior_url?: string[];
  galeria_interior: string[];
  
  // ========== UBICACIÓN ==========
  ubicacion: string[];
  sucursal: string[]; // Alias for ubicacion
  
  // ========== GARANTÍA ==========
  garantia: string;
  
  // ========== ESTADO ==========
  vendido: boolean;
  separado: boolean;
  ordenstatus: string;
  
  // ========== CLASIFICACIÓN Y CATEGORÍAS ==========
  clasificacionid: string[];
  carroceria: string;
  
  // ========== PROMOCIONES ==========
  promociones: string[];
  
  // ========== ESTADÍSTICAS ==========
  viewcount: number;
  
  // ========== LEGACY & COMPATIBILITY (to be phased out) ==========
  // These are kept for now to avoid breaking other parts of the app
  // but the primary fields above are the source of truth.
  title: string;
  price: number;
  year: number;
  kms: number;
  [key: string]: any; // Allow other properties for now
}

export type WordPressVehicle = Vehicle;

// =============================================================================
// FILTROS
// =============================================================================
export interface VehicleFilters {
  search?: string;
  marca?: string[];
  autoano?: number[];
  promociones?: string[];
  garantia?: string[];
  carroceria?: string[];
  transmision?: string[];
  combustible?: string[];
  ubicacion?: string[];
  hideSeparado?: boolean;
  minPrice?: number;
  maxPrice?: number;
  enganchemin?: number;
  maxEnganche?: number;
  orderby?: string;
}

// Other types remain the same...

export interface WordPressPaginatedResponse {
  vehicles: Vehicle[];
  totalItems: number;
  totalPages: number;
}
export interface TaxonomyTerm {
  id: number;
  name: string;
  slug: string;
  count: number;
}
export interface InspectionReportData {
  id?: string;
  vehicle_id: number;
  status: 'approved' | 'pending' | 'rejected';
  past_owners: number;
  sinisters: number;
  police_report: string;
  inspection_points: {
    [key: string]: string[];
  };
  created_at?: string;
  updated_at?: string;
}
export interface IntelimotorValuation {
  suggestedOffer: number;
  highMarketValue: number;
  lowMarketValue: number;
  ofertaAutomatica?: number;
  avgDaysOnMarket?: number;
  avgKms?: number;
}
export interface Profile {
    id: string;
    updated_at?: string;
    email: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
    role: 'user' | 'admin' | 'sales';
    [key: string]: any;
}
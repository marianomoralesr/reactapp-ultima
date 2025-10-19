import type { Vehicle, VehicleFilters } from '../types/types';
import { supabase } from '../../supabaseClient';
import { getPlaceholderImage, generateSlug } from '../utils/formatters';

interface CacheEntry<T> {
  data: T;
  totalCount: number;
  timestamp: number;
}

type ViewCounts = Record<number, number>;

const isValidImageUrl = (url: any): url is string => {
    if (typeof url !== 'string' || url.trim() === '') return false;
    return url.trim().startsWith('http');
};

class VehicleService {
    private static readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
    private static readonly VIEW_COUNT_KEY = 'trefa_vehicle_views';
    private static readonly RECENTLY_VIEWED_KEY = 'trefa_recently_viewed';
    private static cache = new Map<string, CacheEntry<Vehicle[]>>();
    private static readonly VEHICLES_PER_PAGE = 20;

    private static buildSupabaseQuery(filters: VehicleFilters = {}, page: number = 1) {
        console.log('Building Supabase query with filters:', filters);
        const reverseSucursalMapping: Record<string, string> = {
            'Monterrey': 'MTY',
            'Guadalupe': 'GPE',
            'Reynosa': 'TMPS',
            'Saltillo': 'COAH'
        };

        let query = supabase.from('inventario_cache').select('*, feature_image_url, fotos_exterior_url', { count: 'exact' });

        // --- Base Filters ---
        query = query.eq('ordenstatus', 'Comprado');
        if (filters.hideSeparado) {
            query = query.not('separado', 'is', true);
        }

        // --- Direct Equality Filters ---
        if (filters.marca && filters.marca.length > 0) {
            query = query.in('marca', filters.marca);
        }
        if (filters.autoano && filters.autoano.length > 0) {
            query = query.in('autoano', filters.autoano);
        }
        if (filters.transmision && filters.transmision.length > 0) {
            query = query.in('transmision', filters.transmision);
        }
        if (filters.combustible && filters.combustible.length > 0) {
            query = query.in('combustible', filters.combustible);
        }
        if (filters.garantia && filters.garantia.length > 0) {
            query = query.in('garantia', filters.garantia);
        }

        // --- Range Filters ---
        if (filters.minPrice) {
            query = query.gte('precio', filters.minPrice);
        }
        if (filters.maxPrice) {
            query = query.lte('precio', filters.maxPrice);
        }
        if (filters.enganchemin) {
            query = query.gte('enganchemin', filters.enganchemin);
        }
        if (filters.maxEnganche) {
            query = query.lte('enganchemin', filters.maxEnganche);
        }

        // --- Complex Text Search / Array-like Filters ---
        const andFilters = [];
        if (filters.search) {
            const searchClauses = `title.ilike.%${filters.search}%,marca.ilike.%${filters.search}%,modelo.ilike.%${filters.search}%`;
            andFilters.push(`or(${searchClauses})`);
        }
        if (filters.carroceria && filters.carroceria.length > 0) {
            query = query.in('carroceria', filters.carroceria);
        }
        if (filters.ubicacion && filters.ubicacion.length > 0) {
            const rawSucursales = filters.ubicacion.map(s => reverseSucursalMapping[s] || s);
            query = query.in('ubicacion', rawSucursales);
        }

        if (filters.promotion && filters.promotion.length > 0) {
            // Assuming 'promociones' in Supabase is a text array column
            // This will check if the array contains any of the selected promotions
            query = query.overlaps('promociones', filters.promotion);
        }
        
        if (andFilters.length > 0) {
            query = query.and(andFilters.join(','));
        }

        // --- Pagination and Ordering ---
        const from = (page - 1) * this.VEHICLES_PER_PAGE;
        const to = from + this.VEHICLES_PER_PAGE - 1;
        query = query.range(from, to);
        
        if (filters.orderby) {
            const [field, direction] = filters.orderby.split('-');
            const fieldMap: Record<string, string> = {
                price: 'precio',
                year: 'autoano',
                mileage: 'kilometraje'
            };
            const mappedField = fieldMap[field] || field;
            query = query.order(mappedField, { ascending: direction === 'asc' });
        } else {
            query = query.order('updated_at', { ascending: false });
        }

        return query;
    }

    public static async getAllVehicles(filters: VehicleFilters = {}, page: number = 1): Promise<{ vehicles: Vehicle[], totalCount: number }> {
        const cacheKey = `vehicles_${JSON.stringify(filters)}_${page}`;
        
        const cached = this.cache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
            console.log('Cache hit!');
            return { vehicles: this.applyViewCounts(cached.data), totalCount: cached.totalCount };
        }

        try {
            const localCache = localStorage.getItem(cacheKey);
            if (localCache) {
                const { data, totalCount, timestamp } = JSON.parse(localCache);
                if (Date.now() - timestamp < this.CACHE_TTL) {
                    console.log('Local storage cache hit!');
                    this.cache.set(cacheKey, { data, totalCount, timestamp });
                    return { vehicles: this.applyViewCounts(data), totalCount };
                }
            }
        } catch (e) {
            console.warn("Could not read localStorage cache.", e);
        }

        try {
            const query = this.buildSupabaseQuery(filters, page);
            const { data, error, count } = await query;
            
            if (error) throw error;
            if (!data) throw new Error("No data returned from Supabase.");

            const normalizedData = this.normalizeVehicleData(data);
            const totalCount = count || 0;
            
            this.cache.set(cacheKey, { data: normalizedData, totalCount, timestamp: Date.now() });
            try {
                localStorage.setItem(cacheKey, JSON.stringify({ data: normalizedData, totalCount, timestamp: Date.now() }));
            } catch (e) {
                console.warn("Could not write to localStorage cache.", e);
            }

            return { vehicles: this.applyViewCounts(normalizedData), totalCount };
        } catch (error) {
            console.error('Primary data source failed, attempting to use stale cache.', error);
            // If the network fails, try to return from cache even if it's stale.
            const staleCached = this.cache.get(cacheKey);
            if (staleCached) {
                console.warn('Returning stale in-memory cache data.');
                return { vehicles: this.applyViewCounts(staleCached.data), totalCount: staleCached.totalCount };
            }
            try {
                const staleLocalCache = localStorage.getItem(cacheKey);
                if (staleLocalCache) {
                    console.warn('Returning stale localStorage cache data.');
                    const { data, totalCount } = JSON.parse(staleLocalCache);
                    return { vehicles: this.applyViewCounts(data), totalCount };
                }
            } catch (e) {
                console.error("Could not read or parse stale localStorage cache.", e);
            }
            // If there's no stale cache, re-throw the original error.
            throw error;
        }
    }

    public static async getFilterOptions(): Promise<any> {
        try {
            const { data, error } = await supabase.rpc('get_filter_options');
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching filter options:', error);
            return {};
        }
    }

    public static async getVehicleBySlug(slug: string): Promise<Vehicle | null> {
        if (!slug) return null;
        try {
            const { data, error } = await supabase
                .from('inventario_cache')
                .select('*')
                .eq('slug', slug)
                .single();

            if (error) {
                if (error.code === 'PGRST116') return null;
                throw error;
            }
            if (data) {
                const normalized = this.normalizeVehicleData([data]);
                return this.recordVehicleView(normalized[0]);
            }
            return null;
        } catch (error) {
            console.error(`Error fetching vehicle by slug '${slug}':`, error);
            return null;
        }
    }

    public static async getAllVehicleSlugs(): Promise<{ slug: string }[]> {
        try {
            const { data, error } = await supabase
                .from('inventario_cache')
                .select('slug')
                .eq('ordenstatus', 'Comprado')
                .order('updated_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching all vehicle slugs:', error);
            return [];
        }
    }

    private static applyViewCounts(vehicles: Vehicle[]): Vehicle[] {
        const viewCounts = this.getViewCounts();
        return vehicles.map(vehicle => ({
            ...vehicle,
            view_count: viewCounts[vehicle.id] || vehicle.view_count || 0,
        }));
    }

        private static recordVehicleView(vehicle: Vehicle): Vehicle {

            // Fire-and-forget the RPC call to not block the UI

            supabase.rpc('increment_view_count', { p_vehicle_id: vehicle.id })

                .then(({ error }) => {

                    if (error) {

                        console.error(`[VehicleService] Error incrementing view count for vehicle ${vehicle.id}:`, error);

                    }

                });

    

            const viewCounts = this.getViewCounts();

            const newCount = (viewCounts[vehicle.id] || vehicle.view_count || 0) + 1;

            viewCounts[vehicle.id] = newCount;

            this.setViewCounts(viewCounts);

            this.addToRecentlyViewed(vehicle.id);

            return { ...vehicle, view_count: newCount };

        }

    private static getViewCounts = (): ViewCounts => {
        try {
            const counts = localStorage.getItem(this.VIEW_COUNT_KEY);
            return counts ? JSON.parse(counts) : {};
        } catch { return {}; }
    };
    
    private static setViewCounts = (counts: ViewCounts) => {
        try {
            localStorage.setItem(this.VIEW_COUNT_KEY, JSON.stringify(counts));
        } catch (error) { console.error("Failed to save view counts:", error); }
    };

    private static addToRecentlyViewed(vehicleId: number) {
        try {
            const rawData = localStorage.getItem(this.RECENTLY_VIEWED_KEY);
            const recentlyViewed: number[] = rawData ? JSON.parse(rawData) : [];
            const filtered = recentlyViewed.filter(id => id !== vehicleId);
            filtered.unshift(vehicleId);
            localStorage.setItem(this.RECENTLY_VIEWED_KEY, JSON.stringify(filtered.slice(0, 10)));
        } catch (error) { console.error("Failed to update recently viewed:", error); }
    }
    
    private static normalizeVehicleData(rawData: any[]): Vehicle[] {
        const safeParseFloat = (val: any, fallback = 0) => { const n = parseFloat(String(val).replace(/,/g, '')); return isNaN(n) ? fallback : n; };
        const safeParseInt = (val: any, fallback = 0) => { const n = parseInt(String(val).replace(/,/g, ''), 10); return isNaN(n) ? fallback : n; };

        return rawData.filter(Boolean).map((item) => {
            const title = item.title || `${item.marca || ''} ${item.modelo || ''} ${item.autoano || ''}`.trim() || 'Auto sin título';
            const slug = item.slug || generateSlug(title);
            
            let clasificacionid: string[] = [];
            if (Array.isArray(item.clasificacionid)) {
                clasificacionid = item.clasificacionid.map(String);
            } else if (typeof item.clasificacionid === 'string') {
                clasificacionid = item.clasificacionid.split(',').map((c: string) => c.trim()).filter(Boolean);
            }

            const sucursalMapping: Record<string, string> = { 'MTY': 'Monterrey', 'GPE': 'Guadalupe', 'TMPS': 'Reynosa', 'COAH': 'Saltillo' };
            let normalizedSucursales: string[] = [];
            if (Array.isArray(item.ubicacion)) {
                normalizedSucursales = item.ubicacion.map((s: string) => sucursalMapping[s.trim().toUpperCase()] || s.trim()).filter(Boolean);
            } else if (typeof item.ubicacion === 'string') {
                normalizedSucursales = item.ubicacion.split(',').map((s: string) => sucursalMapping[s.trim().toUpperCase()] || s.trim()).filter(Boolean);
            }

            const featureImage = [
                item.feature_image_url,
                ...(Array.isArray(item.feature_image) ? item.feature_image : []),
                ...(Array.isArray(item.fotos_exterior_url) ? item.fotos_exterior_url : []),
            ].find(isValidImageUrl);

            const exteriorGallery = [
                ...(Array.isArray(item.fotos_exterior_url) ? item.fotos_exterior_url : []),
                ...(Array.isArray(item.galeria_exterior) ? item.galeria_exterior : [])
            ];

            return {
                id: item.id,
                slug: slug,
                ordencompra: item.ordencompra,
                record_id: item.record_id || null,
                
                titulo: title,
                descripcion: item.descripcion,
                metadescripcion: item.metadescripcion,

                marca: item.marca,
                modelo: item.modelo,
                
                autoano: safeParseInt(item.autoano),
                precio: safeParseFloat(item.precio),
                kilometraje: safeParseInt(item.kilometraje), // As per user spec
                transmision: item.transmision,
                combustible: item.combustible,
                carroceria: item.carroceria,
                cilindros: safeParseInt(item.cilindros),
                
                enganchemin: safeParseFloat(item.enganchemin),
                enganche_recomendado: safeParseFloat(item.enganche_recomendado),
                mensualidad_minima: safeParseFloat(item.mensualidad_minima),
                mensualidad_recomendada: safeParseFloat(item.mensualidad_recomendada),
                plazomax: safeParseInt(item.plazomax),
                
                feature_image: featureImage ? [featureImage] : [],
                galeria_exterior: [...new Set(exteriorGallery.filter(isValidImageUrl))],
                fotos_exterior_url: [...new Set(exteriorGallery.filter(isValidImageUrl))],
                galeria_interior: Array.isArray(item.fotos_interior_url) ? [...new Set(item.fotos_interior_url.filter(isValidImageUrl))] : [],
                
                ubicacion: normalizedSucursales,
                sucursal: normalizedSucursales,
                
                garantia: item.garantia,
                
                vendido: !!item.vendido,
                separado: !!item.separado,
                ordenstatus: item.ordenstatus,
                
                clasificacionid: clasificacionid,
                
                promociones: Array.isArray(item.promociones) ? item.promociones : [],
                
                viewcount: safeParseInt(item.viewcount),

                // --- Compatibility Aliases ---
                title: title,
                price: safeParseFloat(item.precio),
                year: safeParseInt(item.autoano),
                kms: safeParseInt(item.kilometraje),
            } as Vehicle;
        });
    }


}

export default VehicleService;

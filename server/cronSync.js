const cron = require('node-cron');
const { createClient } = require('@supabase/supabase-js');
const Airtable = require('airtable');

// --- Configuration ---
const {
    VITE_SUPABASE_URL,
    SUPABASE_SERVICE_KEY,
    VITE_AIRTABLE_API_KEY,
    VITE_AIRTABLE_BASE_ID,
    VITE_AIRTABLE_TABLE_ID
} = process.env;

// --- Initialization ---
if (!VITE_SUPABASE_URL || !SUPABASE_SERVICE_KEY || !VITE_AIRTABLE_API_KEY || !VITE_AIRTABLE_BASE_ID || !VITE_AIRTABLE_TABLE_ID) {
    console.error('[SYNC_ERROR] Missing required environment variables. The sync script will not run.');
    // Do not exit in a server environment, just log the error
    return;
}
const supabase = createClient(VITE_SUPABASE_URL, SUPABASE_SERVICE_KEY);
const airtableBase = new Airtable({ apiKey: VITE_AIRTABLE_API_KEY }).base(VITE_AIRTABLE_BASE_ID);

let isSyncing = false;

async function fetchAllAirtableRecords() {
    console.log('[SYNC] Fetching all records from Airtable...');
    const allRecords = [];
    try {
        await airtableBase(VITE_AIRTABLE_TABLE_ID).select().eachPage((records, fetchNextPage) => {
            records.forEach(record => allRecords.push({ airtable_id: record.id, ...record.fields }));
            fetchNextPage();
        });
        console.log(`[SYNC] Successfully fetched ${allRecords.length} records from Airtable.`);
        return allRecords;
    } catch (error) {
        console.error('[SYNC_ERROR] Failed to fetch records from Airtable:', error);
        throw new Error('Airtable fetch failed.');
    }
}

function transformRecordsForSupabase(airtableRecords) {
    console.log('[SYNC] Transforming records for Supabase...');
    return airtableRecords.map(record => {
        return {
            airtable_id: record.airtable_id,
            slug: record['Slug'] || null,
            ordencompra: record['OrdenCompra'] || null,
            title: record['Vehicle Name'] || 'Auto sin título',
            descripcion: record['Descripcion'] || null,
            marca: record['Marca'] || 'Sin Marca',
            modelo: record['Modelo'] || null,
            autoano: record['Ano'] || 0,
            precio: record['Precio'] || 0,
            kilometraje: record['Kilometraje'] || 0,
            transmision: record['Transmision'] || 'N/A',
            combustible: record['Combustible'] || 'N/A',
            motor: record['Motor'] || null,
            cilindros: record['Cilindros'] || 0,
            enganche_minimo: record['Enganche Minimo'] || 0,
            enganche_recomendado: record['Enganche Recomendado'] || 0,
            mensualidad_minima: record['Mensualidad Minima'] || 0,
            mensualidad_recomendada: record['Mensualidad Recomendada'] || 0,
            plazomax: record['Plazo Maximo'] || 0,
            feature_image_url: record['Feature Image URL'] || null,
            fotos_exterior_url: record['Fotos Exterior URL'] || null,
            fotos_interior_url: record['Fotos Interior URL'] || null,
            ubicacion: record['Ubicacion'] || null,
            vendido: record['Vendido'] || false,
            separado: record['Separado'] || false,
            ordenstatus: record['OrdenStatus'] || null,
            clasificacionid: record['ClasificacionID'] || [],
            promociones: record['Promociones'] || [],
        };
    });
}

async function syncAirtableToSupabase() {
    if (isSyncing) {
        console.log('[SYNC] Sync job already in progress. Skipping this run.');
        return;
    }

    isSyncing = true;
    console.log('[SYNC] Starting Airtable to Supabase synchronization process.');
    const startTime = Date.now();

    try {
        const airtableRecords = await fetchAllAirtableRecords();
        if (!airtableRecords || airtableRecords.length === 0) {
            console.log('[SYNC] No records found in Airtable to sync.');
            return;
        }

        const supabaseRecords = transformRecordsForSupabase(airtableRecords);

        console.log(`[SYNC] Upserting ${supabaseRecords.length} records into Supabase...`);
        const { error } = await supabase
            .from('inventario_cache')
            .upsert(supabaseRecords, { onConflict: 'airtable_id' });

        if (error) {
            throw error;
        }

        const duration = (Date.now() - startTime) / 1000;
        console.log(`[SYNC] Successfully synced ${supabaseRecords.length} records in ${duration}s.`);

    } catch (error) {
        console.error('[SYNC_ERROR] The synchronization process failed:', error);
    } finally {
        isSyncing = false;
        console.log('[SYNC] Synchronization process finished.');
    }
}

// --- Cron Job Scheduling ---
console.log('[CRON] Initializing cron job to run every 10 minutes.');
cron.schedule('*/10 * * * *', syncAirtableToSupabase);

// Run once on startup
console.log('[SYNC] Performing initial sync on startup...');
// syncAirtableToSupabase();
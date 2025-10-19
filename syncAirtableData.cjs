const { createClient } = require('@supabase/supabase-js');
const Airtable = require('airtable');

// --- Configuration ---
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || 'patgjhCDUrCQ915MV.8595dc00077c25d786992f793e5370e4a45af5b6929668beb47ff49511ddb414';
const AIRTABLE_BASE_ID = 'appbOPKYqQRW2HgyB';
const AIRTABLE_TABLE_NAME = 'tblOjECDJDZlNv8At';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://jjepfehmuybpctdzipnu.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpqZXBmZWhtdXlicGN0ZHppcG51Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDE5OTYwMywiZXhwIjoyMDU5Nzc1NjAzfQ.KwSFEXOrtgwgIjMVG-czB73VWQIVDahgDvTdyL5qSQo';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const airtableBase = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID);

const RATE_LIMIT_DELAY_MS = 250; // ~4 requests per second

function logTime(msg) {
  console.log(`[${new Date().toISOString()}] ${msg}`);
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function syncAirtableToSupabase() {
  logTime('🚀 Starting Airtable to Supabase data sync...');
  let totalFetched = 0;
  let totalSynced = 0;

  try {
    logTime('📦 Fetching all "Comprado" records from Airtable in batches...');
    
    await airtableBase(AIRTABLE_TABLE_NAME).select({
      filterByFormula: "{OrdenStatus} = 'Comprado'",
      pageSize: 100 // Airtable's max page size
    }).eachPage(async (records, fetchNextPage) => {
      const pageNumber = Math.floor(totalFetched / 100) + 1;
      logTime(`Fetched page ${pageNumber} with ${records.length} records.`);
      totalFetched += records.length;

      const safeParseFloat = (val, fallback = 0) => { const n = parseFloat(String(val).replace(/,/g, '')); return isNaN(n) ? fallback : n; };
      const safeParseInt = (val, fallback = 0) => { const n = parseInt(String(val).replace(/,/g, ''), 10); return isNaN(n) ? fallback : n; };

      const supabaseData = records.map(record => {
        const fields = record.fields;
        return {
          record_id: record.id,
          title: fields['Auto'],
          slug: fields['slug'],
          marca: fields['Marca'],
          modelo: fields['Modelo'],
          autoano: safeParseInt(fields['AutoAño']),
          precio: safeParseFloat(fields['Precio']),
          kilometraje: safeParseInt(fields['kilometraje']),
          autotransmision: fields['Transmision'],
          combustible: fields['Combustible'],
          ordenstatus: fields['OrdenStatus'],
          vendido: fields['Vendido'] || false,
          separado: fields['Separado'] || false,
          ubicacion: fields['Ubicacion'],
          vin: fields['vin'],
          consigna: fields['consigna'] || false,    
          clasificacionid: fields['ClasificacionID'],
          viewcount: fields['viewCount'] || 0,
          AutoMotor: fields['AutoMotor'],
          cilindros: fields['AutoCilindros'],
          ordencompra: fields['OrdenCompra'],
          ingreso_inventario: fields['ingreso_inventario'], 
          descripcion: fields['descripcion'],  
          formulafinanciamiento: fields['FormulaFinanciamiento'],  
          garantia: fields['garantia'],
          feature_image: fields['feature_image_url'] ? fields['feature_image_url'].split(',').map(s => s.trim()) : [],
          mensualidad_minima: safeParseFloat(fields['mensualidad_minima']), 
          mensualidad_recomendada: safeParseFloat(fields['mensualidad_recomendada']),
          enganchemin: safeParseFloat(fields['enganche_minimo']),
          enganche_recomendado: safeParseFloat(fields['enganche_recomendado']),
          plazomax: safeParseInt(fields['PlazoMax']),
          numero_duenos: safeParseInt(fields['numero_duenos']),
          fotos_exterior_url: fields['fotos_exterior_url'] ? fields['fotos_exterior_url'].split(',').map(s => s.trim()) : [],
          fotos_interior_url: fields['fotos_interior_url'] ? fields['fotos_interior_url'].split(',').map(s => s.trim()) : [],
          created_at: fields['CreatedAt'] ? new Date(fields['CreatedAt']) : new Date(),
          updated_at: new Date()
        };
      });

      logTime(`🔄 Upserting batch of ${supabaseData.length} records to Supabase...`);
      const { error, count } = await supabase
        .from('inventario_cache')
        .upsert(supabaseData, { onConflict: 'record_id' });

      if (error) {
        console.error(`🚨 Failed to sync batch ${pageNumber}:`, error.message);
        // Log individual records for debugging
        for (const record of supabaseData) {
          try {
            await supabase.from('inventario_cache').upsert(record, { onConflict: 'record_id' });
          } catch (e) {
            console.error(`Failed record ID: ${record.record_id}`, e.message);
            console.error('Problematic record data:', record);
          }
        }
      } else {
        const syncedCount = count === null ? supabaseData.length : count;
        totalSynced += syncedCount;
        logTime(`✅ Successfully synced batch ${pageNumber}.`);
      }

      await sleep(RATE_LIMIT_DELAY_MS);
      fetchNextPage();
    });

    logTime(`✅ Fetched a total of ${totalFetched} records from Airtable.`);
    logTime(`🎉 Sync complete. Successfully synced ${totalSynced} of ${totalFetched} records to Supabase.`);

  } catch (error) {
    console.error('🚨 A critical error occurred during the sync process:', error.message);
  }
}

// Run the sync function
syncAirtableToSupabase();
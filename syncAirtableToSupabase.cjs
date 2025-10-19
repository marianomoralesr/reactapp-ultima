/**
 * Airtable → Supabase Image Sync Script (final optimized version)
 * - Runs immediately, then every 30 minutes
 * - Skips re-uploading images already in the bucket
 * - Updates last_synced_at in inventario_cache
 * - Non-overlapping scheduler (safe for long runs)
 */

const fetch = require('node-fetch');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');

// --- Configuration ---
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || 'patgjhCDUrCQ915MV.8595dc00077c25d786992f793e5370e4a45af5b6929668beb47ff49511ddb414';
const AIRTABLE_BASE_ID = 'appbOPKYqQRW2HgyB';
const AIRTABLE_TABLE_ID = 'tblOjECDJDZlNv8At';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://jjepfehmuybpctdzipnu.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpqZXBmZWhtdXlicGN0ZHppcG51Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDE5OTYwMywiZXhwIjoyMDU5Nzc1NjAzfQ.KwSFEXOrtgwgIjMVG-czB73VWQIVDahgDvTdyL5qSQo';
const SUPABASE_BUCKET_NAME = 'fotos_airtable';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// --- Utility: log timestamp ---
function logTime(msg) {
  console.log(`[${new Date().toISOString()}] ${msg}`);
}

// -----------------------------------------------------
// 1️⃣ Fetch Vehicles from Airtable
// -----------------------------------------------------
async function fetchFromAirtable() {
  logTime("📦 Fetching 'Comprado' vehicles from Airtable...");
  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}?filterByFormula=%7BOrdenStatus%7D%3D'Comprado'`;

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` },
  });

  if (!response.ok) {
    throw new Error(`Airtable API responded with status: ${response.status}`);
  }

  const data = await response.json();
  logTime(`✅ Fetched ${data.records.length} vehicles.`);
  return data.records;
}

// -----------------------------------------------------
// 2️⃣ Check if file already exists in bucket
// -----------------------------------------------------
async function isFileInFolder(vehicleId, type, fileName) {
  try {
    const folderPath = `${vehicleId}/${type}/`;
    const { data, error } = await supabase.storage
      .from(SUPABASE_BUCKET_NAME)
      .list(folderPath, { limit: 1000 });

    if (error) {
      console.error("Error listing storage folder:", error.message);
      return false;
    }

    return Array.isArray(data) && data.some(f => f.name === fileName);
  } catch (err) {
    console.error("isFileInFolder error:", err.message);
    return false;
  }
}

// -----------------------------------------------------
// 3️⃣ Download & Upload to Supabase (skip existing)
// -----------------------------------------------------
async function downloadAndUpload(url, vehicleId, type) {
  if (!url || typeof url !== 'string') return null;

  try {
    const fileName = path.basename(new URL(url).pathname);
    const supabasePath = `${vehicleId}/${type}/${fileName}`;

    // Skip if already uploaded
    if (await isFileInFolder(vehicleId, type, fileName)) {
      logTime(`⏭️ Skipped (already uploaded): ${supabasePath}`);
      const { data: publicUrlData } = supabase.storage
        .from(SUPABASE_BUCKET_NAME)
        .getPublicUrl(supabasePath);
      return publicUrlData?.publicUrl || null;
    }

    const response = await fetch(url);
    if (!response.ok) {
      console.error(`⚠️ Failed to download image: ${url} (status: ${response.status})`);
      return null;
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    const { error: uploadError } = await supabase.storage
      .from(SUPABASE_BUCKET_NAME)
      .upload(supabasePath, buffer, {
        contentType: response.headers.get('content-type') || 'application/octet-stream',
        upsert: false,
      });

    if (uploadError) {
      console.error(`❌ Upload error for ${supabasePath}:`, uploadError.message);
      return null;
    }

    const { data: publicUrlData } = supabase.storage
      .from(SUPABASE_BUCKET_NAME)
      .getPublicUrl(supabasePath);

    const publicUrl = publicUrlData?.publicUrl || null;
    if (publicUrl) logTime(`📤 Uploaded ${fileName} → ${publicUrl}`);
    return publicUrl;
  } catch (err) {
    console.error(`❌ Error processing image ${url}:`, err.message);
    return null;
  }
}

// -----------------------------------------------------
// 4️⃣ Process Airtable Record
// -----------------------------------------------------
async function processRecord(record) {
  const fields = record.fields || {};
  const vehicleId = fields.OrdenCompra || record.id;
  logTime(`🚗 Processing vehicle: ${vehicleId}`);

  const processField = async (fieldName) => {
    let urls = fields[fieldName] || [];
    if (!Array.isArray(urls)) {
      urls = String(urls || '').split(',').map(u => u.trim()).filter(Boolean);
    }
    if (urls.length === 0) return null;

    const uploaded = await Promise.all(urls.map(url => downloadAndUpload(url, vehicleId, fieldName)));
    const validUrls = uploaded.filter(Boolean);

    if (validUrls.length === 0) return null;
    if (fieldName === 'feature_image_url') return String(validUrls[0]);
    return validUrls.join(',');
  };

  const [feature, exterior, interior] = await Promise.all([
    processField('feature_image_url'),
    processField('fotos_exterior_url'),
    processField('fotos_interior_url'),
  ]);

  return {
    record_id: record.id,
    feature_image_url: feature,
    fotos_exterior_url: exterior,
    fotos_interior_url: interior,
    last_synced_at: new Date().toISOString(),
  };
}

// -----------------------------------------------------
// 5️⃣ Upsert to Supabase
// -----------------------------------------------------
async function updateSupabaseTable(updates) {
  logTime('🗂️ Updating Supabase inventario_cache table...');
  const validUpdates = updates.filter(u => u && u.record_id);

  if (validUpdates.length === 0) {
    console.warn('⚠️ No valid records to update.');
    return;
  }

  const { data, error } = await supabase
    .from('inventario_cache')
    .upsert(validUpdates, { onConflict: 'record_id' });

  if (error) {
    console.error('❌ Error updating Supabase table:', error.message);
  } else {
    logTime(`✅ Updated ${data?.length || validUpdates.length} records in Supabase.`);
  }
}

// -----------------------------------------------------
// 6️⃣ Main Runner (with overlap prevention)
// -----------------------------------------------------
let isRunning = false;

async function runSync() {
  if (isRunning) {
    logTime('⚙️ Previous sync still running, skipping this cycle.');
    return;
  }
  isRunning = true;

  try {
    const records = await fetchFromAirtable();
    const updates = [];

    for (const record of records) {
      const update = await processRecord(record);
      updates.push(update);
    }

    await updateSupabaseTable(updates);
    logTime('🎉 Sync complete.');
  } catch (err) {
    console.error('🚨 Sync failed:', err.message);
  } finally {
    isRunning = false;
  }
}

// -----------------------------------------------------
// 7️⃣ Run immediately and then every 30 minutes
// -----------------------------------------------------
runSync();
const THIRTY_MINUTES = 30 * 60 * 1000;
setInterval(runSync, THIRTY_MINUTES);
const env = (import.meta as any)?.env ?? {};

// --- Supabase Configuration ---
const SUPABASE_URL = 'https://jjepfehmuybpctdzipnu.supabase.co';
const SUPABASE_ANON_KEY ='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpqZXBmZWhtdXlicGN0ZHppcG51Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDE5OTYwMywiZXhwIjoyMDU5Nzc1NjAzfQ.KwSFEXOrtgwgIjMVG-czB73VWQIVDahgDvTdyL5qSQo';

// --- Airtable Configuration ---
const AIRTABLE_VALUATION_API_KEY = env.VITE_AIRTABLE_VALUATION_API_KEY || 'patgjhCDUrCQ915MV.8595dc00077c25d786992f793e5370e4a45af5b6929668beb47ff49511ddb414';
const AIRTABLE_VALUATION_BASE_ID = env.VITE_AIRTABLE_VALUATION_BASE_ID || 'appbOPKYqQRW2HgyB';
const AIRTABLE_VALUATION_TABLE_ID = env.VITE_AIRTABLE_VALUATION_TABLE_ID || 'tblGuvYLMnZXr6o8f';
const AIRTABLE_VALUATION_VIEW = env.VITE_AIRTABLE_VALUATION_VIEW || 'viwEQ9YuMH4Y7XMs9';
const AIRTABLE_LEAD_CAPTURE_API_KEY = env.VITE_AIRTABLE_LEAD_CAPTURE_API_KEY || 'patgjhCDUrCQ915MV.8595dc00077c25d786992f793e5370e4a45af5b6929668beb47ff49511ddb414';
const AIRTABLE_LEAD_CAPTURE_BASE_ID = env.VITE_AIRTABLE_LEAD_CAPTURE_BASE_ID || 'appbOPKYqQRW2HgyB';
const AIRTABLE_LEAD_CAPTURE_TABLE_ID = env.VITE_AIRTABLE_LEAD_CAPTURE_TABLE_ID || 'tblLFY58uCrcX7dPK';
const AIRTABLE_VALUATIONS_STORAGE_TABLE_ID = env.VITE_AIRTABLE_VALUATIONS_STORAGE_TABLE_ID || 'tbl66UyGNcOfOxQUm';

// --- Intelimotor API Configuration ---
const INTELIMOTOR_BUSINESS_UNIT_ID = env.VITE_INTELIMOTOR_BUSINESS_UNIT_ID || '629f91e85853b40012e58308';
const INTELIMOTOR_API_KEY = env.VITE_INTELIMOTOR_API_KEY || '920b45727bb711069c950bbda204182f883d5bd1b17a6d0c6ccd0d673dace457';
const INTELIMOTOR_API_SECRET = env.VITE_INTELIMOTOR_API_SECRET || 'ee4b975fb97eb1573624adfe45cb5c78ca53f3a002729e61b499dd182cb23a6a';

// --- Car Studio API Configuration ---
const CAR_STUDIO_API_KEY = env.VITE_CAR_STUDIO_API_KEY || 'AIzaSyBzx6k35qkY0FzG8RAwwDgMazCzdyA-AZ8';

// --- Webhook Configuration ---
const LEAD_CONNECTOR_WEBHOOK_URL = env.VITE_LEAD_CONNECTOR_WEBHOOK_URL || 'https://services.leadconnectorhq.com/hooks/LJhjk6eFZEHwptjuIF0a/webhook-trigger/eprKrEBZDa2DNegPGQ3T';
const LANDING_WEBHOOK_URL = env.VITE_LANDING_WEBHOOK_URL || 'https://hooks.airtable.com/workflows/v1/genericWebhook/appbOPKYqQRW2HgyB/wflQkAdsDbWeyGSIm/wtrb8ZF0GxoaZk2bf';
const APPLICATION_WEBHOOK_URL = env.VITE_APPLICATION_WEBHOOK_URL || 'https://services.leadconnectorhq.com/hooks/LJhjk6eFZEHwptjuIF0a/webhook-trigger/eprKrEBZDa2DNegPGQ3T';
const VALUATION_WEBHOOK_URL = env.VITE_VALUATION_WEBHOOK_URL || 'YOUR_VALUATION_WEBHOOK_URL';
const BREVO_WEBHOOK_URL = env.VITE_BREVO_WEBHOOK_URL || 'YOUR_BREVO_WEBHOOK_URL_HERE';

// --- CORS Proxy Configuration ---
const CORS_PROXY_URL = env.VITE_CORS_PROXY_URL || 'https://proxy.cors.sh/';

// --- Calendly Configuration ---
const CALENDLY_URL_MTY = env.VITE_CALENDLY_URL_MTY || 'https://calendly.com/trefa-monterrey/cita-monterrey?month=2025-09';
const CALENDLY_URL_TMPS = env.VITE_CALENDLY_URL_TMPS || 'https://calendly.com/trefa-reynosa/cita-reynosa?month=2025-09';
const CALENDLY_URL_COAH = env.VITE_CALENDLY_URL_COAH || 'https://calendly.com/trefa-saltillo/cita-saltillo?month=2025-09';
const CALENDLY_URL_GPE = env.VITE_CALENDLY_URL_GPE || 'https://calendly.com/trefa-guadalupe/cita-guadalupe?month=2025-09';

export const config = {
    supabase: {
        url: SUPABASE_URL,
        anonKey: SUPABASE_ANON_KEY,
    },
    airtable: {
        valuation: {
            apiKey: AIRTABLE_VALUATION_API_KEY,
            baseId: AIRTABLE_VALUATION_BASE_ID,
            tableId: AIRTABLE_VALUATION_TABLE_ID,
            view: AIRTABLE_VALUATION_VIEW,
            storageTableId: AIRTABLE_VALUATIONS_STORAGE_TABLE_ID,
        },
        leadCapture: {
            apiKey: AIRTABLE_LEAD_CAPTURE_API_KEY,
            baseId: AIRTABLE_LEAD_CAPTURE_BASE_ID,
            tableId: AIRTABLE_LEAD_CAPTURE_TABLE_ID,
        },
    },
    intelimotor: {
        businessUnitId: INTELIMOTOR_BUSINESS_UNIT_ID,
        apiKey: INTELIMOTOR_API_KEY,
        apiSecret: INTELIMOTOR_API_SECRET,
    },
    carStudio: {
        apiKey: CAR_STUDIO_API_KEY,
    },
    webhooks: {
        leadConnector: LEAD_CONNECTOR_WEBHOOK_URL,
        landing: LANDING_WEBHOOK_URL,
        application: APPLICATION_WEBHOOK_URL,
        valuation: VALUATION_WEBHOOK_URL,
        brevo: BREVO_WEBHOOK_URL,
    },
    proxy: {
        url: CORS_PROXY_URL,
    },
    calendly: {
        MTY: CALENDLY_URL_MTY,
        TMPS: CALENDLY_URL_TMPS,
        COAH: CALENDLY_URL_COAH,
        GPE: CALENDLY_URL_GPE,
    }
};

export const getEmailRedirectUrl = (): string => {
  const isProduction = (import.meta as any).env.MODE === 'production';
  if (isProduction) {
    return window.location.origin;
  } else {
    return window.location.origin;
  }
};
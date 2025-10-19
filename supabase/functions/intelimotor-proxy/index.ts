import "jsr:@supabase/functions-js/edge-runtime.d.ts"

const INTELIMOTOR_API_KEY = Deno.env.get('INTELIMOTOR_API_KEY');
const INTELIMOTOR_API_SECRET = Deno.env.get('INTELIMOTOR_API_SECRET');
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  try {
    const { endpoint, method, body } = await req.json();

    if (!endpoint) {
      return new Response(JSON.stringify({ error: 'endpoint is required' }), {
        status: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    const intelimotorUrl = `https://api.intelimotor.com/api/${endpoint}`;
    
    const headers = new Headers({
      'Content-Type': 'application/json',
      'X-Api-Key': INTELIMOTOR_API_KEY,
      'X-Api-Secret': INTELIMOTOR_API_SECRET,
    });

    const fetchOptions: RequestInit = {
      method: method || 'POST',
      headers,
    };

    if (method !== 'GET' && body) {
      fetchOptions.body = JSON.stringify(body);
    }

    const intelimotorResponse = await fetch(intelimotorUrl, fetchOptions);
    const data = await intelimotorResponse.json();

    return new Response(JSON.stringify(data), {
      status: intelimotorResponse.status,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }
});

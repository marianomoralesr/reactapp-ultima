import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const AIRTABLE_API_KEY = Deno.env.get('AIRTABLE_API_KEY');
const INTELIMOTOR_API_KEY = Deno.env.get('INTELIMOTOR_API_KEY');
const INTELIMOTOR_API_SECRET = Deno.env.get('INTELIMOTOR_API_SECRET');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { url, method, headers, body } = await req.json();
    const targetUrl = new URL(url);

    let response;
    if (targetUrl.hostname.includes('api.airtable.com')) {
      response = await fetch(url, {
        method,
        headers: {
          ...headers,
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        },
        body: body ? JSON.stringify(body) : null,
      });
    } else if (targetUrl.hostname.includes('intelimotor.com')) {
      response = await fetch(url, {
        method,
        headers: {
          ...headers,
          'X-Api-Key': INTELIMOTOR_API_KEY,
          'X-Api-Secret': INTELIMOTOR_API_SECRET,
        },
        body: body ? JSON.stringify(body) : null,
      });
    } else {
      return new Response(JSON.stringify({ error: 'Invalid target URL' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

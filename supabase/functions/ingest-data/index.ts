import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    let device_id, lat, lon, ax, ay, az, src, p_dist, Pair_id;
    const url = new URL(req.url);

    if (req.method === 'GET') {
      device_id = url.searchParams.get('device_id');
      lat = parseFloat(url.searchParams.get('lat') || '0');
      lon = parseFloat(url.searchParams.get('lon') || '0');
      ax = parseFloat(url.searchParams.get('ax') || '0');
      ay = parseFloat(url.searchParams.get('ay') || '0');
      az = parseFloat(url.searchParams.get('az') || '0');
      src = url.searchParams.get('src') || 'GPS';
      p_dist = parseFloat(url.searchParams.get('p_dist') || '0');
      Pair_id = parseInt(url.searchParams.get('Pair_id') || '0');
    } else {
      const body = await req.json();
      ({ device_id, lat, lon, ax, ay, az, src, p_dist, Pair_id } = body);
    }

    // Basic validation
    if (!device_id) {
       return new Response(JSON.stringify({ error: 'Missing required field: device_id' }), {
         status: 400,
         headers: { ...corsHeaders, 'Content-Type': 'application/json' },
       });
    }

    const { error } = await supabaseClient
      .from('sensor_readings')
      .insert({
        device_id,
        latitude: lat,
        longitude: lon,
        ax: ax || 0,
        ay: ay || 0,
        az: az || 0,
        src: src || 'GPS',
        p_dist: p_dist || 0,
        pair_id: Pair_id || 0,
      });

    if (error) {
      console.error('Supabase insert error:', error);
      throw error;
    }

    return new Response(JSON.stringify({ success: true, message: 'Data ingested successfully' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

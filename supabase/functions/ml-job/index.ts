import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const QUEUE_URL = Deno.env.get('BULLMQ_REDIS_URL');

serve(async (req) => {
  if (!QUEUE_URL) return new Response('Queue not configured', { status: 500 });
  const payload = await req.json();
  const res = await fetch(`${Deno.env.get('ML_SERVICE_QUEUE_URL') ?? ''}/enqueue`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    return new Response(await res.text(), { status: res.status });
  }
  return new Response('enqueued');
});

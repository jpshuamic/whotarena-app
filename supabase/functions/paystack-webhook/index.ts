/**
 * Paystack deposit webhook (Section 12)
 * Verifies signature, credits real_balance in kobo.
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

function createJsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function fetchSupabase(path: string, options: RequestInit = {}) {
  const url = `${SUPABASE_URL.replace(/\/?$/, '')}${path}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SUPABASE_KEY}`,
      apikey: SUPABASE_KEY,
      ...(options.headers ?? {}),
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Supabase request failed ${response.status}: ${text}`);
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

async function verifySignature(secret: string, payload: string, signature: string) {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-512' },
    false,
    ['sign'],
  );
  const digest = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(payload));
  const hashArray = Array.from(new Uint8Array(digest));
  const computed = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  return computed === signature;
}

serve(async (req) => {
  if (req.method !== 'POST') {
    return createJsonResponse({ error: 'Method not allowed' }, 405);
  }

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return createJsonResponse({ error: 'Supabase backend not configured' }, 500);
  }

  const signature = req.headers.get('x-paystack-signature');
  if (!signature) {
    return createJsonResponse({ error: 'Missing Paystack signature' }, 400);
  }

  const bodyText = await req.text();
  let payload: any;

  try {
    payload = JSON.parse(bodyText);
  } catch {
    return createJsonResponse({ error: 'Invalid JSON payload' }, 400);
  }

  if (!(await verifySignature(Deno.env.get('PAYSTACK_SECRET_KEY') ?? '', bodyText, signature))) {
    return createJsonResponse({ error: 'Invalid Paystack signature' }, 401);
  }

  const event = payload.event;
  const data = payload.data;

  if (!event || !data) {
    return createJsonResponse({ error: 'Malformed Paystack payload' }, 400);
  }

  if (event === 'charge.success' && data.status === 'success') {
    const playerId = String(data.metadata?.player_id ?? data.metadata?.playerId ?? '');
    if (!playerId) {
      return createJsonResponse({ error: 'Missing player_id in metadata' }, 400);
    }

    const reference = String(data.reference);
    const amount = Number(data.amount);

    const existing = await fetchSupabase(`/rest/v1/transactions?reference=eq.${encodeURIComponent(reference)}`);
    const existingTransaction = Array.isArray(existing) ? existing[0] : null;

    if (existingTransaction?.status === 'completed') {
      return createJsonResponse({ ok: true, event, message: 'Already processed' });
    }

    if (!existingTransaction) {
      await fetchSupabase('/rest/v1/transactions', {
        method: 'POST',
        body: JSON.stringify({
          player_id: playerId,
          type: 'deposit',
          amount,
          status: 'completed',
          reference,
        }),
      });
    } else {
      await fetchSupabase(`/rest/v1/transactions?reference=eq.${encodeURIComponent(reference)}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'completed', amount }),
      });
    }

    await fetchSupabase('/rpc/increment_profile_balance', {
      method: 'POST',
      body: JSON.stringify({ profile_uuid: playerId, delta: amount }),
    });

    return createJsonResponse({ ok: true, event });
  }

  if (event === 'transfer.success' && data.status === 'success') {
    const reference = String(data.reference);
    await fetchSupabase(`/rest/v1/transactions?reference=eq.${encodeURIComponent(reference)}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'completed' }),
    });
    return createJsonResponse({ ok: true, event });
  }

  if (event === 'transfer.failed') {
    const reference = String(data.reference);
    await fetchSupabase(`/rest/v1/transactions?reference=eq.${encodeURIComponent(reference)}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'failed' }),
    });
    return createJsonResponse({ ok: true, event });
  }

  return createJsonResponse({ ok: true, event, handled: false });
});

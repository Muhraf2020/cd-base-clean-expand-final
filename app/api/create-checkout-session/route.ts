// app/api/create-checkout-session/route.ts
import { NextResponse } from 'next/server';

function getBaseUrl() {
  const base =
    (process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://dermaclinicnearme.com').replace(/\/$/, '');
  return base;
}
function form(body: Record<string, string>) {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(body)) p.append(k, v);
  return p;
}

const MAP_ENV: Record<string, string> = {
  price_basic_monthly: 'STRIPE_BASIC_PRICE_ID',
  price_premium_monthly: 'STRIPE_PREMIUM_PRICE_ID',
  price_enterprise_monthly: 'STRIPE_ENTERPRISE_PRICE_ID',
};

async function resolvePriceIdFromProduct(sk: string, productId: string) {
  const r = await fetch(`https://api.stripe.com/v1/prices?product=${encodeURIComponent(productId)}&active=true&limit=100`, {
    headers: { Authorization: `Bearer ${sk}` },
  });
  const j = await r.json();
  if (j?.error) throw new Error(j.error.message);
  const prices: any[] = Array.isArray(j?.data) ? j.data : [];
  if (!prices.length) throw new Error(`Product ${productId} has no active Prices.`);
  const recurring = prices.find((p) => !!p.recurring);
  return (recurring?.id || prices[0].id) as string;
}

export async function POST(req: Request) {
  try {
    const { priceId, packageName } = await req.json();

    const sk = (process.env.STRIPE_SECRET_KEY || '').trim();
    if (!sk) return NextResponse.json({ error: 'STRIPE_SECRET_KEY missing.' }, { status: 500 });

    // Resolve identifier (check mapped keys FIRST, then direct price_/prod_ IDs)
    let identifier = '';
    if (priceId in MAP_ENV) {
      // This is a mapped key like 'price_basic_monthly'
      const envName = MAP_ENV[priceId];
      const envVal = (process.env[envName] || '').trim();
      if (!envVal) {
        return NextResponse.json({ 
          error: `Missing environment variable ${envName} for package "${packageName}". Please contact support or set ${envName} in your environment variables.` 
        }, { status: 400 });
      }
      identifier = envVal;
    } else if (typeof priceId === 'string' && priceId.length > 15 && (priceId.startsWith('price_') || priceId.startsWith('prod_'))) {
      // This looks like a real Stripe ID (e.g., price_1234567890abcdef or prod_1234567890abcdef)
      // Real Stripe IDs are longer than 15 characters
      identifier = priceId.trim();
    } else {
      return NextResponse.json({ 
        error: `Invalid price configuration for "${packageName}". Please contact support.` 
      }, { status: 400 });
    }

    let finalPriceId = identifier;
    if (identifier.startsWith('prod_')) {
      finalPriceId = await resolvePriceIdFromProduct(sk, identifier);
    }

    // Inspect the price to pick mode
    const priceRes = await fetch(`https://api.stripe.com/v1/prices/${finalPriceId}`, {
      headers: { Authorization: `Bearer ${sk}` },
    });
    const price = await priceRes.json();
    if (price?.error) return NextResponse.json({ error: price.error.message }, { status: 400 });

    const mode: 'payment' | 'subscription' = price.recurring ? 'subscription' : 'payment';
    const site = getBaseUrl();

    // Create Checkout session
    const sessionRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${sk}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: form({
        mode,
        'line_items[0][price]': finalPriceId,
        'line_items[0][quantity]': '1',
        success_url: `${site}/advertise/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${site}/advertise?canceled=true`,
        ...(packageName ? { 'metadata[packageName]': String(packageName) } : {}),
      }),
    });

    const session = await sessionRes.json();
    if (session?.error) return NextResponse.json({ error: session.error.message }, { status: 400 });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('Stripe checkout error:', err);
    return NextResponse.json({ error: err?.message || 'Unexpected error.' }, { status: 500 });
  }
}

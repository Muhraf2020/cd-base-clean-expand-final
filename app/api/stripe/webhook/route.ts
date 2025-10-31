// app/api/stripe/webhook/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Helpers
const enc = new TextEncoder();
function toHex(ab: ArrayBuffer) {
  return [...new Uint8Array(ab)].map(b => b.toString(16).padStart(2, '0')).join('');
}
function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let res = 0;
  for (let i = 0; i < a.length; i++) res |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return res === 0;
}
async function hmacSHA256(secret: string, payload: string) {
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(payload));
  return toHex(sig);
}

export async function POST(req: Request) {
  const secret = (process.env.STRIPE_WEBHOOK_SECRET || '').trim();
  if (!secret) {
    console.error('Missing STRIPE_WEBHOOK_SECRET');
    return NextResponse.json({ ok: true }, { status: 200 }); // avoid retries but log
  }

  const sigHeader = req.headers.get('stripe-signature') || '';
  const raw = await req.text(); // raw body for signature verification

  // Parse Stripe-Signature header: t=timestamp, v1=signature
  const parts = Object.fromEntries(
    sigHeader.split(',').map(kv => kv.split('=').map(s => s.trim()))
  ) as Record<string, string>;
  const timestamp = parts['t'];
  const v1 = parts['v1'];

  if (!timestamp || !v1) {
    return NextResponse.json({ error: 'Bad signature header' }, { status: 400 });
  }

  // Optional: reject if too old (5 min)
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - Number(timestamp)) > 300) {
    return NextResponse.json({ error: 'Timestamp outside tolerance' }, { status: 400 });
  }

  // Compute expected HMAC over `${t}.${raw}`
  const payload = `${timestamp}.${raw}`;
  const expected = await hmacSHA256(secret, payload);
  if (!timingSafeEqual(expected, v1)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Verified: handle the event
  const event = JSON.parse(raw);

  // Initialize Supabase
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase not configured for webhook');
    return NextResponse.json({ received: true }, { status: 200 });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        console.log('Checkout session completed:', session.id);

        // Check if subscription record already exists
        const { data: existing } = await supabase
          .from('subscriptions')
          .select('id')
          .eq('stripe_session_id', session.id)
          .single();

        if (!existing && session.payment_status === 'paid') {
          // Create subscription record (will be linked to submission later)
          const subscriptionData = {
            stripe_customer_id: session.customer,
            stripe_subscription_id: session.subscription || null,
            stripe_session_id: session.id,
            package_name: session.metadata?.packageName || 'Unknown',
            package_price_id: session.mode === 'subscription' 
              ? (session.subscription_details?.items?.[0]?.price || '') 
              : '',
            status: 'active',
            customer_email: session.customer_details?.email || session.customer_email || null,
            customer_name: session.customer_details?.name || null,
            subscription_start: new Date().toISOString(),
          };

          await supabase
            .from('subscriptions')
            .insert([subscriptionData]);

          console.log('Subscription record created for session:', session.id);
        }
        break;
      }

      case 'customer.subscription.created': {
        const subscription = event.data.object;
        console.log('Subscription created:', subscription.id);

        // Update subscription record with period info
        await supabase
          .from('subscriptions')
          .update({
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            status: subscription.status,
          })
          .eq('stripe_subscription_id', subscription.id);

        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        console.log('Subscription updated:', subscription.id, 'Status:', subscription.status);

        // Update subscription status
        await supabase
          .from('subscriptions')
          .update({
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id);

        // If subscription is cancelled or expired, remove featured status
        if (['canceled', 'unpaid', 'past_due'].includes(subscription.status)) {
          const { data: subData } = await supabase
            .from('subscriptions')
            .select('id')
            .eq('stripe_subscription_id', subscription.id)
            .single();

          if (subData) {
            await supabase
              .from('clinics')
              .update({
                featured_clinic: false,
                featured_package: null,
                featured_until: null,
              })
              .eq('subscription_id', subData.id);

            console.log('Removed featured status due to subscription status:', subscription.status);
          }
        }

        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        console.log('Subscription deleted:', subscription.id);

        // Mark subscription as canceled
        const { data: subData } = await supabase
          .from('subscriptions')
          .update({
            status: 'canceled',
            subscription_end: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id)
          .select()
          .single();

        // Remove featured status from associated clinics
        if (subData) {
          await supabase
            .from('clinics')
            .update({
              featured_clinic: false,
              featured_package: null,
              featured_until: null,
              subscription_id: null,
            })
            .eq('subscription_id', subData.id);

          console.log('Removed featured status due to subscription deletion');
        }

        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object;
        console.log('Invoice paid:', invoice.id, 'Subscription:', invoice.subscription);

        // Update subscription status to active if it was past_due
        if (invoice.subscription) {
          await supabase
            .from('subscriptions')
            .update({ status: 'active' })
            .eq('stripe_subscription_id', invoice.subscription);
        }

        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        console.log('Invoice payment failed:', invoice.id, 'Subscription:', invoice.subscription);

        // Update subscription status to past_due
        if (invoice.subscription) {
          await supabase
            .from('subscriptions')
            .update({ status: 'past_due' })
            .eq('stripe_subscription_id', invoice.subscription);
        }

        break;
      }

      default:
        console.log('Unhandled event type:', event.type);
        break;
    }
  } catch (e) {
    console.error('Webhook handler error:', e);
    // Return 200 so Stripe doesn't retry forever; log for investigation
  }

  return NextResponse.json({ received: true }, { status: 200 });
}

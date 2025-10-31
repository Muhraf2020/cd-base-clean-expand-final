// app/api/verify-session/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing session_id parameter' },
        { status: 400 }
      );
    }

    const sk = (process.env.STRIPE_SECRET_KEY || '').trim();
    if (!sk) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Retrieve the checkout session from Stripe
    const response = await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${sessionId}?expand[]=customer&expand[]=subscription`,
      {
        headers: {
          'Authorization': `Bearer ${sk}`,
        },
      }
    );

    const session = await response.json();

    if (session.error) {
      return NextResponse.json(
        { error: session.error.message },
        { status: 400 }
      );
    }

    // Verify payment was successful
    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 400 }
      );
    }

    // Return session data
    return NextResponse.json({
      session: {
        id: session.id,
        customer_id: session.customer,
        customer_email: session.customer_details?.email || session.customer_email,
        subscription_id: session.subscription,
        payment_status: session.payment_status,
        amount_total: session.amount_total,
        currency: session.currency,
        metadata: session.metadata || {},
      },
    });
  } catch (error) {
    console.error('Session verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify session' },
      { status: 500 }
    );
  }
}

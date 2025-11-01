// app/api/send-comparison/route.ts
import { NextResponse } from 'next/server';

// NOTE:
// This is a stub endpoint for production deploy.
// It pretends success so the UI works, but it does NOT send an email.
// We removed the `resend` import so Cloudflare can build.

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // We accept whatever CompareModal sends us, but we don't actually
    // generate email yet in production
    const { email, userName, clinics } = body || {};

    console.log('[send-comparison STUB] request received', {
      email,
      userName,
      clinicsCount: Array.isArray(clinics) ? clinics.length : 0,
    });

    // basic validation just so the frontend gets predictable responses
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email address is required' },
        { status: 400 }
      );
    }

    if (!Array.isArray(clinics) || clinics.length < 2) {
      return NextResponse.json(
        { error: 'At least 2 clinics are required for comparison' },
        { status: 400 }
      );
    }

    // Fake success response so the modal can show "Email sent!"
    return NextResponse.json(
      {
        ok: true,
        message:
          'Stub mode: comparison captured. Email sending is currently disabled in production.',
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('[send-comparison STUB] error parsing request body:', err);
    return NextResponse.json(
      { error: 'Bad request' },
      { status: 400 }
    );
  }
}

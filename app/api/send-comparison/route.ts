// app/api/send-comparison/route.ts
import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { ComparisonEmailTemplate } from '@/emails/comparison-template';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, userName, clinics } = body;

    // Validation
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

    if (clinics.length > 4) {
      return NextResponse.json(
        { error: 'Maximum 4 clinics can be compared' },
        { status: 400 }
      );
    }

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: 'Derma Finder <noreply@dermaclinicnearme.com>',
      to: [email],
      subject: `Dermatology Clinic Comparison Report - ${clinics.length} Clinics`,
      react: ComparisonEmailTemplate({ 
        clinics, 
        userName: userName || 'there' 
      }),
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json(
        { error: 'Failed to send email. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Comparison email sent successfully!',
      emailId: data?.id,
    });

  } catch (error) {
    console.error('Send comparison error:', error);
    return NextResponse.json(
      { error: 'An error occurred while sending email.' },
      { status: 500 }
    );
  }
}

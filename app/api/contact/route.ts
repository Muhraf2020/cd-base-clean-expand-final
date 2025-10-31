import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const data = await request.json();

    if (!data.name || !data.email || !data.clinicName) {
      return NextResponse.json(
        { success: false, message: 'Please fill in required fields.' },
        { status: 400 }
      );
    }

    // Check if Supabase is configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase credentials not configured');
      return NextResponse.json(
        { success: false, message: 'Database configuration error. Please contact support.' },
        { status: 500 }
      );
    }

    const contactSubmission = {
      name: data.name,
      email: data.email,
      clinic_name: data.clinicName,
      phone: data.phone || null,
      package: data.package || null,
      message: data.message || null,
      type: 'advertising_inquiry',
      submitted_at: new Date().toISOString()
    };

    // Store in Supabase
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { error } = await supabase
      .from('contact_submissions')
      .insert([contactSubmission]);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to submit. Please try again later.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Thank you! We will contact you shortly.' 
    });

  } catch (error) {
    console.error('Contact submission error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred. Please try again.' },
      { status: 500 }
    );
  }
}

// app/api/submit-advertising/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Validate required fields
    if (!data.clinic_name || !data.contact_name || !data.contact_email || 
        !data.contact_phone || !data.stripe_session_id || !data.package_name ||
        !data.street_address || !data.city || !data.state_code || !data.postal_code) {
      return NextResponse.json(
        { error: 'Please fill in all required fields.' },
        { status: 400 }
      );
    }

    // Check Supabase configuration
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase credentials not configured');
      return NextResponse.json(
        { error: 'Database configuration error. Please contact support.' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. First, verify the Stripe session and get subscription info
    const sk = (process.env.STRIPE_SECRET_KEY || '').trim();
    if (!sk) {
      return NextResponse.json(
        { error: 'Stripe configuration error' },
        { status: 500 }
      );
    }

    const sessionResponse = await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${data.stripe_session_id}?expand[]=customer&expand[]=subscription`,
      {
        headers: { 'Authorization': `Bearer ${sk}` },
      }
    );

    const session = await sessionResponse.json();

    if (session.error || session.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Invalid or unpaid session' },
        { status: 400 }
      );
    }

    // 2. Check if subscription already exists (prevent duplicate submissions)
    const { data: existingSub } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('stripe_session_id', data.stripe_session_id)
      .single();

    let subscriptionId;

    if (!existingSub) {
      // 3. Create subscription record
      const subscriptionData = {
        stripe_customer_id: session.customer,
        stripe_subscription_id: session.subscription,
        stripe_session_id: data.stripe_session_id,
        package_name: data.package_name,
        package_price_id: session.mode === 'subscription' ? session.subscription?.items?.data[0]?.price?.id : '',
        status: 'active',
        customer_email: data.contact_email,
        customer_name: data.contact_name,
        subscription_start: new Date().toISOString(),
        current_period_start: session.subscription?.current_period_start 
          ? new Date(session.subscription.current_period_start * 1000).toISOString() 
          : new Date().toISOString(),
        current_period_end: session.subscription?.current_period_end 
          ? new Date(session.subscription.current_period_end * 1000).toISOString() 
          : null,
      };

      const { data: newSub, error: subError } = await supabase
        .from('subscriptions')
        .insert([subscriptionData])
        .select()
        .single();

      if (subError) {
        console.error('Subscription creation error:', subError);
        return NextResponse.json(
          { error: 'Failed to create subscription record' },
          { status: 500 }
        );
      }

      subscriptionId = newSub.id;
    } else {
      subscriptionId = existingSub.id;
    }

    // 4. Check if submission already exists for this session
    const { data: existingSubmission } = await supabase
      .from('advertising_submissions')
      .select('id')
      .eq('stripe_session_id', data.stripe_session_id)
      .single();

    if (existingSubmission) {
      return NextResponse.json(
        { error: 'Submission already exists for this session' },
        { status: 400 }
      );
    }

    // 5. Create advertising submission
    const submissionData = {
      subscription_id: subscriptionId,
      stripe_session_id: data.stripe_session_id,
      package_name: data.package_name,
      
      // Clinic identification
      existing_clinic_place_id: data.is_existing_clinic === 'existing' ? data.existing_clinic_place_id : null,
      
      // Clinic details
      clinic_name: data.clinic_name,
      contact_name: data.contact_name,
      contact_email: data.contact_email,
      contact_phone: data.contact_phone,
      
      // Address
      street_address: data.street_address,
      city: data.city,
      state_code: data.state_code,
      postal_code: data.postal_code,
      
      // Additional info
      website: data.website || null,
      clinic_description: data.clinic_description || null,
      services_offered: data.services_offered || [],
      special_offers: data.special_offers || null,
      
      // Preferences
      preferred_contact_method: data.preferred_contact_method || 'email',
      best_contact_time: data.best_contact_time || null,
      
      // Status
      submission_status: 'pending',
      submitted_at: new Date().toISOString(),
    };

    const { error: submissionError } = await supabase
      .from('advertising_submissions')
      .insert([submissionData]);

    if (submissionError) {
      console.error('Submission error:', submissionError);
      return NextResponse.json(
        { error: 'Failed to submit. Please try again.' },
        { status: 500 }
      );
    }

    // 6. Send notification email (optional - you can implement this later)
    // await sendNotificationEmail(data);

    return NextResponse.json({
      success: true,
      message: 'Submission received successfully! We will activate your listing within 24-48 hours.',
    });

  } catch (error) {
    console.error('Submission error:', error);
    return NextResponse.json(
      { error: 'An error occurred. Please try again.' },
      { status: 500 }
    );
  }
}

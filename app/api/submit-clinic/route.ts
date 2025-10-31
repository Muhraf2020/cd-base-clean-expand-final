import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateClinicSlug } from '@/lib/utils';

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Validate required fields
    if (!data.display_name || !data.city || !data.state_code || !data.phone || !data.email || !data.website) {
      return NextResponse.json(
        { success: false, message: 'Please fill in all required fields.' },
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

    // Build opening hours from dropdowns
    const weekdayDescriptions = [];
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    for (let i = 0; i < days.length; i++) {
      const openTime = data[`${days[i]}_open`];
      const closeTime = data[`${days[i]}_close`];
      
      if (openTime === 'Closed') {
        weekdayDescriptions.push(`${dayNames[i]}: Closed`);
      } else {
        weekdayDescriptions.push(`${dayNames[i]}: ${openTime} - ${closeTime}`);
      }
    }

    // Generate slug
    const baseSlug = generateClinicSlug(data.display_name, data.city, data.state_code);

    // Parse location if provided
    let location = null;
    if (data.latitude && data.longitude) {
      location = {
        lat: parseFloat(data.latitude),
        lng: parseFloat(data.longitude)
      };
    }

    // Build clinic submission object
    const clinicSubmission = {
      place_id: `manual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      display_name: data.display_name,
      formatted_address: data.formatted_address,
      location: location,
      primary_type: 'skin_care_clinic',
      types: ['skin_care_clinic', 'health', 'point_of_interest', 'establishment'],
      rating: null,
      user_rating_count: null,
      current_open_now: null,
      phone: data.phone,
      international_phone_number: data.international_phone || null,
      email: data.email,
      opening_hours: {
        open_now: null,
        weekday_text: weekdayDescriptions
      },
      website: data.website,
      google_maps_uri: data.google_maps_uri || null,
      business_status: 'OPERATIONAL',
      accessibility_options: data.accessibility_wheelchair ? {
        wheelchairAccessibleEntrance: true
      } : null,
      parking_options: {
        freeParking: data.parking_free || false,
        paidParking: data.parking_paid || false,
        parkingAvailable: data.parking_available || false
      },
      payment_options: {
        acceptsCreditCards: data.payment_credit_cards || false,
        acceptsDebitCards: data.payment_debit_cards || false,
        acceptsCashOnly: data.payment_cash_only || false,
        acceptsNfc: data.payment_nfc || false
      },
      price_level: null,
      city: data.city,
      state_code: data.state_code,
      postal_code: data.postal_code,
      photos: [],
      slug: baseSlug,
      submission_type: 'manual',
      status: 'pending',
      submitted_at: new Date().toISOString()
    };

    // Store in Supabase
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { error } = await supabase
      .from('clinic_submissions')
      .insert([clinicSubmission]);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to submit. Please try again later.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Clinic submitted successfully! We will review it shortly.' 
    });

  } catch (error) {
    console.error('Submission error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred. Please try again later.' },
      { status: 500 }
    );
  }
}

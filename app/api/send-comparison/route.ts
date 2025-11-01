// app/api/send-comparison/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { render } from '@react-email/render';
import { ComparisonEmailTemplate } from '@/emails/comparison-template';

export async function POST(request: Request) {
  try {
    // Initialize Resend and Supabase inside the function
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase configuration');
      return NextResponse.json(
        { error: 'Service configuration error. Please try again later.' },
        { status: 500 }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { name, email, clinics } = await request.json();

    // Validation
    if (!name || !email || !clinics || !Array.isArray(clinics) || clinics.length < 2) {
      return NextResponse.json(
        { error: 'Please provide your name, email, and at least 2 clinics to compare.' },
        { status: 400 }
      );
    }

    // Validate name (at least 2 characters)
    if (name.trim().length < 2) {
      return NextResponse.json(
        { error: 'Please provide a valid name.' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    // Limit to max 4 clinics
    if (clinics.length > 4) {
      return NextResponse.json(
        { error: 'Maximum 4 clinics can be compared at once.' },
        { status: 400 }
      );
    }

    // Step 1: Create or get user from database
    let userId: string;
    
    // Check if user exists
    const { data: existingUser, error: userFetchError } = await supabase
      .from('users')
      .select('id, name')
      .eq('email', email.toLowerCase())
      .single();

    if (existingUser) {
      // User exists - use their ID and optionally update name if changed
      userId = existingUser.id;
      
      if (existingUser.name !== name.trim()) {
        // Update name if it's different
        await supabase
          .from('users')
          .update({ name: name.trim() })
          .eq('id', userId);
      }
    } else {
      // Create new user
      const { data: newUser, error: userCreateError } = await supabase
        .from('users')
        .insert([
          {
            email: email.toLowerCase(),
            name: name.trim(),
          },
        ])
        .select('id')
        .single();

      if (userCreateError) {
        console.error('Error creating user:', userCreateError);
        return NextResponse.json(
          { error: 'Failed to save user information. Please try again.' },
          { status: 500 }
        );
      }

      userId = newUser.id;
    }

    // Step 2: Extract clinic place_ids and display_names
    const clinicPlaceIds = clinics.map((clinic: any) => clinic.place_id);
    const clinicNames = clinics.map((clinic: any) => clinic.display_name);

    // Step 3: Save comparison request to database (linked to user)
    const { data: comparisonRequest, error: dbError } = await supabase
      .from('comparison_requests')
      .insert([
        {
          user_id: userId,
          user_email: email.toLowerCase(),
          clinic_ids: clinicPlaceIds,
          clinic_names: clinicNames,
          request_status: 'pending',
        },
      ])
      .select()
      .single();

    if (dbError) {
      console.error('Error saving comparison request:', dbError);
      return NextResponse.json(
        { error: 'Failed to save comparison request. Please try again.' },
        { status: 500 }
      );
    }

    // Step 4: Generate email HTML using React Email template (await the render)
    const emailHTML = render(
    ComparisonEmailTemplate({ 
      clinics: clinics,
      userName: name 
    }),
    {
      pretty: false
    }
  );

    // Step 5: Send email using Resend
    try {
      const { data: emailData, error: emailError } = await resend.emails.send({
        from: 'Derm Clinics Near Me <noreply@dermaclinicnearme.com>',
        to: [email],
        subject: `Your Dermatology Clinic Comparison Report - ${clinics.length} Clinics`,
        html: emailHTML,
      });

      if (emailError) {
        console.error('Error sending email:', emailError);
        
        // Update request status to failed
        await supabase
          .from('comparison_requests')
          .update({
            request_status: 'failed',
            error_message: emailError.message || 'Unknown email error',
          })
          .eq('id', comparisonRequest.id);

        return NextResponse.json(
          { error: 'Failed to send email. Please try again or check your email address.' },
          { status: 500 }
        );
      }

      // Step 6: Update request status to sent
      await supabase
        .from('comparison_requests')
        .update({
          request_status: 'sent',
          email_sent_at: new Date().toISOString(),
        })
        .eq('id', comparisonRequest.id);

      return NextResponse.json({
        success: true,
        message: `Comparison report sent successfully to ${email}!`,
        requestId: comparisonRequest.id,
        userId: userId,
      });

    } catch (emailError: any) {
      console.error('Error sending email:', emailError);
      
      // Update request status to failed
      await supabase
        .from('comparison_requests')
        .update({
          request_status: 'failed',
          error_message: emailError.message || 'Unknown error',
        })
        .eq('id', comparisonRequest.id);

      return NextResponse.json(
        { error: 'Failed to send email. Please try again.' },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}

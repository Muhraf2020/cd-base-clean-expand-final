// app/api/send-comparison/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

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

    // Step 4: Generate email HTML
    const emailHTML = generateComparisonEmailHTML(clinics, name);

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

// Helper function to generate email HTML
function generateComparisonEmailHTML(clinics: any[], userName: string): string {
  const siteUrl = 'https://dermaclinicnearme.com';
  
  // Sort clinics by rating (highest first) to highlight the top one
  const sortedClinics = [...clinics].sort((a, b) => {
    const ratingA = a.rating || 0;
    const ratingB = b.rating || 0;
    return ratingB - ratingA;
  });

  const topClinic = sortedClinics[0];

  const clinicCardsHTML = sortedClinics.map((clinic, index) => {
    const rating = clinic.rating || 0;
    const reviews = clinic.user_rating_count || 0;
    const isTopRated = clinic.place_id === topClinic.place_id && sortedClinics.length > 1;
    
    return `
      <div style="background-color: ${isTopRated ? '#f0f9ff' : '#ffffff'}; 
                  border: ${isTopRated ? '2px solid #2563eb' : '1px solid #e5e7eb'}; 
                  border-radius: 8px; 
                  padding: 20px; 
                  margin-bottom: 16px;">
        ${isTopRated ? `
          <div style="background-color: #2563eb; color: white; display: inline-block; 
                      padding: 4px 12px; border-radius: 4px; font-size: 12px; 
                      font-weight: 600; margin-bottom: 12px;">
            ⭐ TOP RATED
          </div>
        ` : ''}
        
        <h3 style="margin: 0 0 12px 0; color: #111827; font-size: 18px; font-weight: 600;">
          ${index + 1}. ${clinic.display_name}
        </h3>
        
        <div style="display: flex; align-items: center; margin-bottom: 12px;">
          <span style="color: #fbbf24; font-size: 18px; margin-right: 8px;">
            ${'★'.repeat(Math.round(rating))}${'☆'.repeat(5 - Math.round(rating))}
          </span>
          <span style="color: #6b7280; font-size: 14px;">
            ${rating.toFixed(1)} (${reviews} reviews)
          </span>
        </div>

        ${clinic.formatted_address ? `
          <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">
            📍 ${clinic.formatted_address}
          </p>
        ` : ''}

        ${clinic.phone ? `
          <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">
            📞 ${clinic.phone}
          </p>
        ` : ''}

        ${clinic.intelligence_scores?.overall_score ? `
          <div style="margin: 12px 0;">
            <div style="background-color: #f3f4f6; border-radius: 4px; height: 8px; overflow: hidden;">
              <div style="background-color: #10b981; height: 100%; width: ${clinic.intelligence_scores.overall_score}%;"></div>
            </div>
            <p style="margin: 4px 0 0 0; color: #6b7280; font-size: 12px;">
              Quality Score: ${clinic.intelligence_scores.overall_score}%
            </p>
          </div>
        ` : ''}

        ${clinic.services && clinic.services.length > 0 ? `
          <div style="margin: 12px 0;">
            <p style="margin: 0 0 8px 0; color: #374151; font-size: 14px; font-weight: 500;">
              Services:
            </p>
            <div>
              ${clinic.services.slice(0, 4).map((service: string) => `
                <span style="display: inline-block; background-color: #e5e7eb; color: #374151; 
                            padding: 4px 8px; border-radius: 4px; font-size: 12px; margin: 2px;">
                  ${service}
                </span>
              `).join('')}
              ${clinic.services.length > 4 ? `
                <span style="color: #6b7280; font-size: 12px;">
                  +${clinic.services.length - 4} more
                </span>
              ` : ''}
            </div>
          </div>
        ` : ''}

        ${clinic.website ? `
          <a href="${clinic.website}" 
             style="display: inline-block; margin-top: 12px; padding: 8px 16px; 
                    background-color: #2563eb; color: white; text-decoration: none; 
                    border-radius: 4px; font-size: 14px;">
            Visit Website
          </a>
        ` : ''}
      </div>
    `;
  }).join('');

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f9fafb;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          
          <!-- Header -->
          <div style="background-color: #2563eb; padding: 32px 24px; text-align: center;">
            <h1 style="margin: 0; color: #ffffff; font-size: 24px;">
              Your Dermatology Clinic Comparison
            </h1>
            <p style="margin: 8px 0 0 0; color: #bfdbfe; font-size: 14px;">
              Requested by ${userName}
            </p>
          </div>

          <!-- Content -->
          <div style="padding: 32px 24px;">
            <p style="margin: 0 0 24px 0; color: #374151; font-size: 16px;">
              Hi ${userName},
            </p>
            <p style="margin: 0 0 24px 0; color: #374151; font-size: 16px;">
              Here's your comparison of ${clinics.length} dermatology clinics:
            </p>

            ${clinicCardsHTML}

            <div style="margin-top: 32px; padding: 20px; background-color: #f0f9ff; 
                        border-radius: 8px; text-align: center;">
              <p style="margin: 0 0 16px 0; color: #374151; font-size: 16px;">
                Ready to book an appointment?
              </p>
              <a href="${siteUrl}/clinics" 
                 style="display: inline-block; padding: 12px 32px; background-color: #2563eb; 
                        color: white; text-decoration: none; border-radius: 6px; font-size: 16px;">
                View More Clinics
              </a>
            </div>
          </div>

          <!-- Footer -->
          <div style="padding: 24px; background-color: #f9fafb; text-align: center; 
                      border-top: 1px solid #e5e7eb;">
            <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">
              This comparison was generated by 
              <a href="${siteUrl}" style="color: #2563eb; text-decoration: none;">
                Derm Clinics Near Me
              </a>
            </p>
            <p style="margin: 0; color: #9ca3af; font-size: 12px;">
              © ${new Date().getFullYear()} Derm Clinics Near Me. All rights reserved.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}

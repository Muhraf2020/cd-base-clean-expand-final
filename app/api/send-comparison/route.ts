// app/api/send-comparison/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
  try {
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

    // Step 2: Extract clinic IDs and names
    const clinicIds = clinics.map((clinic: any) => clinic.id);
    const clinicNames = clinics.map((clinic: any) => clinic.name);

    // Step 3: Save comparison request to database (linked to user)
    const { data: comparisonRequest, error: dbError } = await supabase
      .from('comparison_requests')
      .insert([
        {
          user_id: userId,
          user_email: email.toLowerCase(),
          clinic_ids: clinicIds,
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
    const ratingA = a.overallRating || a.googleRating || 0;
    const ratingB = b.overallRating || b.googleRating || 0;
    return ratingB - ratingA;
  });

  const topClinic = sortedClinics[0];

  const clinicCardsHTML = sortedClinics.map((clinic, index) => {
    const rating = clinic.overallRating || clinic.googleRating || 0;
    const reviews = clinic.reviewCount || 0;
    const isTopRated = clinic.id === topClinic.id && sortedClinics.length > 1;
    
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
          ${index + 1}. ${clinic.name}
        </h3>
        
        <div style="display: flex; align-items: center; margin-bottom: 12px;">
          <span style="color: #fbbf24; font-size: 18px; margin-right: 8px;">
            ${'★'.repeat(Math.round(rating))}${'☆'.repeat(5 - Math.round(rating))}
          </span>
          <span style="color: #6b7280; font-size: 14px;">
            ${rating.toFixed(1)} (${reviews} reviews)
          </span>
        </div>

        ${clinic.address ? `
          <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">
            📍 ${clinic.address}
          </p>
        ` : ''}

        ${clinic.phone ? `
          <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">
            📞 ${clinic.phone}
          </p>
        ` : ''}

        ${clinic.qualityScore ? `
          <div style="margin: 12px 0;">
            <div style="background-color: #f3f4f6; border-radius: 4px; height: 8px; overflow: hidden;">
              <div style="background-color: #10b981; height: 100%; width: ${clinic.qualityScore}%;"></div>
            </div>
            <p style="margin: 4px 0 0 0; color: #6b7280; font-size: 12px;">
              Quality Score: ${clinic.qualityScore}%
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
                <span style="display: inline-block; color: #6b7280; font-size: 12px; margin: 2px;">
                  +${clinic.services.length - 4} more
                </span>
              ` : ''}
            </div>
          </div>
        ` : ''}

        <a href="${siteUrl}/clinics/${clinic.id}" 
           style="display: inline-block; background-color: #2563eb; color: white; 
                  padding: 10px 20px; border-radius: 6px; text-decoration: none; 
                  font-size: 14px; font-weight: 500; margin-top: 12px;">
          View Full Details →
        </a>
      </div>
    `;
  }).join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Clinic Comparison Report</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 32px; border-radius: 8px 8px 0 0; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">
                Your Clinic Comparison Report
              </h1>
              <p style="margin: 8px 0 0 0; color: #e0e7ff; font-size: 14px;">
                ${clinics.length} dermatology clinics compared
              </p>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding: 32px 32px 24px 32px;">
              <p style="margin: 0; color: #111827; font-size: 16px;">
                Hi ${userName},
              </p>
              <p style="margin: 16px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                Thank you for using Derm Clinics Near Me! Here's your detailed comparison of ${clinics.length} dermatology clinics. 
                We've highlighted the top-rated clinic to help you make an informed decision.
              </p>
            </td>
          </tr>

          <!-- Clinic Cards -->
          <tr>
            <td style="padding: 0 32px 24px 32px;">
              ${clinicCardsHTML}
            </td>
          </tr>

          <!-- How to Choose Section -->
          <tr>
            <td style="padding: 0 32px 24px 32px; border-top: 1px solid #e5e7eb;">
              <h2 style="margin: 24px 0 12px 0; color: #111827; font-size: 18px; font-weight: 600;">
                How to Choose the Right Clinic
              </h2>
              <ul style="margin: 0; padding-left: 20px; color: #6b7280; font-size: 14px; line-height: 1.8;">
                <li>Compare ratings and review counts for reliability</li>
                <li>Check if they offer the specific services you need</li>
                <li>Consider location and accessibility</li>
                <li>Review their quality scores and patient feedback</li>
                <li>Contact clinics directly to verify availability</li>
              </ul>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding: 0 32px 32px 32px; text-align: center;">
              <a href="${siteUrl}" 
                 style="display: inline-block; background-color: #2563eb; color: white; 
                        padding: 14px 32px; border-radius: 6px; text-decoration: none; 
                        font-size: 16px; font-weight: 600;">
                Browse More Clinics
              </a>
              <p style="margin: 16px 0 0 0; color: #9ca3af; font-size: 12px;">
                Need help? Visit our website or contact support
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px 32px; border-radius: 0 0 8px 8px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">
                © ${new Date().getFullYear()} Derm Clinics Near Me. All rights reserved.
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                You received this email because you requested a clinic comparison from dermaclinicnearme.com
              </p>
              <p style="margin: 12px 0 0 0;">
                <a href="${siteUrl}" style="color: #2563eb; text-decoration: none; font-size: 12px; font-weight: 500;">
                  Visit Website
                </a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

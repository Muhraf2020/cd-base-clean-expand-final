// app/api/send-comparison/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { Clinic } from '@/lib/dataTypes';

// Initialize Resend (you'll need to set RESEND_API_KEY in your environment variables)
const resend = new Resend(process.env.RESEND_API_KEY);

interface ComparisonEmailRequest {
  email: string;
  clinics: Clinic[];
}

export async function POST(request: NextRequest) {
  try {
    const body: ComparisonEmailRequest = await request.json();
    const { email, clinics } = body;

    // Validation
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email address is required' },
        { status: 400 }
      );
    }

    if (!clinics || clinics.length < 2) {
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

    // Generate HTML email content
    const htmlContent = generateComparisonHTML(clinics);
    const textContent = generateComparisonText(clinics);

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: 'Derm Clinics Near Me <noreply@dermaclinicnearme.com>',
      to: [email],
      subject: `Dermatology Clinic Comparison Report - ${clinics.length} Clinics`,
      html: htmlContent,
      text: textContent,
    });

    if (error) {
      console.error('Resend API error:', error);
      return NextResponse.json(
        { error: 'Failed to send email. Please try again later.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Comparison report sent successfully',
      emailId: data?.id,
    });
  } catch (error) {
    console.error('Error sending comparison email:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

function generateComparisonHTML(clinics: Clinic[]): string {
  const clinicRows = clinics.map((clinic, index) => `
    <div style="margin-bottom: 30px; border: 2px solid ${index === 0 ? '#10b981' : '#e5e7eb'}; border-radius: 8px; padding: 20px; background-color: ${index === 0 ? '#f0fdf4' : '#ffffff'};">
      ${index === 0 ? '<div style="background-color: #10b981; color: white; padding: 4px 12px; border-radius: 4px; display: inline-block; font-size: 12px; font-weight: bold; margin-bottom: 12px;">TOP RATED</div>' : ''}
      
      <h2 style="color: #1f2937; margin: 0 0 8px 0; font-size: 22px;">${clinic.display_name}</h2>
      
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
        <div style="color: #f59e0b; font-size: 18px;">${'★'.repeat(Math.floor(clinic.rating || 0))}${'☆'.repeat(5 - Math.floor(clinic.rating || 0))}</div>
        <span style="color: #4b5563; font-weight: 600;">${clinic.rating?.toFixed(1) || 'N/A'}</span>
        <span style="color: #9ca3af;">(${clinic.user_ratings_total || 0} reviews)</span>
      </div>

      <div style="margin-bottom: 16px;">
        ${clinic.phone ? `<div style="color: #4b5563; margin-bottom: 4px;">📞 ${clinic.phone}</div>` : ''}
        ${clinic.website ? `<div style="color: #4b5563; margin-bottom: 4px;">🌐 <a href="${clinic.website}" style="color: #2563eb;">${clinic.website}</a></div>` : ''}
        ${clinic.address ? `<div style="color: #4b5563; margin-bottom: 4px;">📍 ${clinic.address}</div>` : ''}
      </div>

      <div style="background-color: #f9fafb; padding: 12px; border-radius: 6px; margin-bottom: 12px;">
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;">
          ${clinic.quality_score !== undefined ? `
            <div>
              <div style="color: #6b7280; font-size: 12px;">Quality Score</div>
              <div style="color: #1f2937; font-weight: 600;">${clinic.quality_score.toFixed(1)}/100</div>
            </div>
          ` : ''}
          ${clinic.walk_score !== undefined ? `
            <div>
              <div style="color: #6b7280; font-size: 12px;">Walk Score</div>
              <div style="color: #1f2937; font-weight: 600;">${clinic.walk_score}</div>
            </div>
          ` : ''}
          ${clinic.parking_available !== undefined ? `
            <div>
              <div style="color: #6b7280; font-size: 12px;">Parking</div>
              <div style="color: #1f2937; font-weight: 600;">${clinic.parking_available ? '✓ Available' : '✗ Limited'}</div>
            </div>
          ` : ''}
          ${clinic.wheelchair_accessible !== undefined ? `
            <div>
              <div style="color: #6b7280; font-size: 12px;">Accessibility</div>
              <div style="color: #1f2937; font-weight: 600;">${clinic.wheelchair_accessible ? '✓ Accessible' : '✗ Not Listed'}</div>
            </div>
          ` : ''}
        </div>
      </div>

      ${clinic.services && clinic.services.length > 0 ? `
        <div style="margin-bottom: 12px;">
          <div style="color: #6b7280; font-size: 12px; margin-bottom: 6px; font-weight: 600;">Services Offered:</div>
          <div style="display: flex; flex-wrap: wrap; gap: 6px;">
            ${clinic.services.slice(0, 8).map(service => 
              `<span style="background-color: #dbeafe; color: #1e40af; padding: 4px 10px; border-radius: 12px; font-size: 12px;">${service}</span>`
            ).join('')}
            ${clinic.services.length > 8 ? `<span style="color: #6b7280; font-size: 12px; padding: 4px 10px;">+${clinic.services.length - 8} more</span>` : ''}
          </div>
        </div>
      ` : ''}

      ${clinic.languages && clinic.languages.length > 0 ? `
        <div>
          <div style="color: #6b7280; font-size: 12px; margin-bottom: 6px; font-weight: 600;">Languages:</div>
          <div style="color: #4b5563;">${clinic.languages.join(', ')}</div>
        </div>
      ` : ''}

      <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
        <a href="https://dermaclinicnearme.com/clinics/${clinic.slug}" style="background-color: #2563eb; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; display: inline-block; font-weight: 600;">View Full Details</a>
      </div>
    </div>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Dermatology Clinic Comparison</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1f2937; max-width: 700px; margin: 0 auto; padding: 20px; background-color: #f3f4f6;">
      
      <div style="background-color: #ffffff; border-radius: 12px; padding: 30px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
        <div style="text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #e5e7eb;">
          <h1 style="color: #1f2937; margin: 0 0 8px 0;">Dermatology Clinic Comparison</h1>
          <p style="color: #6b7280; margin: 0; font-size: 14px;">Compare ${clinics.length} clinics side-by-side</p>
        </div>

        ${clinicRows}

        <div style="margin-top: 30px; padding: 20px; background-color: #eff6ff; border-radius: 8px; border-left: 4px solid #2563eb;">
          <h3 style="color: #1e40af; margin: 0 0 12px 0; font-size: 16px;">How to Choose the Right Clinic</h3>
          <ul style="margin: 0; padding-left: 20px; color: #4b5563;">
            <li>Consider proximity and transportation options (Walk Score, parking availability)</li>
            <li>Review ratings and patient feedback carefully</li>
            <li>Verify insurance acceptance before booking</li>
            <li>Check if they offer the specific services you need</li>
            <li>Ensure accessibility requirements are met</li>
            <li>Compare quality scores across multiple factors</li>
          </ul>
        </div>

        <div style="margin-top: 30px; text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px; margin: 0 0 12px 0;">Want to explore more options?</p>
          <a href="https://dermaclinicnearme.com" style="background-color: #10b981; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block; font-weight: 600;">Browse All Clinics</a>
        </div>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            This comparison was generated by <strong>DermClinicsNearMe.com</strong><br>
            Your trusted resource for finding quality dermatology care<br>
            <a href="https://dermaclinicnearme.com" style="color: #2563eb;">Visit Website</a> | 
            <a href="mailto:support@dermaclinicnearme.com" style="color: #2563eb;">Contact Support</a>
          </p>
        </div>
      </div>

    </body>
    </html>
  `;
}

function generateComparisonText(clinics: Clinic[]): string {
  let text = `DERMATOLOGY CLINIC COMPARISON REPORT\n`;
  text += `=========================================\n\n`;
  text += `Comparing ${clinics.length} clinics\n\n`;

  clinics.forEach((clinic, index) => {
    text += `\n${index + 1}. ${clinic.display_name}\n`;
    text += `${'='.repeat(clinic.display_name.length + 3)}\n\n`;
    
    text += `Rating: ${clinic.rating?.toFixed(1) || 'N/A'} stars (${clinic.user_ratings_total || 0} reviews)\n`;
    
    if (clinic.phone) text += `Phone: ${clinic.phone}\n`;
    if (clinic.website) text += `Website: ${clinic.website}\n`;
    if (clinic.address) text += `Address: ${clinic.address}\n`;
    
    text += `\nKey Metrics:\n`;
    if (clinic.quality_score !== undefined) text += `  - Quality Score: ${clinic.quality_score.toFixed(1)}/100\n`;
    if (clinic.walk_score !== undefined) text += `  - Walk Score: ${clinic.walk_score}\n`;
    if (clinic.parking_available !== undefined) text += `  - Parking: ${clinic.parking_available ? 'Available' : 'Limited'}\n`;
    if (clinic.wheelchair_accessible !== undefined) text += `  - Wheelchair Accessible: ${clinic.wheelchair_accessible ? 'Yes' : 'Not Listed'}\n`;
    
    if (clinic.services && clinic.services.length > 0) {
      text += `\nServices: ${clinic.services.slice(0, 5).join(', ')}${clinic.services.length > 5 ? ` (+${clinic.services.length - 5} more)` : ''}\n`;
    }
    
    if (clinic.languages && clinic.languages.length > 0) {
      text += `Languages: ${clinic.languages.join(', ')}\n`;
    }
    
    text += `\nView full details: https://dermaclinicnearme.com/clinics/${clinic.slug}\n`;
    text += `\n${'─'.repeat(60)}\n`;
  });

  text += `\n\nVISIT: https://dermaclinicnearme.com\n`;
  text += `Generated by DermClinicsNearMe.com - Your trusted resource for finding quality dermatology care\n`;

  return text;
}


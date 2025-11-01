// emails/comparison-template.tsx
import * as React from 'react';
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Heading,
  Link,
  Hr,
} from '@react-email/components';

interface Clinic {
  place_id: string;
  display_name: string;
  city?: string;
  state_code?: string;
  slug?: string;
  rating?: number;
  user_rating_count?: number;
  formatted_address?: string;
  phone?: string;
  website?: string;
  current_open_now?: boolean;
  
  // New fields
  intelligence_scores?: {
    overall_score: number;
    data_completeness_score: number;
    service_diversity_score: number;
    digital_presence_score: number;
    patient_experience_score: number;
  };
  website_services?: {
    has_online_booking?: boolean;
    has_telehealth?: boolean;
    has_patient_portal?: boolean;
    mentioned_services?: string[];
    languages?: string[];
  };
  convenience_scores?: {
    walk_score?: number;
    transit_score?: number;
    bike_score?: number;
    parking_assessment?: {
      difficulty: string;
      estimated_cost: string;
    };
  };
  accessibility_options?: Record<string, boolean>;
  parking_options?: Record<string, boolean>;
  payment_options?: Record<string, boolean>;
}

interface ComparisonEmailTemplateProps {
  clinics: Clinic[];
  userName?: string;
}

export const ComparisonEmailTemplate: React.FC<ComparisonEmailTemplateProps> = ({
  clinics,
  userName = 'there',
}) => {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dermaclinicnearme.com';

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={h1}>🏥 Dermatology Clinic Comparison</Heading>
            <Text style={subtitle}>
              Your personalized comparison of {clinics.length} dermatology clinics
            </Text>
          </Section>

          {/* Greeting */}
          <Text style={text}>Hi {userName},</Text>
          <Text style={text}>
            Thank you for using Derma Finder! Below is your detailed comparison of the selected clinics:
          </Text>

          {/* Clinic Headers */}
          <Section style={clinicHeaderSection}>
            {clinics.map((clinic, index) => (
              <div key={clinic.place_id} style={clinicHeaderCard}>
                <Heading style={h3}>
                  {index + 1}. {clinic.display_name}
                </Heading>
                <Text style={smallText}>
                  📍 {clinic.city}, {clinic.state_code}
                </Text>
                {clinic.rating && (
                  <Text style={ratingText}>
                    ⭐ {clinic.rating} ({clinic.user_rating_count || 0} reviews)
                  </Text>
                )}
                {clinic.slug && (
                  <Link 
                    href={`${baseUrl}/clinics/${clinic.slug}`}
                    style={linkButton}
                  >
                    View Full Profile →
                  </Link>
                )}
              </div>
            ))}
          </Section>

          <Hr style={hr} />

          {/* Quality Intelligence Scores */}
          {clinics.some(c => c.intelligence_scores) && (
            <>
              <Heading style={h2}>🎯 Quality Intelligence Score</Heading>
              <table style={table}>
                <thead>
                  <tr>
                    <th style={tableHeader}>Metric</th>
                    {clinics.map(clinic => (
                      <th key={clinic.place_id} style={tableHeader}>
                        {clinic.display_name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr style={tableRow}>
                    <td style={tableCell}><strong>Overall Score</strong></td>
                    {clinics.map(clinic => (
                      <td key={clinic.place_id} style={tableCellCenter}>
                        {clinic.intelligence_scores?.overall_score ? (
                          <span style={getScoreStyle(clinic.intelligence_scores.overall_score)}>
                            {clinic.intelligence_scores.overall_score}/100
                          </span>
                        ) : '—'}
                      </td>
                    ))}
                  </tr>
                  <tr style={tableRow}>
                    <td style={tableCell}>📊 Data Completeness</td>
                    {clinics.map(clinic => (
                      <td key={clinic.place_id} style={tableCellCenter}>
                        {clinic.intelligence_scores?.data_completeness_score || '—'}
                      </td>
                    ))}
                  </tr>
                  <tr style={tableRow}>
                    <td style={tableCell}>🏥 Service Diversity</td>
                    {clinics.map(clinic => (
                      <td key={clinic.place_id} style={tableCellCenter}>
                        {clinic.intelligence_scores?.service_diversity_score || '—'}
                      </td>
                    ))}
                  </tr>
                  <tr style={tableRow}>
                    <td style={tableCell}>💻 Digital Presence</td>
                    {clinics.map(clinic => (
                      <td key={clinic.place_id} style={tableCellCenter}>
                        {clinic.intelligence_scores?.digital_presence_score || '—'}
                      </td>
                    ))}
                  </tr>
                  <tr style={tableRow}>
                    <td style={tableCell}>⭐ Patient Experience</td>
                    {clinics.map(clinic => (
                      <td key={clinic.place_id} style={tableCellCenter}>
                        {clinic.intelligence_scores?.patient_experience_score || '—'}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
              <Hr style={hr} />
            </>
          )}

          {/* Services & Features */}
          {clinics.some(c => c.website_services) && (
            <>
              <Heading style={h2}>🏥 Services & Features</Heading>
              
              <Heading style={h3}>Digital Services</Heading>
              <table style={table}>
                <thead>
                  <tr>
                    <th style={tableHeader}>Service</th>
                    {clinics.map(clinic => (
                      <th key={clinic.place_id} style={tableHeader}>
                        {clinic.display_name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr style={tableRow}>
                    <td style={tableCell}>Online Booking</td>
                    {clinics.map(clinic => (
                      <td key={clinic.place_id} style={tableCellCenter}>
                        {clinic.website_services?.has_online_booking ? '✅' : '❌'}
                      </td>
                    ))}
                  </tr>
                  <tr style={tableRow}>
                    <td style={tableCell}>Telehealth</td>
                    {clinics.map(clinic => (
                      <td key={clinic.place_id} style={tableCellCenter}>
                        {clinic.website_services?.has_telehealth ? '✅' : '❌'}
                      </td>
                    ))}
                  </tr>
                  <tr style={tableRow}>
                    <td style={tableCell}>Patient Portal</td>
                    {clinics.map(clinic => (
                      <td key={clinic.place_id} style={tableCellCenter}>
                        {clinic.website_services?.has_patient_portal ? '✅' : '❌'}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>

              {/* Languages */}
              <Heading style={h3}>🗣️ Languages</Heading>
              <table style={table}>
                <tbody>
                  <tr style={tableRow}>
                    <td style={tableCell}>Supported Languages</td>
                    {clinics.map(clinic => (
                      <td key={clinic.place_id} style={tableCell}>
                        {clinic.website_services?.languages?.join(', ') || '—'}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>

              {/* Services Offered */}
              {clinics.some(c => c.website_services?.mentioned_services?.length) && (
                <>
                  <Heading style={h3}>Services Offered</Heading>
                  {clinics.map(clinic => (
                    clinic.website_services?.mentioned_services?.length ? (
                      <div key={clinic.place_id} style={servicesList}>
                        <Text style={smallText}><strong>{clinic.display_name}:</strong></Text>
                        <Text style={smallText}>
                          {clinic.website_services.mentioned_services.slice(0, 10).join(', ')}
                          {clinic.website_services.mentioned_services.length > 10 && 
                            ` +${clinic.website_services.mentioned_services.length - 10} more`}
                        </Text>
                      </div>
                    ) : null
                  ))}
                </>
              )}
              
              <Hr style={hr} />
            </>
          )}

          {/* Location Convenience */}
          {clinics.some(c => c.convenience_scores) && (
            <>
              <Heading style={h2}>🚶 Location Convenience</Heading>
              <table style={table}>
                <thead>
                  <tr>
                    <th style={tableHeader}>Feature</th>
                    {clinics.map(clinic => (
                      <th key={clinic.place_id} style={tableHeader}>
                        {clinic.display_name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr style={tableRow}>
                    <td style={tableCell}>Walk Score</td>
                    {clinics.map(clinic => (
                      <td key={clinic.place_id} style={tableCellCenter}>
                        {clinic.convenience_scores?.walk_score ? (
                          <>
                            <strong>{clinic.convenience_scores.walk_score}</strong>
                            <br />
                            <span style={smallText}>
                              {getWalkScoreLabel(clinic.convenience_scores.walk_score)}
                            </span>
                          </>
                        ) : '—'}
                      </td>
                    ))}
                  </tr>
                  <tr style={tableRow}>
                    <td style={tableCell}>Transit Score</td>
                    {clinics.map(clinic => (
                      <td key={clinic.place_id} style={tableCellCenter}>
                        {clinic.convenience_scores?.transit_score || '—'}
                      </td>
                    ))}
                  </tr>
                  <tr style={tableRow}>
                    <td style={tableCell}>Bike Score</td>
                    {clinics.map(clinic => (
                      <td key={clinic.place_id} style={tableCellCenter}>
                        {clinic.convenience_scores?.bike_score || '—'}
                      </td>
                    ))}
                  </tr>
                  <tr style={tableRow}>
                    <td style={tableCell}>🅿️ Parking</td>
                    {clinics.map(clinic => (
                      <td key={clinic.place_id} style={tableCell}>
                        {clinic.convenience_scores?.parking_assessment ? (
                          <>
                            {clinic.convenience_scores.parking_assessment.difficulty}
                            <br />
                            <span style={smallText}>
                              {clinic.convenience_scores.parking_assessment.estimated_cost}
                            </span>
                          </>
                        ) : clinic.parking_options ? 'Available' : '—'}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
              <Hr style={hr} />
            </>
          )}

          {/* Verified Reputation */}
          <Heading style={h2}>⭐ Verified Reputation</Heading>
          <table style={table}>
            <thead>
              <tr>
                <th style={tableHeader}>Metric</th>
                {clinics.map(clinic => (
                  <th key={clinic.place_id} style={tableHeader}>
                    {clinic.display_name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr style={tableRow}>
                <td style={tableCell}>Overall Rating</td>
                {clinics.map(clinic => (
                  <td key={clinic.place_id} style={tableCellCenter}>
                    {clinic.rating ? (
                      <>
                        ⭐ <strong>{clinic.rating}</strong>
                        <br />
                        <span style={smallText}>
                          {clinic.user_rating_count || 0} reviews
                        </span>
                      </>
                    ) : '—'}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
          <Hr style={hr} />

          {/* Basic Information */}
          <Heading style={h2}>📋 Basic Information</Heading>
          <table style={table}>
            <thead>
              <tr>
                <th style={tableHeader}>Detail</th>
                {clinics.map(clinic => (
                  <th key={clinic.place_id} style={tableHeader}>
                    {clinic.display_name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr style={tableRow}>
                <td style={tableCell}>📞 Phone</td>
                {clinics.map(clinic => (
                  <td key={clinic.place_id} style={tableCell}>
                    {clinic.phone || '—'}
                  </td>
                ))}
              </tr>
              <tr style={tableRow}>
                <td style={tableCell}>🌐 Website</td>
                {clinics.map(clinic => (
                  <td key={clinic.place_id} style={tableCell}>
                    {clinic.website ? (
                      <Link href={clinic.website} style={link}>
                        Visit Website
                      </Link>
                    ) : '—'}
                  </td>
                ))}
              </tr>
              <tr style={tableRow}>
                <td style={tableCell}>📍 Address</td>
                {clinics.map(clinic => (
                  <td key={clinic.place_id} style={tableCell}>
                    {clinic.formatted_address || '—'}
                  </td>
                ))}
              </tr>
              <tr style={tableRow}>
                <td style={tableCell}>Status</td>
                {clinics.map(clinic => (
                  <td key={clinic.place_id} style={tableCellCenter}>
                    {clinic.current_open_now !== undefined ? (
                      clinic.current_open_now ? '🟢 Open' : '🔴 Closed'
                    ) : '—'}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>

          {/* Footer */}
          <Hr style={hr} />
          <Text style={footer}>
            This comparison was generated by{' '}
            <Link href={baseUrl} style={link}>
              Derma Finder
            </Link>
            , your trusted resource for finding dermatology clinics across the USA.
          </Text>
          <Text style={footer}>
            Need help choosing? Visit our website for detailed clinic profiles, patient reviews, 
            and more information to make the best decision for your skin care needs.
          </Text>
          <Section style={ctaSection}>
            <Link href={baseUrl} style={ctaButton}>
              Visit Derma Finder
            </Link>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// Helper functions
function getScoreStyle(score: number): React.CSSProperties {
  const color = score >= 80 ? '#16a34a' : 
                score >= 60 ? '#2563eb' : 
                score >= 40 ? '#f59e0b' : '#dc2626';
  return {
    color,
    fontWeight: 'bold',
    fontSize: '18px',
  };
}

function getWalkScoreLabel(score: number): string {
  if (score >= 90) return "Walker's Paradise";
  if (score >= 70) return 'Very Walkable';
  if (score >= 50) return 'Somewhat Walkable';
  return 'Car-Dependent';
}

// Styles
const main: React.CSSProperties = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container: React.CSSProperties = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '800px',
};

const header: React.CSSProperties = {
  backgroundColor: '#3b82f6',
  padding: '30px 20px',
  textAlign: 'center',
  borderRadius: '8px 8px 0 0',
};

const h1: React.CSSProperties = {
  color: '#ffffff',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0 0 10px',
  padding: '0',
};

const subtitle: React.CSSProperties = {
  color: '#dbeafe',
  fontSize: '16px',
  margin: '0',
};

const h2: React.CSSProperties = {
  color: '#1f2937',
  fontSize: '22px',
  fontWeight: 'bold',
  margin: '30px 20px 15px',
};

const h3: React.CSSProperties = {
  color: '#374151',
  fontSize: '18px',
  fontWeight: '600',
  margin: '20px 20px 10px',
};

const text: React.CSSProperties = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 20px',
};

const smallText: React.CSSProperties = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '4px 0',
};

const clinicHeaderSection: React.CSSProperties = {
  margin: '20px 20px',
  display: 'grid',
  gap: '15px',
};

const clinicHeaderCard: React.CSSProperties = {
  backgroundColor: '#f9fafb',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  padding: '20px',
  marginBottom: '10px',
};

const ratingText: React.CSSProperties = {
  color: '#f59e0b',
  fontSize: '16px',
  fontWeight: '600',
  margin: '8px 0',
};

const table: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  margin: '20px 0',
};

const tableHeader: React.CSSProperties = {
  backgroundColor: '#f3f4f6',
  color: '#374151',
  fontSize: '14px',
  fontWeight: '600',
  padding: '12px',
  textAlign: 'left',
  borderBottom: '2px solid #e5e7eb',
};

const tableRow: React.CSSProperties = {
  borderBottom: '1px solid #e5e7eb',
};

const tableCell: React.CSSProperties = {
  color: '#374151',
  fontSize: '14px',
  padding: '12px',
  verticalAlign: 'top',
};

const tableCellCenter: React.CSSProperties = {
  ...tableCell,
  textAlign: 'center',
};

const servicesList: React.CSSProperties = {
  margin: '10px 20px',
  padding: '10px',
  backgroundColor: '#f9fafb',
  borderRadius: '6px',
};

const link: React.CSSProperties = {
  color: '#3b82f6',
  textDecoration: 'underline',
};

const linkButton: React.CSSProperties = {
  display: 'inline-block',
  backgroundColor: '#3b82f6',
  color: '#ffffff',
  padding: '8px 16px',
  borderRadius: '6px',
  textDecoration: 'none',
  fontSize: '14px',
  fontWeight: '600',
  marginTop: '10px',
};

const hr: React.CSSProperties = {
  borderColor: '#e5e7eb',
  margin: '30px 20px',
};

const footer: React.CSSProperties = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '16px 20px',
  textAlign: 'center',
};

const ctaSection: React.CSSProperties = {
  textAlign: 'center',
  margin: '30px 20px',
};

const ctaButton: React.CSSProperties = {
  backgroundColor: '#3b82f6',
  color: '#ffffff',
  padding: '12px 32px',
  borderRadius: '8px',
  textDecoration: 'none',
  fontSize: '16px',
  fontWeight: '600',
  display: 'inline-block',
};

export default ComparisonEmailTemplate;

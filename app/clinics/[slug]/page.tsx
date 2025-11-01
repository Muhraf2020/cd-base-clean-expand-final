export const dynamic = 'force-dynamic';

import { createSupabaseClient } from '@/lib/supabase';
import { Clinic } from '@/lib/dataTypes';
import Link from 'next/link';
import ClinicBanner from '@/components/ClinicBanner';
import FeaturedClinicsSection from '@/components/FeaturedClinicsSection';
import { notFound, redirect } from 'next/navigation';
import { Metadata } from 'next';
import {
  generateClinicSchema,
  generateBreadcrumbSchema,
} from '@/lib/structuredData';
import IntelligenceScores from '@/components/IntelligenceScores';
import {
  ReviewsSection,
  ServicesSection,
  NPIVerificationSection,
  QASection,
} from '@/components/EnhancedClinicData';

// Tier 2 extras
import {
  CompetitionBadge,
  ReviewInsightsSection,
  RealTimeStatusBanner,
  ConvenienceScoreCard,
  SocialProofSummary,
} from '@/components/Tier2EnhancedData';

// NEW: compare button on detail page
import CompareButton from '@/components/CompareButton';

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://dermaclinicnearme.com';

// NEW:
interface ClinicPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// ============================================================================
// METADATA GENERATION FOR SEO
// ============================================================================
export async function generateMetadata({
  params,
}: ClinicPageProps): Promise<Metadata> {
  const { slug } = await params;  // ✅ Correct
  const clinic = await getClinicBySlug(slug);

  if (!clinic) {
    return {
      title: 'Clinic Not Found',
    };
  }

  const canonicalUrl = `${BASE_URL}/clinics/${clinic.slug}`;

  return {
    title: `${clinic.display_name} - Dermatology Clinic in ${clinic.city}, ${clinic.state_code}`,
    description: `${clinic.display_name} offers dermatology services in ${clinic.city}, ${
      clinic.state_code
    }. ${
      clinic.rating
        ? `Rated ${clinic.rating}/5 with ${clinic.user_rating_count} reviews.`
        : ''
    } Book your appointment today.`,
    keywords: [
      'dermatology',
      clinic.display_name,
      clinic.city || '',
      clinic.state_code || '',
      'skin care',
      'dermatologist',
    ],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${clinic.display_name} - Dermatology Clinic`,
      description: `Professional dermatology services in ${clinic.city}, ${clinic.state_code}`,
      url: canonicalUrl,
      siteName: 'Derm Clinics Near Me',
      type: 'website',
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${clinic.display_name} - Dermatology Clinic`,
      description: `Professional dermatology services in ${clinic.city}, ${clinic.state_code}`,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function getClinicBySlug(slug: string): Promise<Clinic | null> {
  const supabase = createSupabaseClient();

  // First try to find by slug
  let { data, error } = await supabase
    .from('clinics')
    .select('*')
    .eq('slug', slug)
    .single();

  // If not found by slug, check if it's a place_id (backward compatibility)
  if (error && slug.startsWith('ChIJ')) {
    const { data: placeData, error: placeError } = await supabase
      .from('clinics')
      .select('*')
      .eq('place_id', slug)
      .single();

    if (!placeError && placeData) {
      // Redirect to the proper slug URL
      if (placeData.slug) {
        redirect(`/clinics/${placeData.slug}`);
      }
      data = placeData;
    }
  }

  if (error || !data) {
    return null;
  }

  return data as Clinic;
}

function normalizeClinicForUI(raw: any) {
  const accessibility_options = raw?.accessibility_options
    ? {
        wheelchair_accessible_entrance:
          raw.accessibility_options.wheelchair_accessible_entrance ??
          raw.accessibility_options.wheelchairAccessibleEntrance,
        wheelchair_accessible_parking:
          raw.accessibility_options.wheelchair_accessible_parking ??
          raw.accessibility_options.wheelchairAccessibleParking,
        wheelchair_accessible_restroom:
          raw.accessibility_options.wheelchair_accessible_restroom ??
          raw.accessibility_options.wheelchairAccessibleRestroom,
        wheelchair_accessible_seating:
          raw.accessibility_options.wheelchair_accessible_seating ??
          raw.accessibility_options.wheelchairAccessibleSeating,
      }
    : undefined;

  const payment_options = raw?.payment_options
    ? {
        accepts_credit_cards:
          raw.payment_options.accepts_credit_cards ??
          raw.payment_options.acceptsCreditCards,
        accepts_debit_cards:
          raw.payment_options.accepts_debit_cards ??
          raw.payment_options.acceptsDebitCards,
        accepts_cash_only:
          raw.payment_options.accepts_cash_only ??
          raw.payment_options.acceptsCashOnly,
        accepts_nfc:
          raw.payment_options.accepts_nfc ?? raw.payment_options.acceptsNfc,
      }
    : undefined;

  const parking_options = raw?.parking_options
    ? {
        free_parking_lot:
          raw.parking_options.free_parking_lot ??
          raw.parking_options.freeParkingLot,
        paid_parking_lot:
          raw.parking_options.paid_parking_lot ??
          raw.parking_options.paidParkingLot,
        free_street_parking:
          raw.parking_options.free_street_parking ??
          raw.parking_options.freeStreetParking,
        paid_street_parking:
          raw.parking_options.paid_street_parking ??
          raw.parking_options.paidStreetParking,
        valet_parking:
          raw.parking_options.valet_parking ??
          raw.parking_options.valetParking,
        free_garage_parking:
          raw.parking_options.free_garage_parking ??
          raw.parking_options.freeGarageParking,
        paid_garage_parking:
          raw.parking_options.paid_garage_parking ??
          raw.parking_options.paidGarageParking,
      }
    : undefined;

  return {
    ...raw,
    accessibility_options,
    payment_options,
    parking_options,
  };
}

function buildAmenityChips(c: any) {
  const chips: Array<{
    label: string;
    icon: string;
    tone: 'green' | 'blue' | 'amber';
  }> = [];

  if (c?.accessibility_options?.wheelchair_accessible_entrance) {
    chips.push({
      label: 'Wheelchair Accessible Entrance',
      icon: '♿️',
      tone: 'green',
    });
  }
  if (c?.accessibility_options?.wheelchair_accessible_parking) {
    chips.push({
      label: 'Wheelchair Accessible Parking',
      icon: '🅿️',
      tone: 'blue',
    });
  }
  if (c?.accessibility_options?.wheelchair_accessible_restroom) {
    chips.push({
      label: 'Wheelchair Accessible Restroom',
      icon: '🚻',
      tone: 'blue',
    });
  }
  if (c?.accessibility_options?.wheelchair_accessible_seating) {
    chips.push({
      label: 'Wheelchair Accessible Seating',
      icon: '♿️',
      tone: 'green',
    });
  }

  if (c?.parking_options?.free_parking_lot) {
    chips.push({
      label: 'Free Parking Lot',
      icon: '🅿️',
      tone: 'green',
    });
  }
  if (c?.parking_options?.paid_parking_lot) {
    chips.push({
      label: 'Paid Parking Lot',
      icon: '🅿️',
      tone: 'amber',
    });
  }

  if (c?.payment_options?.accepts_credit_cards) {
    chips.push({
      label: 'Accepts Credit Cards',
      icon: '💳',
      tone: 'green',
    });
  }
  if (c?.payment_options?.accepts_cash_only) {
    chips.push({
      label: 'Cash Only',
      icon: '💵',
      tone: 'amber',
    });
  }

  return chips;
}

function toneClasses(tone: 'green' | 'blue' | 'amber') {
  if (tone === 'green') return 'bg-green-50/70 border-green-100';
  if (tone === 'blue') return 'bg-blue-50/70 border-blue-100';
  return 'bg-amber-50/70 border-amber-100';
}

// helper to slugify city to match /state/[code]/city/[slug]
function toCitySlug(name: string) {
  return (name || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // spaces -> dashes
    .replace(/(^-|-$)/g, ''); // trim leading/trailing -
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default async function ClinicDetailPage({ params }: ClinicPageProps) {
  const { slug } = await params;  // ✅ Correct

  const rawClinic = await getClinicBySlug(slug);
  if (!rawClinic) {
    notFound();
  }

  const clinic = normalizeClinicForUI(rawClinic) as Clinic;
  const amenityChips = buildAmenityChips(clinic);
  const canonicalUrl = `${BASE_URL}/clinics/${clinic.slug}`;

  // Structured data for SEO
  const clinicSchema = generateClinicSchema(clinic, canonicalUrl);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: BASE_URL },
    {
      name: clinic.state_code || 'State',
      url: `${BASE_URL}/state/${clinic.state_code}`,
    },
    { name: clinic.display_name, url: canonicalUrl },
  ]);

  // Pretty "Back to ___ Clinics" link
  const stateCode = clinic.state_code || '';
  const cityName = clinic.city || '';
  const citySlug = toCitySlug(cityName);

  const backHref =
    stateCode && citySlug
      ? `/state/${stateCode.toLowerCase()}/city/${citySlug}`
      : '/clinics';

  return (
    <>
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(clinicSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />

      <div className="min-h-screen bg-gray-50">
        {/* Hero Banner */}
        <div className="relative h-64 sm:h-80 md:h-96 overflow-hidden">
          <ClinicBanner
            clinicName={clinic.display_name}
            placeId={clinic.place_id}
            rating={clinic.rating}
            website={clinic.website}
            className="w-full h-full object-cover"
          />

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-gray-50"></div>
        </div>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10">
          {/* Back Button */}
          <div className="mb-4">
            <Link
              href={backHref}
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
            >
              <svg
                className="w-5 h-5 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to {cityName} Clinics
            </Link>
          </div>

          {/* Main Card */}
          <div className="bg-white rounded-xl shadow-xl overflow-hidden mb-8">
            {/* Header Section */}
            <div className="p-6 sm:p-8 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1">
                  <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
                    {clinic.display_name}
                  </h1>

                  {/* Rating */}
                  {clinic.rating && (
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-400 text-2xl">★</span>
                        <span className="text-2xl font-bold text-gray-900">
                          {clinic.rating.toFixed(1)}
                        </span>
                      </div>
                      {clinic.user_rating_count && (
                        <span className="text-gray-600">
                          ({clinic.user_rating_count} reviews)
                        </span>
                      )}
                    </div>
                  )}

                  {/* Business Status */}
                  <div className="flex items-center gap-2">
                    {clinic.current_open_now ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        ● Open Now
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                        Closed
                      </span>
                    )}

                    {clinic.business_status === 'CLOSED_TEMPORARILY' && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                        Temporarily Closed
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2 sm:flex-shrink-0">
                  {clinic.phone && (
                    <a
                      href={`tel:${clinic.phone}`}
                      className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                      Call Now
                    </a>
                  )}

                  {/* NEW: Compare button on detail page */}
                  <CompareButton clinic={clinic} variant="detail" />

                  <a
                    href={clinic.google_maps_uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    Get Directions
                  </a>

                  {clinic.website && (
                    <a
                      href={clinic.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                        />
                      </svg>
                      Visit Website
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 sm:p-8">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Address */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                    <svg
                      className="w-6 h-6 mr-2 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    Address
                  </h2>
                  <p className="text-gray-700 text-lg">
                    {clinic.formatted_address}
                  </p>
                </div>

                {/* Contact Information */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                    <svg
                      className="w-6 h-6 mr-2 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    Contact
                  </h2>
                  <div className="space-y-2">
                    {clinic.phone && (
                      <p className="text-gray-700">
                        <span className="font-medium">Phone:</span>{' '}
                        {clinic.phone}
                      </p>
                    )}
                    {clinic.website && (
                      <p className="text-gray-700">
                        <span className="font-medium">Website:</span>{' '}
                        <a
                          href={clinic.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Visit Website
                        </a>
                      </p>
                    )}
                  </div>
                </div>

                {/* Amenities */}
                {amenityChips.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                      <svg
                        className="w-6 h-6 mr-2 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Amenities
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {amenityChips.map((chip, idx) => (
                        <span
                          key={idx}
                          className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium border ${toneClasses(
                            chip.tone
                          )}`}
                        >
                          <span className="mr-2">{chip.icon}</span>
                          {chip.label}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Hours */}
                {clinic.opening_hours?.weekday_text &&
                  clinic.opening_hours.weekday_text.length > 0 && (
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                        <svg
                          className="w-6 h-6 mr-2 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Hours
                      </h2>
                      <div className="space-y-2">
                        {clinic.opening_hours.weekday_text.map(
                          (hours: string, idx: number) => {
                            const [day, time] = hours.split(': ');
                            return (
                              <div
                                key={idx}
                                className="flex justify-between text-gray-700"
                              >
                                <span className="font-medium">{day}</span>
                                <span>{time}</span>
                              </div>
                            );
                          }
                        )}
                      </div>
                    </div>
                  )}
              </div>
            </div>

            {/* Intelligence / Quality Scores */}
            {clinic.intelligence_scores && (
              <div className="border-t border-gray-200 pt-8">
                <IntelligenceScores
                  scores={clinic.intelligence_scores}
                />
              </div>
            )}
          </div>

          {/* Enhanced Information Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            {/* Left Column */}
            <div className="space-y-8">
              <NPIVerificationSection npiData={clinic.npi_data} />
              <ServicesSection services={clinic.website_services} />
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              <ReviewsSection reviews={clinic.reviews} />
              <QASection qa={clinic.questions_answers} />
            </div>
          </div>

          {/* Tier 2 Enhanced Data */}
          {(clinic as any).real_time_status && (
            <RealTimeStatusBanner
              status={(clinic as any).real_time_status}
            />
          )}

          {(clinic as any).competition_metrics && (
            <div className="mb-6">
              <CompetitionBadge
                metrics={(clinic as any).competition_metrics}
              />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            {/* Left Column */}
            <div className="space-y-8">
              <ReviewInsightsSection
                intelligence={(clinic as any).review_intelligence}
              />
              <ConvenienceScoreCard
                scores={(clinic as any).convenience_scores}
              />
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              <SocialProofSummary
                social={(clinic as any).social_proof_extended}
              />
            </div>
          </div>

          {/* Featured Clinics Section */}
          {clinic.city && clinic.state_code && (
            <FeaturedClinicsSection
              currentClinicId={clinic.place_id}
              city={clinic.city}
              stateCode={clinic.state_code}
            />
          )}
        </main>
      </div>
    </>
  );
}

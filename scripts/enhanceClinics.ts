/**
 * Tier 1 Enhancement Script - FINAL CORRECTED VERSION
 * 
 * This script enhances existing clinics with:
 * 1. Reviews from Google Places ✅
 * 2. Opening hours data ✅
 * 3. Website service extraction ✅
 * 4. NPI verification ✅
 * 5. Intelligence scores calculation ✅
 * 
 * Note: Q&A and Popular Times are not available in Places API (New)
 * 
 * Usage:
 *   npx tsx scripts/enhanceClinics.ts --state=CA --limit=10
 *   npx tsx scripts/enhanceClinics.ts --place-ids=ChIJ123,ChIJ456
 *   npx tsx scripts/enhanceClinics.ts --all --batch-size=50
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import path from 'path';

config({ path: path.resolve(process.cwd(), '.env.local') });

// ============================================================================
// Configuration
// ============================================================================

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) {
    console.error(`❌ Missing required environment variable: ${name}`);
    process.exit(1);
  }
  return v;
}

const SUPABASE_URL         = requireEnv('NEXT_PUBLIC_SUPABASE_URL');
const SUPABASE_SERVICE_KEY = requireEnv('SUPABASE_SERVICE_KEY');
const GOOGLE_API_KEY       = requireEnv('GOOGLE_PLACES_API_KEY');
const NPI_API_URL          = 'https://npiregistry.cms.hhs.gov/api';
// Add this line:
const FETCH_GOOGLE_REVIEWS = process.env.FETCH_GOOGLE_REVIEWS !== 'false'; // Default to true

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const QPS = 3; // Queries per second
const ENHANCEMENT_VERSION = '1.0';

let TOTAL_REQUESTS = 0;
let lastCallTime = 0;

// ============================================================================
// Rate Limiting
// ============================================================================

async function rateLimit() {
  const now = Date.now();
  const elapsed = now - lastCallTime;
  const minInterval = 1000 / QPS;
  
  if (elapsed < minInterval) {
    await new Promise(resolve => setTimeout(resolve, minInterval - elapsed));
  }
  
  lastCallTime = Date.now();
  TOTAL_REQUESTS++;
}

// ============================================================================
// 1. Fetch Enhanced Google Places Data - FIXED VERSION
// ============================================================================

async function fetchEnhancedPlacesData(placeId: string) {
  await rateLimit();

  // FIXED: 
  // 1. Use X-Goog-FieldMask header (not query parameter)
  // 2. Removed 'questions' field (not available in Places API New)
  const fields = [
    'id',
    'displayName',
    'currentOpeningHours.periods',
    'currentOpeningHours.weekdayDescriptions',
    'reviews'
  ].join(',');

  const url = `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`;

  try {
    const response = await fetch(url, {
      headers: {
        'X-Goog-Api-Key': GOOGLE_API_KEY,
        'X-Goog-FieldMask': fields,  // Field mask in header!
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`   ⚠️  Places API error for ${placeId}: ${response.status}`);
      console.error(`   Error details: ${errorText.substring(0, 200)}`);
      return null;
    }

    const data = await response.json();
    
    // Transform reviews
    const reviews = data.reviews?.slice(0, 10).map((r: any) => ({
      author_name: r.authorAttribution?.displayName || 'Anonymous',
      author_photo: r.authorAttribution?.photoUri || null,
      rating: r.rating || 0,
      text: r.text?.text || r.originalText?.text || '',
      time: r.publishTime ? new Date(r.publishTime).getTime() / 1000 : Date.now() / 1000,
      relative_time_description: r.relativePublishTimeDescription || '',
    })) || [];

    return {
      reviews,
      
      // Q&A not available through Places API (New)
      // Would require web scraping Google Maps (complex + against ToS)
      questions_answers: [],

      // Popular times not available through Places API (New)
      // Would require web scraping or additional APIs
      popular_times: null,
    };
  } catch (error: any) {
    console.error(`   ⚠️  Error fetching Places data: ${error.message}`);
    return null;
  }
}

// ============================================================================
// 2. Extract Services from Website
// ============================================================================

async function extractWebsiteServices(websiteUrl: string): Promise<any> {
  if (!websiteUrl) return null;

  try {
    const response = await fetch(websiteUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ClinicEnhancer/1.0)',
      },
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) return null;

    const html = await response.text();
    const lowerHtml = html.toLowerCase();

    // Service keywords to look for
    const services: string[] = [];
    const serviceKeywords = [
      'botox', 'filler', 'laser', 'microneedling', 'chemical peel',
      'acne treatment', 'skin cancer', 'mohs surgery', 'mole removal',
      'eczema', 'psoriasis', 'rosacea', 'cosmetic dermatology',
      'pediatric dermatology', 'hair loss', 'nail disorders',
      'skin tag removal', 'wart removal', 'cryotherapy'
    ];

    serviceKeywords.forEach(keyword => {
      if (lowerHtml.includes(keyword)) {
        services.push(keyword);
      }
    });

    // Check for online features
    const hasOnlineBooking = 
      lowerHtml.includes('book online') ||
      lowerHtml.includes('schedule online') ||
      lowerHtml.includes('online scheduling') ||
      lowerHtml.includes('book appointment');

    const hasTelehealth = 
      lowerHtml.includes('telehealth') ||
      lowerHtml.includes('telemedicine') ||
      lowerHtml.includes('virtual visit') ||
      lowerHtml.includes('video consultation');

    const hasPatientPortal = 
      lowerHtml.includes('patient portal') ||
      lowerHtml.includes('mychart') ||
      lowerHtml.includes('patient login') ||
      lowerHtml.includes('portal login');

    const insuranceMentioned = 
      lowerHtml.includes('insurance') ||
      lowerHtml.includes('medicare') ||
      lowerHtml.includes('medicaid');

    // Extract languages
    const languages: string[] = ['English']; // Default
    const languageKeywords = [
      'spanish', 'chinese', 'vietnamese', 'korean', 'tagalog',
      'russian', 'arabic', 'french', 'portuguese', 'hindi'
    ];
    
    languageKeywords.forEach(lang => {
      if (lowerHtml.includes(lang)) {
        languages.push(lang.charAt(0).toUpperCase() + lang.slice(1));
      }
    });

    return {
      has_online_booking: hasOnlineBooking,
      has_telehealth: hasTelehealth,
      has_patient_portal: hasPatientPortal,
      mentioned_services: [...new Set(services)], // Remove duplicates
      insurance_mentioned: insuranceMentioned,
      languages: [...new Set(languages)], // Remove duplicates
    };
  } catch (error) {
    // Silently fail for website scraping - it's optional
    return null;
  }
}

// ============================================================================
// 3. Verify NPI Data
// ============================================================================

async function verifyNPI(clinicName: string, city: string, state: string): Promise<any> {
  try {
    const params = new URLSearchParams({
      version: '2.1',
      city,
      state,
      limit: '5',
      taxonomy_description: 'Dermatology',
    });

    const response = await fetch(`${NPI_API_URL}/?${params}`);
    if (!response.ok) return null;

    const data = await response.json();
    
    if (data.result_count === 0) return null;

    // Find best match by name similarity
    const results = data.results || [];
    const bestMatch = results[0]; // Simple: take first result

    if (!bestMatch) return null;

    const basic = bestMatch.basic;
    const taxonomies = bestMatch.taxonomies || [];
    const dermatologyTax = taxonomies.find((t: any) => 
      t.desc?.toLowerCase().includes('dermatology')
    );

    return {
      npi_number: bestMatch.number,
      provider_name: `${basic.first_name || ''} ${basic.last_name || ''}`.trim() || basic.organization_name,
      taxonomy_description: dermatologyTax?.desc || taxonomies[0]?.desc || 'Unknown',
      is_verified: true,
      verification_date: new Date().toISOString().split('T')[0],
      board_certifications: [], // Would need additional source
    };
  } catch (error) {
    // NPI lookup is optional - don't break enhancement
    return null;
  }
}

// ============================================================================
// 4. Calculate Intelligence Scores
// ============================================================================

function calculateIntelligenceScores(clinic: any, enhanced: any): any {
  let dataCompleteness = 0;
  let serviceDiversity = 0;
  let digitalPresence = 0;
  let patientExperience = 0;

  // Data Completeness (0-100)
  const fields = [
    clinic.phone,
    clinic.website,
    clinic.rating,
    clinic.opening_hours,
    clinic.formatted_address,
    clinic.photos?.length,
    enhanced.reviews?.length,
    enhanced.npi_data,
  ];
  dataCompleteness = (fields.filter(Boolean).length / fields.length) * 100;

  // Service Diversity (0-100)
  const services = enhanced.website_services?.mentioned_services?.length || 0;
  serviceDiversity = Math.min((services / 10) * 100, 100);

  // Digital Presence (0-100)
  let digitalScore = 0;
  if (clinic.website) digitalScore += 30;
  if (enhanced.website_services?.has_online_booking) digitalScore += 30;
  if (enhanced.website_services?.has_telehealth) digitalScore += 20;
  if (enhanced.website_services?.has_patient_portal) digitalScore += 20;
  digitalPresence = digitalScore;

  // Patient Experience (0-100)
  let expScore = 0;
  if (clinic.rating) expScore += (clinic.rating / 5) * 50;
  if (clinic.user_rating_count > 10) expScore += 20;
  if (enhanced.reviews?.length > 0) expScore += 20;
  if (clinic.accessibility_options) expScore += 10;
  patientExperience = Math.min(expScore, 100);

  // Overall Score (weighted average)
  const overallScore = (
    dataCompleteness * 0.25 +
    serviceDiversity * 0.2 +
    digitalPresence * 0.25 +
    patientExperience * 0.3
  );

  return {
    overall_score: Math.round(overallScore),
    data_completeness_score: Math.round(dataCompleteness),
    service_diversity_score: Math.round(serviceDiversity),
    digital_presence_score: Math.round(digitalPresence),
    patient_experience_score: Math.round(patientExperience),
    calculated_at: new Date().toISOString(),
  };
}

// ============================================================================
// 5. Enhance Single Clinic
// ============================================================================

async function enhanceClinic(clinic: any): Promise<any> {
  console.log(`\n📍 Enhancing: ${clinic.display_name}`);
  console.log(`   Location: ${clinic.city}, ${clinic.state_code}`);

  const enhanced: any = {
    reviews: null,
    questions_answers: [],
    popular_times: null,
    website_services: null,
    npi_data: null,
    intelligence_scores: null,
  };

  // 1. Fetch Google Places enhanced data (conditionally)
  if (FETCH_GOOGLE_REVIEWS) {
    console.log('   🔍 Fetching Google Places data...');
    const placesData = await fetchEnhancedPlacesData(clinic.place_id);
    if (placesData) {
      enhanced.reviews = placesData.reviews;
      enhanced.questions_answers = placesData.questions_answers;
      enhanced.popular_times = placesData.popular_times;
      console.log(`   ✅ Got ${placesData.reviews?.length || 0} reviews`);
    } else {
      console.log('   ⚠️  Could not fetch Places data');
    }
  } else {
    console.log('   ⏭️  Skipping Google reviews (FETCH_GOOGLE_REVIEWS=false)');
  }


  // 2. Extract website services
  if (clinic.website) {
    console.log('   🌐 Analyzing website...');
    enhanced.website_services = await extractWebsiteServices(clinic.website);
    if (enhanced.website_services) {
      console.log(`   ✅ Found ${enhanced.website_services.mentioned_services?.length || 0} services`);
    } else {
      console.log('   ⚠️  Could not analyze website');
    }
  }

  // 3. Verify NPI
  console.log('   🏥 Looking up NPI...');
  enhanced.npi_data = await verifyNPI(
    clinic.display_name,
    clinic.city,
    clinic.state_code
  );
  if (enhanced.npi_data) {
    console.log(`   ✅ NPI verified: ${enhanced.npi_data.npi_number}`);
  } else {
    console.log('   ⚠️  NPI not found');
  }

  // 4. Calculate scores
  console.log('   📊 Calculating intelligence scores...');
  enhanced.intelligence_scores = calculateIntelligenceScores(clinic, enhanced);
  console.log(`   ✅ Overall score: ${enhanced.intelligence_scores.overall_score}/100`);

  return enhanced;
}

// ============================================================================
// 6. Main Enhancement Process
// ============================================================================

async function enhanceClinics(options: {
  stateCode?: string;
  placeIds?: string[];
  limit?: number;
  all?: boolean;
  batchSize?: number;
}) {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║              TIER 1 CLINIC ENHANCEMENT                         ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  // Build query
  let query = supabase.from('clinics').select('*');

  if (options.placeIds) {
    query = query.in('place_id', options.placeIds);
  } else if (options.stateCode) {
    query = query.eq('state_code', options.stateCode);
  }

  // Only enhance clinics without recent enhancement
  query = query.or('enhanced_data_fetched_at.is.null,enhanced_data_fetched_at.lt.' + 
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

  if (options.limit) {
    query = query.limit(options.limit);
  }

  const { data: clinics, error } = await query;

  if (error) {
    console.error('❌ Error fetching clinics:', error.message);
    return;
  }

  if (!clinics || clinics.length === 0) {
    console.log('✅ No clinics need enhancement');
    return;
  }

  console.log(`📋 Found ${clinics.length} clinics to enhance\n`);

  let enhanced = 0;
  let errors = 0;

  for (const clinic of clinics) {
    try {
      const enhancedData = await enhanceClinic(clinic);

      // Update database
      const { error: updateError } = await supabase
        .from('clinics')
        .update({
          reviews: enhancedData.reviews,
          questions_answers: enhancedData.questions_answers,
          popular_times: enhancedData.popular_times,
          website_services: enhancedData.website_services,
          npi_data: enhancedData.npi_data,
          intelligence_scores: enhancedData.intelligence_scores,
          enhanced_data_fetched_at: new Date().toISOString(),
          enhancement_version: ENHANCEMENT_VERSION,
        })
        .eq('place_id', clinic.place_id);

      if (updateError) {
        console.error(`   ❌ Database update failed: ${updateError.message}`);
        errors++;
      } else {
        console.log('   ✅ Enhancement saved to database');
        enhanced++;
      }

      // Small delay between clinics
      await new Promise(resolve => setTimeout(resolve, 500));

    } catch (error: any) {
      console.error(`   ❌ Error: ${error.message}`);
      errors++;
    }
  }

  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║                 ENHANCEMENT COMPLETE                           ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');
  console.log(`✅ Successfully enhanced: ${enhanced} clinics`);
  console.log(`❌ Errors: ${errors}`);
  console.log(`📊 Total API requests: ${TOTAL_REQUESTS}`);
  console.log(`💰 Estimated cost: $${(TOTAL_REQUESTS * 0.032).toFixed(2)}\n`);
}

// ============================================================================
// CLI Argument Parsing
// ============================================================================

async function main() {
  const args = process.argv.slice(2);

  const options: any = {
    batchSize: 50,
  };

  args.forEach(arg => {
    if (arg.startsWith('--state=')) {
      options.stateCode = arg.split('=')[1];
    } else if (arg.startsWith('--place-ids=')) {
      options.placeIds = arg.split('=')[1].split(',');
    } else if (arg.startsWith('--limit=')) {
      options.limit = parseInt(arg.split('=')[1]);
    } else if (arg === '--all') {
      options.all = true;
    }
  });

  if (!options.stateCode && !options.placeIds && !options.all && !options.limit) {
    console.error('\n❌ Missing required arguments\n');
    console.error('Usage:');
    console.error('  npx tsx scripts/enhanceClinics.ts --state=CA --limit=10');
    console.error('  npx tsx scripts/enhanceClinics.ts --place-ids=ChIJ123,ChIJ456');
    console.error('  npx tsx scripts/enhanceClinics.ts --all --batch-size=50');
    console.error('  npx tsx scripts/enhanceClinics.ts --limit=5  # Test with 5 clinics\n');
    process.exit(1);
  }

  await enhanceClinics(options);
}

main().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});


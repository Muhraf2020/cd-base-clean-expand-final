/**
 * Upload Clinic Data to Supabase - FIXED VERSION
 * 
 * This script reads clinic data from JSON files in data/clinics/
 * and uploads them to your Supabase database.
 * 
 * Fixes:
 * - Generates slugs for all clinics before upload
 * - Converts price_level strings to integers
 * 
 * Usage:
 *   npx tsx scripts/uploadToSupabase.ts
 * 
 * Environment Variables Required:
 *   NEXT_PUBLIC_SUPABASE_URL - Your Supabase project URL
 *   SUPABASE_SERVICE_KEY - Your Supabase service role key (not anon key!)
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { config } from 'dotenv';
import { generateClinicSlug, generateUniqueSlug } from '../lib/utils';

// Load environment variables
config({ path: path.resolve(process.cwd(), '.env.local') });

// ============================================================================
// Configuration
// ============================================================================

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const DATA_DIR = path.join(process.cwd(), 'data', 'clinics');
const BATCH_SIZE = 100; // Supabase batch limit
const DELAY_BETWEEN_BATCHES_MS = 100; // Small delay to avoid rate limiting

// ============================================================================
// Validation
// ============================================================================

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing required environment variables:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_KEY');
  console.error('');
  console.error('Please ensure these are set in your .env.local file');
  process.exit(1);
}

if (!fs.existsSync(DATA_DIR)) {
  console.error(`❌ Data directory not found: ${DATA_DIR}`);
  console.error('   Run data collection first: npm run collect-data');
  process.exit(1);
}

// ============================================================================
// Initialize Supabase Client
// ============================================================================

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

// ============================================================================
// Helper Functions
// ============================================================================

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Convert Google Places price_level string to integer
 */
function convertPriceLevel(priceLevel: any): number | null {
  if (!priceLevel) return null;
  
  // If already a number, return it
  if (typeof priceLevel === 'number') return priceLevel;
  
  // Convert string to number
  const priceLevelMap: Record<string, number> = {
    'PRICE_LEVEL_FREE': 0,
    'PRICE_LEVEL_INEXPENSIVE': 1,
    'PRICE_LEVEL_MODERATE': 2,
    'PRICE_LEVEL_EXPENSIVE': 3,
    'PRICE_LEVEL_VERY_EXPENSIVE': 4,
  };
  
  return priceLevelMap[priceLevel] ?? null;
}

function formatClinicForUpload(clinic: any, slug: string) {
  // Ensure all required fields are present
  return {
    place_id: clinic.place_id,
    slug: slug, // Add generated slug
    display_name: clinic.display_name,
    formatted_address: clinic.formatted_address,
    city: clinic.city,
    state_code: clinic.state_code,
    postal_code: clinic.postal_code,
    location: clinic.location,
    primary_type: clinic.primary_type,
    types: clinic.types,
    rating: clinic.rating,
    user_rating_count: clinic.user_rating_count,
    current_open_now: clinic.current_open_now,
    phone: clinic.phone,
    international_phone_number: clinic.international_phone_number,
    website: clinic.website,
    google_maps_uri: clinic.google_maps_uri,
    business_status: clinic.business_status,
    accessibility_options: clinic.accessibility_options,
    parking_options: clinic.parking_options,
    payment_options: clinic.payment_options,
    opening_hours: clinic.opening_hours,
    photos: clinic.photos,
    price_level: convertPriceLevel(clinic.price_level), // Convert to integer
    last_fetched_at: clinic.last_fetched_at,
  };
}

// ============================================================================
// Main Upload Function
// ============================================================================

async function uploadClinicsFromFile(filePath: string): Promise<{
  success: number;
  errors: number;
  skipped: number;
}> {
  const fileName = path.basename(filePath);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const clinics = data.clinics || [];

  console.log(`\n📤 Processing ${fileName} (${clinics.length} clinics)...`);

  if (clinics.length === 0) {
    console.log('   ⚠️  No clinics in file, skipping');
    return { success: 0, errors: 0, skipped: clinics.length };
  }

  // Generate slugs for all clinics in this file
  const slugSet = new Set<string>();
  const clinicsWithSlugs = clinics.map((clinic: any) => {
    // Use existing slug if available, otherwise generate
    if (clinic.slug) {
      slugSet.add(clinic.slug);
      return { ...clinic, generatedSlug: clinic.slug };
    }
    
    const baseSlug = generateClinicSlug(
      clinic.display_name,
      clinic.city,
      clinic.state_code
    );
    const uniqueSlug = generateUniqueSlug(baseSlug, slugSet);
    slugSet.add(uniqueSlug);
    return { ...clinic, generatedSlug: uniqueSlug };
  });

  let successCount = 0;
  let errorCount = 0;
  let skippedCount = 0;

  // Process in batches
  for (let i = 0; i < clinicsWithSlugs.length; i += BATCH_SIZE) {
    const batch = clinicsWithSlugs.slice(i, i + BATCH_SIZE);
    const formattedBatch = batch.map((clinic: any) => 
      formatClinicForUpload(clinic, clinic.generatedSlug)
    );

    try {
      const { data: uploaded, error } = await supabase
        .from('clinics')
        .upsert(formattedBatch, {
          onConflict: 'place_id',
          ignoreDuplicates: false, // Update existing records
        });

      if (error) {
        console.error(`   ❌ Batch ${Math.floor(i / BATCH_SIZE) + 1} error: ${error.message}`);
        errorCount += batch.length;
      } else {
        const count = Math.min(i + BATCH_SIZE, clinicsWithSlugs.length);
        successCount += batch.length;
        console.log(`   ✅ Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${count}/${clinicsWithSlugs.length} uploaded`);
      }
    } catch (err: any) {
      console.error(`   ❌ Unexpected error: ${err.message}`);
      errorCount += batch.length;
    }

    // Small delay between batches to avoid rate limiting
    if (i + BATCH_SIZE < clinicsWithSlugs.length) {
      await sleep(DELAY_BETWEEN_BATCHES_MS);
    }
  }

  return { success: successCount, errors: errorCount, skipped: skippedCount };
}

// ============================================================================
// Main Execution
// ============================================================================

async function main() {
  console.log('');
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║         SUPABASE CLINIC DATA UPLOAD TOOL (FIXED)              ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log('✨ Fixes applied:');
  console.log('   - Auto-generates slugs for all clinics');
  console.log('   - Converts price_level strings to integers');
  console.log('');

  // Verify Supabase connection
  console.log('🔗 Testing Supabase connection...');
  try {
    const { count, error } = await supabase
      .from('clinics')
      .select('*', { count: 'exact', head: true });
    
    if (error) throw error;
    console.log(`   ✅ Connected to Supabase`);
    console.log(`   📊 Current records in database: ${count}`);
  } catch (error: any) {
    console.error(`   ❌ Failed to connect to Supabase: ${error.message}`);
    console.error('');
    console.error('Troubleshooting:');
    console.error('1. Verify NEXT_PUBLIC_SUPABASE_URL in .env.local');
    console.error('2. Verify SUPABASE_SERVICE_KEY in .env.local');
    console.error('3. Ensure the "clinics" table exists in Supabase');
    console.error('4. Check Supabase project is active and accessible');
    process.exit(1);
  }

  // Get all JSON files
  const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));

  if (files.length === 0) {
    console.log('');
    console.log('❌ No JSON files found in data/clinics/');
    console.log('   Run data collection first: npm run collect-data');
    process.exit(1);
  }

  console.log(`\n📂 Found ${files.length} state file(s) to process`);
  console.log('');

  // Upload statistics
  let totalSuccess = 0;
  let totalErrors = 0;
  let totalSkipped = 0;

  // Process each file
  for (const file of files) {
    const filePath = path.join(DATA_DIR, file);
    const result = await uploadClinicsFromFile(filePath);

    totalSuccess += result.success;
    totalErrors += result.errors;
    totalSkipped += result.skipped;
  }

  // Final report
  console.log('');
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║                    UPLOAD COMPLETE                             ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log('📊 Summary:');
  console.log(`   ✅ Successfully uploaded: ${totalSuccess} clinics`);
  console.log(`   ❌ Failed uploads: ${totalErrors} clinics`);
  console.log(`   ⚠️  Skipped: ${totalSkipped} clinics`);
  console.log(`   📁 Files processed: ${files.length}`);
  console.log('');

  if (totalErrors > 0) {
    console.log('⚠️  Some uploads failed. Check the error messages above for details.');
    console.log('   You can re-run this script to retry failed uploads.');
    console.log('');
  }

  // Verify final count
  console.log('🔍 Verifying database...');
  try {
    const { count, error } = await supabase
      .from('clinics')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;

    console.log(`   ✅ Total records in database: ${count}`);
    
    // Show breakdown by state
    const { data: stateData, error: stateError } = await supabase
      .from('clinics')
      .select('state_code');
    
    if (!stateError && stateData) {
      const stateCounts: Record<string, number> = {};
      stateData.forEach((clinic: any) => {
        const state = clinic.state_code || 'UNKNOWN';
        stateCounts[state] = (stateCounts[state] || 0) + 1;
      });
      
      console.log('\n   📍 Clinics by state:');
      Object.entries(stateCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .forEach(([state, count]) => {
          console.log(`      ${state}: ${count} clinics`);
        });
    }
  } catch (error: any) {
    console.error(`   ❌ Failed to verify: ${error.message}`);
  }

  console.log('');
  console.log('✨ Upload process complete!');
  console.log('');
  console.log('Next steps:');
  console.log('1. Visit your Supabase dashboard to verify the data');
  console.log('2. Test your website locally: npm run dev');
  console.log('3. Deploy to Cloudflare: npm run deploy');
  console.log('');
}

// ============================================================================
// Execute
// ============================================================================

main().catch((error) => {
  console.error('');
  console.error('❌ Fatal error:', error);
  console.error('');
  process.exit(1);
});

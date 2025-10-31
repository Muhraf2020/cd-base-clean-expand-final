/**
 * Generate Slugs for Existing Clinics
 * 
 * This script generates SEO-friendly slugs for all existing clinics
 * 
 * Usage:
 *   npx tsx scripts/generateSlugs.ts
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import path from 'path';
import { generateClinicSlug, generateUniqueSlug } from '../lib/utils';

config({ path: path.resolve(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function generateSlugs() {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║              GENERATE CLINIC SLUGS                             ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  console.log('📊 Fetching clinics from database...\n');

  // Fetch all clinics
  const { data: clinics, error } = await supabase
    .from('clinics')
    .select('place_id, display_name, city, state_code, slug')
    .order('place_id');

  if (error) {
    console.error('❌ Error fetching clinics:', error.message);
    process.exit(1);
  }

  if (!clinics || clinics.length === 0) {
    console.log('⚠️  No clinics found in database');
    return;
  }

  console.log(`Found ${clinics.length} clinics\n`);

  // Track existing slugs to handle collisions
  const existingSlugs = new Set<string>();
  const updates: Array<{ place_id: string; slug: string }> = [];

  // Generate slugs
  console.log('🔄 Generating slugs...\n');

  for (const clinic of clinics) {
    // Skip if slug already exists
    if (clinic.slug) {
      existingSlugs.add(clinic.slug);
      continue;
    }

    // Generate base slug
    const baseSlug = generateClinicSlug(
      clinic.display_name,
      clinic.city,
      clinic.state_code
    );

    // Ensure uniqueness
    const uniqueSlug = generateUniqueSlug(baseSlug, existingSlugs);
    existingSlugs.add(uniqueSlug);

    updates.push({
      place_id: clinic.place_id,
      slug: uniqueSlug,
    });
  }

  console.log(`Generated ${updates.length} new slugs\n`);

  if (updates.length === 0) {
    console.log('✅ All clinics already have slugs!\n');
    return;
  }

  // Update in batches
  console.log('💾 Updating database...\n');

  let updated = 0;
  let errors = 0;

  // Update one by one to avoid conflicts (more reliable)
  for (let i = 0; i < updates.length; i++) {
    const update = updates[i];

    try {
      // Use UPDATE instead of UPSERT to only modify the slug column
      const { error: updateError } = await supabase
        .from('clinics')
        .update({ slug: update.slug })
        .eq('place_id', update.place_id);

      if (updateError) {
        console.error(`   ❌ Error updating ${update.place_id}:`, updateError.message);
        errors++;
      } else {
        updated++;
      }

      // Progress indicator every 100 updates
      if ((i + 1) % 100 === 0 || i === updates.length - 1) {
        console.log(`   ✅ Updated ${i + 1}/${updates.length}`);
      }
    } catch (err: any) {
      console.error(`   ❌ Unexpected error for ${update.place_id}:`, err.message);
      errors++;
    }

    // Small delay to avoid rate limiting
    if (i % 50 === 0 && i > 0) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║                    SLUG GENERATION COMPLETE                    ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');
  console.log(`✅ Successfully updated: ${updated} clinics`);
  console.log(`❌ Failed updates: ${errors} clinics\n`);

  if (errors > 0) {
    console.log('⚠️  Some updates failed. You can re-run this script to retry.\n');
  }

  // Show some examples
  console.log('📋 Example slugs:\n');
  const examples = updates.slice(0, 5);
  for (let i = 0; i < examples.length; i++) {
    const u = examples[i];
    const clinic = clinics.find(c => c.place_id === u.place_id);
    console.log(`${i + 1}. ${clinic?.display_name}`);
    console.log(`   → ${u.slug}\n`);
  }

  // Verify the updates
  console.log('🔍 Verifying updates...\n');
  const { count: slugCount } = await supabase
    .from('clinics')
    .select('slug', { count: 'exact', head: true })
    .not('slug', 'is', null);

  console.log(`✅ Total clinics with slugs: ${slugCount}\n`);
}

generateSlugs().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});

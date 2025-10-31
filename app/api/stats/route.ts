// app/api/stats/route.ts
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase';

const VALID_US_STATES = new Set([
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA',
  'ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK',
  'OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC'
]);

const US_STATES_FULL: Record<string, string> = {
  'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas',
  'CA': 'California', 'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware',
  'FL': 'Florida', 'GA': 'Georgia', 'HI': 'Hawaii', 'ID': 'Idaho',
  'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa', 'KS': 'Kansas',
  'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
  'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi',
  'MO': 'Missouri', 'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada',
  'NH': 'New Hampshire', 'NJ': 'New Jersey', 'NM': 'New Mexico', 'NY': 'New York',
  'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio', 'OK': 'Oklahoma',
  'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
  'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah',
  'VT': 'Vermont', 'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia',
  'WI': 'Wisconsin', 'WY': 'Wyoming', 'DC': 'Washington DC'
};

export async function GET(request: Request) {
  const supabase = createSupabaseClient();

  try {
    // Base query to fetch state codes for valid US states
    const { data, error } = await supabase
      .from('clinics')
      .select('state_code')
      .in('state_code', Array.from(VALID_US_STATES));

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    // Count clinics per state
    const stateCounts: Record<string, number> = {};
    data?.forEach((clinic: { state_code?: string }) => {
      const state = clinic.state_code;
      if (state) {
        stateCounts[state] = (stateCounts[state] || 0) + 1;
      }
    });

    // Build states list and totals
    const states = Object.entries(stateCounts)
      .map(([code, count]) => ({
        code,
        name: US_STATES_FULL[code] || code,
        clinicCount: count
      }))
      .sort((a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }));

    const totalClinics = Object.values(stateCounts).reduce((sum, count) => sum + count, 0);
    const totalStates = Object.keys(stateCounts).filter(code => code !== 'DC').length;

    // --- NEW: unique cities with clinics ---
    const { data: cityRows, error: cityErr } = await supabase
      .from('clinics')
      .select('city,state_code')
      .not('city', 'is', null)
      .neq('city', '')
      .in('state_code', Array.from(VALID_US_STATES));

    if (cityErr) {
      console.error('stats:cities', cityErr);
    }

    const totalCities = new Set(
      (cityRows ?? []).map((r: { city: unknown; state_code: string }) =>
        `${String(r.city).trim().toLowerCase()}|${r.state_code}`
      )
    ).size;
    // --- END NEW ---

    const response = NextResponse.json({
      states,
      totalClinics,
      totalStates,
      totalCities, // added
      lastUpdated: new Date().toISOString()
    });

    // Aggressive caching headers for Cloudflare
    response.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    response.headers.set('CDN-Cache-Control', 'public, s-maxage=3600');
    response.headers.set('Cloudflare-CDN-Cache-Control', 'public, max-age=3600');

    return response;
  } catch (error) {
    console.error('Error in stats API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}

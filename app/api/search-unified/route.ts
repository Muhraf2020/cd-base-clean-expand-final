// app/api/search-unified/route.ts
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase';

const VALID_US_STATES = new Set([
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA',
  'ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK',
  'OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC'
]);

/**
 * Enhanced search with relevance scoring
 * Searches: clinic names, addresses, cities, specialties
 */
export async function GET(request: Request) {
  const supabase = createSupabaseClient();

  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim();
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);

    if (!query || query.length < 2) {
      return NextResponse.json({ clinics: [], query: '', total: 0 });
    }

    const lowerQuery = query.toLowerCase();
    const isZipCode = /^\d{5}$/.test(query);

    let supabaseQuery = supabase
      .from('clinics')
      .select('*')
      .in('state_code', Array.from(VALID_US_STATES));

    if (isZipCode) {
      // Exact ZIP code match
      supabaseQuery = supabaseQuery.eq('postal_code', query);
    } else {
      // Text search across multiple fields
      supabaseQuery = supabaseQuery.or(
        `display_name.ilike.%${query}%,` +
        `formatted_address.ilike.%${query}%,` +
        `city.ilike.%${query}%,` +
        `state_code.ilike.%${query}%`
      );
    }

    const { data, error } = await supabaseQuery.limit(limit);

    if (error) {
      console.error('Search error:', error);
      throw error;
    }

    // Client-side relevance scoring
    const results = (data || []).map(clinic => {
      let score = 0;
      const name = (clinic.display_name || '').toLowerCase();
      const address = (clinic.formatted_address || '').toLowerCase();
      const city = (clinic.city || '').toLowerCase();

      // Exact match in name (highest priority)
      if (name === lowerQuery) score += 100;
      else if (name.startsWith(lowerQuery)) score += 50;
      else if (name.includes(lowerQuery)) score += 25;

      // City match
      if (city === lowerQuery) score += 40;
      else if (city.includes(lowerQuery)) score += 20;

      // Address match
      if (address.includes(lowerQuery)) score += 10;

      // Boost by rating and reviews
      if (clinic.rating) score += clinic.rating * 2;
      if (clinic.user_rating_count) score += Math.log10(clinic.user_rating_count);

      // Boost operational clinics
      if (clinic.business_status === 'OPERATIONAL') score += 5;

      return { ...clinic, relevance_score: score };
    });

    // Sort by relevance
    results.sort((a, b) => b.relevance_score - a.relevance_score);

    const response = NextResponse.json({
      clinics: results,
      query,
      total: results.length,
    });

    // Cache for 5 minutes
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=3600');
    
    return response;
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Search failed', clinics: [], query: '', total: 0 },
      { status: 500 }
    );
  }
}

// app/api/clinics/route.ts

// Use Node runtime on Cloudflare; edge runtime is not supported by default
// export const runtime = 'edge';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase';
import { Clinic } from '@/lib/dataTypes';

// ✅ Valid US states for filtering
const VALID_US_STATES = new Set([
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA',
  'ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK',
  'OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC'
]);

// US State to Timezone mapping
const STATE_TIMEZONES: Record<string, string> = {
  'AL': 'America/Chicago', 'AK': 'America/Anchorage', 'AZ': 'America/Phoenix',
  'AR': 'America/Chicago', 'CA': 'America/Los_Angeles', 'CO': 'America/Denver',
  'CT': 'America/New_York', 'DE': 'America/New_York', 'FL': 'America/New_York',
  'GA': 'America/New_York', 'HI': 'Pacific/Honolulu', 'ID': 'America/Denver',
  'IL': 'America/Chicago', 'IN': 'America/Indiana/Indianapolis', 'IA': 'America/Chicago',
  'KS': 'America/Chicago', 'KY': 'America/New_York', 'LA': 'America/Chicago',
  'ME': 'America/New_York', 'MD': 'America/New_York', 'MA': 'America/New_York',
  'MI': 'America/Detroit', 'MN': 'America/Chicago', 'MS': 'America/Chicago',
  'MO': 'America/Chicago', 'MT': 'America/Denver', 'NE': 'America/Chicago',
  'NV': 'America/Los_Angeles', 'NH': 'America/New_York', 'NJ': 'America/New_York',
  'NM': 'America/Denver', 'NY': 'America/New_York', 'NC': 'America/New_York',
  'ND': 'America/Chicago', 'OH': 'America/New_York', 'OK': 'America/Chicago',
  'OR': 'America/Los_Angeles', 'PA': 'America/New_York', 'RI': 'America/New_York',
  'SC': 'America/New_York', 'SD': 'America/Chicago', 'TN': 'America/Chicago',
  'TX': 'America/Chicago', 'UT': 'America/Denver', 'VT': 'America/New_York',
  'VA': 'America/New_York', 'WA': 'America/Los_Angeles', 'WV': 'America/New_York',
  'WI': 'America/Chicago', 'WY': 'America/Denver', 'DC': 'America/New_York'
};

/**
 * Calculate if a clinic is open now based on weekday_text array
 * with proper timezone handling
 *
 * Example weekday_text:
 * ["Monday: 8:00 AM – 5:00 PM", "Tuesday: 9:00 AM – 5:00 PM", ...]
 */
function calculateOpenNowFromWeekdayText(
  weekdayText: string[],
  timezone: string
): boolean {
  if (!weekdayText || weekdayText.length === 0) return false;

  try {
    // Get current time in the clinic's timezone
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      weekday: 'long',
      hour: 'numeric',
      minute: 'numeric',
      hour12: false,
    });

    const parts = formatter.formatToParts(now);
    const weekday = parts.find(p => p.type === 'weekday')?.value || '';
    const hour = parseInt(parts.find(p => p.type === 'hour')?.value || '0', 10);
    const minute = parseInt(parts.find(p => p.type === 'minute')?.value || '0', 10);
    const currentTime = hour * 60 + minute; // Minutes since midnight

    // Find today's hours
    const todayHours = weekdayText.find(text => text.startsWith(weekday));
    if (!todayHours) return false;

    // Check if closed
    if (todayHours.toLowerCase().includes('closed')) return false;

    // Parse hours - handle multiple dash types (-, –, —)
    const timeMatch = todayHours.match(
      /(\d{1,2}):(\d{2})\s*(AM|PM)\s*[-–—]\s*(\d{1,2}):(\d{2})\s*(AM|PM)/i
    );

    if (!timeMatch) {
      console.warn(`Could not parse hours: ${todayHours}`);
      return false;
    }

    const [, openHour, openMin, openPeriod, closeHour, closeMin, closePeriod] = timeMatch;

    // Convert to minutes since midnight (24h)
    let openTime = parseInt(openHour, 10) * 60 + parseInt(openMin, 10);
    let closeTime = parseInt(closeHour, 10) * 60 + parseInt(closeMin, 10);

    // Handle AM/PM conversion for opening time
    if (openPeriod.toUpperCase() === 'PM' && parseInt(openHour, 10) !== 12) {
      openTime += 12 * 60;
    }
    if (openPeriod.toUpperCase() === 'AM' && parseInt(openHour, 10) === 12) {
      // 12 AM is 00:xx
      openTime = parseInt(openMin, 10);
    }

    // Handle AM/PM conversion for closing time
    if (closePeriod.toUpperCase() === 'PM' && parseInt(closeHour, 10) !== 12) {
      closeTime += 12 * 60;
    }
    if (closePeriod.toUpperCase() === 'AM' && parseInt(closeHour, 10) === 12) {
      // 12 AM is 00:xx
      closeTime = parseInt(closeMin, 10);
    }

    // Check if current time is within operating hours
    return currentTime >= openTime && currentTime < closeTime;
  } catch (error) {
    console.error('Error calculating open_now:', error);
    return false;
  }
}

/**
 * Transform Supabase data (camelCase in DB) to frontend format (snake_case)
 * and calculate real-time open_now status
 */
function transformClinicData(rawClinic: any): Clinic {
  // Transform accessibility_options from camelCase (DB) to snake_case (frontend)
  const accessibility_options = rawClinic.accessibility_options
    ? {
        wheelchair_accessible_entrance:
          rawClinic.accessibility_options.wheelchairAccessibleEntrance,
        wheelchair_accessible_parking:
          rawClinic.accessibility_options.wheelchairAccessibleParking,
        wheelchair_accessible_restroom:
          rawClinic.accessibility_options.wheelchairAccessibleRestroom,
        wheelchair_accessible_seating:
          rawClinic.accessibility_options.wheelchairAccessibleSeating,
      }
    : undefined;

  // Transform payment_options from camelCase to snake_case
  const payment_options = rawClinic.payment_options
    ? {
        accepts_credit_cards: rawClinic.payment_options.acceptsCreditCards,
        accepts_debit_cards: rawClinic.payment_options.acceptsDebitCards,
        accepts_cash_only: rawClinic.payment_options.acceptsCashOnly,
        accepts_nfc: rawClinic.payment_options.acceptsNfc,
      }
    : undefined;

  // Transform parking_options from camelCase to snake_case
  const parking_options = rawClinic.parking_options
    ? {
        free_parking_lot: rawClinic.parking_options.freeParkingLot,
        paid_parking_lot: rawClinic.parking_options.paidParkingLot,
        free_street_parking: rawClinic.parking_options.freeStreetParking,
        paid_street_parking: rawClinic.parking_options.paidStreetParking,
        valet_parking: rawClinic.parking_options.valetParking,
        free_garage_parking: rawClinic.parking_options.freeGarageParking,
        paid_garage_parking: rawClinic.parking_options.paidGarageParking,
      }
    : undefined;

  // Calculate real-time open_now status from weekday_text
  let current_open_now = false;
  if (rawClinic.opening_hours?.weekday_text) {
    const timezone =
      STATE_TIMEZONES[rawClinic.state_code] || 'America/New_York';
    current_open_now = calculateOpenNowFromWeekdayText(
      rawClinic.opening_hours.weekday_text,
      timezone
    );
  }

  return {
    ...rawClinic,
    accessibility_options,
    payment_options,
    parking_options,
    current_open_now,
    opening_hours: rawClinic.opening_hours
      ? {
          ...rawClinic.opening_hours,
          open_now: current_open_now, // dynamic override
        }
      : undefined,
  };
}

/**
 * Helper: does this clinic "match" certain service keywords?
 * Checks clinic.website_services.mentioned_services[] and clinic.display_name.
 * Used for client-side fallback filters like pediatric / cosmetic / Mohs.
 */
function matchesService(clinic: any, serviceKeywords: string[]): boolean {
  const mentioned =
    clinic.website_services?.mentioned_services || [];
  const name = (clinic.display_name || '').toLowerCase();

  return serviceKeywords.some((kw) => {
    const kwLower = kw.toLowerCase();
    const inArray = mentioned.some(
      (s: string) => s.toLowerCase().includes(kwLower)
    );
    const inName = name.includes(kwLower);
    return inArray || inName;
  });
}

export async function GET(request: Request) {
  // ✅ Initialize Supabase client INSIDE the function (Workers safe)
  const supabase = createSupabaseClient();

  try {
    const { searchParams } = new URL(request.url);

    // -----------------------------------------------------------------------
    // BASIC QUERY PARAMS (existing)
    // -----------------------------------------------------------------------
    const state = searchParams.get('state');
    const city = searchParams.get('city');
    const q = searchParams.get('q');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const perPage = parseInt(searchParams.get('per_page') || '500', 10);

    // -----------------------------------------------------------------------
    // NEW FILTER PARAMS (enhanced filters)
    // Booleans come in as strings ("true" / "false")
    // -----------------------------------------------------------------------
    const rating_min = searchParams.get('rating_min');
    const open_now = searchParams.get('open_now') === 'true';
    const wheelchair_accessible =
      searchParams.get('wheelchair_accessible') === 'true';
    const free_parking = searchParams.get('free_parking') === 'true';

    // Digital services / experience flags from website_services JSONB
    const has_online_booking =
      searchParams.get('has_online_booking') === 'true';
    const has_telehealth =
      searchParams.get('has_telehealth') === 'true';
    const has_patient_portal =
      searchParams.get('has_patient_portal') === 'true';
    const accepts_insurance =
      searchParams.get('accepts_insurance') === 'true';

    // Services list filter (comma-separated list like "acne,botox,laser_hair")
    const servicesParam = searchParams.get('services');
    const servicesList = servicesParam
      ? servicesParam
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    // Specialty-style convenience filters
    const pediatric = searchParams.get('pediatric') === 'true';
    const cosmetic = searchParams.get('cosmetic') === 'true';
    const mohs_surgery = searchParams.get('mohs_surgery') === 'true';

    // NPI verification
    const npi_verified =
      searchParams.get('npi_verified') === 'true';

    // Intelligence score thresholds
    const min_overall_score_raw =
      searchParams.get('min_overall_score');
    const min_overall_score = min_overall_score_raw
      ? parseInt(min_overall_score_raw, 10)
      : undefined;

    const min_digital_presence_raw =
      searchParams.get('min_digital_presence');
    const min_digital_presence = min_digital_presence_raw
      ? parseInt(min_digital_presence_raw, 10)
      : undefined;

    // Sorting params (with fallbacks)
    const sort_by = searchParams.get('sort_by') || 'rating';
    const sort_order =
      (searchParams.get('sort_order') as 'asc' | 'desc') ||
      'desc';

    // -----------------------------------------------------------------------
    // BUILD BASE QUERY (Supabase/PostgREST)
    // -----------------------------------------------------------------------
    let query = supabase
      .from('clinics')
      .select('*', { count: 'exact' });

    // ✅ Always filter to valid US states at the DB level
    query = query.in('state_code', Array.from(VALID_US_STATES));

    // State filter
    if (state) {
      query = query.eq('state_code', state);
    }

    // City filter (ILIKE for partial match, case-insensitive)
    if (city) {
      query = query.ilike('city', `%${city}%`);
    }

    // Free text search in name or address
    if (q) {
      // NOTE: .or() can only be called once effectively, so we keep this
      // as the only .or() in the DB query to avoid collisions with
      // pediatric/cosmetic/etc. Those we handle client-side below.
      //
      // ✅ ENHANCED: Search in more fields when no location context is provided
      // This helps home page searches find relevant clinics
      const hasLocationContext = !!(state || city);

      if (hasLocationContext) {
        // City/state pages: simple name/address search (client will do advanced filtering)
        query = query.or(
          `display_name.ilike.%${q}%,formatted_address.ilike.%${q}%`
        );
      } else {
        // Nationwide search from home page: cast broader net at DB level
        // Search in name, address, type, and city to find relevant clinics
        // Client-side will then refine with synonyms, fuzzy matching, etc.
        query = query.or(
          `display_name.ilike.%${q}%,formatted_address.ilike.%${q}%,primary_type.ilike.%${q}%,city.ilike.%${q}%,state_code.ilike.%${q}%`
        );
      }
    }

    // Minimum rating filter
    if (rating_min) {
      const minRatingNum = parseFloat(rating_min);
      if (!Number.isNaN(minRatingNum)) {
        query = query.gte('rating', minRatingNum);
      }
    }

    // Accessibility filter (DB is camelCase; frontend is snake_case)
    if (wheelchair_accessible) {
      // DB JSONB path example:
      // accessibility_options->>wheelchairAccessibleEntrance = 'true'
      query = query.eq(
        'accessibility_options->>wheelchairAccessibleEntrance',
        'true'
      );
    }

    // Parking filter
    if (free_parking) {
      query = query.eq(
        'parking_options->>freeParkingLot',
        'true'
      );
    }

    // Digital service filters (website_services JSONB)
    if (has_online_booking) {
      query = query.eq(
        'website_services->>has_online_booking',
        'true'
      );
    }

    if (has_telehealth) {
      query = query.eq(
        'website_services->>has_telehealth',
        'true'
      );
    }

    if (has_patient_portal) {
      query = query.eq(
        'website_services->>has_patient_portal',
        'true'
      );
    }

    if (accepts_insurance) {
      query = query.eq(
        'website_services->>insurance_mentioned',
        'true'
      );
    }

    // NPI verification filter
    if (npi_verified) {
      // only clinics with npi_data.is_verified === true
      query = query.not('npi_data', 'is', null);
      query = query.eq(
        'npi_data->>is_verified',
        'true'
      );
    }

    // NOTE: We are NOT pushing servicesList / pediatric / cosmetic / mohs_surgery
    // OR score thresholds into the DB query here because:
    // - Supabase .or() can't be chained repeatedly without overwriting
    // - Comparing numeric thresholds inside nested JSONB sometimes sorts/filters lexicographically
    // We'll do these as a safe client-side pass AFTER we fetch the rows.

    // -----------------------------------------------------------------------
    // SORTING before pagination
    // -----------------------------------------------------------------------
    // SORTING before pagination
    // -----------------------------------------------------------------------
    switch (sort_by) {
      case 'rating': {
        query = query.order('rating', {
          ascending: sort_order === 'asc',
        });
        break;
      }
    
      case 'reviews': {
        query = query.order('user_rating_count', {
          ascending: sort_order === 'asc',
        });
        break;
      }
    
      case 'name': {
        query = query.order('display_name', {
          ascending: sort_order === 'asc',
        });
        break;
      }
    
      case 'score': {
        // overall_score lives in intelligence_scores JSONB.
        // Using ->> will treat it as text in Postgres, which is fine for now.
        query = query.order('intelligence_scores->>overall_score', {
          ascending: sort_order === 'asc',
        });
        break;
      }
    
      case 'distance': {
        // true distance sort needs PostGIS/haversine, which we don't have yet.
        // Fallback = sort by rating descending (best clinics first).
        console.warn(
          'Distance sorting requested but not implemented server-side'
        );
        query = query.order('rating', {
          ascending: false,
        });
        break;
      }
    
      default: {
        // default behavior = highest rated first
        query = query.order('rating', {
          ascending: false,
        });
        break;
      }
    }


    // -----------------------------------------------------------------------
    // PAGINATION
    // -----------------------------------------------------------------------
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;
    query = query.range(from, to);

    // -----------------------------------------------------------------------
    // EXECUTE QUERY
    // -----------------------------------------------------------------------
    const { data, error, count } = await query;

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    // -----------------------------------------------------------------------
    // DEFENSE-IN-DEPTH: still ensure US-only in case anything leaked
    // -----------------------------------------------------------------------
    const usClinics = (data || []).filter(
      (clinic: any) =>
        clinic.state_code && VALID_US_STATES.has(clinic.state_code)
    );

    // -----------------------------------------------------------------------
    // TRANSFORM FOR FRONTEND (snake_case fields, dynamic open_now)
    // -----------------------------------------------------------------------
    let transformedClinics: Clinic[] = usClinics.map(
      transformClinicData
    );

    // -----------------------------------------------------------------------
    // CLIENT-SIDE / FALLBACK FILTERS
    // (safe post-processing so we don't break your .or() logic above)
    // -----------------------------------------------------------------------

    // Filter by "currently open"
    if (open_now) {
      transformedClinics = transformedClinics.filter(
        (c: any) => c.current_open_now === true
      );
    }

    // Filter by services list (e.g. services=acne,botox,laser)
    if (servicesList.length > 0) {
      transformedClinics = transformedClinics.filter((c) =>
        matchesService(c, servicesList)
      );
    }

    // Pediatric-only clinics
    if (pediatric) {
      transformedClinics = transformedClinics.filter((c) =>
        matchesService(c, [
          'pediatric dermatology',
          'pediatric',
          'kids',
          'children',
        ])
      );
    }

    // Cosmetic-focused clinics
    if (cosmetic) {
      transformedClinics = transformedClinics.filter((c) =>
        matchesService(c, [
          'cosmetic dermatology',
          'cosmetic',
          'aesthetic',
          'botox',
          'filler',
          'fillers',
          'injectable',
          'laser',
        ])
      );
    }

    // Mohs surgery filter
    if (mohs_surgery) {
      transformedClinics = transformedClinics.filter((c) =>
        matchesService(c, [
          'mohs surgery',
          'mohs',
          'skin cancer surgery',
        ])
      );
    }

    // Intelligence score thresholds (client-side numeric compare)
    if (typeof min_overall_score === 'number') {
      transformedClinics = transformedClinics.filter((c: any) => {
        const score =
          c.intelligence_scores?.overall_score;
        const numScore =
          typeof score === 'number'
            ? score
            : parseFloat(score || '0');
        return !Number.isNaN(numScore) &&
          numScore >= min_overall_score;
      });
    }

    if (typeof min_digital_presence === 'number') {
      transformedClinics = transformedClinics.filter((c: any) => {
        const score =
          c.intelligence_scores?.digital_presence_score;
        const numScore =
          typeof score === 'number'
            ? score
            : parseFloat(score || '0');
        return !Number.isNaN(numScore) &&
          numScore >= min_digital_presence;
      });
    }

    // -----------------------------------------------------------------------
    // BUILD RESPONSE
    // total:
    // - We return the count AFTER client-side filters so the frontend
    //   can show "X clinics found" that matches what it actually received.
    // -----------------------------------------------------------------------
    const response = NextResponse.json({
      clinics: transformedClinics,
      total: transformedClinics.length,
      page,
      per_page: perPage,
    });

    // Cloudflare-friendly cache headers
    // Cache for 5 minutes, allow stale for 1 hour
    response.headers.set(
      'Cache-Control',
      'public, s-maxage=300, stale-while-revalidate=3600'
    );
    response.headers.set(
      'CDN-Cache-Control',
      'public, s-maxage=300'
    );
    response.headers.set(
      'Cloudflare-CDN-Cache-Control',
      'public, max-age=300'
    );

    return response;
  } catch (error) {
    console.error('Error in clinics API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch clinics' },
      { status: 500 }
    );
  }
}

import type { Metadata } from 'next';
import ClinicsClientPage from './ClientPage';

// Map for nice state names
const US_STATES: Record<string, string> = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California',
  CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', FL: 'Florida', GA: 'Georgia',
  HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa',
  KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland',
  MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri',
  MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey',
  NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio',
  OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina',
  SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont',
  VA: 'Virginia', WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming',
  DC: 'Washington DC'
};

function prettifyCity(slug?: string) {
  if (!slug) return '';
  return slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase()); // "houston" -> "Houston"
}

// NOTE: We intentionally type the argument as `any`
// because Next.js 15 may pass searchParams as a Promise.
// We safely unwrap it below.
export async function generateMetadata(props: any): Promise<Metadata> {
  // unwrap searchParams whether it's a Promise or a plain object
  const rawSearchParams =
    props?.searchParams && typeof props.searchParams.then === 'function'
      ? await props.searchParams
      : props?.searchParams || {};

  const rawState = rawSearchParams.state || '';
  const rawCity = rawSearchParams.city || '';
  const rawQ    = rawSearchParams.q || '';
  const rawLat  = rawSearchParams.lat || '';
  const rawLng  = rawSearchParams.lng || '';

  const stateCode =
    typeof rawState === 'string' ? rawState.toUpperCase() : '';
  const stateName =
    typeof rawState === 'string'
      ? US_STATES[stateCode] || rawState
      : '';

  const cityPretty =
    typeof rawCity === 'string'
      ? prettifyCity(rawCity)
      : '';

  // Detect "search-like" pages (internal search results views)
  const hasCoords =
    typeof rawLat === 'string' &&
    rawLat.trim() !== '' &&
    typeof rawLng === 'string' &&
    rawLng.trim() !== '';

  const hasQuery =
    typeof rawQ === 'string' &&
    rawQ.trim() !== '';

  const isSearchLike = hasCoords || hasQuery;

  //
  // === TITLE & DESCRIPTION LOGIC (location-aware) ===
  //
  let title =
    'Find Dermatology Clinics Near You | Derma Clinic Near Me';
  let description =
    'Search dermatologists and skin specialists across the United States. Browse clinic profiles, phone numbers, hours, and reviews.';

  // City-level SEO
  if (cityPretty && stateCode) {
    title = `Best Dermatologists in ${cityPretty}, ${stateCode} | Top Skin Clinics Near You`;
    description = `Find dermatology clinics in ${cityPretty}, ${stateCode}: acne care, cosmetic dermatology, mole checks, and skin cancer screening. Browse phone, hours, and patient reviews.`;
  }
  // State-level SEO (no city picked yet)
  else if (stateName) {
    title = `Dermatology Clinics in ${stateName} | Top Dermatologists in ${stateCode}`;
    description = `Browse dermatologists and skin care clinics in ${stateName}. Contact info, hours, accepted insurance, and patient reviews.`;
  }

  //
  // === CANONICAL URL (strip noisy params like q, lat, lng, per_page) ===
  //
  const siteUrl =
    (process.env.SITE_URL || 'https://dermaclinicnearme.com').replace(/\/$/, '');

  // canonical is stable: only keep state and city, not q/lat/lng/per_page
  const canonicalUrl = (() => {
    // base /clinics
    const url = new URL('/clinics', siteUrl);

    // keep state/city if present because those represent real landing pages
    if (stateCode) {
      url.searchParams.set('state', stateCode);
    }
    if (typeof rawCity === 'string' && rawCity) {
      url.searchParams.set('city', rawCity);
    }

    return url.toString();
  })();

  //
  // === Decide robots index/noindex ===
  // Rule:
  // - default index
  // - noindex if this is basically an internal search (`?q=` or `?lat&lng`)
  // - also noindex if we have state/city but 0 clinics (thin/empty page)
  //
  let indexable = !isSearchLike;

  if (indexable && (stateCode || cityPretty)) {
    try {
      // Quick server-side check: does this location have any clinics?
      const usp = new URLSearchParams();
      if (stateCode) usp.set('state', stateCode);
      if (typeof rawCity === 'string' && rawCity) {
        usp.set('city', rawCity);
      }
      // only need 1 to know it's not empty
      usp.set('per_page', '1');

      // fetch from the live API using the canonical domain
      const res = await fetch(`${siteUrl}/api/clinics?${usp.toString()}`, {
        cache: 'no-store',
      });
      const data = await res.json();

      const total =
        typeof data?.total === 'number'
          ? data.total
          : Array.isArray(data?.clinics)
            ? data.clinics.length
            : 0;

      if (total === 0) {
        indexable = false;
      }
    } catch {
      // if the check fails, we don't crash metadata;
      // we keep whatever indexable currently is
    }
  }

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    robots: {
      // If this is a search-like page or empty listing, noindex it.
      index: indexable,
      follow: true,
      noarchive: false,
    },
  };
}

// Server component that renders the actual interactive client UI
export default function ClinicsPage() {
  return <ClinicsClientPage />;
}

// app/state/[code]/page.tsx
import { notFound } from 'next/navigation';
import Link from 'next/link';
import CityGrid from '@/components/CityGrid';
import type { Metadata } from 'next';
import { createSupabaseClient } from '@/lib/supabase';

// Force dynamic rendering - pages will render at runtime with database access
// This prevents build-time errors when Supabase credentials aren't available
export const dynamic = 'force-dynamic';

// Map 2-letter state codes to readable names
const US_STATES: Record<string, string> = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas',
  CA: 'California', CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware',
  FL: 'Florida', GA: 'Georgia', HI: 'Hawaii', ID: 'Idaho',
  IL: 'Illinois', IN: 'Indiana', IA: 'Iowa', KS: 'Kansas',
  KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland',
  MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi',
  MO: 'Missouri', MT: 'Montana', NE: 'Nebraska', NV: 'Nevada',
  NH: 'New Hampshire', NJ: 'New Jersey', NM: 'New Mexico', NY: 'New York',
  NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio', OK: 'Oklahoma',
  OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina',
  SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah',
  VT: 'Vermont', VA: 'Virginia', WA: 'Washington', WV: 'West Virginia',
  WI: 'Wisconsin', WY: 'Wyoming', DC: 'Washington DC',
};

/**
 * Pre-render all state pages at build time.
 * This gives:
 *   - fast first load
 *   - stable HTML for Google
 *   - better Core Web Vitals
 */
export function generateStaticParams() {
  const STATE_CODES = [
    'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
    'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
    'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
    'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
    'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC',
  ];

  return STATE_CODES.map(code => ({
    code: code.toLowerCase(), // must match the dynamic folder name [code]
  }));
}

// Next 15 treats params as Promise-like for server components
interface StatePageProps {
  params: Promise<{
    code: string;
  }>;
}

/**
 * Per-state SEO metadata.
 */
export async function generateMetadata(
  { params }: StatePageProps
): Promise<Metadata> {
  // unwrap params
  const { code } = await params;
  const stateCode = code.toUpperCase(); // "TX"
  const stateName = US_STATES[stateCode]; // "Texas"

  // Canonical base for this state page
  const siteUrl = (process.env.SITE_URL || 'https://dermaclinicnearme.com').replace(/\/$/, '');
  const canonical = `${siteUrl}/state/${code.toLowerCase()}`;

  // Invalid state → don't let it index
  if (!stateName) {
    const notFoundTitle = 'State not found | Derma Clinic Near Me';
    const notFoundDesc =
      'We could not find dermatology listings for this location.';

    return {
      title: notFoundTitle,
      description: notFoundDesc,
      robots: {
        index: false,
        follow: false,
      },
      alternates: {
        canonical,
      },
      openGraph: {
        title: notFoundTitle,
        description: notFoundDesc,
        url: canonical,
        type: 'website',
      },
    };
  }

  // ✅ Tuned SEO copy for valid states
  const title = `Dermatologists in ${stateName} by City | ${stateCode} Skin Clinics Directory`;
  const description = `Browse dermatology clinics across ${stateName} by city. Pick your city to see local dermatologists, phone numbers, hours, and patient reviews.`;

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

/**
 * Actual page UI (+ JSON-LD ItemList for cities)
 */
export default async function StatePage({ params }: StatePageProps) {
  const { code } = await params;
  const stateCode = code.toUpperCase();

  // If invalid state → 404 (this triggers Next's not-found UI)
  if (!US_STATES[stateCode]) {
    notFound();
  }

  const stateName = US_STATES[stateCode];

  // -------- Build ItemList JSON-LD for this state --------
  // We'll mirror the /api/cities?state=XX logic here on the server
  // so we can output structured data that Google can read.
  const supabase = createSupabaseClient();

  let uniqueCities: string[] = [];
  try {
    // Get all clinic rows for this state (only need the city field)
    const { data: cityRows, error: groupErr } = await supabase
      .from('clinics')
      .select('city')
      .eq('state_code', stateCode);

    if (!groupErr && Array.isArray(cityRows)) {
      // Count clinics per city
      const countsByCity: Record<string, number> = {};
      for (const row of cityRows) {
        const cName = (row.city || '').trim();
        if (!cName) continue;
        countsByCity[cName] = (countsByCity[cName] || 0) + 1;
      }

      // Sort city names by clinic volume desc
      uniqueCities = Object.keys(countsByCity).sort(
        (a, b) => (countsByCity[b] || 0) - (countsByCity[a] || 0)
      );
    }
  } catch {
    // swallow; uniqueCities stays []
  }

  // Construct ItemList schema.org for these city landing targets
  const siteUrl = (process.env.SITE_URL || 'https://dermaclinicnearme.com').replace(/\/$/, '');
  const cityItemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": uniqueCities.map((cityName: string, idx: number) => ({
      "@type": "ListItem",
      "position": idx + 1,
      "name": `Dermatology clinics in ${cityName}, ${stateCode}`,
      "url": `${siteUrl}/clinics?state=${encodeURIComponent(
        stateCode
      )}&city=${encodeURIComponent(cityName)}`
    })),
  };

  return (
    <>
      {/* SEO structured data for the list of cities in this state */}
      <script
        type="application/ld+json"
        suppressHydrationWarning
        // We stringify on the server. Google reads this for rich understanding.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(cityItemList) }}
      />

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            <Link
              href="/"
              className="text-blue-100 hover:text-white mb-4 inline-block"
            >
              ← Back to Home
            </Link>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3">
              Dermatology Clinics in {stateName}
            </h1>
            <p className="text-lg sm:text-xl text-blue-100">
              Select a city to find clinics near you
            </p>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <CityGrid stateCode={stateCode} />
        </main>
      </div>
    </>
  );
}

// app/state/[code]/city/[slug]/page.tsx

// Force dynamic rendering - pages will render at runtime with database access
// This prevents build-time errors when Supabase credentials aren't available
export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import CityClientPage from './CityClientPage';
import { createSupabaseClient } from '@/lib/supabase';

// helper: "san-diego" -> "San Diego"
function unslugifyCity(slug: string) {
  return slug
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

// --- types ---
interface CityPageParams {
  code: string;
  slug: string;
}
interface CityPageProps {
  params: Promise<CityPageParams>;
}

// Fetch clinics for that city/state (server side, used both by metadata + page)
async function getClinicsForCity(stateCode: string, cityName: string) {
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from('clinics')
    .select('*')
    .eq('state_code', stateCode)
    .ilike('city', cityName) // case-insensitive match
    .order('rating', { ascending: false });

  if (error) {
    console.error('City page clinic fetch error:', error);
    return [];
  }

  // return only rows that look real / have a slug
  return (data ?? []).filter((c: any) => c && c.slug);
}

/**
 * SEO metadata for this city URL.
 * - canonical is the pretty /state/{code}/city/{slug} URL
 * - robots: noindex if we literally have no clinics in that city
 */
export async function generateMetadata(
  { params }: CityPageProps
): Promise<Metadata> {
  const { code, slug } = await params;

  const stateCode = code.toUpperCase();
  const cityPretty = unslugifyCity(slug);

  const siteUrl = (process.env.SITE_URL || 'https://dermaclinicnearme.com').replace(/\/$/, '');
  const canonical = `${siteUrl}/state/${code.toLowerCase()}/city/${slug.toLowerCase()}`;

  // Pull clinics so we can see if there's anything to index
  const clinics = await getClinicsForCity(stateCode, cityPretty);
  const hasResults = clinics.length > 0;

  const title = hasResults
    ? `Best Dermatologists in ${cityPretty}, ${stateCode} | Top Skin Clinics Near You`
    : `Dermatologists in ${cityPretty}, ${stateCode} | Clinic Directory`;
  const description = hasResults
    ? `Find dermatology clinics in ${cityPretty}, ${stateCode}: acne care, cosmetic dermatology, mole checks, and skin cancer screening. Browse phone, hours, and reviews.`
    : `Browse dermatology providers in ${cityPretty}, ${stateCode}. Contact details, hours, and services.`;

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
      // If empty city (no clinics), don't index this thin page.
      index: hasResults,
      follow: true,
    },
  };
}

/**
 * Page:
 * - Injects ItemList JSON-LD for the clinics in this city (good for local SEO)
 * - Renders a client component that recreates the full interactive Clinics UI:
 *   sticky SearchBar with Near Me, filters sidebar, map/grid toggle, etc.
 *   (screenshot #1 layout)
 */
export default async function CityPage({ params }: CityPageProps) {
  const { code, slug } = await params;

  const stateCode = code.toUpperCase();
  const cityPretty = unslugifyCity(slug);

  // fetch clinics for hydration + JSON-LD
  const clinics = await getClinicsForCity(stateCode, cityPretty);

  // Build ItemList JSON-LD for these clinics
  const siteUrl = (process.env.SITE_URL || 'https://dermaclinicnearme.com').replace(/\/$/, '');
  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: clinics.map((c: any, idx: number) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: c.display_name || c.name || 'Dermatology Clinic',
      url: `${siteUrl}/clinics/${c.slug}`,
    })),
  };

  return (
    <>
      {/* JSON-LD for ItemList (helps Google understand "list of dermatology clinics in CITY") */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }}
      />

      {/* Interactive city view with filters / Near Me / etc. */}
      <CityClientPage
        stateCode={stateCode}
        cityPretty={cityPretty}
        clinicsFromServer={clinics}
      />
    </>
  );
}

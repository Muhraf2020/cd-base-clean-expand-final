// app/sitemap.xml/route.ts
//
// City-level sitemap:
//   https://dermaclinicnearme.com/sitemap.xml
//
// This lists URLs like:
//   https://dermaclinicnearme.com/state/CA/city/san-francisco
//   https://dermaclinicnearme.com/state/NY/city/new-york
//
// It does NOT touch /sitemap-clinics.xml (clinic detail URLs).

import { createSupabaseClient } from '@/lib/supabase';

// Use the same idea as robots.ts → prefer SITE_URL, fall back to NEXT_PUBLIC_SITE_URL, then default
function getBase(): string {
  return (
    process.env.SITE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    'https://dermaclinicnearme.com'
  ).replace(/\/$/, '');
}

// Escape text for XML
function xmlEscape(str: string | null | undefined): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Slugify a city name in the same style as your routes use
// e.g. "San Francisco" → "san-francisco"
function slugifyCity(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-') // non-alphanumerics → dash
    .replace(/-+/g, '-')          // collapse multiple dashes
    .replace(/^-|-$/g, '');       // trim leading/trailing dash
}

interface CityRow {
  state_code: string | null;
  city: string | null;
  updated_at?: string | null;
}

export async function GET() {
  const base = getBase();
  const supabase = createSupabaseClient();

  // We’ll walk through the clinics table and derive unique cities
  const pageSize = 1000;
  let start = 0;

  // key = "CA|san francisco"
  const seen = new Map<string, { state_code: string; city: string; lastmod?: string }>();

  for (;;) {
    const { data, error } = await supabase
      .from('clinics')
      .select('state_code, city, updated_at')
      .order('state_code', { ascending: true })
      .order('city', { ascending: true })
      .range(start, start + pageSize - 1);

    if (error) {
      console.error('sitemap cities query error:', error);
      break;
    }

    const rows = (data ?? []) as CityRow[];

    if (rows.length === 0) {
      break;
    }

    for (const row of rows) {
      if (!row.state_code || !row.city) continue;

      const stateCode = row.state_code.trim();
      const cityName = row.city.trim();

      if (!stateCode || !cityName) continue;

      const key = `${stateCode}|${cityName.toLowerCase()}`;
      const lastmodISO = row.updated_at
        ? new Date(row.updated_at).toISOString()
        : undefined;

      const existing = seen.get(key);
      if (!existing) {
        seen.set(key, { state_code: stateCode, city: cityName, lastmod: lastmodISO });
      } else if (lastmodISO && (!existing.lastmod || lastmodISO > existing.lastmod)) {
        // keep the most recent updated_at for that city
        existing.lastmod = lastmodISO;
      }
    }

    if (rows.length < pageSize) {
      // last batch
      break;
    }
    start += pageSize;
  }

  // Build XML
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  for (const { state_code, city, lastmod } of seen.values()) {
    const slug = slugifyCity(city);
    const loc = `${base}/state/${state_code}/city/${slug}`;
    const lastmodFinal = lastmod || new Date().toISOString();

    xml += `  <url>\n`;
    xml += `    <loc>${xmlEscape(loc)}</loc>\n`;
    xml += `    <lastmod>${xmlEscape(lastmodFinal)}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.7</priority>\n`;
    xml += `  </url>\n`;
  }

  xml += `</urlset>`;

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=86400', // 1 day cache
    },
  });
}

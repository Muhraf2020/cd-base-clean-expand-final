// app/sitemap-clinics.xml/route.ts
//
// https://dermaclinicnearme.com/sitemap-clinics.xml

// Force dynamic rendering - don't pre-render at build time
export const dynamic = 'force-dynamic';

import { createSupabaseClient } from '@/lib/supabase';

// Do NOT export runtime='edge' here.
// Cloudflare/OpenNext can't bundle an edge route together with the rest
// of your app in one Worker, so leaving this out fixes the deploy.

function getBase(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://dermaclinicnearme.com')
    .replace(/\/$/, '');
}

// Minimal escaping so we don't accidentally generate invalid XML
function xmlEscape(str: string | null | undefined): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  const base = getBase();

  // We'll build raw XML manually
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  const supabase = createSupabaseClient();

  const pageSize = 1000;
  let start = 0;

  // paginate through all clinics in batches of 1000
  for (;;) {
    const { data, error } = await supabase
      .from('clinics')
      .select('slug, updated_at')
      .order('slug', { ascending: true })
      .range(start, start + pageSize - 1);

    if (error) {
      console.error('sitemap-clinics query error:', error);
      break;
    }

    const rows = data ?? [];
    if (rows.length === 0) {
      break;
    }

    for (const row of rows) {
      if (!row.slug) continue;

      const loc = `${base}/clinics/${row.slug}`;
      const lastModISO = row.updated_at
        ? new Date(row.updated_at).toISOString()
        : new Date().toISOString();

      xml += `  <url>\n`;
      xml += `    <loc>${xmlEscape(loc)}</loc>\n`;
      xml += `    <lastmod>${xmlEscape(lastModISO)}</lastmod>\n`;
      xml += `    <changefreq>monthly</changefreq>\n`;
      xml += `    <priority>0.4</priority>\n`;
      xml += `  </url>\n`;
    }

    if (rows.length < pageSize) {
      // that was the last batch
      break;
    }
    start += pageSize;
  }

  xml += `</urlset>`;

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      // cache 1 day, totally fine for sitemap
      'Cache-Control': 'public, max-age=86400',
    },
  });
}

// app/sitemap.xml/route.ts
// https://dermaclinicnearme.com/sitemap.xml

// Use the same base URL logic as app/robots.ts
function getBase(): string {
  return (process.env.SITE_URL || 'https://dermaclinicnearme.com')
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
  const now = new Date().toISOString();

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    `  <sitemap>\n` +
    `    <loc>${xmlEscape(`${base}/sitemap-clinics.xml`)}</loc>\n` +
    `    <lastmod>${xmlEscape(now)}</lastmod>\n` +
    `  </sitemap>\n` +
    `</sitemapindex>`;

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      // cache 1 day
      'Cache-Control': 'public, max-age=86400',
    },
  });
}

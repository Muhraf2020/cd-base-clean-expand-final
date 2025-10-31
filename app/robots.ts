// app/robots.ts
import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  // Normalize base URL (no trailing slash)
  const siteUrl = (process.env.SITE_URL || 'https://dermaclinicnearme.com').replace(/\/$/, '');

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          // block raw parammed search/list pages from being indexed
          '/clinics?',
          '/clinics?*',
          '/state/*?*',
        ],
      },
    ],
    // Tell crawlers about BOTH sitemaps:
    sitemap: [
      `${siteUrl}/sitemap.xml`,
      `${siteUrl}/sitemap-clinics.xml`,
    ],
    // Host directive (no protocol)
    host: siteUrl.replace(/^https?:\/\//, ''),
  };
}

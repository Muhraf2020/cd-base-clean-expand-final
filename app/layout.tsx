// export const runtime = 'edge';

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';

import dynamic from 'next/dynamic';

// CompareProvider is still fine to render in a Server Component.
// It's a client boundary, and Next will handle that.
import { CompareProvider } from '@/contexts/CompareContext';

// Lazy-load the floating compare bar, but WITHOUT { ssr: false }.
// This keeps code-splitting but satisfies the Server Component rule.
const CompareFloatingBar = dynamic(() => import('@/components/CompareFloatingBar'));

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Derma Clinic Near Me | Find Dermatology Clinics in USA',
  description:
    'Comprehensive directory of dermatology clinics across the United States. Find skin care specialists, ratings, reviews, and contact information.',
  keywords: [
    'derma clinic near me',
    'dermatologist near me',
    'dermatologist close to me',
    'skin specialist near me',
    'black dermatologist near me',
    'walk in dermatologist near me',
    'best skin doctor near me',
    'nearest dermatologist',
  ],
  authors: [{ name: 'Derma Clinic Near Me' }],
  openGraph: {
    title: 'Derma Clinic Near Me',
    description: 'Find the best dermatology clinics across the USA',
    url: 'https://dermaclinicnearme.com',
    siteName: 'Derma Clinic Near Me',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Derma Clinic Near Me',
    description: 'Find the best dermatology clinics across the USA',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // google: 'your-google-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // GA4 Measurement ID
  const GA_ID = 'G-J1L5SKGEXW';

  // Google Ads / Google Tag ID
  const ADS_ID = 'AW-641859201';

  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#2563eb" />
        {/* If you use a strict CSP, be sure to allow googletagmanager.com */}
      </head>

      <body className={inter.className}>
        {/* Global comparison state provider wraps the whole app */}
        <CompareProvider>
          {children}

          {/* Floating compare bar loads as a separate chunk now */}
          <CompareFloatingBar />
        </CompareProvider>

        {/* Global Google Tag (GA4 + Ads)
           Using lazyOnload so it's not counted as render-blocking. */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="lazyOnload"
        />

        <Script id="gtag-init" strategy="lazyOnload">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}

            // Initialize gtag
            gtag('js', new Date());

            // GA4 config
            gtag('config', '${GA_ID}');

            // Google Ads config
            gtag('config', '${ADS_ID}');
          `}
        </Script>
      </body>
    </html>
  );
}

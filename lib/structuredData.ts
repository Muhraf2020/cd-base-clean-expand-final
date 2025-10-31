// lib/structuredData.ts
import { Clinic } from './dataTypes';

/**
 * Generate JSON-LD structured data for a clinic (LocalBusiness schema)
 * This helps Google understand your business and display rich results
 */
export function generateClinicSchema(clinic: Clinic, canonicalUrl: string) {
  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'MedicalBusiness',
    '@id': canonicalUrl,
    name: clinic.display_name,
    description: `Dermatology clinic providing skin care services in ${clinic.city}, ${clinic.state_code}`,
    url: canonicalUrl,
    telephone: clinic.phone || undefined,
    address: {
      '@type': 'PostalAddress',
      streetAddress: clinic.formatted_address?.split(',')[0] || '',
      addressLocality: clinic.city || '',
      addressRegion: clinic.state_code || '',
      postalCode: clinic.postal_code || '',
      addressCountry: 'US',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: clinic.location?.lat,
      longitude: clinic.location?.lng,
    },
  };

  // Add rating if available
  if (clinic.rating && clinic.user_rating_count) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: clinic.rating,
      reviewCount: clinic.user_rating_count,
      bestRating: 5,
      worstRating: 1,
    };
  }

  // Add opening hours if available
  if (clinic.opening_hours?.weekday_text) {
    schema.openingHoursSpecification = clinic.opening_hours.weekday_text.map(text => {
      const [day, hours] = text.split(': ');
      
      if (hours.toLowerCase().includes('closed')) {
        return null;
      }

      // Parse hours (e.g., "9:00 AM – 5:00 PM")
      const timeMatch = hours.match(/(\d{1,2}):(\d{2})\s*(AM|PM)\s*[-–—]\s*(\d{1,2}):(\d{2})\s*(AM|PM)/i);
      
      if (!timeMatch) return null;

      const [, openHour, openMin, openPeriod, closeHour, closeMin, closePeriod] = timeMatch;

      return {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: day,
        opens: formatTime(openHour, openMin, openPeriod),
        closes: formatTime(closeHour, closeMin, closePeriod),
      };
    }).filter(Boolean);
  }

  // Add website
  if (clinic.website) {
    schema.sameAs = [clinic.website];
  }

  // Add image if available
  if (clinic.photos && clinic.photos.length > 0) {
    schema.image = `/api/photo?name=${encodeURIComponent(clinic.photos[0].name)}`;
  }

  // Add price range if available
  if (clinic.price_level) {
    schema.priceRange = '$'.repeat(clinic.price_level);
  }

  // Add accessibility features
  if (clinic.accessibility_options?.wheelchair_accessible_entrance) {
    schema.accessibilityFeature = ['Wheelchair accessible entrance'];
  }

  return schema;
}

function formatTime(hour: string, minute: string, period: string): string {
  let h = parseInt(hour);
  if (period.toUpperCase() === 'PM' && h !== 12) h += 12;
  if (period.toUpperCase() === 'AM' && h === 12) h = 0;
  return `${h.toString().padStart(2, '0')}:${minute}`;
}

/**
 * Generate breadcrumb structured data
 */
export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Generate organization schema for homepage
 */
export function generateOrganizationSchema(baseUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Derm Clinics Near Me',
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    description: 'Comprehensive directory of dermatology clinics across the United States',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      availableLanguage: 'English',
    },
    sameAs: [
      // Add your social media links here
    ],
  };
}

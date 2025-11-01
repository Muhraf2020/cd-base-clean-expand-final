/**
 * Amenity Helpers - Simplified for camelCase data
 * Your diagnostic shows all data is already in camelCase format
 */

// All possible amenity keys from Google Places API
export const AMENITY_KEYS = {
  accessibility: [
    'wheelchairAccessibleEntrance',
    'wheelchairAccessibleParking',
    'wheelchairAccessibleRestroom',
    'wheelchairAccessibleSeating',
  ],
  parking: [
    'freeParkingLot',
    'paidParkingLot',
    'freeStreetParking',
    'paidStreetParking',
    'valetParking',
    'freeGarageParking',
    'paidGarageParking',
  ],
  payment: [
    'acceptsCashOnly',
    'acceptsCreditCards',
    'acceptsDebitCards',
    'acceptsNfc',
    'acceptsChecks',
  ],
};

// Human-readable labels for amenities
export const AMENITY_LABELS: Record<string, string> = {
  // Accessibility
  wheelchairAccessibleEntrance: 'Wheelchair Accessible Entrance',
  wheelchairAccessibleParking: 'Wheelchair Accessible Parking',
  wheelchairAccessibleRestroom: 'Wheelchair Accessible Restroom',
  wheelchairAccessibleSeating: 'Wheelchair Accessible Seating',
  
  // Parking
  freeParkingLot: 'Free Parking Lot',
  paidParkingLot: 'Paid Parking Lot',
  freeStreetParking: 'Free Street Parking',
  paidStreetParking: 'Paid Street Parking',
  valetParking: 'Valet Parking',
  freeGarageParking: 'Free Garage Parking',
  paidGarageParking: 'Paid Garage Parking',
  
  // Payment
  acceptsCashOnly: 'Cash Only',
  acceptsCreditCards: 'Credit Cards',
  acceptsDebitCards: 'Debit Cards',
  acceptsNfc: 'NFC/Contactless',
  acceptsChecks: 'Checks',
};

/**
 * Get all unique amenity keys across multiple clinics
 * This ensures the comparison shows ALL amenities from ALL clinics
 */
export function getAllUniqueAmenityKeys(clinics: any[]): {
  accessibility: string[];
  parking: string[];
  payment: string[];
} {
  const accessibilitySet = new Set<string>();
  const parkingSet = new Set<string>();
  const paymentSet = new Set<string>();

  clinics.forEach(clinic => {
    // Collect accessibility keys
    if (clinic.accessibility_options) {
      Object.keys(clinic.accessibility_options).forEach(key => {
        if (AMENITY_KEYS.accessibility.includes(key)) {
          accessibilitySet.add(key);
        }
      });
    }

    // Collect parking keys  
    if (clinic.parking_options) {
      Object.keys(clinic.parking_options).forEach(key => {
        if (AMENITY_KEYS.parking.includes(key)) {
          parkingSet.add(key);
        }
      });
    }

    // Collect payment keys
    if (clinic.payment_options) {
      Object.keys(clinic.payment_options).forEach(key => {
        if (AMENITY_KEYS.payment.includes(key)) {
          paymentSet.add(key);
        }
      });
    }
  });

  return {
    accessibility: Array.from(accessibilitySet).sort(),
    parking: Array.from(parkingSet).sort(),
    payment: Array.from(paymentSet).sort(),
  };
}

/**
 * Get amenity value for a clinic (true, false, or undefined)
 */
export function getAmenityValue(
  clinic: any,
  category: 'accessibility' | 'parking' | 'payment',
  key: string
): boolean | undefined {
  const fieldMap = {
    accessibility: 'accessibility_options',
    parking: 'parking_options',
    payment: 'payment_options',
  };

  const field = fieldMap[category];
  const options = clinic[field];

  if (!options || typeof options !== 'object') {
    return undefined;
  }

  return options[key];
}

/**
 * Check if a clinic has any amenity data
 */
export function hasAnyAmenities(clinic: any): boolean {
  return !!(
    (clinic.accessibility_options && Object.keys(clinic.accessibility_options).length > 0) ||
    (clinic.parking_options && Object.keys(clinic.parking_options).length > 0) ||
    (clinic.payment_options && Object.keys(clinic.payment_options).length > 0)
  );
}

/**
 * Format amenity category name for display
 */
export function formatCategoryName(category: string): string {
  const names: Record<string, string> = {
    accessibility: '♿ Accessibility',
    parking: '🅿️ Parking',
    payment: '💳 Payment Options',
  };
  return names[category] || category;
}

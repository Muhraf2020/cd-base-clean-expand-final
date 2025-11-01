// lib/dataTypes.ts
// Type definitions for Dermatology Clinic Directory

// ============================================================================
// Core primitives
// ============================================================================

export interface Location {
  lat: number;
  lng: number;
}

export interface AccessibilityOptions {
  wheelchair_accessible_entrance?: boolean;
  wheelchair_accessible_parking?: boolean;
  wheelchair_accessible_restroom?: boolean;
  wheelchair_accessible_seating?: boolean;
}

export interface ParkingOptions {
  free_parking_lot?: boolean;
  paid_parking_lot?: boolean;
  free_street_parking?: boolean;
  paid_street_parking?: boolean;
  valet_parking?: boolean;
  free_garage_parking?: boolean;
  paid_garage_parking?: boolean;
}

export interface PaymentOptions {
  accepts_credit_cards?: boolean;
  accepts_debit_cards?: boolean;
  accepts_cash_only?: boolean;
  accepts_nfc?: boolean;
}

export interface PhotoAttribution {
  display_name: string;
  uri: string;
  photo_uri: string;
}

export interface Photo {
  name: string;
  width_px?: number;
  height_px?: number;
  author_attributions?: PhotoAttribution[];
}

export interface OpeningHours {
  open_now?: boolean | null;
  periods?: Array<{
    open: { day: number; hour: number; minute: number };
    close?: { day: number; hour: number; minute: number };
  }>;
  weekday_text?: string[];
}

// ============================================================================
// Tier 1 enrichment: reviews, Q&A, traffic, website intel, NPI, scores
// ============================================================================

export interface PopularTime {
  day: number; // 0 = Sunday, 6 = Saturday
  hour: number; // 0-23
  occupancy: number; // 0-100 percentage
}

// Alternate structure Claude suggested (map of day -> hours/popularity)
export type PopularTimes = {
  [day: string]: Array<{
    hour: number;
    popularity: number;
  }>;
};

export interface Review {
  author_name: string;
  author_photo?: string;
  rating: number;
  text: string;
  time: number; // Unix timestamp
  relative_time_description: string;
}

export interface QuestionAnswer {
  question: string;
  answer?: string;
  author_name: string;
  time?: number; // you had this, Claude's version drops it, keep optional
}

export interface WebsiteServices {
  has_online_booking: boolean;
  has_telehealth: boolean;
  has_patient_portal: boolean;
  mentioned_services: string[]; // e.g., ["Botox", "Acne Treatment", "Skin Cancer Screening"]
  insurance_mentioned: boolean;
  languages: string[]; // Languages mentioned on website
}

export interface NPIData {
  npi_number: string;
  provider_name: string;
  taxonomy_description: string; // e.g., "Dermatology"
  is_verified: boolean;
  verification_date: string;
  board_certifications?: string[];
}

export interface IntelligenceScores {
  overall_score: number; // 0-100
  data_completeness_score: number; // 0-100
  service_diversity_score: number; // 0-100
  digital_presence_score: number; // 0-100
  patient_experience_score: number; // 0-100
  calculated_at: string;
}

// ============================================================================
// Tier 2 enrichment: competition, sentiment, convenience, etc.
// We'll merge your version + Claude's version so nothing breaks.
// ============================================================================

export interface CompetitionMetrics {
  // Your version
  competition_density?: 'Low' | 'Medium' | 'High';
  competitors_within_5mi?: number;
  market_position?: string | 'Top Rated' | 'Highly Rated' | 'Above Average' | 'Average';
  rating_percentile?: number; // 0-100
  reviews_percentile?: number; // 0-100
  price_positioning?: 'Budget' | 'Mid-range' | 'Premium' | 'Unknown';
  service_breadth_vs_market?: 'Below Average' | 'Average' | 'Above Average';
  amenities_score_vs_local?: number; // 0-100

  // Claude extras
  local_rank?: number;
  total_competitors?: number;
}

export interface ReviewIntelligence {
  // Volume & sentiment
  overall_sentiment?: 'Very Positive' | 'Positive' | 'Mixed' | 'Neutral' | 'Negative';
  sentiment_score?: number; // 0-1
  total_analyzed?: number;

  // Themes
  common_praise?: Array<{ topic: string; mentions: number; sentiment?: number }>;
  common_complaints?: Array<{ topic: string; mentions: number; sentiment?: number }>;

  // Extracted insights
  extracted_insights?: {
    typical_wait_time?: string;
    best_time_to_visit?: string;
    booking_lead_time?: string;

    // Claude extras
    staff_friendliness?: 'Excellent' | 'Good' | 'Average' | 'Poor';
    cleanliness?: 'Excellent' | 'Good' | 'Average' | 'Poor';
  };

  // Service + staff mentions (your version)
  services_mentioned?: Record<string, number>; // e.g. "Botox": 23
  staff_mentions?: {
    doctor_names?: string[];
    positive_staff_mentions?: number;
  };
}

export interface MedicareQuality {
  overall_rating?: number; // 1-5 stars
  patient_experience_rating?: number;
  quality_of_care_rating?: number;
  data_available: boolean;
  last_updated?: string;
  source: 'CMS' | 'Not Available';
}

// Merge your version + Claude's
export interface ConvenienceScores {
  // Access / mobility
  transit_score?: number; // 0-100
  walk_score?: number; // 0-100
  bike_score?: number; // 0-100

  // Claude's shape
  parking_assessment?: {
    difficulty: 'Easy' | 'Moderate' | 'Difficult';
    estimated_cost: string; // "$0-5/hour"
  };

  nearest_transit?: {
    type: string; // 'subway', 'bus', 'train'
    name: string;
    distance_miles: number;
  };

  nearby_amenities?: Array<{
    // merged: Claude allows any type string, you had specific enum
    type?: 'pharmacy' | 'hospital' | 'lab' | 'urgent_care' | string;
    name: string;
    distance_miles: number;
  }>;
}

export interface HealthEquityData {
  medically_underserved_area: boolean;
  health_professional_shortage_area: boolean;
  area_deprivation_index?: number; // 0-100 (higher = more deprived)

  census_data?: {
    median_income: string;
    poverty_rate: number;
    uninsured_rate: number;
  };

  clinic_equity_features: {
    sliding_scale_fees: boolean;
    serves_uninsured: boolean;
    multilingual_staff: boolean;
  };
}

export interface WebsiteQuality {
  quality_score: number; // 0-100
  mobile_friendly: boolean;
  load_time_seconds: number;
  accessibility_score?: number;
  ssl_certificate: boolean;
  last_updated_estimate?: string;

  features: {
    has_blog: boolean;
    has_faq: boolean;
    has_virtual_tour: boolean;
    has_patient_portal: boolean;
    portal_provider?: string;
  };
}

export interface SocialProofExtended {
  aggregate_rating: number;
  total_reviews_all_platforms: number;

  platforms: {
    google?: { rating: number; count: number };
    yelp?: { rating: number; count: number };
    healthgrades?: { rating: number; count: number };
    facebook?: { rating: number; count: number };
  };

  // Claude calls these "trust_signals"; you had more detail
  trust_signals?: {
    bbb_rating?: string;
    years_in_business?: number;
    response_rate_percent?: number; // your version
    response_rate?: number;        // Claude version in %
    avg_response_time_hours?: number;
    response_time_hours?: number;  // Claude version
  };

  // Your version
  social_media?: {
    facebook_likes?: number;
    instagram_followers?: number;
  };
}

// Merge both busy-level taxonomies so either works
export interface RealTimeStatus {
  currently_open: boolean;
  current_busy_level?:
    | 'Low'
    | 'Moderate'
    | 'High'
    | 'Very High'
    | 'Not busy'
    | 'A little busy'
    | 'Usually busy'
    | 'Very busy';

  availability?: {
    accepts_walk_ins: boolean;
    estimated_wait_if_walk_in?: string;
    next_available_appointment_estimate?: string;
  };

  trending?: {
    rating_trend_30d?: 'up' | 'down' | 'stable';
    rating_change_30d?: number;
    new_reviews_30d?: number;
    actively_responding?: boolean;
  };
}

// Optional richer NPI data (your extended version)
export interface EnhancedNPIData extends NPIData {
  credential?: string; // MD, DO, PA, NP
  medical_school?: string;
  graduation_year?: number;
  board_certifications?: string[];
  group_practice_size?: number;
  hospital_affiliations?: string[];
  practice_locations?: Array<{
    address: string;
    city: string;
    state: string;
  }>;
}

// ============================================================================
// Main Clinic interface
// We merge your version + Claude's into one definition
// ============================================================================

export interface Clinic {
  // Core identity / location
  place_id: string;
  slug?: string;
  display_name: string;
  formatted_address: string;
  location: Location;

  city?: string | null;
  state_code?: string | null;
  postal_code?: string | null;

  // Basic business info
  primary_type: string | null;
  types: string[];
  rating?: number | null;
  user_rating_count?: number | null;

  // Hours / status
  current_open_now?: boolean | null;
  opening_hours?: OpeningHours;

  // Contact / web
  phone?: string | null;
  international_phone_number?: string | null;
  website?: string | null;
  google_maps_uri: string;
  business_status: 'OPERATIONAL' | 'CLOSED_TEMPORARILY' | 'CLOSED_PERMANENTLY' | string | null;

  // Amenities
  accessibility_options?: AccessibilityOptions;
  parking_options?: ParkingOptions;
  payment_options?: PaymentOptions;

  // Media
  photos?: Photo[];

  // Pricing
  price_level?: number | null;

  // Services you might collect separately
  services?: string[];

  // Crawled timestamps
  last_fetched_at: string;
  created_at?: string;
  updated_at?: string;

  // Feature flag
  featured_clinic?: boolean;

  // Tier 1 enrichment
  popular_times?: PopularTime[] | PopularTimes | null;
  reviews?: Review[];
  questions_answers?: QuestionAnswer[];
  website_services?: WebsiteServices;
  npi_data?: NPIData | EnhancedNPIData;
  intelligence_scores?: IntelligenceScores;

  // Tier 2 enrichment
  competition_metrics?: CompetitionMetrics;
  review_intelligence?: ReviewIntelligence;
  medicare_quality?: MedicareQuality;
  convenience_scores?: ConvenienceScores;
  health_equity_data?: HealthEquityData;
  website_quality?: WebsiteQuality;
  social_proof_extended?: SocialProofExtended;
  real_time_status?: RealTimeStatus;

  // Internal metadata about scraping/enrichment
  enhanced_data_fetched_at?: string;
  enhancement_version?: string; // e.g., "1.0"
  tier2_enhanced_at?: string;
  tier2_enhancement_version?: string;
}

// ============================================================================
// Searching / filtering / paging DTOs
// ============================================================================

export interface SearchParams {
  location?: string;
  lat?: number;
  lng?: number;
  radius?: number;

  rating_min?: number;
  open_now?: boolean;
  wheelchair_accessible?: boolean;
  free_parking?: boolean;
}

// This powers UI state like checkboxes, dropdowns, sliders, etc.
// Merged: your original FilterOptions + Claude's extended FilterOptions
export interface FilterOptions {
  // Text / keyword search
  query?: string;

  // Location filters
  states?: string[];
  cities?: string[];
  city?: string;
  postal_code?: string;
  lat?: number;
  lng?: number;
  radius_miles?: number;

  // Rating / quality
  rating_min?: number;

  // Basic availability
  open_now?: boolean;

  // Contact / presence
  has_website?: boolean;
  has_phone?: boolean;

  // Amenities & accessibility
  wheelchair_accessible?: boolean;
  free_parking?: boolean;

  // Digital services (website_services JSONB)
  has_online_booking?: boolean;
  has_telehealth?: boolean;
  has_patient_portal?: boolean;
  accepts_insurance?: boolean;

  // Services filter (from mentioned_services array or name match)
  services?: string[]; // e.g., ['acne', 'botox', 'laser']

  // Specialty slices
  pediatric?: boolean;
  cosmetic?: boolean;
  mohs_surgery?: boolean;

  // NPI verification
  npi_verified?: boolean;

  // Intelligence score thresholds
  min_overall_score?: number;
  min_digital_presence?: number;

  // Sort/paging
  sort_by?: 'rating' | 'reviews' | 'name' | 'distance' | 'score';
  sort_order?: 'asc' | 'desc';
  limit?: number;
  offset?: number;

  // Kept from your original FilterOptions for compatibility
  open_now_only?: boolean; // legacy-style flag if you had one in UI
}

// API response shapes
export interface SearchResult {
  clinics: Clinic[];
  total: number;
  page: number;
  per_page: number;
}

export interface ClinicsResponse {
  clinics: Clinic[];
  total: number;
  page?: number;
  limit?: number;
}

export interface StateData {
  state_code: string;
  state_name: string;
  clinic_count: number;
  cities: string[];
}

export interface CityData {
  city_name: string;
  state_code: string;
  clinic_count: number;
  center_location: Location;
}

export interface StatsResponse {
  totalClinics: number;
  totalStates: number;
  totalCities: number;
  states: Array<{
    code: string;
    name: string;
    clinicCount: number;
  }>;
}

export interface CityResponse {
  cities: Array<{
    name: string;
    clinicCount: number;
    slug: string;
  }>;
  totalClinics: number;
}

// Utility type for partial clinic updates
export type ClinicUpdate = Partial<Clinic> & { place_id: string };

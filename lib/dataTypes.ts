// Type definitions for Dermatology Clinic Directory

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

export interface Photo {
  name: string;
  width_px?: number;
  height_px?: number;
  author_attributions?: Array<{
    display_name: string;
    uri: string;
    photo_uri: string;
  }>;
}

export interface OpeningHours {
  open_now?: boolean;
  periods?: Array<{
    open: { day: number; hour: number; minute: number };
    close?: { day: number; hour: number; minute: number };
  }>;
  weekday_text?: string[];
}

export interface Clinic {
  place_id: string;
  slug?: string; // Add this line
  display_name: string;
  formatted_address: string;
  location: Location;
  primary_type: string;
  types: string[];
  rating?: number;
  user_rating_count?: number;
  current_open_now?: boolean;
  phone?: string;
  international_phone_number?: string;
  website?: string;
  google_maps_uri: string;
  business_status: 'OPERATIONAL' | 'CLOSED_TEMPORARILY' | 'CLOSED_PERMANENTLY';
  accessibility_options?: AccessibilityOptions;
  parking_options?: ParkingOptions;
  photos?: Photo[];
  opening_hours?: OpeningHours;
  price_level?: number;
  services?: string[];
  payment_options?: {
    accepts_credit_cards?: boolean;
    accepts_debit_cards?: boolean;
    accepts_cash_only?: boolean;
    accepts_nfc?: boolean;
  };
  last_fetched_at: string;
  
  // Added from Supabase migration
  state_code?: string;
  city?: string;
  postal_code?: string;
  created_at?: string;
  updated_at?: string;
  featured_clinic?: boolean;
  // All existing Clinic fields remain the same
  // Add these new optional fields:
  
  popular_times?: PopularTime[];
  reviews?: Review[];
  questions_answers?: QuestionAnswer[];
  
  website_services?: WebsiteServices;
  npi_data?: NPIData;
  intelligence_scores?: IntelligenceScores;
  
  // Metadata
  enhanced_data_fetched_at?: string;
  enhancement_version?: string; // e.g., "1.0"

  
}
  
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

export interface SearchResult {
  clinics: Clinic[];
  total: number;
  page: number;
  per_page: number;
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

// Utility type for partial clinic updates
export type ClinicUpdate = Partial<Clinic> & { place_id: string };

// Filter options for the directory
export interface FilterOptions {
  states?: string[];
  cities?: string[];
  rating_min?: number;
  has_website?: boolean;
  has_phone?: boolean;
  wheelchair_accessible?: boolean;
  free_parking?: boolean;
  open_now?: boolean;
  sort_by?: 'rating' | 'reviews' | 'name' | 'distance';
  sort_order?: 'asc' | 'desc';
}

// Enhanced Types for Tier 1 Features
// Add these to your existing lib/dataTypes.ts

// ============================================================================
// Enhanced Google Places Data
// ============================================================================

export interface PopularTime {
  day: number; // 0 = Sunday, 6 = Saturday
  hour: number; // 0-23
  occupancy: number; // 0-100 percentage
}

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
  time: number;
}

// ============================================================================
// Website Intelligence
// ============================================================================

export interface WebsiteServices {
  has_online_booking: boolean;
  has_telehealth: boolean;
  has_patient_portal: boolean;
  mentioned_services: string[]; // e.g., ["Botox", "Acne Treatment", "Skin Cancer Screening"]
  insurance_mentioned: boolean;
  languages: string[]; // Languages mentioned on website
}

// ============================================================================
// NPI Data
// ============================================================================

export interface NPIData {
  npi_number: string;
  provider_name: string;
  taxonomy_description: string; // e.g., "Dermatology"
  is_verified: boolean;
  verification_date: string;
  board_certifications?: string[];
}

// ============================================================================
// Intelligence Scores
// ============================================================================

export interface IntelligenceScores {
  overall_score: number; // 0-100
  data_completeness_score: number; // 0-100
  service_diversity_score: number; // 0-100
  digital_presence_score: number; // 0-100
  patient_experience_score: number; // 0-100
  calculated_at: string;
}

// ============================================================================
// Enhanced Clinic Interface (extends existing Clinic)
// ============================================================================

// Add these new interfaces to lib/dataTypes.ts

// Competition & Market Intelligence
export interface CompetitionMetrics {
  competition_density: 'Low' | 'Medium' | 'High';
  competitors_within_5mi: number;
  market_position: string; // e.g., "Top 25%"
  rating_percentile: number; // 0-100
  reviews_percentile: number; // 0-100
  price_positioning: 'Budget' | 'Mid-range' | 'Premium' | 'Unknown';
  service_breadth_vs_market: 'Below Average' | 'Average' | 'Above Average';
  amenities_score_vs_local: number; // 0-100
}

// Review Intelligence
export interface ReviewIntelligence {
  overall_sentiment: string; // 'Very Positive', 'Positive', 'Neutral', 'Negative'
  sentiment_score: number; // 0-1
  total_analyzed: number;
  
  common_praise: Array<{ topic: string; mentions: number; sentiment: number }>;
  common_complaints: Array<{ topic: string; mentions: number; sentiment: number }>;
  
  extracted_insights: {
    typical_wait_time?: string;
    best_time_to_visit?: string;
    booking_lead_time?: string;
  };
  
  services_mentioned: Record<string, number>; // "Botox": 23
  staff_mentions: {
    doctor_names: string[];
    positive_staff_mentions: number;
  };
}

// Medicare Quality Data
export interface MedicareQuality {
  overall_rating?: number; // 1-5 stars
  patient_experience_rating?: number;
  quality_of_care_rating?: number;
  data_available: boolean;
  last_updated?: string;
  source: 'CMS' | 'Not Available';
}

// Convenience Scores
export interface ConvenienceScores {
  transit_score?: number; // 0-100
  walk_score?: number; // 0-100
  bike_score?: number; // 0-100
  
  nearest_transit?: {
    type: string; // 'subway', 'bus', 'train'
    name: string;
    distance_miles: number;
  };
  
  parking_assessment: {
    difficulty: 'Easy' | 'Moderate' | 'Difficult';
    estimated_cost: string; // "$0-5/hour"
  };
  
  nearby_amenities: Array<{
    type: 'pharmacy' | 'hospital' | 'lab' | 'urgent_care';
    name: string;
    distance_miles: number;
  }>;
}

// Health Equity Data
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

// Website Quality
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

// Social Proof Extended
export interface SocialProofExtended {
  aggregate_rating: number;
  total_reviews_all_platforms: number;
  
  platforms: {
    google?: { rating: number; count: number };
    yelp?: { rating: number; count: number };
    healthgrades?: { rating: number; count: number };
    facebook?: { rating: number; count: number };
  };
  
  social_media?: {
    facebook_likes?: number;
    instagram_followers?: number;
  };
  
  trust_signals: {
    bbb_rating?: string;
    years_in_business?: number;
    response_rate_percent?: number;
    avg_response_time_hours?: number;
  };
}

// Real-Time Status
export interface RealTimeStatus {
  currently_open: boolean;
  current_busy_level?: 'Low' | 'Moderate' | 'High' | 'Very High';
  
  availability: {
    accepts_walk_ins: boolean;
    estimated_wait_if_walk_in?: string;
    next_available_appointment_estimate?: string;
  };
  
  trending: {
    rating_trend_30d: 'up' | 'down' | 'stable';
    rating_change_30d: number;
    new_reviews_30d: number;
    actively_responding: boolean;
  };
}

// Enhanced NPI Data (extend existing)
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

// Update the main Clinic interface
export interface Clinic {
  // ... existing fields ...
  
  // Add these new optional fields:
  competition_metrics?: CompetitionMetrics;
  review_intelligence?: ReviewIntelligence;
  medicare_quality?: MedicareQuality;
  convenience_scores?: ConvenienceScores;
  health_equity_data?: HealthEquityData;
  website_quality?: WebsiteQuality;
  social_proof_extended?: SocialProofExtended;
  real_time_status?: RealTimeStatus;
  
  // Timestamps
  tier2_enhanced_at?: string;
  tier2_enhancement_version?: string;
}

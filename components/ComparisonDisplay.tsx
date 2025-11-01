/**
 * ENHANCED Comparison Feature Component
 * 
 * This component displays a comprehensive side-by-side comparison of clinics including:
 * - Quality Intelligence Scores
 * - Services & Features (Digital Services, Services Offered, Languages)
 * - Location Convenience (Walk Score, Parking, Transit)
 * - Verified Reputation (Ratings, Reviews, Trends)
 * - Basic Information
 * - Amenities (Accessibility, Parking, Payment)
 */

import {
  getAllUniqueAmenityKeys,
  getAmenityValue,
  AMENITY_LABELS,
  formatCategoryName,
  hasAnyAmenities,
} from '@/lib/amenity-helpers';

// ============================================================================
// QUALITY INTELLIGENCE SCORE SECTION
// ============================================================================
function QualityScoreSection({ clinics }: { clinics: any[] }) {
  const hasAnyScores = clinics.some(c => c.intelligence_scores);

  if (!hasAnyScores) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <span className="text-2xl">🎯</span>
        Quality Intelligence Score
      </h3>
      
      <div className="space-y-4">
        {/* Overall Score */}
        <div 
          className="grid gap-4"
          style={{ 
            gridTemplateColumns: `minmax(200px, 1fr) repeat(${clinics.length}, 1fr)` 
          }}
        >
          <div className="font-medium text-gray-700 py-2">Overall Score</div>
          {clinics.map(clinic => (
            <div key={clinic.place_id} className="text-center py-2">
              {clinic.intelligence_scores?.overall_score ? (
                <div className={`text-3xl font-bold ${
                  clinic.intelligence_scores.overall_score >= 80 ? 'text-green-600' :
                  clinic.intelligence_scores.overall_score >= 60 ? 'text-blue-600' :
                  clinic.intelligence_scores.overall_score >= 40 ? 'text-amber-600' :
                  'text-red-600'
                }`}>
                  {clinic.intelligence_scores.overall_score}
                  <span className="text-lg text-gray-500">/100</span>
                </div>
              ) : (
                <span className="text-gray-400">—</span>
              )}
            </div>
          ))}
        </div>

        {/* Score Breakdown */}
        {[
          { key: 'data_completeness_score', label: 'Data Completeness', icon: '📊' },
          { key: 'service_diversity_score', label: 'Service Diversity', icon: '🏥' },
          { key: 'digital_presence_score', label: 'Digital Presence', icon: '💻' },
          { key: 'patient_experience_score', label: 'Patient Experience', icon: '⭐' }
        ].map(({ key, label, icon }) => (
          <div 
            key={key}
            className="grid gap-4"
            style={{ 
              gridTemplateColumns: `minmax(200px, 1fr) repeat(${clinics.length}, 1fr)` 
            }}
          >
            <div className="font-medium text-gray-700 py-2 flex items-center gap-2">
              <span>{icon}</span>
              {label}
            </div>
            {clinics.map(clinic => {
              const score = clinic.intelligence_scores?.[key];
              return (
                <div key={clinic.place_id} className="text-center py-2">
                  {score !== undefined ? (
                    <div className="flex flex-col items-center">
                      <div className="text-xl font-semibold">{score}</div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className={`h-2 rounded-full ${
                            score >= 80 ? 'bg-green-500' :
                            score >= 60 ? 'bg-blue-500' :
                            score >= 40 ? 'bg-amber-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${score}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// SERVICES & FEATURES SECTION
// ============================================================================
function ServicesSection({ clinics }: { clinics: any[] }) {
  // Collect all unique services and digital features
  const allDigitalServices = new Set<string>();
  const allServices = new Set<string>();
  const allLanguages = new Set<string>();

  clinics.forEach(clinic => {
    // Digital services
    if (clinic.website_services?.has_online_booking) allDigitalServices.add('online_booking');
    if (clinic.website_services?.has_telehealth) allDigitalServices.add('telehealth');
    if (clinic.website_services?.has_patient_portal) allDigitalServices.add('patient_portal');
    
    // Services offered
    if (clinic.website_services?.mentioned_services) {
      clinic.website_services.mentioned_services.forEach((s: string) => allServices.add(s));
    }
    
    // Languages
    if (clinic.website_services?.languages) {
      clinic.website_services.languages.forEach((lang: string) => allLanguages.add(lang));
    }
  });

  const hasAnyData = allDigitalServices.size > 0 || allServices.size > 0 || allLanguages.size > 0;

  if (!hasAnyData) {
    return null;
  }

  const digitalServiceLabels = {
    online_booking: 'Online Booking',
    telehealth: 'Telehealth',
    patient_portal: 'Patient Portal'
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <span className="text-2xl">🏥</span>
        Services & Features
      </h3>
      
      <div className="space-y-6">
        {/* Digital Services */}
        {allDigitalServices.size > 0 && (
          <div>
            <h4 className="font-semibold text-gray-800 mb-3">Digital Services</h4>
            <div className="space-y-3">
              {Array.from(allDigitalServices).map(service => (
                <div 
                  key={service}
                  className="grid gap-4"
                  style={{ 
                    gridTemplateColumns: `minmax(200px, 1fr) repeat(${clinics.length}, 1fr)` 
                  }}
                >
                  <div className="font-medium text-gray-700 py-2">
                    {digitalServiceLabels[service as keyof typeof digitalServiceLabels]}
                  </div>
                  {clinics.map(clinic => {
                    const hasService = service === 'online_booking' 
                      ? clinic.website_services?.has_online_booking
                      : service === 'telehealth'
                      ? clinic.website_services?.has_telehealth
                      : clinic.website_services?.has_patient_portal;
                    
                    return (
                      <div key={clinic.place_id} className="text-center py-2">
                        {hasService ? (
                          <span className="inline-flex items-center text-green-600 font-semibold">
                            <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Yes
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-red-600 font-semibold">
                            <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                            No
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Services Offered */}
        {allServices.size > 0 && (
          <div>
            <h4 className="font-semibold text-gray-800 mb-3">Services Offered</h4>
            <div className="space-y-2">
              {Array.from(allServices).slice(0, 10).map(service => (
                <div 
                  key={service}
                  className="grid gap-4"
                  style={{ 
                    gridTemplateColumns: `minmax(200px, 1fr) repeat(${clinics.length}, 1fr)` 
                  }}
                >
                  <div className="text-sm text-gray-700 py-1">{service}</div>
                  {clinics.map(clinic => {
                    const hasService = clinic.website_services?.mentioned_services?.includes(service);
                    return (
                      <div key={clinic.place_id} className="text-center py-1">
                        {hasService ? (
                          <span className="text-green-600">✓</span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
              {allServices.size > 10 && (
                <p className="text-sm text-gray-500 italic mt-2">
                  + {allServices.size - 10} more services...
                </p>
              )}
            </div>
          </div>
        )}

        {/* Languages */}
        {allLanguages.size > 0 && (
          <div>
            <h4 className="font-semibold text-gray-800 mb-3">🗣️ Languages</h4>
            <div 
              className="grid gap-4"
              style={{ 
                gridTemplateColumns: `minmax(200px, 1fr) repeat(${clinics.length}, 1fr)` 
              }}
            >
              <div className="font-medium text-gray-700 py-2">Supported Languages</div>
              {clinics.map(clinic => (
                <div key={clinic.place_id} className="py-2">
                  {clinic.website_services?.languages && clinic.website_services.languages.length > 0 ? (
                    <div className="text-sm">
                      {clinic.website_services.languages.join(', ')}
                    </div>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// LOCATION CONVENIENCE SECTION
// ============================================================================
function LocationConvenienceSection({ clinics }: { clinics: any[] }) {
  const hasAnyData = clinics.some(c => 
    c.convenience_scores?.walk_score || 
    c.convenience_scores?.transit_score ||
    c.convenience_scores?.bike_score ||
    c.parking_options
  );

  if (!hasAnyData) {
    return null;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <span className="text-2xl">🚶</span>
        Location Convenience
      </h3>
      
      <div className="space-y-3">
        {/* Walk Score */}
        <div 
          className="grid gap-4"
          style={{ 
            gridTemplateColumns: `minmax(200px, 1fr) repeat(${clinics.length}, 1fr)` 
          }}
        >
          <div className="font-medium text-gray-700 py-2">Walk Score</div>
          {clinics.map(clinic => {
            const score = clinic.convenience_scores?.walk_score;
            return (
              <div key={clinic.place_id} className="text-center py-2">
                {score !== undefined ? (
                  <div className="flex flex-col items-center">
                    <div className="text-2xl font-bold text-blue-600">{score}</div>
                    <div className="text-xs text-gray-500">
                      {score >= 90 ? "Walker's Paradise" :
                       score >= 70 ? 'Very Walkable' :
                       score >= 50 ? 'Somewhat Walkable' :
                       'Car-Dependent'}
                    </div>
                  </div>
                ) : (
                  <span className="text-gray-400">—</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Transit Score */}
        <div 
          className="grid gap-4"
          style={{ 
            gridTemplateColumns: `minmax(200px, 1fr) repeat(${clinics.length}, 1fr)` 
          }}
        >
          <div className="font-medium text-gray-700 py-2">Transit Score</div>
          {clinics.map(clinic => {
            const score = clinic.convenience_scores?.transit_score;
            return (
              <div key={clinic.place_id} className="text-center py-2">
                {score !== undefined ? (
                  <div className="text-xl font-semibold text-purple-600">{score}</div>
                ) : (
                  <span className="text-gray-400">—</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Bike Score */}
        <div 
          className="grid gap-4"
          style={{ 
            gridTemplateColumns: `minmax(200px, 1fr) repeat(${clinics.length}, 1fr)` 
          }}
        >
          <div className="font-medium text-gray-700 py-2">Bike Score</div>
          {clinics.map(clinic => {
            const score = clinic.convenience_scores?.bike_score;
            return (
              <div key={clinic.place_id} className="text-center py-2">
                {score !== undefined ? (
                  <div className="text-xl font-semibold text-green-600">{score}</div>
                ) : (
                  <span className="text-gray-400">—</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Parking Assessment */}
        <div 
          className="grid gap-4"
          style={{ 
            gridTemplateColumns: `minmax(200px, 1fr) repeat(${clinics.length}, 1fr)` 
          }}
        >
          <div className="font-medium text-gray-700 py-2">🅿️ Parking</div>
          {clinics.map(clinic => {
            const parking = clinic.convenience_scores?.parking_assessment;
            const hasParking = clinic.parking_options && Object.values(clinic.parking_options).some(v => v === true);
            
            return (
              <div key={clinic.place_id} className="py-2 text-sm">
                {parking ? (
                  <div>
                    <div className="font-medium">{parking.difficulty}</div>
                    <div className="text-gray-500">{parking.estimated_cost}</div>
                  </div>
                ) : hasParking ? (
                  <span className="text-green-600">Available</span>
                ) : (
                  <span className="text-gray-400">—</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Nearest Transit */}
        {clinics.some(c => c.convenience_scores?.nearest_transit) && (
          <div 
            className="grid gap-4"
            style={{ 
              gridTemplateColumns: `minmax(200px, 1fr) repeat(${clinics.length}, 1fr)` 
            }}
          >
            <div className="font-medium text-gray-700 py-2">🚇 Nearest Transit</div>
            {clinics.map(clinic => {
              const transit = clinic.convenience_scores?.nearest_transit;
              return (
                <div key={clinic.place_id} className="py-2 text-sm">
                  {transit ? (
                    <div>
                      <div className="font-medium">{transit.name}</div>
                      <div className="text-gray-500">
                        {transit.distance_miles.toFixed(1)} mi
                      </div>
                    </div>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// VERIFIED REPUTATION SECTION
// ============================================================================
function VerifiedReputationSection({ clinics }: { clinics: any[] }) {
  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <span className="text-2xl">⭐</span>
        Verified Reputation
      </h3>
      
      <div className="space-y-3">
        {/* Overall Rating */}
        <div 
          className="grid gap-4"
          style={{ 
            gridTemplateColumns: `minmax(200px, 1fr) repeat(${clinics.length}, 1fr)` 
          }}
        >
          <div className="font-medium text-gray-700 py-2">Overall Rating</div>
          {clinics.map(clinic => (
            <div key={clinic.place_id} className="text-center py-2">
              {clinic.rating ? (
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-500 text-xl">⭐</span>
                    <span className="text-2xl font-bold">{clinic.rating}</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {clinic.user_rating_count || 0} reviews
                  </div>
                </div>
              ) : (
                <span className="text-gray-400">—</span>
              )}
            </div>
          ))}
        </div>

        {/* Review Count Comparison */}
        <div 
          className="grid gap-4"
          style={{ 
            gridTemplateColumns: `minmax(200px, 1fr) repeat(${clinics.length}, 1fr)` 
          }}
        >
          <div className="font-medium text-gray-700 py-2">Total Reviews</div>
          {clinics.map(clinic => (
            <div key={clinic.place_id} className="text-center py-2">
              {clinic.user_rating_count ? (
                <div className="text-xl font-semibold text-blue-600">
                  {clinic.user_rating_count.toLocaleString()}
                </div>
              ) : (
                <span className="text-gray-400">—</span>
              )}
            </div>
          ))}
        </div>

        {/* Review Trend (if available) */}
        {clinics.some(c => c.real_time_status?.trending) && (
          <>
            <div 
              className="grid gap-4"
              style={{ 
                gridTemplateColumns: `minmax(200px, 1fr) repeat(${clinics.length}, 1fr)` 
              }}
            >
              <div className="font-medium text-gray-700 py-2">Rating Trend (30d)</div>
              {clinics.map(clinic => {
                const trend = clinic.real_time_status?.trending?.rating_trend_30d;
                return (
                  <div key={clinic.place_id} className="text-center py-2">
                    {trend ? (
                      <span className={`font-semibold ${
                        trend === 'up' ? 'text-green-600' :
                        trend === 'down' ? 'text-red-600' :
                        'text-gray-600'
                      }`}>
                        {trend === 'up' ? '↑ Improving' :
                         trend === 'down' ? '↓ Declining' :
                         '→ Stable'}
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </div>
                );
              })}
            </div>

            <div 
              className="grid gap-4"
              style={{ 
                gridTemplateColumns: `minmax(200px, 1fr) repeat(${clinics.length}, 1fr)` 
              }}
            >
              <div className="font-medium text-gray-700 py-2">New Reviews (30d)</div>
              {clinics.map(clinic => {
                const count = clinic.real_time_status?.trending?.new_reviews_30d;
                return (
                  <div key={clinic.place_id} className="text-center py-2">
                    {count !== undefined ? (
                      <div className="text-lg font-semibold">{count}</div>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Review Intelligence (if available) */}
        {clinics.some(c => c.review_intelligence) && (
          <div 
            className="grid gap-4"
            style={{ 
              gridTemplateColumns: `minmax(200px, 1fr) repeat(${clinics.length}, 1fr)` 
            }}
          >
            <div className="font-medium text-gray-700 py-2">Overall Sentiment</div>
            {clinics.map(clinic => {
              const sentiment = clinic.review_intelligence?.overall_sentiment;
              return (
                <div key={clinic.place_id} className="text-center py-2">
                  {sentiment ? (
                    <span className={`font-semibold ${
                      sentiment.includes('Positive') ? 'text-green-600' :
                      sentiment === 'Neutral' ? 'text-gray-600' :
                      'text-red-600'
                    }`}>
                      {sentiment}
                    </span>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Response Rate (if available) */}
        {clinics.some(c => c.social_proof_extended?.trust_signals?.response_rate_percent) && (
          <div 
            className="grid gap-4"
            style={{ 
              gridTemplateColumns: `minmax(200px, 1fr) repeat(${clinics.length}, 1fr)` 
            }}
          >
            <div className="font-medium text-gray-700 py-2">Response Rate</div>
            {clinics.map(clinic => {
              const rate = clinic.social_proof_extended?.trust_signals?.response_rate_percent;
              return (
                <div key={clinic.place_id} className="text-center py-2">
                  {rate !== undefined ? (
                    <div className="text-lg font-semibold text-green-600">{rate}%</div>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// AMENITY COMPARISON SECTION (Existing)
// ============================================================================
function AmenityComparisonSection({ 
  clinics, 
  category 
}: { 
  clinics: any[]; 
  category: 'accessibility' | 'parking' | 'payment' 
}) {
  const allKeys = getAllUniqueAmenityKeys(clinics);
  const keys = allKeys[category];

  if (keys.length === 0) {
    return null;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">
        {formatCategoryName(category)}
      </h3>
      
      <div className="space-y-3">
        {keys.map(key => (
          <div 
            key={key}
            className="grid gap-4"
            style={{ 
              gridTemplateColumns: `minmax(200px, 1fr) repeat(${clinics.length}, 1fr)` 
            }}
          >
            <div className="font-medium text-gray-700 py-2">
              {AMENITY_LABELS[key] || key}
            </div>
            {clinics.map(clinic => {
              const value = getAmenityValue(clinic, category, key);
              
              return (
                <div 
                  key={clinic.place_id}
                  className="text-center py-2"
                >
                  {value === true && (
                    <span className="inline-flex items-center text-green-600 font-semibold">
                      <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Yes
                    </span>
                  )}
                  {value === false && (
                    <span className="inline-flex items-center text-red-600 font-semibold">
                      <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      No
                    </span>
                  )}
                  {value === undefined && (
                    <span className="text-gray-400">—</span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// BASIC INFORMATION SECTION
// ============================================================================
function BasicInfoSection({ clinics }: { clinics: any[] }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">📋 Basic Information</h3>
      
      <div className="space-y-3">
        {/* Phone */}
        <div 
          className="grid gap-4"
          style={{ 
            gridTemplateColumns: `minmax(200px, 1fr) repeat(${clinics.length}, 1fr)` 
          }}
        >
          <div className="font-medium text-gray-700 py-2">Phone</div>
          {clinics.map(clinic => (
            <div key={clinic.place_id} className="py-2">
              {clinic.phone || clinic.international_phone_number || <span className="text-gray-400">—</span>}
            </div>
          ))}
        </div>

        {/* Website */}
        <div 
          className="grid gap-4"
          style={{ 
            gridTemplateColumns: `minmax(200px, 1fr) repeat(${clinics.length}, 1fr)` 
          }}
        >
          <div className="font-medium text-gray-700 py-2">Website</div>
          {clinics.map(clinic => (
            <div key={clinic.place_id} className="py-2">
              {clinic.website ? (
                <a 
                  href={clinic.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Visit
                </a>
              ) : (
                <span className="text-gray-400">—</span>
              )}
            </div>
          ))}
        </div>

        {/* Address */}
        <div 
          className="grid gap-4"
          style={{ 
            gridTemplateColumns: `minmax(200px, 1fr) repeat(${clinics.length}, 1fr)` 
          }}
        >
          <div className="font-medium text-gray-700 py-2">Address</div>
          {clinics.map(clinic => (
            <div key={clinic.place_id} className="py-2 text-sm">
              {clinic.formatted_address || <span className="text-gray-400">—</span>}
            </div>
          ))}
        </div>

        {/* Business Hours */}
        <div 
          className="grid gap-4"
          style={{ 
            gridTemplateColumns: `minmax(200px, 1fr) repeat(${clinics.length}, 1fr)` 
          }}
        >
          <div className="font-medium text-gray-700 py-2">Currently Open</div>
          {clinics.map(clinic => (
            <div key={clinic.place_id} className="py-2">
              {clinic.current_open_now !== undefined ? (
                <span className={`font-semibold ${clinic.current_open_now ? 'text-green-600' : 'text-red-600'}`}>
                  {clinic.current_open_now ? '🟢 Open' : '🔴 Closed'}
                </span>
              ) : clinic.real_time_status?.currently_open !== undefined ? (
                <span className={`font-semibold ${clinic.real_time_status.currently_open ? 'text-green-600' : 'text-red-600'}`}>
                  {clinic.real_time_status.currently_open ? '🟢 Open' : '🔴 Closed'}
                </span>
              ) : (
                <span className="text-gray-400">—</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPARISON DISPLAY COMPONENT
// ============================================================================
export function ComparisonDisplay({ clinics }: { clinics: any[] }) {
  if (!clinics || clinics.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No clinics selected for comparison</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Clinic Headers */}
      <div 
        className="grid gap-4 mb-6"
        style={{ 
          gridTemplateColumns: `minmax(200px, 1fr) repeat(${clinics.length}, 1fr)` 
        }}
      >
        <div></div> {/* Empty cell for labels column */}
        {clinics.map(clinic => (
          <div key={clinic.place_id} className="text-center">
            <h3 className="font-bold text-lg mb-2">{clinic.display_name}</h3>
            <p className="text-sm text-gray-600">{clinic.city}, {clinic.state_code}</p>
            {clinic.rating && (
              <div className="flex items-center justify-center mt-2">
                <span className="text-yellow-500 mr-1">⭐</span>
                <span className="font-semibold">{clinic.rating}</span>
                <span className="text-gray-500 text-sm ml-1">
                  ({clinic.user_rating_count || 0})
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Quality Intelligence Score */}
      <QualityScoreSection clinics={clinics} />

      {/* Services & Features */}
      <ServicesSection clinics={clinics} />

      {/* Location Convenience */}
      <LocationConvenienceSection clinics={clinics} />

      {/* Verified Reputation */}
      <VerifiedReputationSection clinics={clinics} />

      {/* Amenity Sections */}
      {hasAnyAmenities(clinics) && (
        <>
          <AmenityComparisonSection clinics={clinics} category="accessibility" />
          <AmenityComparisonSection clinics={clinics} category="parking" />
          <AmenityComparisonSection clinics={clinics} category="payment" />
        </>
      )}

      {/* Basic Info */}
      <BasicInfoSection clinics={clinics} />
    </div>
  );
}

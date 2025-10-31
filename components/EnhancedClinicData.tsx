// components/EnhancedClinicData.tsx
'use client';

// ============================================================================
// Reviews Component
// ============================================================================

interface Review {
  author_name: string;
  author_photo?: string;
  rating: number;
  text: string;
  relative_time_description: string;
}

export function ReviewsSection({ reviews }: { reviews?: Review[] }) {
  if (!reviews || reviews.length === 0) return null;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
        <span className="text-2xl mr-2">💬</span>
        Recent Reviews
      </h2>

      <div className="space-y-4">
        {reviews.slice(0, 5).map((review, idx) => (
          <div key={idx} className="border-b border-gray-200 pb-4 last:border-0">
            <div className="flex items-start gap-3">
              {review.author_photo ? (
                <img
                  src={review.author_photo}
                  alt={review.author_name}
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                  {review.author_name.charAt(0).toUpperCase()}
                </div>
              )}
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-gray-900">{review.author_name}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-400">★</span>
                    <span className="font-semibold">{review.rating.toFixed(1)}</span>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-2">{review.text}</p>
                
                <p className="text-xs text-gray-400">{review.relative_time_description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {reviews.length > 5 && (
        <p className="text-sm text-gray-500 mt-4 text-center">
          Showing 5 of {reviews.length} reviews
        </p>
      )}
    </div>
  );
}

// ============================================================================
// Website Services Component
// ============================================================================

interface WebsiteServices {
  has_online_booking: boolean;
  has_telehealth: boolean;
  has_patient_portal: boolean;
  mentioned_services: string[];
  insurance_mentioned: boolean;
  languages: string[];
}

export function ServicesSection({ services }: { services?: WebsiteServices }) {
  if (!services) return null;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
        <span className="text-2xl mr-2">🏥</span>
        Services & Features
      </h2>

      {/* Digital Features */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase">Digital Services</h3>
        <div className="flex flex-wrap gap-2">
          {services.has_online_booking && (
            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
              ✓ Online Booking
            </span>
          )}
          {services.has_telehealth && (
            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              ✓ Telehealth
            </span>
          )}
          {services.has_patient_portal && (
            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
              ✓ Patient Portal
            </span>
          )}
          {services.insurance_mentioned && (
            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
              ✓ Insurance Accepted
            </span>
          )}
        </div>
      </div>

      {/* Services Offered */}
      {services.mentioned_services.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase">Services Offered</h3>
          <div className="flex flex-wrap gap-2">
            {services.mentioned_services.slice(0, 10).map((service, idx) => (
              <span
                key={idx}
                className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm bg-gray-100 text-gray-700 border border-gray-300"
              >
                {service.charAt(0).toUpperCase() + service.slice(1)}
              </span>
            ))}
          </div>
          {services.mentioned_services.length > 10 && (
            <p className="text-xs text-gray-500 mt-2">
              +{services.mentioned_services.length - 10} more services
            </p>
          )}
        </div>
      )}

      {/* Languages */}
      {services.languages.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase">Languages</h3>
          <div className="flex flex-wrap gap-2">
            {services.languages.map((lang, idx) => (
              <span
                key={idx}
                className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-amber-100 text-amber-800"
              >
                🗣️ {lang}
              </span>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-gray-500 mt-4 italic">
        Services extracted from clinic website. Please verify with the clinic directly.
      </p>
    </div>
  );
}

// ============================================================================
// NPI Verification Component
// ============================================================================

interface NPIData {
  npi_number: string;
  provider_name: string;
  taxonomy_description: string;
  is_verified: boolean;
  verification_date: string;
}

export function NPIVerificationSection({ npiData }: { npiData?: NPIData }) {
  if (!npiData) return null;

  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-2 border-green-200 p-6">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-green-900 mb-2">
            NPI Verified Provider
          </h3>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">NPI Number:</span>
              <span className="font-mono font-semibold text-gray-900">{npiData.npi_number}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Specialty:</span>
              <span className="font-medium text-gray-900">{npiData.taxonomy_description}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Verified:</span>
              <span className="font-medium text-gray-900">
                {new Date(npiData.verification_date).toLocaleDateString()}
              </span>
            </div>
          </div>

          <p className="text-xs text-gray-600 mt-3 italic">
            This provider is verified in the National Provider Identifier (NPI) registry maintained by CMS.
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Q&A Section Component
// ============================================================================

interface QuestionAnswer {
  question: string;
  answer?: string;
  author_name: string;
}

export function QASection({ qa }: { qa?: QuestionAnswer[] }) {
  if (!qa || qa.length === 0) return null;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
        <span className="text-2xl mr-2">❓</span>
        Questions & Answers
      </h2>

      <div className="space-y-4">
        {qa.slice(0, 3).map((item, idx) => (
          <div key={idx} className="border-l-4 border-blue-500 pl-4">
            <p className="font-medium text-gray-900 mb-2">Q: {item.question}</p>
            {item.answer && (
              <p className="text-gray-600 text-sm">A: {item.answer}</p>
            )}
            <p className="text-xs text-gray-400 mt-1">Asked by {item.author_name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

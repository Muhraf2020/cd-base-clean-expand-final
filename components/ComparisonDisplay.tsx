/**
 * FIXED Comparison Feature Component
 * Add this to your app/compare/page.tsx
 * 
 * This fix ensures ALL amenities from ALL clinics are displayed correctly
 */

import {
  getAllUniqueAmenityKeys,
  getAmenityValue,
  AMENITY_LABELS,
  formatCategoryName,
  hasAnyAmenities,
} from '@/lib/amenity-helpers';

// Component to render amenity comparison section
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
    return (
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-3">
          {formatCategoryName(category)}
        </h3>
        <p className="text-gray-500 text-sm">
          No {category} information available for these clinics
        </p>
      </div>
    );
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
            {/* Amenity label */}
            <div className="font-medium text-gray-700 py-2">
              {AMENITY_LABELS[key] || key}
            </div>
            
            {/* Values for each clinic */}
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

// Main comparison display component
export function ComparisonDisplay({ clinics }: { clinics: any[] }) {
  if (!clinics || clinics.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No clinics selected for comparison</p>
      </div>
    );
  }

  // Check if any clinic has amenity data
  const hasAmenities = clinics.some(hasAnyAmenities);

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
                  ({clinic.user_rating_count})
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Amenity Sections */}
      {hasAmenities ? (
        <>
          <AmenityComparisonSection clinics={clinics} category="accessibility" />
          <AmenityComparisonSection clinics={clinics} category="parking" />
          <AmenityComparisonSection clinics={clinics} category="payment" />
        </>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <p className="text-yellow-800">
            ⚠️ No amenity data available for the selected clinics
          </p>
        </div>
      )}

      {/* Basic Info Comparison */}
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
                {clinic.phone || <span className="text-gray-400">—</span>}
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
        </div>
      </div>
    </div>
  );
}

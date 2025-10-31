'use client';

import { Suspense } from 'react';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

const US_STATES = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California',
  CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', FL: 'Florida', GA: 'Georgia',
  HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa',
  KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland',
  MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri',
  MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey',
  NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio',
  OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina',
  SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont',
  VA: 'Virginia', WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming', DC: 'Washington DC'
};

const COMMON_SERVICES = [
  'Acne Treatment',
  'Anti-Aging Treatments',
  'Botox & Fillers',
  'Chemical Peels',
  'Cosmetic Dermatology',
  'Eczema Treatment',
  'Hair Loss Treatment',
  'Laser Hair Removal',
  'Laser Skin Resurfacing',
  'Mole Removal',
  'Psoriasis Treatment',
  'Rosacea Treatment',
  'Skin Cancer Screening',
  'Wart Removal',
  'Other'
];

// Component that uses useSearchParams (must be wrapped in Suspense)
function AdvertisingOnboardingContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  
  const [loading, setLoading] = useState(true);
  const [sessionData, setSessionData] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    existing_clinic_place_id: '',
    is_existing_clinic: 'new',
    clinic_name: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    street_address: '',
    city: '',
    state_code: '',
    postal_code: '',
    website: '',
    clinic_description: '',
    services_offered: [] as string[],
    special_offers: '',
    preferred_contact_method: 'email',
    best_contact_time: '',
  });

  useEffect(() => {
    if (sessionId) {
      fetchSessionData();
    } else {
      setLoading(false);
      setError('No session ID found. Please try again.');
    }
  }, [sessionId]);

  const fetchSessionData = async () => {
    try {
      const response = await fetch(`/api/verify-session?session_id=${sessionId}`);
      const data = await response.json();
      
      if (response.ok && data.session) {
        setSessionData(data.session);
        if (data.session.customer_email) {
          setFormData(prev => ({
            ...prev,
            contact_email: data.session.customer_email
          }));
        }
      } else {
        setError(data.error || 'Failed to verify payment session');
      }
    } catch (err) {
      console.error('Session verification error:', err);
      setError('Failed to verify payment. Please contact support.');
    } finally {
      setLoading(false);
    }
  };

  const handleServiceToggle = (service: string) => {
    setFormData(prev => ({
      ...prev,
      services_offered: prev.services_offered.includes(service)
        ? prev.services_offered.filter(s => s !== service)
        : [...prev.services_offered, service]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/submit-advertising', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          stripe_session_id: sessionId,
          package_name: sessionData?.metadata?.packageName || 'Unknown'
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setError(data.error || 'Submission failed. Please try again.');
      }
    } catch (err) {
      console.error('Submission error:', err);
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center px-4">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-12 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Submission Complete!</h1>
          <p className="text-xl text-gray-600 mb-8">
            Thank you! We've received your clinic information and will activate your {sessionData?.metadata?.packageName} listing within 24-48 hours.
          </p>
          
          <div className="bg-blue-50 rounded-lg p-6 mb-8 text-left">
            <h2 className="font-semibold text-lg mb-3">What Happens Next?</h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">1.</span>
                <span>Our team reviews your submission (usually within 24 hours)</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">2.</span>
                <span>We'll activate your featured listing on the platform</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">3.</span>
                <span>You'll receive a confirmation email with your listing details</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">4.</span>
                <span>Start receiving increased visibility and patient inquiries!</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Go to Homepage
            </Link>
            <a
              href="mailto:info@dermaclinicnearme.com"
              className="px-8 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (error && !sessionData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Verification Failed</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/advertise"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Return to Packages
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Payment Successful!</h1>
              <p className="text-gray-600">
                You've subscribed to the <span className="font-semibold text-blue-600">{sessionData?.metadata?.packageName}</span> package
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Clinic Setup</h2>
          <p className="text-gray-600 mb-8">
            Please provide your clinic details to activate your featured listing. This will only take a few minutes.
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Clinic Type Selection */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b-2 border-blue-100">
                Clinic Type
              </h3>
              <div className="space-y-3">
                <label className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer border-2 border-transparent has-[:checked]:border-blue-500">
                  <input
                    type="radio"
                    name="clinic_type"
                    value="new"
                    checked={formData.is_existing_clinic === 'new'}
                    onChange={(e) => setFormData({...formData, is_existing_clinic: e.target.value, existing_clinic_place_id: ''})}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-3">
                    <span className="block font-medium text-gray-900">New Listing</span>
                    <span className="text-sm text-gray-600">I want to create a brand new clinic listing</span>
                  </span>
                </label>
                
                <label className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer border-2 border-transparent has-[:checked]:border-blue-500">
                  <input
                    type="radio"
                    name="clinic_type"
                    value="existing"
                    checked={formData.is_existing_clinic === 'existing'}
                    onChange={(e) => setFormData({...formData, is_existing_clinic: e.target.value})}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-3">
                    <span className="block font-medium text-gray-900">Claim Existing Listing</span>
                    <span className="text-sm text-gray-600">My clinic is already listed, I want to upgrade it</span>
                  </span>
                </label>
              </div>
              
              {formData.is_existing_clinic === 'existing' && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Existing Clinic Place ID (Optional - we can help you find this)
                  </label>
                  <input
                    type="text"
                    value={formData.existing_clinic_place_id}
                    onChange={(e) => setFormData({...formData, existing_clinic_place_id: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="ChIJ... (leave blank if you don't know it)"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Don't worry if you don't have this - we'll help you find your listing
                  </p>
                </div>
              )}
            </div>

            {/* Clinic Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b-2 border-blue-100">
                Clinic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Clinic Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.clinic_name}
                    onChange={(e) => setFormData({...formData, clinic_name: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Advanced Dermatology Clinic"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website URL <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    required
                    value={formData.website}
                    onChange={(e) => setFormData({...formData, website: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://www.yourclinic.com"
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b-2 border-blue-100">
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.contact_name}
                    onChange={(e) => setFormData({...formData, contact_name: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Dr. Jane Smith"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.contact_email}
                    onChange={(e) => setFormData({...formData, contact_email: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="contact@yourclinic.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.contact_phone}
                    onChange={(e) => setFormData({...formData, contact_phone: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="(555) 123-4567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Contact Method
                  </label>
                  <select
                    value={formData.preferred_contact_method}
                    onChange={(e) => setFormData({...formData, preferred_contact_method: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="email">Email</option>
                    <option value="phone">Phone</option>
                    <option value="either">Either</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b-2 border-blue-100">
                Clinic Address
              </h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.street_address}
                    onChange={(e) => setFormData({...formData, street_address: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="123 Medical Plaza Drive"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Los Angeles"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={formData.state_code}
                      onChange={(e) => setFormData({...formData, state_code: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select State</option>
                      {Object.entries(US_STATES).map(([code, name]) => (
                        <option key={code} value={code}>{name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ZIP Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.postal_code}
                      onChange={(e) => setFormData({...formData, postal_code: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="90001"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Services Offered */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b-2 border-blue-100">
                Services Offered
              </h3>
              <p className="text-sm text-gray-600 mb-4">Select all services your clinic provides</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {COMMON_SERVICES.map((service) => (
                  <label key={service} className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.services_offered.includes(service)}
                      onChange={() => handleServiceToggle(service)}
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 rounded"
                    />
                    <span className="ml-3 text-gray-700">{service}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Clinic Description */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b-2 border-blue-100">
                About Your Clinic
              </h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Clinic Description
                  </label>
                  <textarea
                    value={formData.clinic_description}
                    onChange={(e) => setFormData({...formData, clinic_description: e.target.value})}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Tell potential patients about your clinic, specialties, and what makes you unique..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Special Offers or Promotions
                  </label>
                  <textarea
                    value={formData.special_offers}
                    onChange={(e) => setFormData({...formData, special_offers: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Any current promotions, discounts, or special offers for new patients..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Best Time to Contact
                  </label>
                  <input
                    type="text"
                    value={formData.best_contact_time}
                    onChange={(e) => setFormData({...formData, best_contact_time: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Weekdays 9am-5pm"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6 border-t-2 border-gray-200">
              <button
                type="submit"
                disabled={submitting}
                className="w-full px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed text-lg"
              >
                {submitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  'Complete Setup & Activate Listing'
                )}
              </button>
              <p className="text-center text-sm text-gray-500 mt-4">
                By submitting, you agree to our terms and conditions
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Main export with Suspense wrapper
export default function AdvertisingOnboardingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <AdvertisingOnboardingContent />
    </Suspense>
  );
}

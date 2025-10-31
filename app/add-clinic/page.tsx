'use client';

import { useState } from 'react';
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

const TIME_SLOTS = [
  'Closed',
  '12:00 AM', '12:30 AM', '1:00 AM', '1:30 AM', '2:00 AM', '2:30 AM',
  '3:00 AM', '3:30 AM', '4:00 AM', '4:30 AM', '5:00 AM', '5:30 AM',
  '6:00 AM', '6:30 AM', '7:00 AM', '7:30 AM', '8:00 AM', '8:30 AM',
  '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
  '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM',
  '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM',
  '9:00 PM', '9:30 PM', '10:00 PM', '10:30 PM', '11:00 PM', '11:30 PM'
];

export default function AddClinicPage() {
  const [formData, setFormData] = useState({
    display_name: '',
    formatted_address: '',
    city: '',
    state_code: '',
    postal_code: '',
    phone: '',
    international_phone: '',
    email: '',
    website: '',
    google_maps_uri: '',
    latitude: '',
    longitude: '',
    monday_open: '9:00 AM',
    monday_close: '5:00 PM',
    tuesday_open: '9:00 AM',
    tuesday_close: '5:00 PM',
    wednesday_open: '9:00 AM',
    wednesday_close: '5:00 PM',
    thursday_open: '9:00 AM',
    thursday_close: '5:00 PM',
    friday_open: '9:00 AM',
    friday_close: '5:00 PM',
    saturday_open: 'Closed',
    saturday_close: 'Closed',
    sunday_open: 'Closed',
    sunday_close: 'Closed',
    accessibility_wheelchair: false,
    parking_available: false,
    parking_free: false,
    parking_paid: false,
    payment_credit_cards: false,
    payment_debit_cards: false,
    payment_cash_only: false,
    payment_nfc: false
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMessage('');

    try {
      const response = await fetch('/api/submit-clinic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        // Reset form
        setFormData({
          display_name: '', formatted_address: '', city: '', state_code: '',
          postal_code: '', phone: '', international_phone: '', email: '', website: '',
          google_maps_uri: '', latitude: '', longitude: '',
          monday_open: '9:00 AM', monday_close: '5:00 PM',
          tuesday_open: '9:00 AM', tuesday_close: '5:00 PM',
          wednesday_open: '9:00 AM', wednesday_close: '5:00 PM',
          thursday_open: '9:00 AM', thursday_close: '5:00 PM',
          friday_open: '9:00 AM', friday_close: '5:00 PM',
          saturday_open: 'Closed', saturday_close: 'Closed',
          sunday_open: 'Closed', sunday_close: 'Closed',
          accessibility_wheelchair: false, parking_available: false,
          parking_free: false, parking_paid: false,
          payment_credit_cards: false, payment_debit_cards: false,
          payment_cash_only: false, payment_nfc: false
        });
      } else {
        setStatus('error');
        setErrorMessage(data.message || 'Submission failed. Please try again.');
      }
    } catch (error) {
      setStatus('error');
      setErrorMessage('Network error. Please check your connection and try again.');
    }
  };

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const dayLabels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header with Back Button */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link 
            href="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Add Your Dermatology Clinic</h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            Can't find your clinic in our directory? Add it now and connect with patients searching for dermatology services in your area.
          </p>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Submit Your Information</h3>
              <p className="text-gray-600">Fill out the form below with your clinic details</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">We Review & Verify</h3>
              <p className="text-gray-600">Our team reviews your submission for accuracy</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Go Live!</h3>
              <p className="text-gray-600">Your clinic appears in our searchable directory</p>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-lg p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Why List Your Clinic?</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start space-x-4">
              <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="font-semibold text-lg mb-1">Increased Visibility</h3>
                <p className="text-gray-700">Reach patients actively searching for dermatology services</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <svg className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="font-semibold text-lg mb-1">24/7 Online Presence</h3>
                <p className="text-gray-700">Your clinic information available round the clock</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <svg className="w-6 h-6 text-purple-500 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <div>
                <h3 className="font-semibold text-lg mb-1">Build Credibility</h3>
                <p className="text-gray-700">Establish trust with detailed clinic information</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <svg className="w-6 h-6 text-orange-500 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="font-semibold text-lg mb-1">Grow Your Practice</h3>
                <p className="text-gray-700">Connect with new patients in your area</p>
              </div>
            </div>
          </div>
        </div>

        {/* Submission Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Clinic Information</h2>

          {status === 'success' && (
            <div className="mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-lg flex items-start">
              <svg className="w-6 h-6 text-green-600 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="font-semibold text-green-900 mb-1">Submission Successful!</h3>
                <p className="text-green-800">Thank you! We'll review your clinic information and add it to our directory shortly.</p>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
              <p className="text-red-800 font-medium">{errorMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b-2 border-blue-100">
                Basic Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Clinic Name <span className="text-red-500">*</span>
                  </label>
                  <input type="text" required
                    value={formData.display_name}
                    onChange={(e) => setFormData({...formData, display_name: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="e.g., Advanced Dermatology Center"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address <span className="text-red-500">*</span>
                  </label>
                  <input type="text" required
                    value={formData.formatted_address}
                    onChange={(e) => setFormData({...formData, formatted_address: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="123 Main Street, Suite 100"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input type="text" required
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State <span className="text-red-500">*</span>
                    </label>
                    <select required
                      value={formData.state_code}
                      onChange={(e) => setFormData({...formData, state_code: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    >
                      <option value="">Select State</option>
                      {Object.entries(US_STATES).map(([code, name]) => (
                        <option key={code} value={code}>{name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Zip Code <span className="text-red-500">*</span>
                    </label>
                    <input type="text" required pattern="[0-9]{5}"
                      value={formData.postal_code}
                      onChange={(e) => setFormData({...formData, postal_code: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b-2 border-blue-100">
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input type="tel" required
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    International Phone
                  </label>
                  <input type="tel"
                    value={formData.international_phone}
                    onChange={(e) => setFormData({...formData, international_phone: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="+1 555-123-4567"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input type="email" required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="contact@clinic.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website <span className="text-red-500">*</span>
                  </label>
                  <input type="url" required
                    value={formData.website}
                    onChange={(e) => setFormData({...formData, website: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="https://www.yourwebsite.com"
                  />
                </div>
              </div>
            </div>

            {/* Location Details */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b-2 border-blue-100">
                Location Details
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Google Maps URL <span className="text-red-500">*</span>
                  </label>
                  <input type="url" required
                    value={formData.google_maps_uri}
                    onChange={(e) => setFormData({...formData, google_maps_uri: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="https://maps.google.com/..."
                  />
                  <p className="mt-1 text-sm text-gray-500">Find your clinic on Google Maps and copy the URL</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Latitude
                    </label>
                    <input type="text"
                      value={formData.latitude}
                      onChange={(e) => setFormData({...formData, latitude: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      placeholder="40.7128"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Longitude
                    </label>
                    <input type="text"
                      value={formData.longitude}
                      onChange={(e) => setFormData({...formData, longitude: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      placeholder="-74.0060"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Opening Hours with Dropdowns */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b-2 border-blue-100">
                Opening Hours <span className="text-red-500">*</span>
              </h3>
              <div className="space-y-3">
                {days.map((day, index) => (
                  <div key={day} className="grid grid-cols-1 md:grid-cols-7 gap-3 items-center">
                    <label className="text-sm font-medium text-gray-700 md:col-span-1">
                      {dayLabels[index]}
                    </label>
                    <div className="md:col-span-3">
                      <select
                        value={formData[`${day}_open` as keyof typeof formData] as string}
                        onChange={(e) => setFormData({...formData, [`${day}_open`]: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
                      >
                        {TIME_SLOTS.map(time => (
                          <option key={`${day}-open-${time}`} value={time}>{time}</option>
                        ))}
                      </select>
                    </div>
                    <span className="text-center text-gray-500 text-sm">to</span>
                    <div className="md:col-span-2">
                      <select
                        value={formData[`${day}_close` as keyof typeof formData] as string}
                        onChange={(e) => setFormData({...formData, [`${day}_close`]: e.target.value})}
                        disabled={formData[`${day}_open` as keyof typeof formData] === 'Closed'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm disabled:bg-gray-100"
                      >
                        {TIME_SLOTS.map(time => (
                          <option key={`${day}-close-${time}`} value={time}>{time}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Amenities & Features */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b-2 border-blue-100">
                Amenities & Features
              </h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-gray-800 mb-3">Accessibility</h4>
                  <label className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer">
                    <input type="checkbox"
                      checked={formData.accessibility_wheelchair}
                      onChange={(e) => setFormData({...formData, accessibility_wheelchair: e.target.checked})}
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-3 text-sm font-medium text-gray-700">Wheelchair Accessible Entrance</span>
                  </label>
                </div>

                <div>
                  <h4 className="font-medium text-gray-800 mb-3">Parking Options</h4>
                  <div className="space-y-2">
                    <label className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer">
                      <input type="checkbox"
                        checked={formData.parking_available}
                        onChange={(e) => setFormData({...formData, parking_available: e.target.checked})}
                        className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-3 text-sm font-medium text-gray-700">Parking Available</span>
                    </label>
                    <label className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer">
                      <input type="checkbox"
                        checked={formData.parking_free}
                        onChange={(e) => setFormData({...formData, parking_free: e.target.checked})}
                        className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-3 text-sm font-medium text-gray-700">Free Parking</span>
                    </label>
                    <label className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer">
                      <input type="checkbox"
                        checked={formData.parking_paid}
                        onChange={(e) => setFormData({...formData, parking_paid: e.target.checked})}
                        className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-3 text-sm font-medium text-gray-700">Paid Parking</span>
                    </label>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-800 mb-3">Payment Methods Accepted</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <label className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer">
                      <input type="checkbox"
                        checked={formData.payment_credit_cards}
                        onChange={(e) => setFormData({...formData, payment_credit_cards: e.target.checked})}
                        className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-3 text-sm font-medium text-gray-700">Credit Cards</span>
                    </label>
                    <label className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer">
                      <input type="checkbox"
                        checked={formData.payment_debit_cards}
                        onChange={(e) => setFormData({...formData, payment_debit_cards: e.target.checked})}
                        className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-3 text-sm font-medium text-gray-700">Debit Cards</span>
                    </label>
                    <label className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer">
                      <input type="checkbox"
                        checked={formData.payment_nfc}
                        onChange={(e) => setFormData({...formData, payment_nfc: e.target.checked})}
                        className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-3 text-sm font-medium text-gray-700">NFC Mobile Payments</span>
                    </label>
                    <label className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer">
                      <input type="checkbox"
                        checked={formData.payment_cash_only}
                        onChange={(e) => setFormData({...formData, payment_cash_only: e.target.checked})}
                        className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-3 text-sm font-medium text-gray-700">Cash Only</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={status === 'submitting'}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-8 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
            >
              {status === 'submitting' ? 'Submitting...' : 'Submit Clinic Information'}
            </button>
          </form>
        </div>
      </div>

      {/* CTA Section - Ready to Stand Out */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready To Stand Out From The Competition?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Boost your clinic's visibility with our premium advertising options. Reach more patients and grow your practice faster.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/advertise"
              className="inline-flex items-center px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl"
            >
              Explore Advertising Options
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/"
              className="inline-flex items-center px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-600 transition-all"
            >
              Browse Directory
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

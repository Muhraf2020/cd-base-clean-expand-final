// app/page.tsx
// NOTE: intentionally NO 'use client' here.
// This is now a Server Component for fast initial paint.

import Link from 'next/link';
import dynamic from 'next/dynamic';
import ComparisonFeatureBox from '@/components/ComparisonFeatureBox';

// Lazily load the interactive islands.
// These components themselves can still be 'use client' internally.
const SearchBarClient = dynamic(() => import('@/components/SearchBar'), {
  ssr: false,
});

const StatsSection = dynamic(() => import('@/components/StatsSection'), {
  ssr: false,
});

const StateGridClient = dynamic(() => import('@/components/StateGrid'), {
  ssr: false,
});

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section - Mobile Optimized */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 leading-tight">
              Find Dermatology Clinics Near You
            </h1>
            <p className="text-base sm:text-xl lg:text-2xl text-blue-100 mb-6 sm:mb-8 max-w-3xl mx-auto px-4">
              Your comprehensive directory of dermatology clinics across the United States
            </p>

            <Link
              href="/add-clinic"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Add Your Clinic
            </Link>

            {/* (This second Link rendered nothing visible before, so leaving it out is cleaner.
                If you truly need an empty link for any reason, you can add it back.) */}
          </div>
        </div>
      </header>

      {/* Sticky Search Bar - Mobile Optimized */}
      <div className="sticky top-0 z-50 bg-white shadow-md">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 py-2 sm:py-4">
          {/* SearchBar needs router + geolocation etc., so it stays client-side */}
          <SearchBarClient />
        </div>
      </div>

      {/* Stats Section - Mobile Optimized */}
      {/* We now use your dedicated StatsSection client component instead of inline state/effect */}
      <StatsSection />

      {/* 🔥 NEW FEATURE BOX INSERTED HERE */}
      <ComparisonFeatureBox />

      {/* Credibility & Value Proposition Section */}
      <section className="py-12 sm:py-16 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Why Trust Our Directory?
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              We combine multiple authoritative data sources and AI-powered analysis to provide you with the most comprehensive,
              accurate, and up-to-date dermatology clinic information available.
            </p>
          </div>

          {/* Data Sources Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {/* Google Places API */}
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-blue-100 hover:border-blue-300 transition-all">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 013.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Google Places</h3>
                  <p className="text-sm text-blue-600">Official API</p>
                </div>
              </div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <svg className="w-4 h-4 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Real-time business hours & contact info
                </li>
                <li className="flex items-start">
                  <svg className="w-4 h-4 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Patient reviews & ratings
                </li>
                <li className="flex items-start">
                  <svg className="w-4 h-4 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Accessibility features & amenities
                </li>
              </ul>
            </div>

            {/* CMS Provider Data */}
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-green-100 hover:border-green-300 transition-all">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">CMS Open Data</h3>
                  <p className="text-sm text-green-600">Government Registry</p>
                </div>
              </div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <svg className="w-4 h-4 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Medicare provider enrollment data
                </li>
                <li className="flex items-start">
                  <svg className="w-4 h-4 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  NPI verification & credentials
                </li>
                <li className="flex items-start">
                  <svg className="w-4 h-4 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Practice affiliations & group info
                </li>
              </ul>
            </div>

            {/* Healthcare.gov Data */}
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-purple-100 hover:border-purple-300 transition-all">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Healthcare.gov</h3>
                  <p className="text-sm text-purple-600">Federal Database</p>
                </div>
              </div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <svg className="w-4 h-4 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Insurance plan acceptance
                </li>
                <li className="flex items-start">
                  <svg className="w-4 h-4 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Network participation status
                </li>
                <li className="flex items-start">
                  <svg className="w-4 h-4 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Medicaid & Medicare acceptance
                </li>
              </ul>
            </div>

            {/* Yelp API */}
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-red-100 hover:border-red-300 transition-all">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Yelp API</h3>
                  <p className="text-sm text-red-600">Patient Reviews</p>
                </div>
              </div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <svg className="w-4 h-4 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Detailed patient feedback
                </li>
                <li className="flex items-start">
                  <svg className="w-4 h-4 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Photo verification of facilities
                </li>
                <li className="flex items-start">
                  <svg className="w-4 h-4 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Service highlights & specialties
                </li>
              </ul>
            </div>

            {/* AI Website Analysis */}
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-indigo-100 hover:border-indigo-300 transition-all">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">AI Analysis</h3>
                  <p className="text-sm text-indigo-600">Website Extraction</p>
                </div>
              </div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <svg className="w-4 h-4 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Services & specializations parsing
                </li>
                <li className="flex items-start">
                  <svg className="w-4 h-4 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Technology & equipment identification
                </li>
                <li className="flex items-start">
                  <svg className="w-4 h-4 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Doctor profiles & certifications
                </li>
              </ul>
            </div>

            {/* State Medical Boards */}
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-yellow-100 hover:border-yellow-300 transition-all">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Medical Boards</h3>
                  <p className="text-sm text-yellow-600">License Verification</p>
                </div>
              </div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <svg className="w-4 h-4 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Active license verification
                </li>
                <li className="flex items-start">
                  <svg className="w-4 h-4 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Board certifications
                </li>
                <li className="flex items-start">
                  <svg className="w-4 h-4 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Disciplinary action checks
                </li>
              </ul>
            </div>
          </div>

          {/* How We Use Data */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-2xl p-8 text-white mb-8">
            <h3 className="text-2xl font-bold mb-6 text-center">How We Transform Data Into Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-4xl mb-3">🔄</div>
                <div className="font-semibold mb-1">Multi-Source Aggregation</div>
                <p className="text-sm text-blue-100">Combine 6+ official data sources for complete profiles</p>
              </div>

              <div className="text-center">
                <div className="text-4xl mb-3">🤖</div>
                <div className="font-semibold mb-1">AI-Powered Verification</div>
                <p className="text-sm text-blue-100">Cross-reference & validate data accuracy</p>
              </div>

              <div className="text-center">
                <div className="text-4xl mb-3">⭐</div>
                <div className="font-semibold mb-1">Patient Experience</div>
                <p className="text-sm text-blue-100">Real ratings, reviews & accessibility features</p>
              </div>
            </div>
          </div>

          {/* Data Quality Statement */}
          <div className="mt-8 bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div className="ml-4">
                <h4 className="text-lg font-bold text-gray-900 mb-2">Our Commitment to Data Quality</h4>
                <p className="text-gray-600 mb-3">
                  We update our database regularly from official sources, verify provider credentials through government registries,
                  and use AI to analyze website content and patient reviews. Every data point is traceable to its authoritative source.
                </p>
                <div className="flex flex-wrap gap-3 text-sm">
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 font-medium">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Updated Daily
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 font-medium">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Official Sources Only
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-purple-100 text-purple-800 font-medium">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    AI-Verified
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* States Grid Section - Mobile Optimized */}
      <section id="browse-by-state" className="py-8 sm:py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Browse Clinics by State
            </h2>
            <p className="text-base sm:text-lg text-gray-600 px-4">
              Select your state to find dermatology clinics near you
            </p>
          </div>

          {/* StateGrid needs client-side interactivity, so we keep it isolated */}
          <StateGridClient />
        </div>
      </section>

      {/* About Section - Mobile Optimized */}
      <section className="py-8 sm:py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              About Derma Clinic Near Me
            </h2>
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed px-2">
              We provide a comprehensive, up-to-date directory of dermatology clinics across the United States.
              Whether you're looking for general dermatology care, cosmetic procedures, or specialized skin treatments,
              our directory helps you find qualified dermatologists in your area.
            </p>
          </div>

          {/* 8 COMPREHENSIVE FEATURE BOXES */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
            {/* 1. Advanced Search */}
            <div className="bg-white rounded-lg shadow-md p-5 sm:p-6 hover:shadow-xl transition-shadow">
              <div className="text-blue-600 text-3xl sm:text-4xl mb-2 sm:mb-3">🔍</div>
              <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Advanced Search</h3>
              <p className="text-xs sm:text-sm text-gray-600">
                Find clinics by state, city, ZIP code, or use GPS location
              </p>
            </div>

            {/* 2. Real-Time Updates */}
            <div className="bg-white rounded-lg shadow-md p-5 sm:p-6 hover:shadow-xl transition-shadow">
              <div className="text-green-600 text-3xl sm:text-4xl mb-2 sm:mb-3">🕐</div>
              <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Real-Time Updates</h3>
              <p className="text-xs sm:text-sm text-gray-600">
                Live business hours, phone numbers & current availability
              </p>
            </div>

            {/* 3. Patient Reviews */}
            <div className="bg-white rounded-lg shadow-md p-5 sm:p-6 hover:shadow-xl transition-shadow">
              <div className="text-purple-600 text-3xl sm:text-4xl mb-2 sm:mb-3">⭐</div>
              <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Patient Reviews</h3>
              <p className="text-xs sm:text-sm text-gray-600">
                Verified ratings, detailed feedback & photo reviews
              </p>
            </div>

            {/* 4. Accessibility Info */}
            <div className="bg-white rounded-lg shadow-md p-5 sm:p-6 hover:shadow-xl transition-shadow">
              <div className="text-orange-600 text-3xl sm:text-4xl mb-2 sm:mb-3">♿</div>
              <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Accessibility Info</h3>
              <p className="text-xs sm:text-sm text-gray-600">
                Wheelchair access, parking & facility amenities
              </p>
            </div>

            {/* 5. Insurance Coverage */}
            <div className="bg-white rounded-lg shadow-md p-5 sm:p-6 hover:shadow-xl transition-shadow">
              <div className="text-teal-600 text-3xl sm:text-4xl mb-2 sm:mb-3">💳</div>
              <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Insurance Coverage</h3>
              <p className="text-xs sm:text-sm text-gray-600">
                Accepted insurance plans, Medicare & Medicaid info
              </p>
            </div>

            {/* 6. Verified Credentials */}
            <div className="bg-white rounded-lg shadow-md p-5 sm:p-6 hover:shadow-xl transition-shadow">
              <div className="text-indigo-600 text-3xl sm:text-4xl mb-2 sm:mb-3">🎓</div>
              <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Verified Credentials</h3>
              <p className="text-xs sm:text-sm text-gray-600">
                Board certifications, licenses & NPI verification
              </p>
            </div>

            {/* 7. Service Details */}
            <div className="bg-white rounded-lg shadow-md p-5 sm:p-6 hover:shadow-xl transition-shadow">
              <div className="text-pink-600 text-3xl sm:text-4xl mb-2 sm:mb-3">💉</div>
              <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Service Details</h3>
              <p className="text-xs sm:text-sm text-gray-600">
                Treatments offered, specializations & technologies
              </p>
            </div>

            {/* 8. AI-Powered Analysis */}
            <div className="bg-white rounded-lg shadow-md p-5 sm:p-6 hover:shadow-xl transition-shadow">
              <div className="text-violet-600 text-3xl sm:text-4xl mb-2 sm:mb-3">🤖</div>
              <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">AI-Powered Analysis</h3>
              <p className="text-xs sm:text-sm text-gray-600">
                Smart data extraction & cross-reference verification
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Mobile Optimized */}
      <footer className="bg-gray-900 text-white mt-12 sm:mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            <div>
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">About</h3>
              <p className="text-gray-400 text-xs sm:text-sm">
                Find the best dermatology clinics near you with verified
                information, ratings, and reviews.
              </p>
            </div>

            <div>
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400 text-xs sm:text-sm">
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">
                Connect: info@dermaclinicnearme.com
              </h3>
              <p className="text-gray-400 text-xs sm:text-sm">
                © 2025 Derma Clinic Near Me. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

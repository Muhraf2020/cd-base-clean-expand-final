// components/ComparisonFeatureBox.tsx
'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function ComparisonFeatureBox() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Feature Card */}
        <div 
          className="relative bg-white rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-300 hover:scale-[1.02]"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Gradient Border Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 opacity-10"></div>
          
          <div className="relative p-8 sm:p-12 lg:p-16">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              
              {/* Left Column - Content */}
              <div>
                {/* Badge */}
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-full text-sm font-semibold mb-6">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>NEW FEATURE</span>
                </div>

                {/* Heading */}
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                  Compare Clinics
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                    Instantly
                  </span>
                </h2>

                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                  Make informed decisions with side-by-side comparisons of up to 4 clinics. 
                  Get comprehensive reports delivered straight to your inbox.
                </p>

                {/* Feature List */}
                <div className="space-y-4 mb-8">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">Quality Intelligence Scores</h3>
                      <p className="text-gray-600">AI-powered analysis of clinic quality and services</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">Services & Features</h3>
                      <p className="text-gray-600">Digital services, languages, and treatments offered</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">Location Convenience</h3>
                      <p className="text-gray-600">Walk scores, parking, and transit information</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">Email Reports</h3>
                      <p className="text-gray-600">Get detailed comparison reports sent to your inbox</p>
                    </div>
                  </div>
                </div>

                {/* CTA Button */}
                <Link
                  href="/clinics"
                  className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform transition-all duration-200 hover:scale-105"
                >
                  <span>Start Comparing Now</span>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </div>

              {/* Right Column - Visual Demo */}
              <div className="relative">
                {/* Decorative Background Circles */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-72 h-72 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full opacity-20 blur-3xl animate-pulse"></div>
                </div>

                {/* Comparison Preview Cards */}
                <div className="relative space-y-4">
                  {/* Card 1 */}
                  <div 
                    className={`bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-xl transform transition-all duration-500 ${
                      isHovered ? 'translate-x-2' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-semibold text-lg">Premier Dermatology</div>
                          <div className="text-sm text-blue-200">San Francisco, CA</div>
                        </div>
                      </div>
                      <div className="text-2xl font-bold">92</div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center text-sm">
                      <div>
                        <div className="text-xs text-blue-200">Services</div>
                        <div className="font-semibold">12</div>
                      </div>
                      <div>
                        <div className="text-xs text-blue-200">Rating</div>
                        <div className="font-semibold">4.9 ⭐</div>
                      </div>
                      <div>
                        <div className="text-xs text-blue-200">Reviews</div>
                        <div className="font-semibold">328</div>
                      </div>
                    </div>
                  </div>

                  {/* Card 2 */}
                  <div 
                    className={`bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-lg transform transition-all duration-500 delay-100 ${
                      isHovered ? 'translate-x-4' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-semibold text-lg text-gray-900">City Skin Specialists</div>
                          <div className="text-sm text-gray-500">Los Angeles, CA</div>
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-gray-900">85</div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center text-sm">
                      <div>
                        <div className="text-xs text-gray-500">Services</div>
                        <div className="font-semibold text-gray-900">8</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Rating</div>
                        <div className="font-semibold text-gray-900">4.7 ⭐</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Reviews</div>
                        <div className="font-semibold text-gray-900">215</div>
                      </div>
                    </div>
                  </div>

                  {/* Card 3 */}
                  <div 
                    className={`bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-lg transform transition-all duration-500 delay-200 ${
                      isHovered ? 'translate-x-6' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-semibold text-lg text-gray-900">Advanced Skin Care</div>
                          <div className="text-sm text-gray-500">San Diego, CA</div>
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-gray-900">88</div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center text-sm">
                      <div>
                        <div className="text-xs text-gray-500">Services</div>
                        <div className="font-semibold text-gray-900">10</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Rating</div>
                        <div className="font-semibold text-gray-900">4.8 ⭐</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Reviews</div>
                        <div className="font-semibold text-gray-900">189</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Email Icon Indicator */}
                <div className="absolute -bottom-6 right-0 bg-white rounded-full p-4 shadow-xl border-4 border-blue-100">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Stats Bar */}
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 border-t border-gray-200 px-8 py-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-blue-600">4</div>
                <div className="text-sm text-gray-600">Clinics Max</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-indigo-600">12+</div>
                <div className="text-sm text-gray-600">Data Points</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600">Instant</div>
                <div className="text-sm text-gray-600">Comparison</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-pink-600">Free</div>
                <div className="text-sm text-gray-600">Email Reports</div>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-8 text-gray-600 text-sm">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Verified Data</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <span>Privacy Protected</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Always Free</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

'use client';

import { useState, useEffect } from 'react';

export default function StatsSection() {
  const [stats, setStats] = useState({
    totalClinics: 11210, // fallback so layout height is stable
    totalStates: 50,
    totalCities: 0,
    loading: true,
  });

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch('/api/stats');
        const data = await res.json();

        setStats({
          totalClinics: data.totalClinics || 0,
          totalStates: data.totalStates || 50,
          totalCities: data.totalCities || 0,
          loading: false,
        });
      } catch (err) {
        console.error('Error loading stats:', err);
        setStats((prev) => ({ ...prev, loading: false }));
      }
    }

    loadStats();
  }, []);

  return (
    <section className="py-8 sm:py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">

          {/* Total Clinics */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-lg p-6 sm:p-8 text-center border-2 border-blue-200">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-blue-600 rounded-full mb-3 sm:mb-4">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="text-3xl sm:text-4xl font-bold text-blue-600 mb-2">
              {stats.loading ? '...' : stats.totalClinics.toLocaleString()}
            </div>
            <div className="text-sm sm:text-base text-gray-700 font-medium">
              Dermatology Clinics
            </div>
          </div>

          {/* Total States */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-lg p-6 sm:p-8 text-center border-2 border-green-200">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-green-600 rounded-full mb-3 sm:mb-4">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 013.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <div className="text-3xl sm:text-4xl font-bold text-green-600 mb-2">
              {stats.totalStates}
            </div>
            <div className="text-sm sm:text-base text-gray-700 font-medium">
              States Covered
            </div>
          </div>

          {/* Total Cities */}
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl shadow-lg p-6 sm:p-8 text-center border-2 border-orange-200">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-orange-600 rounded-full mb-3 sm:mb-4">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div className="text-3xl sm:text-4xl font-bold text-orange-600 mb-2">
              {stats.loading ? '...' : stats.totalCities.toLocaleString()}
            </div>
            <div className="text-sm sm:text-base text-gray-700 font-medium">
              Cities with Clinics
            </div>
          </div>

          {/* Verified Info */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-lg p-6 sm:p-8 text-center border-2 border-purple-200 sm:col-span-1 col-span-1">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-purple-600 rounded-full mb-3 sm:mb-4">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-3xl sm:text-4xl font-bold text-purple-600 mb-2">
              100%
            </div>
            <div className="text-sm sm:text-base text-gray-700 font-medium">
              Verified Information
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

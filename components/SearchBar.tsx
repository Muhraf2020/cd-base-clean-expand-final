'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface SearchBarProps {
  // Optional callbacks.
  // If provided, we use them (Clinics page mode).
  // If not provided, we navigate with router (Home page mode).
  onSearch?: (query: string) => void;
  onLocationSearch?: (lat: number, lng: number) => void;
}

export default function SearchBar({ onSearch, onLocationSearch }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isUsingLocation, setIsUsingLocation] = useState(false);
  const router = useRouter();

  // Helper: run a text search
  const submitSearch = (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;

    if (onSearch) {
      // Clinics page mode: parent handles filtering in-memory
      onSearch(trimmed);
    } else {
      // Home page mode: navigate to clinics page with query
      router.push(`/clinics?q=${encodeURIComponent(trimmed)}`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitSearch(query);
  };

  const handleQuickFilter = (filterQuery: string) => {
    setQuery(filterQuery);
    submitSearch(filterQuery);
  };

  // Helper to actually "go near me" once we HAVE lat/lng
  const goToLocation = (lat: number, lng: number) => {
    if (onLocationSearch) {
      // Clinics page: just sort/filter in-memory by distance
      onLocationSearch(lat, lng);
    } else {
      // Home page: navigate to clinics with coords in URL
      router.push(`/clinics?lat=${lat}&lng=${lng}`);
    }
  };

  // Try using cached last-known location if geolocation fails or stalls
  const tryCachedLocationOrAlert = () => {
    try {
      const raw = localStorage.getItem('lastKnownLocation');
      if (raw) {
        const { lat, lng, ts } = JSON.parse(raw) as {
          lat: number;
          lng: number;
          ts: number;
        };

        // only trust cache if it's recent (<24h) and numbers are valid
        const freshEnough =
          typeof lat === 'number' &&
          typeof lng === 'number' &&
          typeof ts === 'number' &&
          Date.now() - ts < 24 * 60 * 60 * 1000;

        if (freshEnough) {
          goToLocation(lat, lng);
          return;
        }
      }
    } catch {
      /* ignore JSON parse issues */
    }

    alert('Unable to get your location. Please allow location access and try again.');
  };

  const getUserLocation = () => {
    // guard: browser support
    if (!('geolocation' in navigator)) {
      alert('Geolocation is not supported in this browser.');
      return;
    }

    setIsUsingLocation(true);

    // failsafe in case the browser never calls success/error (Safari/iOS quirk)
    const failSafe = setTimeout(() => {
      setIsUsingLocation(false);
      tryCachedLocationOrAlert();
    }, 9000);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        clearTimeout(failSafe);
        const { latitude, longitude } = position.coords;

        // cache this location for future fast clicks / fallback
        try {
          localStorage.setItem(
            'lastKnownLocation',
            JSON.stringify({
              lat: latitude,
              lng: longitude,
              ts: Date.now(),
            })
          );
        } catch {
          /* storage may fail in private mode; ignore */
        }

        setIsUsingLocation(false);
        goToLocation(latitude, longitude);
      },
      (error) => {
        clearTimeout(failSafe);
        console.error('Geolocation error:', error);
        setIsUsingLocation(false);
        // try cached coord, otherwise alert
        tryCachedLocationOrAlert();
      },
      {
        enableHighAccuracy: false, // more reliable & faster across devices
        timeout: 8000,
        maximumAge: 120000, // up to 2 minutes-old cached GPS fix is OK
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        {/* Search Input */}
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, location, or ZIP code..."
            className="block w-full pl-9 sm:pl-10 pr-3 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Buttons Container */}
        <div className="flex gap-2 sm:gap-3">
          {/* Near Me Button */}
          <button
            type="button"
            onClick={getUserLocation}
            disabled={isUsingLocation}
            className="flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-3 bg-green-600 text-white text-sm sm:text-base font-medium rounded-lg hover:bg-green-700 focus:ring-4 focus:ring-green-300 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap min-w-[120px]"
          >
            {isUsingLocation ? (
              <>
                <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span className="hidden sm:inline">Finding...</span>
              </>
            ) : (
              <>
                <span>📍</span>
                <span>Near Me</span>
              </>
            )}
          </button>

          {/* Search Button */}
          <button
            type="submit"
            className="flex-1 sm:flex-none px-6 sm:px-8 py-2 sm:py-3 bg-blue-600 text-white text-sm sm:text-base font-medium rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition-colors whitespace-nowrap"
          >
            Search
          </button>
        </div>
      </div>

      {/* Quick Filters */}
      <div className="flex gap-1.5 sm:gap-2 mt-2 sm:mt-3 overflow-x-auto scrollbar-hide">
        <button
          type="button"
          onClick={() => handleQuickFilter('')}
          className="px-2 sm:px-3 py-1 text-[10px] sm:text-xs bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-colors whitespace-nowrap flex-shrink-0"
        >
          All
        </button>
        <button
          type="button"
          onClick={() => handleQuickFilter('acne')}
          className="px-2 sm:px-3 py-1 text-[10px] sm:text-xs bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-colors whitespace-nowrap flex-shrink-0"
        >
          Acne
        </button>
        <button
          type="button"
          onClick={() => handleQuickFilter('cosmetic')}
          className="px-2 sm:px-3 py-1 text-[10px] sm:text-xs bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-colors whitespace-nowrap flex-shrink-0"
        >
          Cosmetic
        </button>
        <button
          type="button"
          onClick={() => handleQuickFilter('pediatric')}
          className="px-2 sm:px-3 py-1 text-[10px] sm:text-xs bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-colors whitespace-nowrap flex-shrink-0"
        >
          Pediatric
        </button>
        <button
          type="button"
          onClick={() => handleQuickFilter('skin cancer')}
          className="px-2 sm:px-3 py-1 text-[10px] sm:text-xs bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-colors whitespace-nowrap flex-shrink-0"
        >
          Skin Cancer
        </button>
      </div>

      {/* Hide scrollbar on mobile */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </form>
  );
}

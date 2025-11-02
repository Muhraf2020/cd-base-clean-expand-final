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

interface FilterChip {
  label: string;
  query: string | null; // null means "All"
  icon: string;
}

export default function SearchBar({ onSearch, onLocationSearch }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isUsingLocation, setIsUsingLocation] = useState(false);
  const [showAllFilters, setShowAllFilters] = useState(false);
  const router = useRouter();

  // Helper: run a text search (or reset)
  const submitSearch = (q: string) => {
    const trimmed = q.trim();

    // If the parent (Clinics page) gave us onSearch, use local filtering
    if (onSearch) {
      onSearch(trimmed);
    } else {
      // We're on the home page: navigate to /clinics
      if (trimmed) {
        router.push(`/clinics?q=${encodeURIComponent(trimmed)}`);
      } else {
        // empty = "All" / reset
        router.push('/clinics');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitSearch(query);
  };

  // Quick category pill click
  function handleQuickFilter(term: string | null) {
    if (term === null) {
      // "All"
      setQuery('');
      submitSearch('');
      return;
    }

    setQuery(term);
    submitSearch(term);
  }

  // After we get coords (either live or cached), decide how to handle them
  const goToLocation = (lat: number, lng: number) => {
    if (onLocationSearch) {
      // Clinics page mode: sort/filter in-memory
      onLocationSearch(lat, lng);
    } else {
      // Home page mode: go to /clinics with lat/lng
      router.push(`/clinics?lat=${lat}&lng=${lng}`);
    }
  };

  // Try to reuse cached location if browser location fails
  const tryCachedLocationOrAlert = () => {
    try {
      const raw = localStorage.getItem('lastKnownLocation');
      if (raw) {
        const { lat, lng, ts } = JSON.parse(raw) as {
          lat: number;
          lng: number;
          ts: number;
        };

        const freshEnough =
          typeof lat === 'number' &&
          typeof lng === 'number' &&
          typeof ts === 'number' &&
          Date.now() - ts < 24 * 60 * 60 * 1000; // <24h

        if (freshEnough) {
          goToLocation(lat, lng);
          return;
        }
      }
    } catch {
      /* ignore bad cache */
    }

    alert('Unable to get your location. Please allow location access and try again.');
  };

  const getUserLocation = () => {
    if (!('geolocation' in navigator)) {
      alert('Geolocation is not supported in this browser.');
      return;
    }

    setIsUsingLocation(true);

    // failsafe if browser never calls back
    const failSafe = setTimeout(() => {
      setIsUsingLocation(false);
      tryCachedLocationOrAlert();
    }, 9000);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        clearTimeout(failSafe);
        const { latitude, longitude } = position.coords;

        // cache for fallback reuse
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
          /* private mode etc */
        }

        setIsUsingLocation(false);
        goToLocation(latitude, longitude);
      },
      (error) => {
        clearTimeout(failSafe);
        console.error('Geolocation error:', error);
        setIsUsingLocation(false);
        tryCachedLocationOrAlert();
      },
      {
        enableHighAccuracy: false,
        timeout: 8000,
        maximumAge: 120000, // up to 2 min old fix is fine
      }
    );
  };

  //
  // Quick filter chips
  //

  // Top row chips (always visible)
  const mainFilters: FilterChip[] = [
    { label: 'All',         query: null,          icon: '🏥' },
    { label: 'Acne',        query: 'acne',        icon: '💊' },
    { label: 'Cosmetic',    query: 'cosmetic',    icon: '✨' },
    { label: 'Pediatric',   query: 'pediatric',   icon: '👶' },
    { label: 'Skin Cancer', query: 'skin cancer', icon: '🎗️' },
  ];

  // Extra clinical specialties (optional "Show more")
  const specialtyFilters: FilterChip[] = [
    { label: 'Mohs Surgery',    query: 'mohs surgery',    icon: '🔬' },
    { label: 'Botox/Fillers',   query: 'botox filler',    icon: '💉' },
    { label: 'Laser Treatment', query: 'laser',           icon: '⚡' },
    { label: 'Hair Loss',       query: 'hair loss',       icon: '💇' },
    { label: 'Eczema',          query: 'eczema',          icon: '🩹' },
    { label: 'Psoriasis',       query: 'psoriasis',       icon: '🔴' },
    { label: 'Rosacea',         query: 'rosacea',         icon: '🌹' },
    { label: 'Wart Removal',    query: 'wart removal',    icon: '🔧' },
  ];

  // We removed amenityFilters because those are already covered
  // in the left sidebar FilterPanel.
  //
  // Before: allFilters = [...mainFilters, ...specialtyFilters, ...amenityFilters]
  // After:  just main + specialty.
  const allFilters: FilterChip[] = showAllFilters
    ? [...mainFilters, ...specialtyFilters]
    : mainFilters;

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
          {/* Near Me */}
          <button
            type="button"
            onClick={getUserLocation}
            disabled={isUsingLocation}
            className="flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-3 bg-green-600 text-white text-sm sm:text-base font-medium rounded-lg hover:bg-green-700 focus:ring-4 focus:ring-green-300 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap min-w-[120px]"
          >
            {isUsingLocation ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 sm:h-5 sm:w-5"
                  viewBox="0 0 24 24"
                >
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

          {/* Search */}
          <button
            type="submit"
            className="flex-1 sm:flex-none px-6 sm:px-8 py-2 sm:py-3 bg-blue-600 text-white text-sm sm:text-base font-medium rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition-colors whitespace-nowrap"
          >
            Search
          </button>
        </div>
      </div>

      {/* Quick Filters row(s) */}
      <div className="mt-2 sm:mt-3">
        <div className="flex gap-1.5 sm:gap-2 overflow-x-auto scrollbar-hide pb-2">
          {allFilters.map((filter) => (
            <button
              key={filter.label}
              type="button"
              onClick={() => handleQuickFilter(filter.query)}
              className="px-2 sm:px-3 py-1 text-[10px] sm:text-xs bg-white border border-gray-300 rounded-full hover:bg-gray-50 hover:border-blue-400 transition-colors whitespace-nowrap flex-shrink-0 flex items-center gap-1"
            >
              <span className="text-xs">{filter.icon}</span>
              <span>{filter.label}</span>
            </button>
          ))}
        </div>

        {/* Show More / Show Less */}
        <button
          type="button"
          onClick={() => setShowAllFilters(!showAllFilters)}
          className="mt-2 text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
        >
          {showAllFilters ? (
            <>
              <span>Show Less</span>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 15l7-7 7 7"
                />
              </svg>
            </>
          ) : (
            <>
              <span>
                Show More Filters ({specialtyFilters.length} more)
              </span>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </>
          )}
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

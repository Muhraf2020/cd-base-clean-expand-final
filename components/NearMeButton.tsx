'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NearMeButton() {
  const router = useRouter();
  const [isUsingLocation, setIsUsingLocation] = useState(false);

  // After we get coords (either live or cached), go to /clinics
  const goToLocation = (lat: number, lng: number) => {
    router.push(`/clinics?lat=${lat}&lng=${lng}`);
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
      // bad cache → just fall through
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
      console.warn('Geolocation timeout, falling back to cached location if available.');
      setIsUsingLocation(false);
      tryCachedLocationOrAlert();
    }, 9000);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        clearTimeout(failSafe);
        const { latitude, longitude } = position.coords;

        // Cache for fallback
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
          // ignore private mode / quota issues
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

  return (
    <button
      type="button"
      onClick={getUserLocation}
      disabled={isUsingLocation}
      className="inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg bg-green-600 text-white font-medium shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-70 disabled:cursor-not-allowed"
      aria-label="Find dermatology clinics near my current location"
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
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0
              3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="hidden sm:inline">Finding...</span>
          <span className="sm:hidden">Locating...</span>
        </>
      ) : (
        <>
          <span>📍</span>
          <span>Near Me</span>
        </>
      )}
    </button>
  );
}

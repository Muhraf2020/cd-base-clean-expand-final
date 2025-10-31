'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import SearchBar from '@/components/SearchBar';
import ClinicCard from '@/components/ClinicCard';
import FreeMapView from '@/components/FreeMapView';
import FilterPanel from '@/components/FilterPanel';
import MobileFilterButton from '@/components/MobileFilterButton';
import { Clinic, FilterOptions } from '@/lib/dataTypes';
import { calculateDistance } from '@/lib/utils';
import Link from 'next/link';

function ClinicsContent() {
  const searchParams = useSearchParams();

  // URL inputs we support
  const stateParam = searchParams.get('state');
  const cityParam = searchParams.get('city');
  const searchQuery = searchParams.get('q');
  const latParam = searchParams.get('lat');
  const lngParam = searchParams.get('lng');

  // State
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [filteredClinics, setFilteredClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [filters, setFilters] = useState<FilterOptions>({});
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);

  // Load clinics whenever location/search context changes
  useEffect(() => {
    loadClinics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stateParam, cityParam, searchQuery, latParam, lngParam]);

  // Fetch clinics from API, allow backend to radius-filter if coords exist,
  // then apply frontend fallback + distance ordering
  const loadClinics = async () => {
    try {
      setLoading(true);

      // 1. Build API URL
      let url = '/api/clinics?per_page=5000';
      if (stateParam) url += `&state=${stateParam}`;
      if (cityParam) url += `&city=${encodeURIComponent(cityParam)}`;
      if (searchQuery) url += `&q=${encodeURIComponent(searchQuery)}`;

      // keep sending coords when present (so backend can do radius search)
      if (latParam && lngParam) {
        url += `&lat=${latParam}&lng=${lngParam}`;
      }

      const res = await fetch(url);
      const data = await res.json();

      const hasLatLng = !!(latParam && lngParam);
      const userLat = hasLatLng ? parseFloat(latParam as string) : NaN;
      const userLng = hasLatLng ? parseFloat(lngParam as string) : NaN;

      let loadedClinics: Clinic[] = data.clinics || [];

      // 2. Fallback: backend returned nothing even though we have coords?
      // Grab a broad list (nationwide) and sort locally.
      if (hasLatLng && loadedClinics.length === 0) {
        try {
          const broad = await fetch('/api/clinics?per_page=5000');
          const broadData = await broad.json();
          loadedClinics = broadData.clinics || [];
        } catch (e) {
          console.error('Fallback broad fetch failed', e);
        }
      }

      // 3. If we know user coords, keep nearest-first ordering on the client
      if (
        hasLatLng &&
        loadedClinics.length > 0 &&
        !Number.isNaN(userLat) &&
        !Number.isNaN(userLng)
      ) {
        loadedClinics = loadedClinics
          .map((c: Clinic & { distance?: number }) => ({
            ...c,
            distance: calculateDistance(
              { lat: userLat, lng: userLng },
              { lat: c.location.lat, lng: c.location.lng }
            ),
          }))
          .sort((a, b) => {
            const da = a.distance ?? 0;
            const db = b.distance ?? 0;
            return da - db;
          });
      }

      setClinics(loadedClinics);
      setFilteredClinics(loadedClinics);
    } catch (error) {
      console.error('Error loading clinics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Local text search (SearchBar → onSearch)
  const handleSearch = (query: string) => {
    if (!query || query.trim() === '') {
      setFilteredClinics(clinics);
      return;
    }

    const trimmedQuery = query.trim();
    const lowerQuery = trimmedQuery.toLowerCase();
    const isZipCode = /^\d{5}$/.test(trimmedQuery);

    const filtered = clinics.filter((clinic) => {
      if (isZipCode) {
        return clinic.postal_code === trimmedQuery;
      }

      const searchableText = `
        ${clinic.display_name || ''} 
        ${clinic.formatted_address || ''} 
        ${clinic.city || ''} 
        ${clinic.state_code || ''} 
        ${clinic.types?.join(' ') || ''} 
        ${clinic.primary_type || ''}
      `.toLowerCase();

      return searchableText.includes(lowerQuery);
    });

    setFilteredClinics(filtered);
  };

  // Local "Near Me" sort (SearchBar → onLocationSearch).
  // Note: this does NOT refetch, it just sorts what we already have.
  const handleLocationSearch = (lat: number, lng: number) => {
    const clinicsWithDistance = clinics.map((clinic) => ({
      ...clinic,
      distance: calculateDistance(
        { lat, lng },
        { lat: clinic.location.lat, lng: clinic.location.lng }
      ),
    }));

    const sorted = clinicsWithDistance.sort(
      (a, b) => (a.distance ?? 0) - (b.distance ?? 0)
    );

    setFilteredClinics(sorted);
  };

  // Apply sidebar filters (rating, amenities, etc.)
  const applyFilters = () => {
    let next = [...clinics];

    if (filters.rating_min) {
      next = next.filter((c) => (c.rating || 0) >= filters.rating_min!);
    }

    if (filters.has_website) {
      next = next.filter((c) => c.website && c.website.trim() !== '');
    }

    if (filters.has_phone) {
      next = next.filter((c) => c.phone && c.phone.trim() !== '');
    }

    if (filters.wheelchair_accessible) {
      next = next.filter(
        (c) => c.accessibility_options?.wheelchair_accessible_entrance === true
      );
    }

    if (filters.free_parking) {
      next = next.filter(
        (c) => c.parking_options?.free_parking_lot === true
      );
    }

    if (filters.open_now) {
      next = next.filter(
        (c) =>
          c.current_open_now === true ||
          c.opening_hours?.open_now === true
      );
    }

    if (filters.states && filters.states.length > 0) {
      next = next.filter((c) => {
        return c.state_code && filters.states?.includes(c.state_code);
      });
    }

    if (filters.sort_by) {
      next.sort((a, b) => {
        let aVal: string | number = 0;
        let bVal: string | number = 0;

        switch (filters.sort_by) {
          case 'rating':
            aVal = a.rating || 0;
            bVal = b.rating || 0;
            break;
          case 'reviews':
            aVal = a.user_rating_count || 0;
            bVal = b.user_rating_count || 0;
            break;
          case 'name':
            aVal = (a.display_name || '').toLowerCase();
            bVal = (b.display_name || '').toLowerCase();
            break;
          default:
            return 0;
        }

        if (filters.sort_order === 'asc') {
          return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        } else {
          return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
        }
      });
    }

    setFilteredClinics(next);
  };

  // Re-run filters whenever filters OR clinics change
  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, clinics]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href={cityParam && stateParam ? `/state/${stateParam}` : '/'}
            className="text-blue-600 hover:text-blue-700 font-medium mb-4 inline-block"
          >
            ← Back to {cityParam ? `${stateParam} Cities` : 'Home'}
          </Link>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {cityParam
                  ? `${cityParam}, ${stateParam || ''} `
                  : stateParam
                  ? `${stateParam} `
                  : ''}
                Dermatology Clinics
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Find the best skin care specialists
                {cityParam && ` in ${cityParam}`}
              </p>
            </div>

            {/* View Toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 rounded-lg transition ${
                  viewMode === 'grid'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Grid View
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`px-4 py-2 rounded-lg transition ${
                  viewMode === 'map'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Map View
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Sticky Search Bar */}
      <div className="sticky top-0 z-40 bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4">
          <SearchBar
            onSearch={handleSearch}
            onLocationSearch={handleLocationSearch}
          />
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-6">
          {/* Filters Sidebar */}
          <aside className="w-64 flex-shrink-0 hidden lg:block">
            <FilterPanel filters={filters} onFilterChange={setFilters} />
          </aside>

          {/* Mobile Filter Button */}
          <MobileFilterButton
            filters={filters}
            onFilterChange={setFilters}
            resultCount={filteredClinics.length}
          />

          {/* Results */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {loading
                  ? 'Loading...'
                  : `${filteredClinics.length} clinics found`}
              </h2>
            </div>

            {/* Grid or Map View */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4 sm:gap-6">
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="bg-white rounded-lg shadow-md p-6 animate-pulse"
                    >
                      <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  ))
                ) : filteredClinics.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <p className="text-gray-500 text-lg">
                      No clinics found. Try adjusting your filters.
                    </p>
                  </div>
                ) : (
                  filteredClinics.map((clinic) => (
                    <ClinicCard
                      key={clinic.place_id}
                      clinic={clinic}
                      onClick={() => setSelectedClinic(clinic)}
                    />
                  ))
                )}
              </div>
            ) : (
              <div className="h-[500px] sm:h-[600px] lg:h-[calc(100vh-300px)] rounded-lg overflow-hidden shadow-lg">
                <FreeMapView
                  clinics={filteredClinics}
                  selectedClinic={selectedClinic}
                  onClinicSelect={setSelectedClinic}
                />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ClinicsClientPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ClinicsContent />
    </Suspense>
  );
}

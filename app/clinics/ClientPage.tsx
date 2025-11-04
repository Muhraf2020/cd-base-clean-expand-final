'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import SearchBar from '@/components/SearchBar';
import ClinicCard from '@/components/ClinicCard';
import FreeMapView from '@/components/FreeMapView';
import FilterPanel from '@/components/FilterPanel';
import MobileFilterButton from '@/components/MobileFilterButton';
import Logo from '@/components/Logo';
import { Clinic, FilterOptions } from '@/lib/dataTypes';
import { calculateDistance } from '@/lib/utils';
import Link from 'next/link';

function ClinicsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

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

  // ----------------------------
  // Search helpers (synonyms + typos + phrases)
  // ----------------------------
  const SEARCH_SYNONYMS: Record<string, string[]> = {
    // Single-word categories
    acne: ['acne', 'acne scars', 'acne scar', 'acne vulgaris', 'comedones', 'pimples'],
    cosmetic: ['cosmetic', 'aesthetic', 'aesthetics', 'cosmetic dermatology', 'cosmetic clinic'],
    pediatric: ['pediatric', 'paediatric', 'kids', 'children', 'child', 'peds', 'pediatric dermatology'],
    eczema: ['eczema', 'atopic dermatitis', 'dermatitis'],
    psoriasis: ['psoriasis', 'psoriatic'],
    rosacea: ['rosacea', 'facial redness', 'flushing', 'telangiectasia', 'erythematotelangiectatic', 'papulopustular'],
    laser: ['laser', 'laser therapy', 'laser hair removal', 'lhr', 'ipl', 'intense pulsed light', 'resurfacing', 'fraxel', 'co2 laser', 'nd:yag', 'vascular laser'],
    mohs: ['mohs', 'mohs surgery', 'mohs micrographic', 'micrographic', 'mohs surgeon'],
    botox: ['botox', 'botulinum toxin', 'dysport', 'xeomin', 'jeuveau'],
    filler: ['filler', 'fillers', 'dermal filler', 'dermal fillers', 'hyaluronic acid', 'restylane', 'juvederm', 'sculptra', 'radiesse'],
    hydrafacial: ['hydrafacial', 'hydra facial', 'hydrofacial', 'hydro facial', 'hydrafacial®'],
    telehealth: ['telehealth', 'virtual visit', 'online consultation', 'video visit'],

    // Additional single-word topics
    alopecia: ['alopecia', 'androgenetic alopecia', 'mpb', 'fpb', 'pattern hair loss'],
    warts: ['warts', 'verruca', 'verruca vulgaris'],

    // Canonical tokens for phrases
    skin_cancer: [
      'skin cancer', 'melanoma', 'non-melanoma', 'basal cell carcinoma', 'bcc',
      'squamous cell carcinoma', 'scc', 'actinic keratosis', 'ak',
      'skin cancer screening', 'mole check', 'mole mapping', 'dermoscopy', 'dermatoscopy'
    ],
    hair_loss: [
      'hair loss', 'alopecia', 'androgenetic alopecia', 'male pattern baldness',
      'female pattern hair loss', 'prp hair', 'prp for hair', 'minoxidil', 'finasteride', 'telogen effluvium'
    ],
    wart_removal: [
      'wart removal', 'warts', 'verruca', 'verruca vulgaris', 'cryotherapy', 'liquid nitrogen', 'salicylic acid'
    ],
    laser_treatment: [
      'laser treatment', 'laser therapy', 'laser', 'laser hair removal', 'lhr', 'ipl', 'intense pulsed light', 'resurfacing', 'fraxel', 'co2 laser', 'nd:yag'
    ],
    botox_fillers: [
      'botox', 'botulinum toxin', 'fillers', 'dermal filler', 'dermal fillers', 'dysport', 'xeomin', 'jeuveau', 'restylane', 'juvederm', 'sculptra', 'radiesse'
    ],
  };

  // Phrase triggers -> canonical tokens to inject
  const PHRASE_SYNONYMS: Record<string, string[]> = {
    'skin cancer': ['skin cancer', ...SEARCH_SYNONYMS.skin_cancer],
    'mohs surgery': ['mohs', ...SEARCH_SYNONYMS.mohs],
    'laser treatment': [...SEARCH_SYNONYMS.laser_treatment],
    'hair loss': [...SEARCH_SYNONYMS.hair_loss],
    'wart removal': [...SEARCH_SYNONYMS.wart_removal],
    'botox fillers': [...SEARCH_SYNONYMS.botox_fillers],
    'botox and fillers': [...SEARCH_SYNONYMS.botox_fillers],
  };

  const MISSPELLINGS: Record<string, string> = {
    eczwma: 'eczema',
    eczmea: 'eczema',
    psorasis: 'psoriasis',
    psoraisis: 'psoriasis',
    rosacia: 'rosacea',
    rozacea: 'rosacea',
    roscaea: 'rosacea',
    hydraficial: 'hydrafacial',
    hydrofacial: 'hydrafacial',
    lasar: 'laser',
    alopcia: 'alopecia',
    alopeica: 'alopecia',
    moh: 'mohs',
    'mohs surgry': 'mohs surgery',
    'mohs suregery': 'mohs surgery',
    botax: 'botox',
    filllers: 'fillers',
    wrat: 'wart',
  };

  const normalize = (s: string) =>
    s
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();

  const correct = (term: string) => MISSPELLINGS[term] || term;

  const expandTerms = (qRaw: string): string[] => {
    // Normalize + remove "open now" (handled by real filter), and soften separators for phrases
    const base = normalize(qRaw);
    const cleaned = base
      .replace(/\bopen\s*now\b/g, '')
      .replace(/[\/&]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const out = new Set<string>();
    if (!cleaned) return [];

    // 1) Add phrase-based synonyms if phrase is present anywhere
    for (const phrase of Object.keys(PHRASE_SYNONYMS)) {
      if (cleaned.includes(phrase)) {
        PHRASE_SYNONYMS[phrase].forEach((syn) => out.add(normalize(syn)));
      }
    }

    // 2) Tokenize remaining words and expand using single-token synonyms
    const parts = cleaned.split(/\s+/).filter(Boolean);
    for (const p of parts) {
      const t = correct(p);
      out.add(t);
      const syns = SEARCH_SYNONYMS[t];
      if (syns) {
        syns.forEach((syn) => out.add(normalize(syn)));
      }
    }

    return Array.from(out);
  };

  const tokenizeClinic = (c: Clinic) => {
    const fields: string[] = [
      c.display_name,
      c.formatted_address,
      c.city,
      c.state_code,
      c.primary_type,
      ...(Array.isArray(c.types) ? c.types : []),
      ...(Array.isArray((c as any).services_offered) ? (c as any).services_offered : []),
      ...(Array.isArray((c as any).specialties) ? (c as any).specialties : []),
      ...(Array.isArray((c as any).conditions_treated) ? (c as any).conditions_treated : []),
      ...(Array.isArray((c as any).keywords) ? (c as any).keywords : []),
      (c as any).description,
    ].filter(Boolean) as string[];

    const text = normalize(fields.join(' ')).replace(/\s+/g, ' ');
    const words = new Set(text.split(/\s+/).filter(Boolean));
    return { text, words };
  };

  // Tiny Levenshtein with early-exit threshold
  const editDistance = (a: string, b: string, max = 2) => {
    const la = a.length, lb = b.length;
    if (Math.abs(la - lb) > max) return max + 1;
    const dp = new Array(lb + 1);
    for (let j = 0; j <= lb; j++) dp[j] = j;
    for (let i = 1; i <= la; i++) {
      let prev = dp[0];
      dp[0] = i;
      let minRow = dp[0];
      for (let j = 1; j <= lb; j++) {
        const tmp = dp[j];
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + cost);
        prev = tmp;
        if (dp[j] < minRow) minRow = dp[j];
      }
      if (minRow > max) return max + 1;
    }
    return dp[lb];
  };

  // Score a clinic against a query (exact > taxonomy > fuzzy)
  const scoreClinic = (c: Clinic, qRaw: string) => {
    const terms = expandTerms(qRaw);
    if (terms.length === 0) return 0;
    const { text, words } = tokenizeClinic(c);
    let score = 0;

    for (const t of terms) {
      if (!t) continue;

      // exact/phrase match
      if (text.includes(t)) {
        const dn = (c.display_name || '').toLowerCase();
        const pt = (c.primary_type || '').toLowerCase();
        const typesBlob = Array.isArray(c.types) ? c.types.join(' ').toLowerCase() : '';

        if (dn.includes(t)) score += 3; // name hit is strongest
        else if (typesBlob.includes(t) || pt.includes(t)) score += 2; // taxonomy hit
        else score += 1; // somewhere else
        continue;
      }

      // fuzzy: allow small typos on long tokens
      const maxEd = t.length >= 7 ? 2 : 1;
      for (const w of words) {
        if (Math.abs(w.length - t.length) > maxEd) continue;
        if (editDistance(w, t, maxEd) <= maxEd) {
          score += 1;
          break;
        }
      }
    }
    return score;
  };

  const filterByQuery = (arr: Clinic[], qRaw: string) => {
    const scored = arr
      .map((c) => ({ c, s: scoreClinic(c, qRaw) }))
      .filter(({ s }) => s > 0)
      .sort((a, b) => b.s - a.s)
      .map(({ c }) => c);
    return scored;
  };

  // ----------------------------------------------------
  // ✅ FIX: Fetch clinics WITHOUT filtering
  // Store FULL dataset in clinics state
  // IMPROVED: Better handling for queries without location
  // ----------------------------------------------------
  const loadClinics = async () => {
    try {
      setLoading(true);

      // --- URL inputs ---
      const qRaw = (searchQuery || '').trim();
      const q = qRaw.toLowerCase();
      const isAll = /^all$/.test(q); // special: 'All' forces nationwide
      const hasLocation = !!(stateParam || cityParam || (latParam && lngParam));
      const hasQueryWithoutLocation = qRaw && !isAll && !hasLocation;

      // --- 1) Build API URL ---
      // ✅ FIX: When searching without location (home page), pass query to API
      // This lets the database do initial filtering, then client refines results
      const fetchNationwide = isAll || hasQueryWithoutLocation;

      let url = `/api/clinics?per_page=5000`;

      // Add location filters if we have location AND not forcing nationwide
      if (!fetchNationwide && hasLocation) {
        if (stateParam) url += `&state=${encodeURIComponent(stateParam)}`;
        if (cityParam) url += `&city=${encodeURIComponent(cityParam)}`;
        if (latParam && lngParam) url += `&lat=${latParam}&lng=${lngParam}`;
      }

      // ✅ NEW: Pass query to API when searching nationwide (home page searches)
      // This reduces dataset size from 5000 to ~50-500 relevant clinics
      if (hasQueryWithoutLocation && qRaw) {
        url += `&q=${encodeURIComponent(qRaw)}`;
      }

      console.log('Fetching clinics:', { url, fetchNationwide, hasLocation, hasQueryWithoutLocation, qRaw });

      const res = await fetch(url);
      const data = await res.json();

      const hasLatLng = !!(latParam && lngParam);
      const userLat = hasLatLng ? parseFloat(latParam as string) : NaN;
      const userLng = hasLatLng ? parseFloat(lngParam as string) : NaN;

      let loadedClinics: Clinic[] = data.clinics || [];

      // --- 2) Fallback: if radius search returned nothing, fetch a broader list (no coords) ---
      if (!fetchNationwide && hasLatLng && loadedClinics.length === 0) {
        try {
          console.log('Fallback: radius search returned nothing, trying broader fetch');
          let fbUrl = `/api/clinics?per_page=5000`;
          if (stateParam) fbUrl += `&state=${encodeURIComponent(stateParam)}`;
          if (cityParam) fbUrl += `&city=${encodeURIComponent(cityParam)}`;
          const broad = await fetch(fbUrl);
          const broadData = await broad.json();
          loadedClinics = broadData.clinics || [];
        } catch (e) {
          console.error('Fallback broad fetch failed', e);
        }
      }

      // --- 3) ✅ Distance ordering on the client when coords are known ---
      if (
        !fetchNationwide &&
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
              { lat: c.location?.lat ?? 0, lng: c.location?.lng ?? 0 }
            ),
          }))
          .sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0)) as Clinic[];
      }

      // --- 4) ✅ CRITICAL FIX: Always store FULL dataset ---
      // Do NOT filter by query here - let applyFilters() handle ALL filtering
      console.log('Loaded clinics:', loadedClinics.length);
      setClinics(loadedClinics);
      // Don't set filteredClinics here - applyFilters() will do it

    } catch (error) {
      console.error('Error loading clinics:', error);
      setClinics([]); // Ensure we set empty array on error
    } finally {
      setLoading(false);
    }
  };

  // Load clinics whenever location context changes
  useEffect(() => {
    loadClinics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stateParam, cityParam, latParam, lngParam, searchQuery]); // ✅ ADDED searchQuery to deps

  // ✅ Sync URL query parameter to filters state
  useEffect(() => {
    const qRaw = (searchQuery || '').trim();

    // ✅ FIX: Check if we have location context
    // If no location context (nationwide search from home page), start with clean filters
    // If location context (city/state page), preserve existing filters
    const hasLocation = !!(stateParam || cityParam || (latParam && lngParam));

    if (qRaw) {
      const includesOpenNow = /\bopen\s*now\b/i.test(qRaw);

      if (hasLocation) {
        // City/state page: preserve existing filters, just add/update query
        setFilters((prev) => ({
          ...prev,
          query: qRaw,
          open_now: includesOpenNow ? true : prev.open_now,
        }));
      } else {
        // Nationwide search from home page: start fresh with only the query
        setFilters({
          query: qRaw,
          ...(includesOpenNow && { open_now: true }),
        } as FilterOptions);
      }
    } else {
      // Clear query filter if no search param
      setFilters((prev) => {
        const { query, ...rest } = prev;
        return rest;
      });
    }
  }, [searchQuery, stateParam, cityParam, latParam, lngParam]);

  // Local text search (SearchBar → onSearch) — "All" resets nationwide list
  const handleSearch = (query: string) => {
    const trimmed = (query || '').trim();

    // If user clicks/types "All": clear filters, clear selection, and strip URL params
    if (trimmed === '' || /^all$/i.test(trimmed)) {
      setSelectedClinic(null);
      setFilters({} as FilterOptions);
      router.push('/clinics'); // removes state/city/q/lat/lng → fetch all 5000
      return;
    }

    const includesOpenNow = /\bopen\s*now\b/i.test(trimmed);
    
    // ✅ Update URL with query parameter
    const params = new URLSearchParams();
    params.set('q', trimmed);
    if (stateParam) params.set('state', stateParam);
    if (cityParam) params.set('city', cityParam);
    if (latParam) params.set('lat', latParam);
    if (lngParam) params.set('lng', lngParam);
    
    router.push(`/clinics?${params.toString()}`);
  };

  // Local "Near Me" sort (SearchBar → onLocationSearch).
  // This does NOT refetch. It just sorts what we already have.
  const handleLocationSearch = (lat: number, lng: number) => {
    const clinicsWithDistance = clinics.map((clinic) => ({
      ...clinic,
      distance: calculateDistance(
        { lat, lng },
        {
          lat: clinic.location?.lat ?? 0,
          lng: clinic.location?.lng ?? 0,
        }
      ),
    }));

    const sorted = clinicsWithDistance.sort(
      (a, b) => (a.distance ?? 0) - (b.distance ?? 0)
    );

    setClinics(sorted as Clinic[]);
  };

  // ✅ FIX: Apply ALL filters (including query) in one place
  const applyFilters = () => {
    let next = [...clinics];

    // 0) ✅ Query filtering FIRST (works with full dataset)
    const queryStrRaw = ((filters as any).query ?? '').toString().trim();
    const isAllQuery = /^all$/i.test(queryStrRaw);
    const queryStr = isAllQuery ? '' : queryStrRaw;

    // ✅ IMPORTANT: Only apply client-side query filtering if we have location context
    // When searching nationwide (home page), trust the API results (already filtered at DB level)
    const hasLocation = !!(stateParam || cityParam || (latParam && lngParam));
    const shouldClientFilter = hasLocation; // Only filter client-side for city/state pages

    if (queryStr && shouldClientFilter) {
      const scored = filterByQuery(next, queryStr);
      next = scored.length > 0 ? scored : next; // fallback to all if no matches
    }

    // 1) Standard filters
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
      next = next.filter((c) => c.parking_options?.free_parking_lot === true);
    }

    if (filters.open_now) {
      next = next.filter(
        (c) => c.current_open_now === true || c.opening_hours?.open_now === true
      );
    }

    if (filters.states && filters.states.length > 0) {
      const allowedStates = filters.states;
      next = next.filter(
        (c) => c.state_code && allowedStates.includes(c.state_code)
      );
    }

    // 2) Sorting (rating/reviews/name). Distance sort is handled at load time.
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

        return filters.sort_order === 'asc'
          ? aVal < bVal
            ? -1
            : aVal > bVal
            ? 1
            : 0
          : aVal > bVal
          ? -1
          : aVal < bVal
          ? 1
          : 0;
      });
    }

    // 3) ✅ Absolute fallback: never show an empty screen
    if (next.length === 0) next = [...clinics];

    console.log('🔍 Applied filters:', {
      queryStr,
      originalCount: clinics.length,
      filteredCount: next.length,
      hasLocation,
      shouldClientFilter,
      activeFilters: Object.keys(filters).filter(k => filters[k as keyof FilterOptions]),
      sampleClinics: clinics.slice(0, 2).map(c => ({
        name: c.display_name,
        city: c.city,
        state: c.state_code,
        rating: c.rating,
        open: c.current_open_now
      })),
      sampleFiltered: next.slice(0, 2).map(c => ({
        name: c.display_name,
        city: c.city,
        state: c.state_code
      }))
    });

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col gap-4">
          {/* Row 1: Brand + Back link */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Logo />
            </div>

            <Link
              href={cityParam && stateParam ? `/state/${stateParam}` : '/'}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm sm:text-base"
            >
              ← Back to {cityParam ? `${stateParam} Cities` : 'Home'}
            </Link>
          </div>

          {/* Row 2: Page title + View toggle */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {searchQuery ? (
                  <>Search: {searchQuery}</>
                ) : cityParam ? (
                  `${cityParam}, ${stateParam || ''} `
                ) : stateParam ? (
                  `${stateParam} `
                ) : (
                  ''
                )}{' '}
                Dermatology Clinics
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {searchQuery 
                  ? `Showing results for "${searchQuery}"${cityParam ? ` in ${cityParam}` : ''}`
                  : `Find the best skin care specialists${cityParam ? ` in ${cityParam}` : ''}`
                }
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
          <SearchBar onSearch={handleSearch} onLocationSearch={handleLocationSearch} />
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
                {loading ? 'Loading...' : `${filteredClinics.length} clinics shown`}
              </h2>
            </div>

            {/* Grid or Map View */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4 sm:gap-6">
                {loading ? (
                  // skeletons
                  Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                      <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  ))
                ) : filteredClinics.length === 0 ? (
                  // empty state with recovery CTA
                  <div className="col-span-full text-center py-12 space-y-4">
                    <p className="text-gray-500 text-lg">No clinics found with those filters.</p>

                    <button
                      className="inline-block px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                      onClick={() => {
                        // 1. clear all local filters
                        setFilters({} as FilterOptions);

                        // 2. force a broad fetch again:
                        //    navigate to /clinics with no query params at all
                        router.push('/clinics');
                      }}
                    >
                      Clear filters and show all clinics
                    </button>
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

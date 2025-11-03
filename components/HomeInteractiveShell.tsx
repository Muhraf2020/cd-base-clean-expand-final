// components/HomeInteractiveShell.tsx
'use client';

import dynamic from 'next/dynamic';

// 1. Search bar (critical UI, but still client code)
//    with the fixed skeleton from section #1.
const SearchBarClient = dynamic(
  () => import('@/components/SearchBarClientWrapper'),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm p-4">
        <div className="min-h-[120px] sm:min-h-[64px] flex flex-col sm:flex-row gap-2 sm:gap-3">
          <div className="h-[56px] w-full rounded-md border border-gray-200 bg-gray-100 animate-pulse" />
          <div className="h-[56px] w-full sm:w-[200px] rounded-md border border-gray-200 bg-gray-100 animate-pulse" />
        </div>
      </div>
    ),
  }
);

// 2. Stats (below hero; not needed for first paint)
const StatsSection = dynamic(
  () => import('@/components/StatsSection'),
  {
    ssr: false,
    loading: () => (
      <section className="py-8 sm:py-10 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse h-20 bg-gray-100 rounded-lg" />
        </div>
      </section>
    ),
  }
);

// 3. State grid ("Browse Clinics by State")
const StateGridClient = dynamic(
  () => import('@/components/StateGrid'),
  {
    ssr: false,
    loading: () => (
      <div className="animate-pulse h-32 bg-gray-100 rounded-lg" />
    ),
  }
);

// 4. Comparison promo box (not essential at all)
const ComparisonFeatureBox = dynamic(
  () => import('@/components/ComparisonFeatureBox'),
  {
    ssr: false,
    loading: () => null,
  }
);

export default function HomeInteractiveShell() {
  return (
    <>
      {/* Sticky Search Bar */}
      <div className="sticky top-0 z-50 bg-white shadow-md">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 py-2 sm:py-4">
          <SearchBarClient />
        </div>
      </div>

      {/* Live stats under hero */}
      <StatsSection />

      {/* Feature promo */}
      <ComparisonFeatureBox />

      {/* Browse by State */}
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

          <StateGridClient />
        </div>
      </section>
    </>
  );
}

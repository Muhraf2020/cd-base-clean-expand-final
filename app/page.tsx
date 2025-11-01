import Link from 'next/link';
import StateGrid from '@/components/StateGrid';
import SearchBar from '@/components/SearchBar';
import StatsSection from '@/components/StatsSection';
import ComparisonFeatureBox from '@/components/ComparisonFeatureBox';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 leading-tight">
              Find Dermatology Clinics Near You
            </h1>
            <p className="text-base sm:text-xl lg:text-2xl text-blue-100 mb-6 sm:mb-8 max-w-3xl mx-auto px-4">
              Your comprehensive directory of dermatology clinics across the
              United States
            </p>

            <Link
              href="/add-clinic"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Add Your Clinic
            </Link>
          </div>
        </div>
      </header>

      {/* Sticky Search Bar */}
      <div className="sticky top-0 z-50 bg-white shadow-md">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 py-2 sm:py-4">
          <SearchBar />
        </div>
      </div>

      {/* Stats Section */}
      <StatsSection />

      {/* 🔥 New Comparison Feature Promo Box */}
      <ComparisonFeatureBox />

      {/* ✅ All your existing “Why trust us / data sources / how we score / etc.”
          sections go here. DO NOT delete them.
          Just keep exactly what you had before you replaced the file. */}

      {/* YOUR ORIGINAL SECTIONS START */}
      {/*
        Example (these are placeholders to show where to put your real JSX):

        <WhyTrustSection />
        <DataSourcesSection />
        <HowWeScoreSection />
        <DataQualityStatement />

        Whatever custom JSX / <section> blocks you had,
        paste them back right here in the same order.
      */}
      {/* YOUR ORIGINAL SECTIONS END */}

      {/* Browse by State */}
      <section className="py-8 sm:py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Browse Clinics by State
            </h2>
            <p className="text-base sm:text-lg text-gray-600 px-4">
              Select your state to find dermatology clinics near you
            </p>
          </div>

          <StateGrid />
        </div>
      </section>

      {/* About / Footer (keep whatever you already had below this) */}
    </div>
  );
}

'use client';

import { useRouter } from 'next/navigation';
import SearchBar from '@/components/SearchBar';

export default function SearchBarClientWrapper() {
  const router = useRouter();

  const handleSearch = (query: string) => {
    router.push(`/clinics?q=${encodeURIComponent(query)}`);
  };

  const handleLocationSearch = (lat: number, lng: number) => {
    router.push(`/clinics?lat=${lat}&lng=${lng}`);
  };

  return (
    <SearchBar
      onSearch={handleSearch}
      onLocationSearch={handleLocationSearch}
    />
  );
}


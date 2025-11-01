'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from 'react';
import { Clinic } from '@/lib/dataTypes';

const MAX_CLINICS = 4;

type CompareContextValue = {
  selectedClinics: Clinic[];
  isModalOpen: boolean;
  addClinic: (clinic: Clinic) => void;
  removeClinic: (placeId: string) => void;
  clearAll: () => void;
  isSelected: (placeId: string) => boolean;
  openModal: () => void;
  closeModal: () => void;
};

const CompareContext = createContext<CompareContextValue | undefined>(
  undefined
);

export function CompareProvider({ children }: { children: ReactNode }) {
  const [selectedClinics, setSelectedClinics] = useState<Clinic[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem('compare_clinics');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setSelectedClinics(parsed);
        }
      }
    } catch {
      /* ignore localStorage errors */
    }
  }, []);

  // Persist to localStorage whenever it changes
  useEffect(() => {
    try {
      window.localStorage.setItem(
        'compare_clinics',
        JSON.stringify(selectedClinics)
      );
    } catch {
      /* ignore */
    }
  }, [selectedClinics]);

  const isSelected = useCallback(
    (placeId: string) =>
      selectedClinics.some((c) => c.place_id === placeId),
    [selectedClinics]
  );

  const addClinic = useCallback((clinic: Clinic) => {
    setSelectedClinics((prev) => {
      // already selected?
      if (prev.some((c) => c.place_id === clinic.place_id)) return prev;
      // hit max?
      if (prev.length >= MAX_CLINICS) return prev;
      return [...prev, clinic];
    });
  }, []);

  const removeClinic = useCallback((placeId: string) => {
    setSelectedClinics((prev) =>
      prev.filter((c) => c.place_id !== placeId)
    );
  }, []);

  const clearAll = useCallback(() => {
    setSelectedClinics([]);
  }, []);

  const openModal = useCallback(() => {
    // only open if there are at least 2 clinics to compare
    setIsModalOpen((prev) => {
      if (selectedClinics.length >= 2) {
        return true;
      }
      return prev;
    });
  }, [selectedClinics.length]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  return (
    <CompareContext.Provider
      value={{
        selectedClinics,
        isModalOpen,
        addClinic,
        removeClinic,
        clearAll,
        isSelected,
        openModal,
        closeModal,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const ctx = useContext(CompareContext);
  if (!ctx) {
    throw new Error(
      'useCompare must be used inside <CompareProvider>. Make sure CompareProvider wraps your app in layout.tsx.'
    );
  }
  return ctx;
}

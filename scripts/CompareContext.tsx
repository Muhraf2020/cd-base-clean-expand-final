'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Clinic } from './dataTypes';

interface CompareContextType {
  selectedClinics: Clinic[];
  addClinic: (clinic: Clinic) => void;
  removeClinic: (placeId: string) => void;
  clearAll: () => void;
  isSelected: (placeId: string) => boolean;
  canAddMore: boolean;
  maxClinics: number;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

const MAX_COMPARE_CLINICS = 4; // Maximum clinics to compare at once
const STORAGE_KEY = 'dermclinic_compare';

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [selectedClinics, setSelectedClinics] = useState<Clinic[]>([]);
  const [isClient, setIsClient] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    setIsClient(true);
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setSelectedClinics(parsed);
        }
      }
    } catch (error) {
      console.error('Error loading comparison data:', error);
    }
  }, []);

  // Save to localStorage whenever selection changes
  useEffect(() => {
    if (isClient) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedClinics));
      } catch (error) {
        console.error('Error saving comparison data:', error);
      }
    }
  }, [selectedClinics, isClient]);

  const addClinic = (clinic: Clinic) => {
    if (selectedClinics.length >= MAX_COMPARE_CLINICS) {
      return; // Don't add if at max
    }
    if (selectedClinics.some(c => c.place_id === clinic.place_id)) {
      return; // Already selected
    }
    setSelectedClinics(prev => [...prev, clinic]);
  };

  const removeClinic = (placeId: string) => {
    setSelectedClinics(prev => prev.filter(c => c.place_id !== placeId));
  };

  const clearAll = () => {
    setSelectedClinics([]);
  };

  const isSelected = (placeId: string) => {
    return selectedClinics.some(c => c.place_id === placeId);
  };

  const canAddMore = selectedClinics.length < MAX_COMPARE_CLINICS;

  return (
    <CompareContext.Provider
      value={{
        selectedClinics,
        addClinic,
        removeClinic,
        clearAll,
        isSelected,
        canAddMore,
        maxClinics: MAX_COMPARE_CLINICS,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error('useCompare must be used within CompareProvider');
  }
  return context;
}

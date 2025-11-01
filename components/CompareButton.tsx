'use client';

import { Clinic } from '@/lib/dataTypes';
import { useCompare } from '@/contexts/CompareContext';

interface CompareButtonProps {
  clinic: Clinic;
  variant?: 'card' | 'detail';
}

export default function CompareButton({
  clinic,
  variant = 'card',
}: CompareButtonProps) {
  const {
    isSelected,
    addClinic,
    removeClinic,
    selectedClinics,
  } = useCompare();

  const selected = isSelected(clinic.place_id);
  const maxedOut =
    !selected && selectedClinics.length >= 4; // hard cap in context

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // don't trigger card navigation
    if (selected) {
      removeClinic(clinic.place_id);
    } else if (!maxedOut) {
      addClinic(clinic);
    }
  };

  // styles differ on card vs detail page
  const baseClassesCard = `
    flex-1 text-center px-3 py-2 text-sm font-medium rounded-md
    transition-colors
  `;

  const baseClassesDetail = `
    inline-flex items-center justify-center px-6 py-3 font-medium rounded-lg
    transition-colors
  `;

  const styleSelectedCard =
    'bg-yellow-100 text-yellow-800 border border-yellow-300 hover:bg-yellow-200';
  const styleUnselectedCard =
    maxedOut
      ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
      : 'bg-yellow-500 text-white hover:bg-yellow-600 shadow';

  const styleSelectedDetail =
    'bg-yellow-100 text-yellow-800 border border-yellow-300 hover:bg-yellow-200';
  const styleUnselectedDetail =
    maxedOut
      ? 'bg-gray-400 text-white cursor-not-allowed'
      : 'bg-yellow-500 text-white hover:bg-yellow-600 shadow-lg';

  const label = selected
    ? 'Added'
    : maxedOut
    ? 'Max 4 clinics'
    : 'Compare';

  const body = (
    <>
      <svg
        className="w-4 h-4 mr-2"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
        />
      </svg>
      <span>{label}</span>
    </>
  );

  if (variant === 'detail') {
    return (
      <button
        onClick={handleClick}
        disabled={maxedOut && !selected}
        className={`${baseClassesDetail} ${
          selected ? styleSelectedDetail : styleUnselectedDetail
        }`}
      >
        {body}
      </button>
    );
  }

  // variant === 'card'
  return (
    <button
      onClick={handleClick}
      disabled={maxedOut && !selected}
      className={`${baseClassesCard} ${
        selected ? styleSelectedCard : styleUnselectedCard
      }`}
    >
      {body}
    </button>
  );
}

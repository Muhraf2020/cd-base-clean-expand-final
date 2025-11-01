'use client';

import { useCompare } from '@/contexts/CompareContext';
import CompareModal from '@/components/CompareModal';

export default function CompareFloatingBar() {
  const {
    selectedClinics,
    removeClinic,
    clearAll,
    isModalOpen,
    openModal,
    closeModal,
  } = useCompare();

  // If nothing selected, don't show bar at all.
  if (selectedClinics.length === 0) {
    return null;
  }

  const canCompare = selectedClinics.length >= 2;

  return (
    <>
      {isModalOpen && <CompareModal />}

      {/* Floating Bar */}
      <div
        className="
          fixed bottom-4 left-1/2 -translate-x-1/2
          sm:left-auto sm:right-4 sm:translate-x-0
          z-[90]
          bg-white border border-gray-200 shadow-2xl rounded-xl
          w-[90%] max-w-lg sm:max-w-md
          px-4 py-3
        "
      >
        <div className="flex flex-col gap-3">
          {/* Selected clinic chips */}
          <div className="flex items-start gap-2 overflow-x-auto no-scrollbar">
            {selectedClinics.map((c) => (
              <div
                key={c.place_id}
                className="
                  flex items-center gap-2
                  bg-blue-50 text-blue-800 border border-blue-200
                  rounded-lg px-2 py-1 text-xs font-medium
                  whitespace-nowrap
                "
              >
                <span className="max-w-[120px] truncate">
                  {c.display_name}
                </span>
                <button
                  className="text-blue-600 hover:text-blue-800"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeClinic(c.place_id);
                  }}
                  aria-label={`Remove ${c.display_name} from comparison`}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* Actions row */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <button
              onClick={(e) => {
                e.stopPropagation();
                clearAll();
              }}
              className="text-xs text-gray-500 hover:text-gray-700 underline"
            >
              Clear all
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                if (canCompare) {
                  openModal();
                }
              }}
              disabled={!canCompare}
              className={`
                flex-1 sm:flex-none inline-flex items-center justify-center
                rounded-lg px-3 py-2 text-sm font-semibold shadow
                ${
                  canCompare
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                }
              `}
            >
              {canCompare ? 'Compare Now' : 'Select at least 2'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

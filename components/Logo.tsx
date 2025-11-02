// components/Logo.tsx
'use client';

import Link from 'next/link';

export default function Logo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-3 group"
      aria-label="Go to Derma Clinic Near Me home"
    >
      {/* Icon block (inspired by apple-touch-icon badge) */}
      <div
        className="
          relative
          w-11 h-11 sm:w-12 sm:h-12
          rounded-xl
          bg-gradient-to-b from-blue-600 to-blue-800
          shadow-[0_16px_30px_rgba(37,99,235,0.5)]
          flex items-center justify-center
          text-white font-semibold text-sm sm:text-base leading-none
        "
      >
        {/* Big "DC" letters */}
        <span className="tracking-wide">DC</span>

        {/* Small pin badge in the corner */}
        <div
          className="
            absolute
            -top-1.5 -right-1.5
            w-5 h-5
            rounded-full
            bg-white/20
            border border-white/60
            shadow-[0_4px_8px_rgba(0,0,0,0.5)]
            text-[10px] font-medium
            flex items-center justify-center
            leading-none text-white
          "
        >
          📍
        </div>
      </div>

      {/* Text block */}
      <div className="flex flex-col leading-tight">
        <span className="text-sm sm:text-base font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
          Derma Clinic
        </span>
        <span className="text-[11px] sm:text-xs text-gray-500 group-hover:text-blue-600 transition-colors">
          Near Me
        </span>
      </div>
    </Link>
  );
}

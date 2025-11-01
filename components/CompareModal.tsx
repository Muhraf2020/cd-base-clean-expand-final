'use client';

import { useEffect, useState } from 'react';
import { Clinic } from '@/lib/dataTypes';
import Link from 'next/link';

interface CompareModalProps {
  clinics: Clinic[];
  onClose: () => void;
}

export default function CompareModal({ clinics, onClose }: CompareModalProps) {
  const [email, setEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState('');

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Helper to get value with fallback
  const getValue = (
    clinic: Clinic,
    accessor: (c: Clinic) => any,
    fallback = 'N/A'
  ) => {
    const value = accessor(clinic);
    if (value === null || value === undefined || value === '') return fallback;
    return value;
  };

  // Helper to render yes/no/unknown for boolean values
  const renderBoolean = (value: boolean | null | undefined) => {
    if (value === true)
      return <span className="text-green-600 font-medium">✓ Yes</span>;
    if (value === false)
      return <span className="text-gray-400">✗ No</span>;
    return <span className="text-gray-400">Unknown</span>;
  };

  // Handle email sending
  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes('@')) {
      setEmailError('Please enter a valid email address');
      return;
    }

    setSendingEmail(true);
    setEmailError('');

    try {
      const response = await fetch('/api/send-comparison', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          userName: userName || undefined,
          clinics: clinics.map((c) => ({
            place_id: c.place_id,
            display_name: c.display_name,
            city: c.city,
            state_code: c.state_code,
            slug: c.slug,
            rating: c.rating,
            user_rating_count: c.user_rating_count,
            formatted_address: c.formatted_address,
            phone: c.phone,
            website: c.website,
            current_open_now: c.current_open_now,
            accessibility_options: c.accessibility_options,
            parking_options: c.parking_options,
            payment_options: c.payment_options,
            intelligence_scores: c.intelligence_scores,
            website_services: c.website_services,
            convenience_scores: (c as any).convenience_scores,
            languages_spoken: (c as any).languages_spoken,
          })),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setEmailSent(true);
        setEmail('');
        setUserName('');
      } else {
        setEmailError(
          data.error || 'Failed to send email. Please try again.'
        );
      }
    } catch (error) {
      console.error('Email send error:', error);
      setEmailError(
        'Network error. Please check your connection and try again.'
      );
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Clinic Comparison
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Comparing {clinics.length} dermatology clinics side-by-side
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition"
            title="Close comparison"
          >
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b-2 border-gray-200">
                  <th className="p-4 text-left sticky left-0 bg-gray-50 z-20 font-semibold text-gray-700">
                    Metric
                  </th>
                  {clinics.map((clinic) => (
                    <th
                      key={clinic.place_id}
                      className="p-4 text-center bg-gray-50 font-semibold text-gray-700"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Link
                          href={`/clinics/${clinic.slug}`}
                          className="text-blue-600 hover:text-blue-800 hover:underline font-semibold"
                          target="_blank"
                        >
                          {clinic.display_name}
                        </Link>
                        <div className="flex items-center gap-1 text-sm">
                          <span className="text-yellow-500">★</span>
                          <span className="font-medium">
                            {clinic.rating || 'N/A'}
                          </span>
                          {clinic.user_rating_count && (
                            <span className="text-gray-500">
                              ({clinic.user_rating_count})
                            </span>
                          )}
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* BASIC INFORMATION SECTION */}
                <tr className="bg-gray-100">
                  <td colSpan={clinics.length + 1} className="p-3">
                    <div className="font-semibold text-gray-800 text-sm uppercase tracking-wider">
                      Basic Information
                    </div>
                  </td>
                </tr>

                <tr className="border-b border-gray-100">
                  <td className="p-4 text-gray-700 sticky left-0 bg-white z-10">
                    Address
                  </td>
                  {clinics.map((clinic) => (
                    <td key={clinic.place_id} className="p-4">
                      <div className="text-sm text-gray-900">
                        {clinic.formatted_address || 'N/A'}
                      </div>
                    </td>
                  ))}
                </tr>

                <tr className="border-b border-gray-100">
                  <td className="p-4 text-gray-700 sticky left-0 bg-white z-10">
                    Phone
                  </td>
                  {clinics.map((clinic) => (
                    <td key={clinic.place_id} className="p-4">
                      {clinic.phone ? (
                        <a
                          href={`tel:${clinic.phone}`}
                          className="text-blue-600 hover:underline font-medium"
                        >
                          {clinic.phone}
                        </a>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>
                  ))}
                </tr>

                <tr className="border-b border-gray-100">
                  <td className="p-4 text-gray-700 sticky left-0 bg-white z-10">
                    Website
                  </td>
                  {clinics.map((clinic) => (
                    <td key={clinic.place_id} className="p-4">
                      {clinic.website ? (
                        <a
                          href={clinic.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm"
                        >
                          Visit Website →
                        </a>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>
                  ))}
                </tr>

                <tr className="border-b border-gray-100">
                  <td className="p-4 text-gray-700 sticky left-0 bg-white z-10">
                    Currently Open
                  </td>
                  {clinics.map((clinic) => (
                    <td key={clinic.place_id} className="p-4 text-center">
                      {renderBoolean(clinic.current_open_now)}
                    </td>
                  ))}
                </tr>

                {/* INTELLIGENCE SCORES SECTION */}
                {clinics.some((c) => c.intelligence_scores) && (
                  <>
                    <tr className="bg-gray-100">
                      <td colSpan={clinics.length + 1} className="p-3">
                        <div className="font-semibold text-gray-800 text-sm uppercase tracking-wider">
                          Intelligence Scores
                        </div>
                      </td>
                    </tr>

                    <tr className="border-b border-gray-100">
                      <td className="p-4 text-gray-700 sticky left-0 bg-white z-10">
                        Overall Score
                      </td>
                      {clinics.map((clinic) => (
                        <td
                          key={clinic.place_id}
                          className="p-4 text-center"
                        >
                          {clinic.intelligence_scores?.overall_score ? (
                            <div className="flex flex-col items-center">
                              <span className="text-2xl font-bold text-indigo-600">
                                {clinic.intelligence_scores.overall_score}
                              </span>
                              <span className="text-xs text-gray-500">
                                out of 100
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </td>
                      ))}
                    </tr>

                    <tr className="border-b border-gray-100">
                      <td className="p-4 text-gray-700 sticky left-0 bg-white z-10">
                        Trust & Credibility
                      </td>
                      {clinics.map((clinic) => (
                        <td
                          key={clinic.place_id}
                          className="p-4 text-center"
                        >
                          <span className="font-medium text-gray-900">
                            {clinic.intelligence_scores
                              ?.trust_credibility_score || 'N/A'}
                          </span>
                        </td>
                      ))}
                    </tr>

                    <tr className="border-b border-gray-100">
                      <td className="p-4 text-gray-700 sticky left-0 bg-white z-10">
                        Patient Experience
                      </td>
                      {clinics.map((clinic) => (
                        <td
                          key={clinic.place_id}
                          className="p-4 text-center"
                        >
                          <span className="font-medium text-gray-900">
                            {clinic.intelligence_scores
                              ?.patient_experience_score || 'N/A'}
                          </span>
                        </td>
                      ))}
                    </tr>

                    <tr className="border-b border-gray-100">
                      <td className="p-4 text-gray-700 sticky left-0 bg-white z-10">
                        Convenience & Accessibility
                      </td>
                      {clinics.map((clinic) => (
                        <td
                          key={clinic.place_id}
                          className="p-4 text-center"
                        >
                          <span className="font-medium text-gray-900">
                            {clinic.intelligence_scores
                              ?.convenience_accessibility_score || 'N/A'}
                          </span>
                        </td>
                      ))}
                    </tr>
                  </>
                )}

                {/* SERVICES SECTION */}
                {clinics.some(
                  (c) => c.website_services && c.website_services.length > 0
                ) && (
                  <>
                    <tr className="bg-gray-100">
                      <td colSpan={clinics.length + 1} className="p-3">
                        <div className="font-semibold text-gray-800 text-sm uppercase tracking-wider">
                          Services Offered
                        </div>
                      </td>
                    </tr>

                    <tr className="border-b border-gray-100">
                      <td className="p-4 text-gray-700 sticky left-0 bg-white z-10">
                        Available Services
                      </td>
                      {clinics.map((clinic) => (
                        <td key={clinic.place_id} className="p-4">
                          {clinic.website_services &&
                          clinic.website_services.length > 0 ? (
                            <ul className="space-y-1 text-sm">
                              {clinic.website_services
                                .slice(0, 5)
                                .map((service, idx) => (
                                  <li key={idx} className="text-gray-700">
                                    • {service}
                                  </li>
                                ))}
                              {clinic.website_services.length > 5 && (
                                <li className="text-gray-500 italic">
                                  +{clinic.website_services.length - 5} more
                                </li>
                              )}
                            </ul>
                          ) : (
                            <span className="text-gray-400">Not listed</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  </>
                )}

                {/* ACCESSIBILITY & PARKING SECTION */}
                <tr className="bg-gray-100">
                  <td colSpan={clinics.length + 1} className="p-3">
                    <div className="font-semibold text-gray-800 text-sm uppercase tracking-wider">
                      Accessibility & Parking
                    </div>
                  </td>
                </tr>

                <tr className="border-b border-gray-100">
                  <td className="p-4 text-gray-700 sticky left-0 bg-white z-10">
                    Wheelchair Accessible
                  </td>
                  {clinics.map((clinic) => (
                    <td key={clinic.place_id} className="p-4 text-center">
                      {renderBoolean(
                        clinic.accessibility_options
                          ?.wheelchair_accessible_entrance
                      )}
                    </td>
                  ))}
                </tr>

                <tr className="border-b border-gray-100">
                  <td className="p-4 text-gray-700 sticky left-0 bg-white z-10">
                    Free Parking
                  </td>
                  {clinics.map((clinic) => (
                    <td key={clinic.place_id} className="p-4 text-center">
                      {renderBoolean(
                        clinic.parking_options?.free_parking_lot
                      )}
                    </td>
                  ))}
                </tr>

                <tr className="border-b border-gray-100">
                  <td className="p-4 text-gray-700 sticky left-0 bg-white z-10">
                    Paid Parking
                  </td>
                  {clinics.map((clinic) => (
                    <td key={clinic.place_id} className="p-4 text-center">
                      {renderBoolean(
                        clinic.parking_options?.paid_parking_lot
                      )}
                    </td>
                  ))}
                </tr>

                {/* PAYMENT OPTIONS SECTION */}
                <tr className="bg-gray-100">
                  <td colSpan={clinics.length + 1} className="p-3">
                    <div className="font-semibold text-gray-800 text-sm uppercase tracking-wider">
                      Payment Options
                    </div>
                  </td>
                </tr>

                <tr className="border-b border-gray-100">
                  <td className="p-4 text-gray-700 sticky left-0 bg-white z-10">
                    Accepts Credit Cards
                  </td>
                  {clinics.map((clinic) => (
                    <td key={clinic.place_id} className="p-4 text-center">
                      {renderBoolean(
                        clinic.payment_options?.accepts_credit_cards
                      )}
                    </td>
                  ))}
                </tr>

                <tr className="border-b border-gray-100">
                  <td className="p-4 text-gray-700 sticky left-0 bg-white z-10">
                    Cash Only
                  </td>
                  {clinics.map((clinic) => (
                    <td key={clinic.place_id} className="p-4 text-center">
                      {renderBoolean(
                        clinic.payment_options?.accepts_cash_only
                      )}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer with Email Form */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          {emailSent ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <svg
                className="w-12 h-12 text-green-600 mx-auto mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-green-800 font-semibold">
                Email sent successfully!
              </p>
              <p className="text-green-700 text-sm mt-1">
                Check your inbox for the detailed comparison report.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSendEmail} className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  📧 Email This Comparison
                </h3>
                <p className="text-sm text-gray-600">
                  Get a detailed PDF comparison sent to your inbox
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setEmailError('');
                    }}
                    required
                    placeholder="your.email@example.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label
                    htmlFor="userName"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Your Name (Optional)
                  </label>
                  <input
                    type="text"
                    id="userName"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {emailError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                  <svg
                    className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-sm text-red-800">{emailError}</p>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <p className="text-sm text-gray-600">
                  We'll send you a detailed PDF comparison report
                </p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-2 text-gray-700 hover:text-gray-900 font-medium transition"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={sendingEmail}
                    className={`
                      px-6 py-2 rounded-lg font-semibold transition-all flex items-center gap-2
                      ${
                        sendingEmail
                          ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }
                    `}
                  >
                    {sendingEmail ? (
                      <>
                        <svg
                          className="animate-spin h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Sending...
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                        Send Comparison
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Clinic } from '@/lib/dataTypes';
import { ComparisonDisplay } from '@/components/ComparisonDisplay';

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

        {/* Body: scrollable comparison table */}
        <div className="flex-1 overflow-auto p-6">
          <ComparisonDisplay clinics={clinics} />
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
                    className={`px-6 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                      sendingEmail
                        ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
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

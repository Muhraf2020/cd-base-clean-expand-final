'use client';

import { useState } from 'react';
import { useCompare } from '@/contexts/CompareContext';
import { X, Mail, Check, AlertCircle } from 'lucide-react';

export default function CompareModal() {
  const { selectedClinics, removeClinic, clearAll, isOpen, closeModal } = useCompare();
  
  // Email form state
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendStatus, setSendStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  if (!isOpen || selectedClinics.length === 0) return null;

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !email.trim()) {
      setSendStatus({
        type: 'error',
        message: 'Please enter both your name and email address',
      });
      return;
    }

    setIsSending(true);
    setSendStatus({ type: null, message: '' });

    try {
      const response = await fetch('/api/send-comparison', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          clinics: selectedClinics,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSendStatus({
          type: 'success',
          message: `✓ Comparison report sent to ${email}! Check your inbox.`,
        });
        
        // Clear form after 3 seconds and close email form
        setTimeout(() => {
          setName('');
          setEmail('');
          setShowEmailForm(false);
          setSendStatus({ type: null, message: '' });
        }, 3000);
      } else {
        setSendStatus({
          type: 'error',
          message: data.error || 'Failed to send email. Please try again.',
        });
      }
    } catch (error) {
      setSendStatus({
        type: 'error',
        message: 'Network error. Please check your connection and try again.',
      });
    } finally {
      setIsSending(false);
    }
  };

  // Calculate max values for each metric
  const maxValues = {
    rating: Math.max(...selectedClinics.map(c => c.overallRating || c.googleRating || 0)),
    reviews: Math.max(...selectedClinics.map(c => c.reviewCount || 0)),
    quality: Math.max(...selectedClinics.map(c => c.qualityScore || 0)),
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-6xl max-h-[90vh] bg-white rounded-lg shadow-xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-600 to-blue-700">
          <div>
            <h2 className="text-2xl font-bold text-white">
              Compare Clinics
            </h2>
            <p className="text-blue-100 text-sm mt-1">
              {selectedClinics.length} {selectedClinics.length === 1 ? 'clinic' : 'clinics'} selected
            </p>
          </div>
          <button
            onClick={closeModal}
            className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6">
          
          {/* Action Buttons */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={() => setShowEmailForm(!showEmailForm)}
              disabled={isSending}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg 
                       hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 
                       disabled:cursor-not-allowed"
            >
              <Mail className="w-4 h-4" />
              {showEmailForm ? 'Hide Email Form' : 'Email This Report'}
            </button>
            
            <button
              onClick={clearAll}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg 
                       hover:bg-gray-50 transition-colors font-medium"
            >
              Clear All
            </button>
          </div>

          {/* Email Form */}
          {showEmailForm && (
            <div className="mb-6 p-6 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-600" />
                Send Comparison Report to Your Email
              </h3>
              
              <form onSubmit={handleSendEmail} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    required
                    disabled={isSending}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 
                             focus:ring-blue-500 focus:border-transparent disabled:opacity-50 
                             disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Your Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                    required
                    disabled={isSending}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 
                             focus:ring-blue-500 focus:border-transparent disabled:opacity-50 
                             disabled:bg-gray-100"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSending}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                           transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed 
                           flex items-center justify-center gap-2"
                >
                  {isSending ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="w-5 h-5" />
                      Send Report
                    </>
                  )}
                </button>
              </form>

              {/* Status Messages */}
              {sendStatus.type && (
                <div className={`mt-4 p-4 rounded-lg flex items-start gap-3 ${
                  sendStatus.type === 'success' 
                    ? 'bg-green-50 border border-green-200 text-green-800' 
                    : 'bg-red-50 border border-red-200 text-red-800'
                }`}>
                  {sendStatus.type === 'success' ? (
                    <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  )}
                  <p className="text-sm font-medium">{sendStatus.message}</p>
                </div>
              )}
            </div>
          )}

          {/* Comparison Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left p-4 font-semibold text-gray-900 border-b-2 border-gray-200 sticky left-0 bg-gray-50 z-10">
                    Clinic
                  </th>
                  {selectedClinics.map((clinic) => (
                    <th key={clinic.id} className="p-4 border-b-2 border-gray-200 min-w-[250px]">
                      <div className="flex flex-col items-center gap-2">
                        <span className="font-semibold text-gray-900 text-center">
                          {clinic.name}
                        </span>
                        <button
                          onClick={() => removeClinic(clinic.id)}
                          className="text-red-600 hover:text-red-700 text-sm flex items-center gap-1"
                        >
                          <X className="w-4 h-4" />
                          Remove
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              
              <tbody>
                {/* Rating Row */}
                <tr className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-700 sticky left-0 bg-white">
                    Rating
                  </td>
                  {selectedClinics.map((clinic) => {
                    const rating = clinic.overallRating || clinic.googleRating || 0;
                    const isMax = rating === maxValues.rating;
                    return (
                      <td key={clinic.id} className={`p-4 text-center ${isMax ? 'bg-green-50' : ''}`}>
                        <div className="flex flex-col items-center gap-1">
                          <div className="flex items-center gap-1 text-yellow-500">
                            {[...Array(5)].map((_, i) => (
                              <span key={i}>
                                {i < Math.round(rating) ? '★' : '☆'}
                              </span>
                            ))}
                          </div>
                          <span className="text-sm font-semibold text-gray-900">
                            {rating.toFixed(1)}
                          </span>
                          {isMax && <span className="text-xs text-green-700 font-medium">Highest</span>}
                        </div>
                      </td>
                    );
                  })}
                </tr>

                {/* Reviews Row */}
                <tr className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-700 sticky left-0 bg-white">
                    Reviews
                  </td>
                  {selectedClinics.map((clinic) => {
                    const reviews = clinic.reviewCount || 0;
                    const isMax = reviews === maxValues.reviews;
                    return (
                      <td key={clinic.id} className={`p-4 text-center ${isMax ? 'bg-green-50' : ''}`}>
                        <div className="flex flex-col items-center gap-1">
                          <span className="font-semibold text-gray-900">{reviews}</span>
                          {isMax && <span className="text-xs text-green-700 font-medium">Most</span>}
                        </div>
                      </td>
                    );
                  })}
                </tr>

                {/* Address Row */}
                <tr className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-700 sticky left-0 bg-white">
                    Address
                  </td>
                  {selectedClinics.map((clinic) => (
                    <td key={clinic.id} className="p-4 text-center">
                      <span className="text-sm text-gray-600">
                        {clinic.address || 'N/A'}
                      </span>
                    </td>
                  ))}
                </tr>

                {/* Phone Row */}
                <tr className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-700 sticky left-0 bg-white">
                    Phone
                  </td>
                  {selectedClinics.map((clinic) => (
                    <td key={clinic.id} className="p-4 text-center">
                      <span className="text-sm text-gray-600">
                        {clinic.phone || 'N/A'}
                      </span>
                    </td>
                  ))}
                </tr>

                {/* Quality Score Row */}
                <tr className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-700 sticky left-0 bg-white">
                    Quality Score
                  </td>
                  {selectedClinics.map((clinic) => {
                    const quality = clinic.qualityScore || 0;
                    const isMax = quality === maxValues.quality;
                    return (
                      <td key={clinic.id} className={`p-4 ${isMax ? 'bg-green-50' : ''}`}>
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full"
                              style={{ width: `${quality}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-semibold text-gray-900">{quality}%</span>
                          {isMax && <span className="text-xs text-green-700 font-medium">Highest</span>}
                        </div>
                      </td>
                    );
                  })}
                </tr>

                {/* Services Row */}
                <tr className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-700 sticky left-0 bg-white">
                    Services
                  </td>
                  {selectedClinics.map((clinic) => (
                    <td key={clinic.id} className="p-4">
                      <div className="flex flex-wrap gap-1 justify-center">
                        {clinic.services && clinic.services.length > 0 ? (
                          clinic.services.slice(0, 3).map((service: string, idx: number) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                            >
                              {service}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-gray-400">None listed</span>
                        )}
                        {clinic.services && clinic.services.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{clinic.services.length - 3} more
                          </span>
                        )}
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50">
          <p className="text-sm text-gray-600 text-center">
            Compare up to 4 clinics at once. Click "Email This Report" to receive a detailed comparison in your inbox.
          </p>
        </div>
      </div>
    </div>
  );
}

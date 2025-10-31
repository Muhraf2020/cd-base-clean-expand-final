'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function AdvertisePage() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleCheckout = async (priceId: string, packageName: string) => {
  setLoading(packageName);
  try {
    const res = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceId, packageName }),
    });

    const ct = res.headers.get('content-type') || '';
    const data = ct.includes('application/json') ? await res.json() : null;

    if (!res.ok) {
      const msg = data?.error || `Checkout failed (HTTP ${res.status})`;
      throw new Error(msg);
    }

    if (data?.url) {
      window.location.href = data.url; // redirect to Stripe Checkout
      return;
    }

    throw new Error('Server did not return a checkout URL.');
  } catch (err: any) {
    console.error('Checkout error:', err);
    alert(err?.message ?? 'Payment error. Please try again.');
  } finally {
    setLoading(null);
  }
};


  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link 
            href="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Advertise With Us</h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
            Reach thousands of patients actively searching for dermatology services. Boost your visibility and grow your practice with our premium advertising solutions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="#packages"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-all shadow-lg"
            >
              View Packages
            </a>
            <a 
              href="#contact"
              className="inline-flex items-center justify-center px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-600 transition-all"
            >
              Contact Us
            </a>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-4 gap-8 text-center">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="text-4xl font-bold text-blue-600 mb-2">5K+</div>
            <div className="text-gray-600">Monthly Visitors</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="text-4xl font-bold text-blue-600 mb-2">10K+</div>
            <div className="text-gray-600">Clinic Listings</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="text-4xl font-bold text-blue-600 mb-2">All 50</div>
            <div className="text-gray-600">States Covered</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="text-4xl font-bold text-blue-600 mb-2">95%</div>
            <div className="text-gray-600">Satisfaction Rate</div>
          </div>
        </div>
      </div>

      {/* Why Advertise Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Why Advertise With Us?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Targeted Audience</h3>
              <p className="text-gray-600">Reach patients actively searching for dermatology services in their area</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Increased Visibility</h3>
              <p className="text-gray-600">Stand out from competitors with premium placement and enhanced listings</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Build Trust</h3>
              <p className="text-gray-600">Enhanced profiles with photos, reviews, and detailed information</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Packages */}
      <div id="packages" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Advertising Packages</h2>
        <p className="text-center text-gray-600 mb-12 text-lg">Choose the perfect plan to grow your practice</p>
        
        <div className="grid md:grid-cols-3 gap-8">
          {/* Basic Package */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-gray-200 hover:border-blue-500 transition-all">
            <h3 className="text-2xl font-bold mb-2">Basic</h3>
            <div className="text-4xl font-bold text-blue-600 mb-6">
              $29<span className="text-lg text-gray-600">/month</span>
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Standard directory listing</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Contact information displayed</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Business hours shown</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Location on map</span>
              </li>
            </ul>
            <button
              onClick={() => handleCheckout('price_basic_monthly', 'Basic')}
              disabled={loading === 'Basic'}
              className="block w-full text-center bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition disabled:opacity-50"
            >
              {loading === 'Basic' ? 'Processing...' : 'Get Started'}
            </button>
          </div>

          {/* Premium Package - Featured */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-2xl p-8 text-white transform scale-105 relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-gray-900 px-4 py-1 rounded-full text-sm font-bold">
              MOST POPULAR
            </div>
            <h3 className="text-2xl font-bold mb-2">Premium</h3>
            <div className="text-4xl font-bold mb-6">
              $49<span className="text-lg text-blue-100">/month</span>
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-300 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Everything in Basic</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-300 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span><strong>Featured listing</strong> (top of search)</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-300 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Up to 10 clinic photos</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-300 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Highlighted badge</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-300 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Monthly performance report</span>
              </li>
            </ul>
            <button
              onClick={() => handleCheckout('price_premium_monthly', 'Premium')}
              disabled={loading === 'Premium'}
              className="block w-full text-center bg-white text-blue-600 py-3 rounded-lg font-semibold hover:bg-blue-50 transition disabled:opacity-50"
            >
              {loading === 'Premium' ? 'Processing...' : 'Get Started'}
            </button>
          </div>

          {/* Enterprise Package */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-gray-200 hover:border-blue-500 transition-all">
            <h3 className="text-2xl font-bold mb-2">Enterprise</h3>
            <div className="text-4xl font-bold text-blue-600 mb-6">
              $99<span className="text-lg text-gray-600">/month</span>
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Everything in Premium</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span><strong>Homepage banner</strong> placement</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Unlimited photos & videos</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Detailed Physician profiles & credentials</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Speciality tags & technology</span>
              </li>
            </ul>
            <button
              onClick={() => handleCheckout('price_enterprise_monthly', 'Enterprise')}
              disabled={loading === 'Enterprise'}
              className="block w-full text-center bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading === 'Enterprise' ? 'Processing...' : 'Get Started'}
            </button>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div id="contact" className="bg-gradient-to-r from-gray-50 to-blue-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <h2 className="text-3xl font-bold text-center mb-4">Need Custom Solutions?</h2>
            <p className="text-center text-gray-600 mb-8">Contact us to discuss enterprise options or custom packages</p>
            
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="flex items-start space-x-4">
                <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Email Us</h3>
                  <p className="text-gray-600">info@dermaclinicnearme.com</p>
                  <p className="text-sm text-gray-500">We'll respond within 24 hours</p>
                </div>
              </div>
            </div>

            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}

function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    clinicName: '',
    phone: '',
    package: '',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setStatus('success');
        setFormData({ name: '', email: '', clinicName: '', phone: '', package: '', message: '' });
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
    }
  };

  return (
    <>
      {status === 'success' && (
        <div className="mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-lg">
          <p className="text-green-800 font-medium">✓ Message sent! We'll contact you within 24 hours.</p>
        </div>
      )}

      {status === 'error' && (
        <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
          <p className="text-red-800 font-medium">Failed to send message. Please try again.</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <input 
            type="text" 
            placeholder="Your Name" 
            required
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <input 
            type="email" 
            placeholder="Email Address" 
            required
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <input 
          type="text" 
          placeholder="Clinic Name" 
          required
          value={formData.clinicName}
          onChange={(e) => setFormData({...formData, clinicName: e.target.value})}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <input 
          type="tel" 
          placeholder="Phone Number"
          value={formData.phone}
          onChange={(e) => setFormData({...formData, phone: e.target.value})}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <select 
          value={formData.package}
          onChange={(e) => setFormData({...formData, package: e.target.value})}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Select Package (Optional)</option>
          <option value="basic">Basic - $29/month</option>
          <option value="premium">Premium - $49/month</option>
          <option value="enterprise">Enterprise - $99/month</option>
          <option value="custom">Custom Package</option>
        </select>
        <textarea 
          placeholder="Tell us about your needs..." 
          rows={4}
          value={formData.message}
          onChange={(e) => setFormData({...formData, message: e.target.value})}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        ></textarea>
        <button 
          type="submit"
          disabled={status === 'submitting'}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-4 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-indigo-800 transition-all shadow-lg disabled:opacity-50"
        >
          {status === 'submitting' ? 'Sending...' : 'Send Message'}
        </button>
      </form>
    </>
  );
}

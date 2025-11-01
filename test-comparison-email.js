#!/usr/bin/env node
/**
 * Test Script for Clinic Comparison Email Feature
 * 
 * This script tests the email sending functionality by:
 * 1. Creating mock clinic data
 * 2. Sending a test email to your address
 * 3. Reporting success or errors
 * 
 * Usage:
 *   node test-comparison-email.js your-email@example.com
 *   or
 *   npm run test:email your-email@example.com
 */

const testEmail = process.argv[2];

if (!testEmail) {
  console.error('❌ Error: Please provide an email address');
  console.log('Usage: node test-comparison-email.js your-email@example.com');
  process.exit(1);
}

// Mock clinic data for testing
const mockClinics = [
  {
    place_id: 'test_clinic_1',
    display_name: 'Premier Dermatology Center',
    slug: 'premier-dermatology-center',
    rating: 4.9,
    user_ratings_total: 328,
    phone: '(555) 123-4567',
    website: 'https://premierdermatology.example.com',
    address: '123 Medical Plaza Dr, Suite 200, San Francisco, CA 94102',
    quality_score: 92.5,
    walk_score: 88,
    parking_available: true,
    wheelchair_accessible: true,
    services: [
      'Acne Treatment',
      'Botox & Fillers',
      'Skin Cancer Screening',
      'Laser Hair Removal',
      'Chemical Peels',
      'Mohs Surgery',
      'Cosmetic Dermatology',
      'Medical Dermatology'
    ],
    languages: ['English', 'Spanish', 'Mandarin'],
    quality_metrics: {
      credentials_score: 19,
      patient_reviews_score: 29,
      digital_presence_score: 20,
      service_diversity_score: 14,
      accessibility_score: 15
    }
  },
  {
    place_id: 'test_clinic_2',
    display_name: 'City Skin Specialists',
    slug: 'city-skin-specialists',
    rating: 4.7,
    user_ratings_total: 215,
    phone: '(555) 234-5678',
    website: 'https://cityskinspecialists.example.com',
    address: '456 Downtown Ave, Floor 3, San Francisco, CA 94103',
    quality_score: 85.0,
    walk_score: 95,
    parking_available: false,
    wheelchair_accessible: true,
    services: [
      'General Dermatology',
      'Acne Treatment',
      'Eczema Treatment',
      'Psoriasis Care',
      'Skin Biopsies',
      'Wart Removal'
    ],
    languages: ['English', 'French'],
    quality_metrics: {
      credentials_score: 17,
      patient_reviews_score: 27,
      digital_presence_score: 18,
      service_diversity_score: 11,
      accessibility_score: 14
    }
  },
  {
    place_id: 'test_clinic_3',
    display_name: 'Advanced Skin Care Clinic',
    slug: 'advanced-skin-care-clinic',
    rating: 4.8,
    user_ratings_total: 189,
    phone: '(555) 345-6789',
    website: 'https://advancedskincare.example.com',
    address: '789 Health Center Blvd, San Francisco, CA 94104',
    quality_score: 88.5,
    walk_score: 72,
    parking_available: true,
    wheelchair_accessible: true,
    services: [
      'Medical Dermatology',
      'Cosmetic Procedures',
      'Laser Treatments',
      'Skin Cancer Surgery',
      'Anti-Aging Treatments',
      'Scar Revision'
    ],
    languages: ['English', 'Spanish', 'Korean'],
    quality_metrics: {
      credentials_score: 18,
      patient_reviews_score: 28,
      digital_presence_score: 19,
      service_diversity_score: 12,
      accessibility_score: 13
    }
  }
];

async function runTest() {
  console.log('🧪 Testing Clinic Comparison Email Feature\n');
  console.log('=' .repeat(60));
  console.log(`📧 Recipient: ${testEmail}`);
  console.log(`🏥 Test Clinics: ${mockClinics.length}`);
  console.log('=' .repeat(60));
  console.log('');

  try {
    console.log('📤 Sending test email...\n');

    const response = await fetch('http://localhost:3000/api/send-comparison', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testEmail,
        clinics: mockClinics,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ SUCCESS! Email sent successfully\n');
      console.log('Response Details:');
      console.log('  Status:', response.status);
      console.log('  Message:', data.message);
      if (data.emailId) {
        console.log('  Email ID:', data.emailId);
      }
      console.log('');
      console.log('📬 Check your inbox at:', testEmail);
      console.log('   (Don\'t forget to check spam/junk folder!)');
      console.log('');
      console.log('Email Preview:');
      console.log('  Subject: Dermatology Clinic Comparison Report - 3 Clinics');
      console.log('  From: Derm Clinics Near Me <noreply@dermaclinicnearme.com>');
      console.log('  Contains: Side-by-side comparison of all 3 clinics');
      console.log('');
    } else {
      console.log('❌ FAILED! Email could not be sent\n');
      console.log('Error Details:');
      console.log('  Status:', response.status);
      console.log('  Error:', data.error || 'Unknown error');
      console.log('');
      console.log('Troubleshooting Steps:');
      console.log('  1. Check that RESEND_API_KEY is set in .env.local');
      console.log('  2. Verify your domain in Resend dashboard');
      console.log('  3. Ensure the API route exists at app/api/send-comparison/route.ts');
      console.log('  4. Check server logs for detailed error messages');
      console.log('');
      process.exit(1);
    }
  } catch (error) {
    console.log('❌ NETWORK ERROR\n');
    console.log('Error:', error.message);
    console.log('');
    console.log('Troubleshooting Steps:');
    console.log('  1. Ensure your dev server is running (npm run dev)');
    console.log('  2. Check that the server is accessible at http://localhost:3000');
    console.log('  3. Verify the API route is properly deployed');
    console.log('  4. Check your network connection');
    console.log('');
    process.exit(1);
  }
}

// Validation
if (!testEmail.includes('@')) {
  console.error('❌ Invalid email format');
  console.log('Please provide a valid email address with an @ symbol');
  process.exit(1);
}

// Run the test
console.log('');
runTest();

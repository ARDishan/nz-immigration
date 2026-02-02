import React, { useState } from 'react';
import { HelpCircle, Loader2, CheckCircle, XCircle } from 'lucide-react';
import NationalityDropdown from './components/NationalityDropdown';
import Header from './components/Header';
import Footer from './components/Footer';

// Supabase Configuration
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export default function NZETAStatusCheck() {
  const [hasReference, setHasReference] = useState(null);
  const [loading, setLoading] = useState(false);
  const [applicationData, setApplicationData] = useState(null);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    referenceNumber: '',
    passportNumber: '',
    nationality: '',
    passportExpiry: '',
    dateOfBirth: ''
  });

  const handleReferenceChange = (value) => {
    setHasReference(value);
    setApplicationData(null);
    setError('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setApplicationData(null);

    try {
      let url = '';

      if (hasReference === true) {
        // Search by reference number and passport number
        url = `${SUPABASE_URL}/rest/v1/nzeta_applications?application_number=eq.${formData.referenceNumber}&passport_number=eq.${formData.passportNumber}&select=*`;
      } else {
        // Search by passport number, nationality, passport expiry, and date of birth
        url = `${SUPABASE_URL}/rest/v1/nzeta_applications?passport_number=eq.${formData.passportNumber}&nationality=eq.${formData.nationality}&date_of_birth=eq.${formData.dateOfBirth}&select=*`;
      }

      const response = await fetch(url, {
        headers: {
          'apikey': SUPABASE_PUBLISHABLE_KEY,
          'Authorization': `Bearer ${SUPABASE_PUBLISHABLE_KEY}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error('Failed to fetch application details');
      }

      if (!data || data.length === 0) {
        setError('No application found with the provided details. Please check your information and try again.');
      } else {
        setApplicationData(data[0]);
      }
    } catch (err) {
      console.error('Error fetching application:', err);
      setError('An error occurred while searching. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetSearch = () => {
    setApplicationData(null);
    setError('');
    setFormData({
      referenceNumber: '',
      passportNumber: '',
      nationality: '',
      passportExpiry: '',
      dateOfBirth: ''
    });
    setHasReference(null);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-1 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 py-12">
          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-4xl font-light text-gray-800 mb-3">Check your NZeTA status</h1>
            <div className="flex items-start gap-2">
              <div className="w-1 h-6 bg-cyan-400 flex-shrink-0"></div>
              <p className="text-gray-600 italic">Use this form to check the status of your NZeTA.</p>
            </div>
          </div>

          {/* Show Results if application found */}
          {applicationData ? (
            <div className="bg-white rounded-lg border-2 border-green-500 p-8 mb-8">
              <div className="flex items-center gap-3 mb-6">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <h2 className="text-2xl font-bold text-gray-900">Application Found</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded">
                  <p className="text-sm font-medium text-gray-500 mb-1">Application Number</p>
                  <p className="text-lg font-bold text-gray-900">{applicationData.application_number}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded">
                  <p className="text-sm font-medium text-gray-500 mb-1">Client Number</p>
                  <p className="text-lg font-bold text-gray-900">{applicationData.client_number}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded">
                  <p className="text-sm font-medium text-gray-500 mb-1">Full Name</p>
                  <p className="text-lg font-bold text-gray-900">{applicationData.name}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded">
                  <p className="text-sm font-medium text-gray-500 mb-1">Gender</p>
                  <p className="text-lg font-bold text-gray-900">{applicationData.gender}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded">
                  <p className="text-sm font-medium text-gray-500 mb-1">Nationality</p>
                  <p className="text-lg font-bold text-gray-900">{applicationData.nationality}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded">
                  <p className="text-sm font-medium text-gray-500 mb-1">Date of Birth</p>
                  <p className="text-lg font-bold text-gray-900">{new Date(applicationData.date_of_birth).toLocaleDateString('en-NZ', { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded">
                  <p className="text-sm font-medium text-gray-500 mb-1">Passport Number</p>
                  <p className="text-lg font-bold text-gray-900">{applicationData.passport_number}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded">
                  <p className="text-sm font-medium text-gray-500 mb-1">Status</p>
                  <p className="text-lg font-bold text-gray-900">{applicationData.status}</p>
                </div>
              </div>

              <div className="mt-8 text-center">
                <button
                  onClick={resetSearch}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-medium px-8 py-3 transition-colors"
                >
                  New Search
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Required Field Notice */}
              <div className="text-right mb-6">
                <span className="text-red-600 text-sm">* Required field</span>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border-2 border-red-500 rounded p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-bold text-red-900 mb-1">Application Not Found</h3>
                      <p className="text-red-800">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Form Card */}
              <div className="bg-gray-100 rounded p-8 mb-8">
                {/* Reference Number Question */}
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <label className="text-gray-900 font-bold">
                      Do you have an NZeTA reference number? <span className="text-red-600">*</span>
                    </label>
                    <button className="text-cyan-500 hover:text-cyan-600">
                      <HelpCircle className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="hasReference"
                        checked={hasReference === false}
                        onChange={() => handleReferenceChange(false)}
                        className="w-4 h-4"
                        disabled={loading}
                      />
                      <span className="text-gray-900 font-bold">No</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="hasReference"
                        checked={hasReference === true}
                        onChange={() => handleReferenceChange(true)}
                        className="w-4 h-4"
                        disabled={loading}
                      />
                      <span className="text-gray-900 font-bold">Yes</span>
                    </label>
                  </div>
                </div>

                {/* Conditional Form Fields - With Reference */}
                {hasReference === true && (
                  <div className="space-y-6 animate-fadeIn">
                    <div>
                      <label className="block text-gray-900 font-bold mb-2">
                        Enter your NZeTA reference number <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        name="referenceNumber"
                        value={formData.referenceNumber}
                        onChange={handleChange}
                        className="w-full bg-white px-4 py-2 border border-gray-400 font-bold focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300"
                        placeholder=""
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <label className="block text-gray-900 font-bold mb-2">
                        Enter your passport number exactly as it appears on your passport <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        name="passportNumber"
                        value={formData.passportNumber}
                        onChange={handleChange}
                        className="w-full bg-white px-4 py-2 border border-gray-400 font-bold focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300"
                        placeholder=""
                        disabled={loading}
                      />
                    </div>

                    <NationalityDropdown formData={formData} setFormData={setFormData} disabled={loading} />
                  </div>
                )}

                {/* Conditional Form Fields - Without Reference */}
                {hasReference === false && (
                  <div className="space-y-6 animate-fadeIn">
                    <div>
                      <label className="block text-gray-900 font-bold mb-2">
                        Enter your passport number exactly as it appears on your passport <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        name="passportNumber"
                        value={formData.passportNumber}
                        onChange={handleChange}
                        className="w-full bg-white px-4 py-2 border border-gray-400 font-bold focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300"
                        placeholder=""
                        disabled={loading}
                      />
                    </div>

                    <div>
                      <label className="block text-gray-900 font-bold mb-2">
                        Select your nationality as shown on the passport you will be travelling on <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        name="nationality"
                        value={formData.nationality}
                        onChange={handleChange}
                        className="w-full bg-white px-4 py-2 border border-gray-400 font-bold focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300"
                        placeholder=""
                        disabled={loading}
                      />
                    </div>

                    <div>
                      <label className="block text-gray-900 font-bold mb-2">
                        Select your date of birth as shown on your passport <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                        className="w-full bg-white px-4 py-2 border border-gray-400 font-bold focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300"
                        placeholder=""
                        disabled={loading}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              {hasReference !== null && (
                <div className="mt-8 text-center">
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="bg-red-600 hover:bg-red-700 text-white font-medium px-8 py-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mx-auto"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Searching...
                      </>
                    ) : (
                      'Search'
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
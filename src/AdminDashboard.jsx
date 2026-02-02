import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Eye, LogOut, Search, X, Loader2 } from 'lucide-react';

// Supabase Configuration
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Simple Supabase client
const supabase = {
  from: (table) => ({
    select: async (columns = '*') => {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=${columns}`, {
        headers: {
          'apikey': SUPABASE_PUBLISHABLE_KEY,
          'Authorization': `Bearer ${SUPABASE_PUBLISHABLE_KEY}`
        }
      });
      const data = await response.json();
      return { data, error: response.ok ? null : data };
    },
    insert: async (values) => {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_PUBLISHABLE_KEY,
          'Authorization': `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(values)
      });
      const data = await response.json();
      return { data, error: response.ok ? null : data };
    },
    update: (values) => ({
      eq: async (column, value) => {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${column}=eq.${value}`, {
          method: 'PATCH',
          headers: {
            'apikey': SUPABASE_PUBLISHABLE_KEY,
            'Authorization': `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify(values)
        });
        const data = await response.json();
        return { data, error: response.ok ? null : data };
      }
    }),
    delete: () => ({
      eq: async (column, value) => {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${column}=eq.${value}`, {
          method: 'DELETE',
          headers: {
            'apikey': SUPABASE_PUBLISHABLE_KEY,
            'Authorization': `Bearer ${SUPABASE_PUBLISHABLE_KEY}`
          }
        });
        return { error: response.ok ? null : await response.json() };
      }
    })
  })
};

export default function NZeTAAdminPanel() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [applications, setApplications] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('');
  const [selectedApp, setSelectedApp] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    application_number: '',
    client_number: '',
    name: '',
    gender: 'Male',
    nationality: '',
    date_of_birth: '',
    passport_number: '',
    status: 'Pending'
  });

  // Fetch applications from Supabase
  const fetchApplications = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('nzeta_applications').select('*');
      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
      alert('Error loading applications. Please check console for details.');
    } finally {
      setLoading(false);
    }
  };

  // Load applications when logged in
  useEffect(() => {
    if (isLoggedIn) {
      fetchApplications();
    }
  }, [isLoggedIn]);

  // Login handler
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/admin_users?username=eq.${loginData.username}&password=eq.${loginData.password}&select=*`,
        {
          headers: {
            'apikey': SUPABASE_PUBLISHABLE_KEY,
            'Authorization': `Bearer ${SUPABASE_PUBLISHABLE_KEY}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok || !data || data.length === 0) {
        alert('Invalid credentials! Please check your username and password.');
        setLoading(false);
        return;
      }

      setIsLoggedIn(true);
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setLoginData({ username: '', password: '' });
    setApplications([]);
  };

  // CRUD Operations
  const openCreateModal = () => {
    setModalMode('create');
    setFormData({
      application_number: '',
      client_number: '',
      name: '',
      gender: 'Male',
      nationality: '',
      date_of_birth: '',
      passport_number: '',
      status: 'Pending'
    });
    setShowModal(true);
  };

  const openEditModal = (app) => {
    setModalMode('edit');
    setSelectedApp(app);
    setFormData({
      application_number: app.application_number,
      client_number: app.client_number,
      name: app.name,
      gender: app.gender,
      nationality: app.nationality,
      date_of_birth: app.date_of_birth,
      passport_number: app.passport_number,
      status: app.status || 'Pending'
    });
    setShowModal(true);
  };

  const openViewModal = (app) => {
    setModalMode('view');
    setSelectedApp(app);
    setShowModal(true);
  };

  const handleCreate = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('nzeta_applications')
        .insert([formData]);

      if (error) throw error;

      alert('Application created successfully!');
      setShowModal(false);
      await fetchApplications(); // Refresh the list
    } catch (error) {
      console.error('Error creating application:', error);
      alert('Error creating application: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('nzeta_applications')
        .update(formData)
        .eq('id', selectedApp.id);

      if (error) throw error;

      alert('Application updated successfully!');
      setShowModal(false);
      await fetchApplications(); // Refresh the list
    } catch (error) {
      console.error('Error updating application:', error);
      alert('Error updating application: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this application?')) {
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('nzeta_applications')
        .delete()
        .eq('id', id);

      if (error) throw error;

      alert('Application deleted successfully!');
      await fetchApplications(); // Refresh the list
    } catch (error) {
      console.error('Error deleting application:', error);
      alert('Error deleting application: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredApplications = applications.filter(app =>
    app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.application_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.passport_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Login Page
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl w-full max-w-md p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-black rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-2xl">NZ</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Login</h1>
            <p className="text-gray-600 mt-2">NZeTA Management System</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                value={loginData.username}
                onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter username"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter password"
                disabled={loading}
              />
            </div>

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Logging in...
                </>
              ) : (
                'Login'
              )}
            </button>


          </div>
        </div>
      </div>
    );
  }

  // Admin Dashboard
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">NZ</span>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">NZeTA Admin Panel</h1>
                <p className="text-sm text-gray-600">Application Management</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-6">
          <div className="flex-1 w-full sm:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, application number, or passport..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <button
            onClick={openCreateModal}
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            <Plus className="w-5 h-5" />
            New Application
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-gray-600 text-sm">Total Applications</p>
            <p className="text-2xl font-bold text-gray-900">{applications.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-gray-600 text-sm">Search Results</p>
            <p className="text-2xl font-bold text-gray-900">{filteredApplications.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-gray-600 text-sm">Nationalities</p>
            <p className="text-2xl font-bold text-gray-900">
              {new Set(applications.map(a => a.nationality)).size}
            </p>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        )}

        {/* Table */}
        {!loading && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Application No.
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nationality
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Passport
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredApplications.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                        No applications found
                      </td>
                    </tr>
                  ) : (
                    filteredApplications.map((app) => (
                      <tr key={app.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {app.application_number}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {app.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {app.nationality}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {app.passport_number}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex gap-2">
                            <button
                              onClick={() => openViewModal(app)}
                              className="text-blue-600 hover:text-blue-800 p-1"
                              title="View"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => openEditModal(app)}
                              className="text-green-600 hover:text-green-800 p-1"
                              title="Edit"
                            >
                              <Edit2 className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(app.id)}
                              className="text-red-600 hover:text-red-800 p-1"
                              title="Delete"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 backdrop-blur-md backdrop-saturate-150 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {modalMode === 'create' && 'Create New Application'}
                  {modalMode === 'edit' && 'Edit Application'}
                  {modalMode === 'view' && 'View Application'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                  disabled={loading}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {modalMode === 'view' ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Application Number</p>
                      <p className="text-lg text-gray-900">{selectedApp.application_number}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Client Number</p>
                      <p className="text-lg text-gray-900">{selectedApp.client_number}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Name</p>
                      <p className="text-lg text-gray-900">{selectedApp.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Gender</p>
                      <p className="text-lg text-gray-900">{selectedApp.gender}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Nationality</p>
                      <p className="text-lg text-gray-900">{selectedApp.nationality}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Date of Birth</p>
                      <p className="text-lg text-gray-900">{selectedApp.date_of_birth}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm font-medium text-gray-500">Passport Number</p>
                      <p className="text-lg text-gray-900">{selectedApp.passport_number}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Status</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                        selectedApp.status === 'Approved' ? 'bg-green-100 text-green-800' :
                        selectedApp.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                        selectedApp.status === 'Under Review' ? 'bg-yellow-100 text-yellow-800' :
                        selectedApp.status === 'Expired' ? 'bg-gray-100 text-gray-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {selectedApp.status || 'Pending'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Application Number *
                      </label>
                      <input
                        type="text"
                        value={formData.application_number}
                        onChange={(e) => setFormData({ ...formData, application_number: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Application No."
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Client Number *
                      </label>
                      <input
                        type="text"
                        value={formData.client_number}
                        onChange={(e) => setFormData({ ...formData, client_number: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Client No."
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Full Name"
                      disabled={loading}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Gender *
                      </label>
                      <select
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={loading}
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nationality *
                      </label>
                      <input
                        type="text"
                        value={formData.nationality}
                        onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Nationality"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date of Birth *
                      </label>
                      <input
                        type="date"
                        value={formData.date_of_birth}
                        onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Passport Number *
                      </label>
                      <input
                        type="text"
                        value={formData.passport_number}
                        onChange={(e) => setFormData({ ...formData, passport_number: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Passport No."
                        disabled={loading}
                      />
                    </div>
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status *
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={loading}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Under Review">Under Review</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Expired">Expired</option>
                    </select>
                  </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={modalMode === 'create' ? handleCreate : handleUpdate}
                      disabled={loading}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          {modalMode === 'create' ? 'Creating...' : 'Updating...'}
                        </>
                      ) : (
                        modalMode === 'create' ? 'Create' : 'Update'
                      )}
                    </button>
                    <button
                      onClick={() => setShowModal(false)}
                      disabled={loading}
                      className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 rounded-lg transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
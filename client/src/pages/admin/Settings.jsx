import React, { useState, useEffect } from 'react';
import api from '../../config/api';
import { useAuth } from '../../context/AuthContext';

const Settings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState('general');

  // General settings
  const [siteName, setSiteName] = useState('');
  const [siteDescription, setSiteDescription] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [logo, setLogo] = useState(null);
  const [currentLogo, setCurrentLogo] = useState('');

  // Commission settings
  const [commissionRate, setCommissionRate] = useState(10);
  const [minimumPayout, setMinimumPayout] = useState(50);
  const [payoutSchedule, setPayoutSchedule] = useState('monthly');

  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);

  // Security settings
  const [requireEmailVerification, setRequireEmailVerification] = useState(true);
  const [requirePhoneVerification, setRequirePhoneVerification] = useState(false);
  const [requireProviderDocuments, setRequireProviderDocuments] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/admin/settings');

      const settings = response.data.data;

      // General settings
      setSiteName(settings.general?.siteName || 'Fixly');
      setSiteDescription(settings.general?.siteDescription || '');
      setContactEmail(settings.general?.contactEmail || '');
      setContactPhone(settings.general?.contactPhone || '');
      setCurrentLogo(settings.general?.logo || '');

      // Commission settings
      setCommissionRate(settings.commission?.rate || 10);
      setMinimumPayout(settings.commission?.minimumPayout || 50);
      setPayoutSchedule(settings.commission?.payoutSchedule || 'monthly');

      // Notification settings
      setEmailNotifications(settings.notifications?.email || true);
      setSmsNotifications(settings.notifications?.sms || false);
      setPushNotifications(settings.notifications?.push || true);

      // Security settings
      setRequireEmailVerification(settings.security?.requireEmailVerification || true);
      setRequirePhoneVerification(settings.security?.requirePhoneVerification || false);
      setRequireProviderDocuments(settings.security?.requireProviderDocuments || true);
      setMaintenanceMode(settings.security?.maintenanceMode || false);

      setLoading(false);
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError('Failed to load settings');
      setLoading(false);
    }
  };

  const handleLogoChange = (e) => {
    if (e.target.files[0]) {
      setLogo(e.target.files[0]);
    }
  };

  const saveGeneralSettings = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);

      const formData = new FormData();
      formData.append('siteName', siteName);
      formData.append('siteDescription', siteDescription);
      formData.append('contactEmail', contactEmail);
      formData.append('contactPhone', contactPhone);

      if (logo) {
        formData.append('logo', logo);
      }

      await api.put('/api/admin/settings/general', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccess('General settings updated successfully');
      setSaving(false);

      // Refresh settings
      fetchSettings();

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Error saving general settings:', err);
      setError(err.response?.data?.message || 'Failed to update general settings');
      setSaving(false);
    }
  };

  const saveCommissionSettings = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);

      await api.put('/api/admin/settings/commission', {
        rate: commissionRate,
        minimumPayout,
        payoutSchedule
      });

      setSuccess('Commission settings updated successfully');
      setSaving(false);

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Error saving commission settings:', err);
      setError(err.response?.data?.message || 'Failed to update commission settings');
      setSaving(false);
    }
  };

  const saveNotificationSettings = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);

      await api.put('/api/admin/settings/notifications', {
        email: emailNotifications,
        sms: smsNotifications,
        push: pushNotifications
      });

      setSuccess('Notification settings updated successfully');
      setSaving(false);

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Error saving notification settings:', err);
      setError(err.response?.data?.message || 'Failed to update notification settings');
      setSaving(false);
    }
  };

  const saveSecuritySettings = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);

      await api.put('/api/admin/settings/security', {
        requireEmailVerification,
        requirePhoneVerification,
        requireProviderDocuments,
        maintenanceMode
      });

      setSuccess('Security settings updated successfully');
      setSaving(false);

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Error saving security settings:', err);
      setError(err.response?.data?.message || 'Failed to update security settings');
      setSaving(false);
    }
  };

  return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
            <p className="text-sm text-gray-500 mt-1">
              Configure platform settings and preferences.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex overflow-x-auto" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('general')}
                className={`whitespace-nowrap px-6 py-4 text-sm font-medium border-b-2 transition-colors duration-200 ${
                  activeTab === 'general'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <i className="fas fa-cog mr-2"></i>
                General
              </button>
              <button
                onClick={() => setActiveTab('commission')}
                className={`whitespace-nowrap px-6 py-4 text-sm font-medium border-b-2 transition-colors duration-200 ${
                  activeTab === 'commission'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <i className="fas fa-percentage mr-2"></i>
                Commission
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className={`whitespace-nowrap px-6 py-4 text-sm font-medium border-b-2 transition-colors duration-200 ${
                  activeTab === 'notifications'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <i className="fas fa-bell mr-2"></i>
                Notifications
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`whitespace-nowrap px-6 py-4 text-sm font-medium border-b-2 transition-colors duration-200 ${
                  activeTab === 'security'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <i className="fas fa-shield-alt mr-2"></i>
                Security
              </button>
            </nav>
          </div>
        </div>

        {/* Settings content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="loader"></div>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg" role="alert">
                  <div className="flex items-center">
                    <i className="fas fa-exclamation-circle mr-3 text-red-500"></i>
                    <span className="font-medium">{error}</span>
                  </div>
                </div>
              )}

              {success && (
                <div className="mb-6 p-4 bg-purple-50 border border-purple-200 text-purple-800 rounded-lg" role="alert">
                  <div className="flex items-center">
                    <i className="fas fa-check-circle mr-3 text-purple-500"></i>
                    <span className="font-medium">{success}</span>
                  </div>
                </div>
              )}

              {/* General Settings */}
              {activeTab === 'general' && (
                <form onSubmit={saveGeneralSettings} className="space-y-6">
                  <div className="border-b border-gray-200 pb-4">
                    <h2 className="text-lg font-medium text-gray-900 flex items-center">
                      <i className="fas fa-cog mr-2 text-purple-600"></i>
                      General Settings
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">Configure basic platform information and branding.</p>
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Site Name
                      </label>
                      <input
                        type="text"
                        value={siteName}
                        onChange={(e) => setSiteName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contact Email
                      </label>
                      <input
                        type="email"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contact Phone
                      </label>
                      <input
                        type="text"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Site Logo
                      </label>
                      <div className="flex items-center space-x-4">
                        {currentLogo && (
                          <div className="flex-shrink-0">
                            <img src={currentLogo} alt="Current Logo" className="h-12 w-auto rounded" />
                          </div>
                        )}
                        <div className="flex-1">
                          <input
                            type="file"
                            onChange={handleLogoChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                            accept="image/*"
                          />
                          <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 2MB</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Site Description
                    </label>
                    <textarea
                      value={siteDescription}
                      onChange={(e) => setSiteDescription(e.target.value)}
                      rows="4"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Brief description of your platform..."
                    ></textarea>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-gray-200">
                    <button
                      type="submit"
                      disabled={saving}
                      className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-colors duration-200 ${
                        saving
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500'
                      }`}
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              )}

              {/* Commission Settings */}
              {activeTab === 'commission' && (
                <form onSubmit={saveCommissionSettings}>
                  <h2 className="text-lg font-medium mb-4">Commission Settings</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Commission Rate (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={commissionRate}
                        onChange={(e) => setCommissionRate(parseFloat(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Minimum Payout Amount ($)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={minimumPayout}
                        onChange={(e) => setMinimumPayout(parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Payout Schedule
                      </label>
                      <select
                        value={payoutSchedule}
                        onChange={(e) => setPayoutSchedule(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      >
                        <option value="weekly">Weekly</option>
                        <option value="biweekly">Bi-weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={saving}
                      className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-colors duration-200 ${
                        saving
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500'
                      }`}
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              )}

              {/* Notification Settings */}
              {activeTab === 'notifications' && (
                <form onSubmit={saveNotificationSettings}>
                  <h2 className="text-lg font-medium mb-4">Notification Settings</h2>

                  <div className="space-y-4 mb-6">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="emailNotifications"
                        checked={emailNotifications}
                        onChange={(e) => setEmailNotifications(e.target.checked)}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                      <label htmlFor="emailNotifications" className="ml-2 block text-sm text-gray-700">
                        Enable Email Notifications
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="smsNotifications"
                        checked={smsNotifications}
                        onChange={(e) => setSmsNotifications(e.target.checked)}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                      <label htmlFor="smsNotifications" className="ml-2 block text-sm text-gray-700">
                        Enable SMS Notifications
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="pushNotifications"
                        checked={pushNotifications}
                        onChange={(e) => setPushNotifications(e.target.checked)}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                      <label htmlFor="pushNotifications" className="ml-2 block text-sm text-gray-700">
                        Enable Push Notifications
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={saving}
                      className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-colors duration-200 ${
                        saving
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500'
                      }`}
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              )}

              {/* Security Settings */}
              {activeTab === 'security' && (
                <form onSubmit={saveSecuritySettings}>
                  <h2 className="text-lg font-medium mb-4">Security Settings</h2>

                  <div className="space-y-4 mb-6">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="requireEmailVerification"
                        checked={requireEmailVerification}
                        onChange={(e) => setRequireEmailVerification(e.target.checked)}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                      <label htmlFor="requireEmailVerification" className="ml-2 block text-sm text-gray-700">
                        Require Email Verification for New Users
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="requirePhoneVerification"
                        checked={requirePhoneVerification}
                        onChange={(e) => setRequirePhoneVerification(e.target.checked)}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                      <label htmlFor="requirePhoneVerification" className="ml-2 block text-sm text-gray-700">
                        Require Phone Verification for New Users
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="requireProviderDocuments"
                        checked={requireProviderDocuments}
                        onChange={(e) => setRequireProviderDocuments(e.target.checked)}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                      <label htmlFor="requireProviderDocuments" className="ml-2 block text-sm text-gray-700">
                        Require Document Verification for Service Providers
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="maintenanceMode"
                        checked={maintenanceMode}
                        onChange={(e) => setMaintenanceMode(e.target.checked)}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                      <label htmlFor="maintenanceMode" className="ml-2 block text-sm text-gray-700">
                        Enable Maintenance Mode
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={saving}
                      className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-colors duration-200 ${
                        saving
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500'
                      }`}
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      </div>
  );
};

export default Settings;            
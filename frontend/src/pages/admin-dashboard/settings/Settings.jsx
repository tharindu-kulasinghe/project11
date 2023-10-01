import React, { useEffect, useState } from 'react'
import './settings.css'
const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8000'

export default function Settings() {
  const [settings, setSettings] = useState({
    siteName: 'Gamanata Vehicle Rental',
    contactEmail: 'info@gamanata.com',
    contactPhone: '+94 11 234 5678',
    address: '123 Main Street, Colombo, Sri Lanka',
    currency: 'LKR',
    timezone: 'Asia/Colombo',
    bookingSettings: {
      minBookingHours: 1,
      maxBookingDays: 30,
      cancellationHours: 24,
      requireDeposit: true,
      depositPercentage: 20
    }
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [savedOk, setSavedOk] = useState(false)

  const [activeTab, setActiveTab] = useState('general')

  const handleSettingChange = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }))
  }

  const handleGeneralChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError('')
        const token = localStorage.getItem('token')
        const headers = { 'Content-Type': 'application/json' }
        if (token) headers['Authorization'] = `Bearer ${token}`
        const res = await fetch(`${API_BASE}/api/system`, { headers })
        if (!res.ok) throw new Error('Failed to load settings')
        const data = await res.json()
        // Merge to ensure missing nested keys have defaults
        setSettings(prev => ({
          ...prev,
          ...data,
          bookingSettings: { ...prev.bookingSettings, ...(data.bookingSettings || {}) }
        }))
      } catch (e) {
        setError(e.message || 'Failed to load settings')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleSave = async () => {
    try {
      setSaving(true)
      setSavedOk(false)
      setError('')
      const token = localStorage.getItem('token')
      const headers = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`
      const res = await fetch(`${API_BASE}/api/system`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(settings)
      })
      if (!res.ok) {
        const msg = await res.json().catch(() => ({}))
        throw new Error(msg?.message || 'Failed to save settings')
      }
      const data = await res.json()
      setSettings(prev => ({
        ...prev,
        ...data,
        bookingSettings: { ...prev.bookingSettings, ...(data.bookingSettings || {}) }
      }))
      setSavedOk(true)
    } catch (e) {
      setError(e.message || 'Failed to save settings')
    } finally {
      setSaving(false)
      setTimeout(() => setSavedOk(false), 2000)
    }
  }

  const handleReset = async () => {
    if (!window.confirm('Are you sure you want to reset all settings to defaults? This action cannot be undone.')) {
      return
    }

    try {
      setSaving(true)
      setError('')
      const token = localStorage.getItem('token')
      const headers = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`
      const res = await fetch(`${API_BASE}/api/system/reset`, {
        method: 'PUT',
        headers
      })
      if (!res.ok) {
        const msg = await res.json().catch(() => ({}))
        throw new Error(msg?.message || 'Failed to reset settings')
      }
      const data = await res.json()
      setSettings(prev => ({
        ...prev,
        ...data.settings,
        bookingSettings: { ...prev.bookingSettings, ...(data.settings.bookingSettings || {}) }
      }))
      setSavedOk(true)
      setTimeout(() => setSavedOk(false), 2000)
    } catch (e) {
      setError(e.message || 'Failed to reset settings')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="settings">
      <div className="settings-container">
        <div className="settings-header">
          <h1>Settings</h1>
          <p>Configure your vehicle rental system settings</p>
        </div>

        {error && (
          <div className="error-state"><p>{error}</p></div>
        )}
        {loading && (
          <div className="loading-state"><p>Loading settings...</p></div>
        )}

        <div className="settings-tabs">
          <button
            className={`tab-btn ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            General
          </button>
          <button
            className={`tab-btn ${activeTab === 'booking' ? 'active' : ''}`}
            onClick={() => setActiveTab('booking')}
          >
            Booking Settings
          </button>
        </div>

        <div className="settings-content">
          {activeTab === 'general' && (
            <div className="general-settings">
              <h3>General Settings</h3>

              <div className="settings-form">
                <div className="form-group">
                  <label>Site Name</label>
                  <input
                    type="text"
                    value={settings.siteName}
                    onChange={(e) => handleGeneralChange('siteName', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Contact Email</label>
                  <input
                    type="email"
                    value={settings.contactEmail}
                    onChange={(e) => handleGeneralChange('contactEmail', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Contact Phone</label>
                  <input
                    type="tel"
                    value={settings.contactPhone}
                    onChange={(e) => handleGeneralChange('contactPhone', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Address</label>
                  <textarea
                    value={settings.address}
                    onChange={(e) => handleGeneralChange('address', e.target.value)}
                    rows="3"
                  />
                </div>

                <div className="form-group">
                  <label>Currency</label>
                  <select
                    value={settings.currency}
                    onChange={(e) => handleGeneralChange('currency', e.target.value)}
                  >
                    <option value="LKR">LKR (Sri Lankan Rupee)</option>
                    <option value="USD">USD (US Dollar)</option>
                    <option value="EUR">EUR (Euro)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Timezone</label>
                  <select
                    value={settings.timezone}
                    onChange={(e) => handleGeneralChange('timezone', e.target.value)}
                  >
                    <option value="Asia/Colombo">Asia/Colombo</option>
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">America/New_York</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'booking' && (
            <div className="booking-settings">
              <h3>Booking Settings</h3>

              <div className="settings-form">
                <div className="form-group">
                  <label>Minimum Booking Hours</label>
                  <input
                    type="number"
                    value={settings.bookingSettings.minBookingHours}
                    onChange={(e) => handleSettingChange('bookingSettings', 'minBookingHours', parseInt(e.target.value))}
                    min="1"
                    max="24"
                  />
                </div>

                <div className="form-group">
                  <label>Maximum Booking Days</label>
                  <input
                    type="number"
                    value={settings.bookingSettings.maxBookingDays}
                    onChange={(e) => handleSettingChange('bookingSettings', 'maxBookingDays', parseInt(e.target.value))}
                    min="1"
                    max="365"
                  />
                </div>

                <div className="form-group">
                  <label>Cancellation Notice (Hours)</label>
                  <input
                    type="number"
                    value={settings.bookingSettings.cancellationHours}
                    onChange={(e) => handleSettingChange('bookingSettings', 'cancellationHours', parseInt(e.target.value))}
                    min="0"
                    max="168"
                  />
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={settings.bookingSettings.requireDeposit}
                      onChange={(e) => handleSettingChange('bookingSettings', 'requireDeposit', e.target.checked)}
                    />
                    <span className="checkmark"></span>
                    Require Security Deposit
                  </label>
                </div>

                {settings.bookingSettings.requireDeposit && (
                  <div className="form-group">
                    <label>Deposit Percentage (%)</label>
                    <input
                      type="number"
                      value={settings.bookingSettings.depositPercentage}
                      onChange={(e) => handleSettingChange('bookingSettings', 'depositPercentage', parseInt(e.target.value))}
                      min="10"
                      max="50"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="settings-actions">
          <button className="save-btn" onClick={handleSave}>
            <i className="ri-save-line"></i>
            {saving ? 'Saving...' : (savedOk ? 'Saved!' : 'Save Settings')}
          </button>
          <button className="reset-btn" onClick={handleReset}>
            <i className="ri-refresh-line"></i>
            Reset to Defaults
          </button>
        </div>
      </div>
    </div>
  )
}

import React, { useState } from 'react'
import './reports.css'

export default function Reports() {
  const [dateRange, setDateRange] = useState('30')
  const [reportType, setReportType] = useState('overview')

  const reportData = {
    overview: {
      totalRevenue: 1245000,
      totalBookings: 156,
      totalUsers: 2847,
      totalVehicles: 156,
      avgBookingValue: 7974,
      topVehicle: 'Toyota Camry',
      topCategory: 'Sedan'
    },
    bookings: {
      daily: [
        { date: '2024-01-01', bookings: 12, revenue: 96000 },
        { date: '2024-01-02', bookings: 8, revenue: 64000 },
        { date: '2024-01-03', bookings: 15, revenue: 120000 }
      ],
      monthly: [
        { month: 'January', bookings: 156, revenue: 1245000 },
        { month: 'December', bookings: 142, revenue: 1136000 }
      ]
    },
    vehicles: {
      utilization: [
        { vehicle: 'Toyota Camry', bookings: 45, utilization: 85 },
        { vehicle: 'Honda CR-V', bookings: 32, utilization: 78 },
        { vehicle: 'BMW M3', bookings: 28, utilization: 65 }
      ]
    }
  }

  const currentData = reportData[reportType]

  return (
    <div className="reports">
      <div className="reports-container">
        <div className="reports-header">
          <h1>Reports & Analytics</h1>
          <p>Comprehensive insights into your vehicle rental business</p>
        </div>

        <div className="reports-controls">
          <div className="report-filters">
            <div className="filter-group">
              <label>Report Type</label>
              <select value={reportType} onChange={(e) => setReportType(e.target.value)}>
                <option value="overview">Overview</option>
                <option value="bookings">Bookings</option>
                <option value="vehicles">Vehicles</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Date Range</label>
              <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="365">Last year</option>
              </select>
            </div>
          </div>

          <button className="generate-report-btn">
            <i className="ri-file-download-line"></i>
            Generate Report
          </button>
        </div>

        {reportType === 'overview' && (
          <div className="overview-reports">
            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-icon">
                  <i className="ri-money-dollar-circle-line"></i>
                </div>
                <div className="metric-info">
                  <h3>Rs. {currentData.totalRevenue.toLocaleString()}</h3>
                  <p>Total Revenue</p>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-icon">
                  <i className="ri-calendar-check-line"></i>
                </div>
                <div className="metric-info">
                  <h3>{currentData.totalBookings}</h3>
                  <p>Total Bookings</p>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-icon">
                  <i className="ri-user-line"></i>
                </div>
                <div className="metric-info">
                  <h3>{currentData.totalUsers.toLocaleString()}</h3>
                  <p>Total Users</p>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-icon">
                  <i className="ri-car-line"></i>
                </div>
                <div className="metric-info">
                  <h3>{currentData.totalVehicles}</h3>
                  <p>Total Vehicles</p>
                </div>
              </div>
            </div>

            <div className="summary-cards">
              <div className="summary-card">
                <h4>Average Booking Value</h4>
                <p className="summary-value">Rs. {currentData.avgBookingValue.toLocaleString()}</p>
              </div>

              <div className="summary-card">
                <h4>Top Performing Vehicle</h4>
                <p className="summary-value">{currentData.topVehicle}</p>
              </div>

              <div className="summary-card">
                <h4>Most Popular Category</h4>
                <p className="summary-value">{currentData.topCategory}</p>
              </div>
            </div>
          </div>
        )}

        {reportType === 'bookings' && (
          <div className="bookings-reports">
            <div className="chart-section">
              <h3>Daily Bookings & Revenue</h3>
              <div className="chart-placeholder">
                <div className="chart-bars">
                  {currentData.daily.map((day, index) => (
                    <div key={index} className="chart-bar">
                      <div className="bar" style={{ height: `${(day.bookings / 20) * 100}%` }}></div>
                      <span className="bar-label">{day.date.split('-')[2]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="monthly-summary">
              <h3>Monthly Summary</h3>
              <div className="monthly-table">
                <table>
                  <thead>
                    <tr>
                      <th>Month</th>
                      <th>Bookings</th>
                      <th>Revenue (Rs.)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentData.monthly.map((month, index) => (
                      <tr key={index}>
                        <td>{month.month}</td>
                        <td>{month.bookings}</td>
                        <td>Rs. {month.revenue.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {reportType === 'vehicles' && (
          <div className="vehicles-reports">
            <div className="utilization-section">
              <h3>Vehicle Utilization</h3>
              <div className="utilization-list">
                {currentData.utilization.map((vehicle, index) => (
                  <div key={index} className="utilization-item">
                    <div className="utilization-info">
                      <span className="vehicle-name">{vehicle.vehicle}</span>
                      <span className="utilization-rate">{vehicle.utilization}%</span>
                    </div>
                    <div className="utilization-bar">
                      <div
                        className="utilization-fill"
                        style={{ width: `${vehicle.utilization}%` }}
                      ></div>
                    </div>
                    <span className="booking-count">{vehicle.bookings} bookings</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

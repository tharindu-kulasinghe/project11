import React from 'react'
import Dashboard from '../components/dashboard/Dashboard'

export default function DashboardLayout({ children }) {
  return (
    <Dashboard>
      {children}
    </Dashboard>
  )
}

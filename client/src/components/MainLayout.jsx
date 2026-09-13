import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  return (
    <div className="app-layout">
      <button className="mobile-toggle" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
        <img src="/logo.svg" alt="" className="mobile-toggle-logo" />
      </button>
      <div className={`sidebar-overlay ${sidebarOpen ? 'visible' : ''}`} onClick={() => setSidebarOpen(false)} />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="main-content"><Outlet /></main>
    </div>
  )
}

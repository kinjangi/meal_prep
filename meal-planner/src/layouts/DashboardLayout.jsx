import React, { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import './DashboardLayout.css';

const navItems = [
  { path: '/', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { path: '/preferences', label: 'Preferences', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
  { path: '/meal-plan', label: 'Meal Plan', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  { path: '/grocery-list', label: 'Grocery List', icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z' },
  { path: '/analytics', label: 'Analytics', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
];

export default function DashboardLayout({
  mealPlan,
  handleRegenerate,
  handleQuickGenerate,
  handleAIGenerate,
  isGeneratingAI,
  aiReasoning,
  aiError,
  setAiError,
  planMode,
  onResetAll,
}) {
  const [sidebarOpen, setSidebarOpen]   = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const location = useLocation();

  const getPageTitle = () => {
    const currentRoute = navItems.find(item => item.path === location.pathname);
    return currentRoute ? currentRoute.label : 'Meal Prep';
  };

  const handleResetClick = () => {
    if (confirmReset) {
      onResetAll?.();
    } else {
      setConfirmReset(true);
      // Auto-cancel if the user doesn't confirm within 4 seconds
      setTimeout(() => setConfirmReset(false), 4000);
    }
  };

  return (
    <div className="dashboard-container">
      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        {/* Logo + brand */}
        <div className="sidebar-header">
          <svg className="sidebar-logo" width={32} height={32} fill="none"
            viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="sidebar-title">MealPrep</h2>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <svg className="nav-icon" width={24} height={24} fill="none"
                viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
              </svg>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* ── Reset All Data — bottom of sidebar ── */}
        <div className="sidebar-footer">
          <button
            type="button"
            className={`reset-btn ${confirmReset ? 'reset-btn--confirm' : ''}`}
            onClick={handleResetClick}
            title="Clear all saved data and return to a fresh state"
          >
            <svg width={15} height={15} fill="none" viewBox="0 0 24 24"
              stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            {confirmReset ? 'Tap again to confirm' : 'Reset All Data'}
          </button>
        </div>
      </div>

      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="main-panel">
        <header className="topbar">
          <button className="hamburger-btn" onClick={() => setSidebarOpen(true)}>
            <svg width={24} height={24} fill="none" viewBox="0 0 24 24"
              strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="page-title">{getPageTitle()}</h1>
          <div className="user-profile">
            <span className="greeting">Welcome back!</span>
            <div className="avatar">U</div>
          </div>
        </header>

        <main className="content-area">
          <Outlet
            context={{
              mealPlan,
              handleRegenerate,
              handleQuickGenerate,
              handleAIGenerate,
              isGeneratingAI,
              aiReasoning,
              aiError,
              setAiError,
              planMode,
            }}
          />
        </main>
      </div>
    </div>
  );
}

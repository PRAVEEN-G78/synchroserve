import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import './App.css';

// Import SVG icons
import MenuIcon from './assets/icons/menu.svg';
import DashboardIcon from './assets/icons/dashboard.svg';
import GroupAddIcon from './assets/icons/group-add.svg';
import CalendarTodayIcon from './assets/icons/calendar.svg';
import WorkOffIcon from './assets/icons/work-off.svg';
import TrendingUpIcon from './assets/icons/trending-up.svg';
import AccountBalanceIcon from './assets/icons/account-balance.svg';
import ExpandLessIcon from './assets/icons/expand-less.svg';
import ExpandMoreIcon from './assets/icons/expand-more.svg';

import Dashboard from './components/Dashboard/Dashboard';
import Onboarding from './components/Onboarding/Onboarding';
import Attendance from './components/Attendance/Attendance';
import LeaveManagement from './components/LeaveManagement/LeaveManagement';
import PerformanceTracking from './components/PerformanceTracking/PerformanceTracking';
import PayrollPreview from './components/PayrollPreview/PayrollPreview';
import EmployeeHome from './components/Employee/EmployeeHome';
import EmployeeLogin from './components/Auth/EmployeeLogin';
import CentreLogin from './components/Auth/CentreLogin';
import AdminLogin from './components/Auth/AdminLogin';
import AdminRegister from './components/Auth/AdminRegister';
import EmployeeRegister from './components/Auth/EmployeeRegister';
import CentreRegister from './components/Auth/CentreRegister';
import LoginSelection from './components/Auth/LoginSelection';
import InactivityTimer from './components/Auth/InactivityTimer';
import TokenManager from './components/Auth/TokenManager';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import AdminDashboard from './components/Dashboard/AdminDashboard';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openSections, setOpenSections] = useState({});
  const [showAdminRegistrationLinks, setShowAdminRegistrationLinks] = useState(false);

  // Auth check
  const isAuthenticated = !!localStorage.getItem('token');
  const user = isAuthenticated ? JSON.parse(localStorage.getItem('user')) : null;
  const userType = user?.userType;

  const handleDrawerToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  const handleSectionToggle = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Employee menu items (restricted access)
  const employeeMenuItems = [
    {
      text: 'Home',
      icon: DashboardIcon,
      path: '/',
      description: 'Employee dashboard and profile overview',
      subItems: [
        { text: 'Dashboard', path: '/' },
        { text: 'Profile', path: '/' },
        { text: 'Quick Actions', path: '/' },
      ],
    },
    {
      text: 'Onboarding',
      icon: GroupAddIcon,
      path: '/onboarding',
      description: 'Manage new employee onboarding process',
    },
    // Attendance and Leave only if status is Approved
    ...(user?.status === 'Approved' ? [
      {
        text: 'Attendance',
        icon: CalendarTodayIcon,
        path: '/attendance',
        description: 'Track employee attendance and time records',
        subItems: [
          { text: 'Daily Attendance', path: '/attendance' },
          { text: 'Time Tracking', path: '/attendance' },
          { text: 'Reports', path: '/ ' },
        ],
      },
      {
        text: 'Leave',
        icon: WorkOffIcon,
        path: '/leave',
        description: 'Manage employee leave requests and balances',
        subItems: [
          { text: 'Leave Requests', path: '/leave' },
          { text: 'Leave Balance', path: '/leave' },
          { text: 'Calendar', path: '/leave' },
        ],
      },
    ] : []),
  ];

  // Centre menu items (full access)
  const centreMenuItems = [
    {
      text: 'Dashboard',
      icon: DashboardIcon,
      path: '/dashboard',
      description: 'Overview of center operations and key metrics',
      subItems: [
        { text: 'Center Overview', path: '/dashboard' },
        { text: 'Employee Stats', path: '/dashboard' },
        { text: 'Quick Actions', path: '/dashboard' },
      ],
    },
    {
      text: 'Performance',
      icon: TrendingUpIcon,
      path: '/performance',
      description: 'Track and evaluate employee performance',
      subItems: [
        { text: 'Performance Reviews', path: '/performance' },
        { text: 'Goals & KPIs', path: '/performance' },
        { text: 'Feedback', path: '/performance' },
      ],
    },
    {
      text: 'Payroll',
      icon: AccountBalanceIcon,
      path: '/payroll',
      description: 'Manage employee compensation and benefits',
      subItems: [
        { text: 'Salary Processing', path: '/payroll' },
        { text: 'Benefits', path: '/payroll' },
        { text: 'Tax Reports', path: '/payroll' },
      ],
    },
  ];

  // Admin menu items
  const adminMenuItems = [
    {
      text: 'Dashboard',
      icon: DashboardIcon,
      path: '/admin/dashboard',
      description: 'Admin dashboard and management',
    },
    {
      text: 'Registration Links',
      icon: GroupAddIcon,
      path: '/admin/registration-links',
      description: 'Register new employees or centres',
      onClick: () => {
        setShowAdminRegistrationLinks(true);
        setSidebarOpen(false);
      },
    },
  ];

  // Select menu items based on user type
  let menuItems = employeeMenuItems;
  if (userType === 'centre') menuItems = centreMenuItems;
  if (userType === 'admin') menuItems = adminMenuItems;

  const drawer = (
    <>
      <div className="sidebar-header">
        <h1 className="sidebar-title">SynchroServe</h1>
      </div>
      <ul className="menu-list">
        {menuItems.map((item) => (
          <li key={item.text}>
            {item.subItems ? (
              <>
                <button
                  className="menu-item"
                  onClick={() => handleSectionToggle(item.text)}
                  data-section={item.text}
                >
                  <img src={item.icon} alt="" className="menu-item-icon" />
                  <div className="menu-item-text">
                    <div>{item.text}</div>
                    <div className="menu-item-description">{item.description}</div>
                  </div>
                  <img
                    src={openSections[item.text] ? ExpandLessIcon : ExpandMoreIcon}
                    alt=""
                    className="menu-item-icon expand-icon"
                  />
                </button>
                {openSections[item.text] && (
                  <ul className="submenu">
                    {item.subItems.map((subItem) => (
                      <li key={subItem.text}>
                        <Link to={subItem.path} className="submenu-item" onClick={() => setSidebarOpen(false)}>
                          {subItem.text}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            ) : item.onClick ? (
              <button className="menu-item" onClick={item.onClick}>
                <img src={item.icon} alt="" className="menu-item-icon" />
                <div className="menu-item-text">
                  <div>{item.text}</div>
                  <div className="menu-item-description">{item.description}</div>
                </div>
              </button>
            ) : (
              <Link to={item.path} className="menu-item" onClick={() => setSidebarOpen(false)}>
                <img src={item.icon} alt="" className="menu-item-icon" />
                <div className="menu-item-text">
                  <div>{item.text}</div>
                  <div className="menu-item-description">{item.description}</div>
                </div>
              </Link>
            )}
          </li>
        ))}
      </ul>
    </>
  );

  return (
    <Router>
      <div className="app-container">
        <header className="app-header">
          <button className="menu-button" onClick={handleDrawerToggle}>
            <img src={sidebarOpen ? ExpandLessIcon : MenuIcon} alt="Menu" />
          </button>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h1 className="app-title">SynchroServe</h1>
            {isAuthenticated && user && (
              <small style={{ color: '#fff', fontSize: '16px' }}>
                Welcome, {userType === 'employee' ? `${user.firstName} ${user.lastName}` : user.centreName}
              </small>
            )}
          </div>
          {isAuthenticated && (
            <button className="logout-button" onClick={handleLogout}>
              Logout
            </button>
          )}
        </header>

        {sidebarOpen && <div className="sidebar-overlay" onClick={handleDrawerToggle}></div>}
        
        <nav className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          {drawer}
        </nav>

        <main className={`main-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
          {isAuthenticated && <InactivityTimer onLogout={handleLogout} />}
          {isAuthenticated && <TokenManager />}
          {/* Show registration links only when admin clicks the sidebar link */}
          {userType === 'admin' && showAdminRegistrationLinks ? (
            <div className="dashboard-container">
              <div className="card" style={{ marginTop: '2rem', border: '2px solid #2196F3', background: 'linear-gradient(90deg, #e3f2fd 0%, #ffffff 100%)' }}>
                <div className="card-content" style={{ textAlign: 'center' }}>
                  <h2 style={{ color: '#1976D2', marginBottom: '1rem', fontWeight: 700, letterSpacing: '1px' }}>Registration Links</h2>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
                    <a href="/employee/register" className="registration-link" style={{
                      display: 'inline-block',
                      padding: '14px 32px',
                      background: '#2196F3',
                      color: '#fff',
                      borderRadius: '6px',
                      fontWeight: 600,
                      fontSize: '1.1rem',
                      textDecoration: 'none',
                      boxShadow: '0 2px 8px rgba(33,150,243,0.08)',
                      transition: 'background 0.2s',
                      marginBottom: '8px'
                    }}
                    onMouseOver={e => e.currentTarget.style.background = '#1976D2'}
                    onMouseOut={e => e.currentTarget.style.background = '#2196F3'}
                    >
                      Register as Employee
                    </a>
                    <a href="/centre/register" className="registration-link" style={{
                      display: 'inline-block',
                      padding: '14px 32px',
                      background: '#21CBF3',
                      color: '#1976D2',
                      borderRadius: '6px',
                      fontWeight: 600,
                      fontSize: '1.1rem',
                      textDecoration: 'none',
                      boxShadow: '0 2px 8px rgba(33,203,243,0.08)',
                      transition: 'background 0.2s',
                      marginBottom: '8px'
                    }}
                    onMouseOver={e => e.currentTarget.style.background = '#b2ebf2'}
                    onMouseOut={e => e.currentTarget.style.background = '#21CBF3'}
                    >
                      Register as Centre
                    </a>
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                <button className="button button-secondary" onClick={() => setShowAdminRegistrationLinks(false)}>
                  Back to Dashboard
                </button>
              </div>
            </div>
          ) : (
            <Routes>
              <Route path="/" element={isAuthenticated ? 
                (userType === 'centre' ? <Dashboard /> : userType === 'admin' ? <AdminDashboard /> : <EmployeeHome />) : 
                <LoginSelection />} 
              />
              <Route path="/employee/login" element={<EmployeeLogin />} />
              <Route path="/centre/login" element={<CentreLogin />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/register" element={<AdminRegister />} />
              <Route path="/employee/register" element={<EmployeeRegister />} />
              <Route path="/centre/register" element={<CentreRegister />} />
              <Route path="/login-selection" element={<LoginSelection />} />
              {/* Employee-only routes - TRUE BLOCKING */}
              <Route path="/onboarding" element={
                <ProtectedRoute allowedUserTypes={['employee']}>
                  <Onboarding />
                </ProtectedRoute>
              } />
              <Route path="/attendance" element={
                <ProtectedRoute allowedUserTypes={['employee']}>
                  <Attendance />
                </ProtectedRoute>
              } />
              <Route path="/leave" element={
                <ProtectedRoute allowedUserTypes={['employee']}>
                  <LeaveManagement />
                </ProtectedRoute>
              } />
              {/* Centre-only routes - TRUE BLOCKING */}
              <Route path="/dashboard" element={
                <ProtectedRoute allowedUserTypes={['centre']}>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/performance" element={
                <ProtectedRoute allowedUserTypes={['centre']}>
                  <PerformanceTracking />
                </ProtectedRoute>
              } />
              <Route path="/payroll" element={
                <ProtectedRoute allowedUserTypes={['centre']}>
                  <PayrollPreview />
                </ProtectedRoute>
              } />
              {/* Admin-only routes - TRUE BLOCKING */}
              <Route path="/admin/dashboard" element={
                <ProtectedRoute allowedUserTypes={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              {/* Catch-all route for authenticated users */}
              {isAuthenticated && (
                <Route path="*" element={
                  <Navigate to={userType === 'employee' ? '/' : userType === 'centre' ? '/dashboard' : userType === 'admin' ? '/admin/dashboard' : '/'} replace />
                } />
              )}
              {/* Public routes */}
              {!isAuthenticated && (
                <Route path="*" element={<LoginSelection />} />
              )}
            </Routes>
          )}
        </main>
      </div>
    </Router>
  );
}

export default App; 
import React, { useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import './dashboard.css'

// Function to decode JWT token
function decodeToken(token) {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return decoded;
  } catch (e) {
    return null;
  }
}

export default function Dashboard({ children }) {
  const navigate = useNavigate();
  const location = useLocation()

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    const decoded = decodeToken(token);
    if (!decoded || decoded.role !== 'admin') {
      navigate('/login');
    }
  }, [navigate]);

  const getActiveClass = (path) => {
    if (path === '/admin/dashboard' && location.pathname === '/admin/dashboard') {
      return 'active'
    }
    if (path === '/admin/vehicles' && location.pathname === '/admin/vehicles') {
      return 'active'
    }
    if (path === '/admin/users' && location.pathname === '/admin/users') {
      return 'active'
    }
    if (path === '/admin/bookings' && location.pathname === '/admin/bookings') {
      return 'active'
    }
    if (path === '/admin/reports' && location.pathname === '/admin/reports') {
      return 'active'
    }
    if (path === '/admin/vehicle-types' && location.pathname === '/admin/vehicle-types') {
      return 'active'
    }
    if (path === '/admin/device-purchase' && location.pathname === '/admin/device-purchase') {
      return 'active'
    }
    if (path === '/admin/settings' && location.pathname === '/admin/settings') {
      return 'active'
    }
    return ''
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.dispatchEvent(new CustomEvent('tokenUpdated')); // Notify other components
    navigate('/');
  };

  return (
    <div className="dashboard">
      <div className="dashboard-sidebar">
        <div className="dashboard-sidebar-header">
          <div className="dashboard-sidebar-header-logo">
            <img src="../assets/images/demo/profile.jpg" alt="" />
          </div>
          <h3>Admin Panel</h3>
        </div>
        <div className="dashboard-sidebar-content">
          <Link to="/admin/dashboard" className={getActiveClass('/admin/dashboard')}>
            <i className="ri-dashboard-line"></i>
            <span>Dashboard</span>
          </Link>
          <Link to="/admin/vehicles" className={getActiveClass('/admin/vehicles')}>
            <i className="ri-car-line"></i>
            <span>Manage Vehicles</span>
          </Link>
          <Link to="/admin/users" className={getActiveClass('/admin/users')}>
            <i className="ri-user-line"></i>
            <span>Manage Users</span>
          </Link>
          <Link to="/admin/bookings" className={getActiveClass('/admin/bookings')}>
            <i className="ri-calendar-check-line"></i>
            <span>Manage Bookings</span>
          </Link>
          <Link to="/admin/vehicle-types" className={getActiveClass('/admin/vehicle-types')}>
            <i className="ri-car-line"></i>
            <span>Manage Vehicle Types</span>
          </Link>
          <Link to="/admin/device-purchase" className={getActiveClass('/admin/device-purchase')}>
            <i className="ri-shopping-cart-2-line"></i>
            <span>Device Purchase</span>
          </Link>
          <Link to="/admin/settings" className={getActiveClass('/admin/settings')}>
            <i className="ri-settings-3-line"></i>
            <span>Settings</span>
          </Link>
          <a href="#" onClick={handleLogout}>
            <i className="ri-logout-box-r-line"></i>
            <span>Logout</span>
          </a>
        </div>
      </div>
      <div className="dashboard-body">
        {children}
      </div>
    </div>
  )
}

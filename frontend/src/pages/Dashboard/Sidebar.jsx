import React, { useContext, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import '../../styles/Dashboard/Sidebar.css';

const Sidebar = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const vendorMenuItems = [
    // { path: '/vendor/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/vendor/products', label: 'Browse Materials', icon: '🔍' },
    { path: '/vendor/suppliers', label: 'Search Suppliers', icon: '🏢' },
    { path: '/vendor/orders', label: 'Order Management', icon: '📦' },
    // { path: '/vendor/analytics', label: 'Analytics', icon: '📈' },
    // { path: '/vendor/chat', label: 'Communication', icon: '💬' },
    // { path: '/vendor/notifications', label: 'Notifications', icon: '🔔' }
  ];

  const supplierMenuItems = [
    // { path: '/supplier/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/supplier/products', label: 'Product Catalog', icon: '📋' },
    { path: '/supplier/orders', label: 'Order Management', icon: '📦' },
    // { path: '/supplier/customers', label: 'Customers', icon: '👥' },
    // { path: '/supplier/analytics', label: 'Analytics', icon: '📈' },
    // { path: '/supplier/chat', label: 'Communication', icon: '💬' },
    // { path: '/supplier/trust-score', label: 'Trust Score', icon: '⭐' }
  ];

  const menuItems = user?.role === 'vendor' ? vendorMenuItems : supplierMenuItems;

  // Handle sidebar close on nav click (mobile)
  const handleNavClick = () => setOpen(false);

  return (
    <>
      {/* Hamburger button for mobile */}
      <button
        className="sidebar-toggle"
        aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
        aria-controls="dashboard-sidebar"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        style={{ display: 'block', position: 'fixed', top: 16, left: 16, zIndex: 1201 }}
      >
        <span style={{ fontSize: 28 }}>{open ? '\u2715' : '\u2630'}</span>
      </button>

      {/* Sidebar overlay for mobile */}
      <div
        className={`dashboard-sidebar${open ? ' open' : ''}`}
        id="dashboard-sidebar"
        style={{
          transform: open ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s',
          zIndex: 1200,
        }}
        aria-hidden={!open}
      >
        <div className="sidebar-header">
          <a href="/" className="sidebar-logo">
            MarketMate
          </a>
          <p className="sidebar-subtitle">
            {user?.role === 'vendor' ? 'Vendor Portal' : 'Supplier Portal'}
          </p>
        </div>
        <nav className="sidebar-nav">
          <div className="nav-section">
            <h3 className="nav-section-title">Main Navigation</h3>
            <ul className="nav-list">
              {menuItems.map((item) => (
                <li key={item.path} className="nav-item">
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `nav-link ${isActive ? 'active' : ''}`
                    }
                    onClick={handleNavClick}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    <span className="nav-text">{item.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        </nav>
        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="user-avatar">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="user-details">
              <p className="user-name">{user?.name}</p>
              <p className="user-role">{user?.role}</p>
            </div>
          </div>
        </div>
      </div>
      {/* Overlay background for mobile when sidebar is open */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.2)',
            zIndex: 1199,
          }}
          aria-hidden="true"
        />
      )}
    </>
  );
};

export default Sidebar; 
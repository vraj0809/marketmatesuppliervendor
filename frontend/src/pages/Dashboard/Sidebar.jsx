import React, { useContext } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import '../../styles/Dashboard/Sidebar.css';

const Sidebar = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();

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
    { path: '/supplier/dashboard', label: 'Product Catalog', icon: '📋' },
    { path: '/supplier/orders', label: 'Order Management', icon: '📦' },
    // { path: '/supplier/customers', label: 'Customers', icon: '👥' },
    // { path: '/supplier/analytics', label: 'Analytics', icon: '📈' },
    // { path: '/supplier/chat', label: 'Communication', icon: '💬' },
    // { path: '/supplier/trust-score', label: 'Trust Score', icon: '' }
  ];

  const menuItems = user?.role === 'vendor' ? vendorMenuItems : supplierMenuItems;

  return (
    <aside className="dashboard-sidebar">
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
    </aside>
  );
};

export default Sidebar; 
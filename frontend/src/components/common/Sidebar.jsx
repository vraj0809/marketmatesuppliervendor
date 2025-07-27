import React, { useContext } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import styles from '../../styles/Sidebar.module.css';

const Sidebar = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  const vendorMenuItems = [
    { path: '/vendor/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/vendor/products', label: 'Browse Materials', icon: '🔍' },
    { path: '/vendor/suppliers', label: 'Search Suppliers', icon: '🏢' },
    { path: '/vendor/orders', label: 'Order Management', icon: '📦' },
    { path: '/vendor/analytics', label: 'Analytics', icon: '📈' },
    { path: '/vendor/chat', label: 'Communication', icon: '💬' },
    { path: '/vendor/notifications', label: 'Notifications', icon: '🔔' }
  ];

  const supplierMenuItems = [
    { path: '/supplier/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/supplier/products', label: 'Product Catalog', icon: '📋' },
    { path: '/supplier/add_product', label: 'AddProduct', icon: '📋' },
    { path: '/supplier/orders', label: 'Order Management', icon: '📦' },
    { path: '/supplier/customers', label: 'Customers', icon: '👥' },
    { path: '/supplier/analytics', label: 'Analytics', icon: '📈' },
    { path: '/supplier/chat', label: 'Communication', icon: '💬' },
    { path: '/supplier/trust-score', label: 'Trust Score', icon: '⭐' }
  ];

  const menuItems = user?.role === 'vendor' ? vendorMenuItems : supplierMenuItems;

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebar__logo}>
        {user?.role === 'vendor' ? 'Vendor Portal' : 'Supplier Portal'}
      </div>
      
      <nav className={styles.sidebar__nav}>
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `${styles.sidebar__link} ${isActive ? styles['sidebar__link--active'] : ''}`
            }
          >
            <span className={styles.sidebar__icon}>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar; 
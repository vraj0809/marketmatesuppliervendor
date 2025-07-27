import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './Dashboard/Header';
import Sidebar from './Dashboard/Sidebar';
import Footer from './Dashboard/Footer';
import DashboardOverview from './Dashboard/DashboardOverview';
import OrderManagement from './Dashboard/OrderManagement';
import styles from '../styles/VendorDashboard.module.css';
import ProductList from './ProductList';
import SearchSuppliers from './Dashboard/SearchSuppliers';

// const Analytics = () => <div>Analytics</div>;
// const Chat = () => <div>Communication Hub</div>;
// const Notifications = () => <div>Notifications</div>;

const VendorDashboard = () => {
  return (
    <div className={styles.dashboard}>
      <Header />
      <div className={styles.dashboard__main}>
        <Sidebar />
        <main className={styles.dashboard__content}>
          <Routes>
            <Route path="/" element={<Navigate to="dashboard" replace />} />
            {/* <Route path="dashboard" element={<DashboardOverview />} /> */}
            <Route path="products" element={<ProductList />} />
            <Route path="suppliers" element={<SearchSuppliers />} />
            <Route path="orders" element={<OrderManagement />} />
            {/* <Route path="analytics" element={<Analytics />} />
            <Route path="chat" element={<Chat />} />
            <Route path="notifications" element={<Notifications />} /> */}
          </Routes>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default VendorDashboard;
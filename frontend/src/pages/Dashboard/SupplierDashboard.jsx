import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  LineChart, Line, PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Legend
} from 'recharts';
import '../../CSS/SupplierDashboard.css';

const SupplierDashboard = () => {
  // State management
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('monthly');
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  const [notifications, setNotifications] = useState([]);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get('/api/supplier/dashboard/overview');
      setDashboardData(res.data);
      // Optionally fetch notifications
      // const notifRes = await axios.get('/api/supplier/notifications');
      // setNotifications(notifRes.data);
    } catch (err) {
      setError('Failed to load dashboard data');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 60000); // auto-refresh every 60s
    return () => clearInterval(interval);
  }, []);

  // UI rendering
  if (loading) return <div className="supplierdashboard-loading">Loading...</div>;
  if (error) return <div className="supplierdashboard-error">{error}</div>;
  if (!dashboardData) return null;

  // Destructure dashboardData for easier access
  const { revenue, orderStatus, topProducts, performance, vendorAnalytics, categoryTrends } = dashboardData;

  return (
    <div className="supplierdashboard-container">
      {/* Revenue Metrics Section */}
      <section className="supplierdashboard-revenue-section">
        <h2 className="supplierdashboard-section-title">Revenue Overview</h2>
        <div className="supplierdashboard-revenue-cards">
          <div className="supplierdashboard-metric-card">
            <span className="supplierdashboard-metric-label">Total Revenue</span>
            <span className="supplierdashboard-metric-value">${revenue.totalRevenue?.toLocaleString()}</span>
          </div>
          <div className="supplierdashboard-metric-card">
            <span className="supplierdashboard-metric-label">Total Orders</span>
            <span className="supplierdashboard-metric-value">{revenue.totalOrders}</span>
          </div>
          <div className="supplierdashboard-metric-card">
            <span className="supplierdashboard-metric-label">Avg Order Value</span>
            <span className="supplierdashboard-metric-value">${revenue.avgOrderValue?.toFixed(2)}</span>
          </div>
        </div>
        {/* Revenue Chart Placeholder */}
        <div className="supplierdashboard-chart-container">
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={[]}>
              <Line type="monotone" dataKey="revenue" stroke="#4caf50" />
              <Tooltip />
              <XAxis dataKey="date" />
              <YAxis />
              <Legend />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Order Analytics Section */}
      <section className="supplierdashboard-orders-section">
        <h2 className="supplierdashboard-section-title">Order Analytics</h2>
        <div className="supplierdashboard-orders-grid">
          <div className="supplierdashboard-order-card">Pending: {orderStatus.pendingOrders}</div>
          <div className="supplierdashboard-order-card">Completed: {orderStatus.completedOrders}</div>
          <div className="supplierdashboard-order-card">Shipped: {orderStatus.shippedOrders}</div>
          <div className="supplierdashboard-order-card">Delivered: {orderStatus.deliveredOrders}</div>
        </div>
        {/* Order Status Pie Chart Placeholder */}
        <div className="supplierdashboard-chart-container">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie dataKey="value" data={[
                { name: 'Pending', value: orderStatus.pendingOrders },
                { name: 'Completed', value: orderStatus.completedOrders },
                { name: 'Shipped', value: orderStatus.shippedOrders },
                { name: 'Delivered', value: orderStatus.deliveredOrders },
              ]} cx="50%" cy="50%" outerRadius={60} fill="#8884d8" label />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Performance KPIs Section */}
      <section className="supplierdashboard-kpi-section">
        <h2 className="supplierdashboard-section-title">Performance KPIs</h2>
        <div className="supplierdashboard-kpi-cards">
          <div className="supplierdashboard-kpi-card">
            <span className="supplierdashboard-kpi-label">Satisfaction</span>
            <span className="supplierdashboard-kpi-value">{performance.satisfactionScore?.toFixed(2)}/5</span>
          </div>
          <div className="supplierdashboard-kpi-card">
            <span className="supplierdashboard-kpi-label">Trust Score</span>
            <span className="supplierdashboard-kpi-value">{performance.trustScore}/100</span>
          </div>
          <div className="supplierdashboard-kpi-card">
            <span className="supplierdashboard-kpi-label">Delivery Success</span>
            <span className="supplierdashboard-kpi-value">{performance.deliverySuccess}%</span>
          </div>
          <div className="supplierdashboard-kpi-card">
            <span className="supplierdashboard-kpi-label">Response Time</span>
            <span className="supplierdashboard-kpi-value">{performance.responseTime}h</span>
          </div>
        </div>
      </section>

      {/* Top Products Section */}
      <section className="supplierdashboard-products-section">
        <h2 className="supplierdashboard-section-title">Top Products</h2>
        <div className="supplierdashboard-products-list">
          {topProducts.map((prod, idx) => (
            <div className="supplierdashboard-product-card" key={prod._id || idx}>
              <img src={prod.images?.[0] || '/placeholder.png'} alt={prod.name} className="supplierdashboard-product-img" />
              <div className="supplierdashboard-product-info">
                <span className="supplierdashboard-product-name">{prod.name}</span>
                <span className="supplierdashboard-product-sold">Sold: {prod.salesAnalytics?.totalSold || 0}</span>
                <span className="supplierdashboard-product-revenue">Revenue: ${prod.salesAnalytics?.revenueContribution?.toLocaleString() || 0}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Vendor Analytics Section */}
      <section className="supplierdashboard-vendor-section">
        <h2 className="supplierdashboard-section-title">Vendor Analytics</h2>
        <div className="supplierdashboard-vendor-cards">
          <div className="supplierdashboard-vendor-card">New Vendors: {vendorAnalytics.newVendors}</div>
          <div className="supplierdashboard-vendor-card">Repeat Vendors: {vendorAnalytics.repeatVendors}</div>
          <div className="supplierdashboard-vendor-card">Vendor LTV: ${vendorAnalytics.vendorLifetimeValue?.toFixed(2)}</div>
        </div>
      </section>

      {/* Market Trends Section */}
      <section className="supplierdashboard-market-section">
        <h2 className="supplierdashboard-section-title">Market Trends</h2>
        <div className="supplierdashboard-market-list">
          {categoryTrends.map((cat, idx) => (
            <div className="supplierdashboard-market-card" key={cat._id || idx}>
              <span className="supplierdashboard-market-category">{cat._id}</span>
              <span className="supplierdashboard-market-sold">Sold: {cat.totalSold}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Actions Panel (Floating) */}
      <div className="supplierdashboard-quick-actions">
        <button className="supplierdashboard-action-btn">Add Product</button>
        <button className="supplierdashboard-action-btn">Process Orders</button>
        <button className="supplierdashboard-action-btn">Unread Messages</button>
        <button className="supplierdashboard-action-btn">Update Inventory</button>
      </div>
    </div>
  );
};

export default SupplierDashboard; 
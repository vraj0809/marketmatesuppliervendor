import React from 'react';
import '../../styles/Dashboard/DashboardOverview.css';

const DashboardOverview = () => {
  const recentActivities = [
    { id: 1, action: 'Confirm order update', status: 'urgent', icon: '✅', time: '2 mins ago' },
    { id: 2, action: 'Finish shipping update', status: 'urgent', icon: '⚠️', time: '5 mins ago' },
    { id: 3, action: 'Create new order', status: 'new', icon: '⭕', time: '10 mins ago' },
    { id: 4, action: 'Update payment report', status: 'default', icon: '✅', time: '1 hour ago' }
  ];

  const inboxMessages = [
    { id: 1, message: 'Waiting for order#12345', time: '4:39', group: 'Support' },
    { id: 2, message: 'Customer support id#22234', time: '11:07', group: 'Support' },
    { id: 3, message: 'Payment confirmation required', time: '2:15', group: 'Finance' }
  ];

  return (
    <div className="dashboard-overview">
      {/* Overview Header */}
      <div className="overview-header">
        <h1 className="overview-title">Dashboard Overview</h1>
        <p className="overview-subtitle">Welcome back! Here's what's happening with your business today.</p>
      </div>

      {/* Statistics Grid */}
      <div className="stats-grid">
        <div className="stat-card revenue">
          <div className="stat-header">
            <h3 className="stat-title">Total Revenue</h3>
            <div className="stat-icon revenue">💰</div>
          </div>
          <p className="stat-value">$45,365.00</p>
          <div className="stat-change positive">
            <span>▲ 12.5%</span>
            <span>from last month</span>
          </div>
        </div>

        <div className="stat-card orders">
          <div className="stat-header">
            <h3 className="stat-title">Total Orders</h3>
            <div className="stat-icon orders">📦</div>
          </div>
          <p className="stat-value">42</p>
          <div className="stat-change positive">
            <span>▲ 8.2%</span>
            <span>from last week</span>
          </div>
        </div>

        <div className="stat-card products">
          <div className="stat-header">
            <h3 className="stat-title">Active Products</h3>
            <div className="stat-icon products">🏷️</div>
          </div>
          <p className="stat-value">156</p>
          <div className="stat-change positive">
            <span>▲ 3.1%</span>
            <span>from last month</span>
          </div>
        </div>

        <div className="stat-card customers">
          <div className="stat-header">
            <h3 className="stat-title">Total Customers</h3>
            <div className="stat-icon customers">👥</div>
          </div>
          <p className="stat-value">1,234</p>
          <div className="stat-change positive">
            <span>▲ 15.3%</span>
            <span>from last month</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Sales Overview</h3>
            <div className="chart-actions">
              <button className="chart-btn active">7 Days</button>
              <button className="chart-btn">30 Days</button>
              <button className="chart-btn">90 Days</button>
            </div>
          </div>
          <div className="chart-container">
            {/* Placeholder for chart */}
            <div style={{ height: '200px', background: '#f8f9fa', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6c757d' }}>
              Chart Component
            </div>
          </div>
        </div>

        <div className="recent-activity">
          <div className="activity-header">
            <h3 className="activity-title">Recent Activity</h3>
            <button className="chart-btn">View All</button>
          </div>
          
          <ul className="activity-list">
            {recentActivities.map((activity) => (
              <li key={activity.id} className="activity-item">
                <div className="activity-icon">{activity.icon}</div>
                <div className="activity-content">
                  <p className="activity-text">{activity.action}</p>
                  <p className="activity-time">{activity.time}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
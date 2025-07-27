import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import '../../styles/Dashboard/SupplierOrderManagement.css';

const SupplierOrderManagement = () => {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Fetch supplier orders
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/supplier/orders', {
        credentials: 'include'
      });
      const data = await response.json();
      if (response.ok) {
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update order status
  const updateOrderStatus = async (orderId, newStatus, notes = '') => {
    try {
      setLoading(true);
      const response = await fetch(`/api/supplier/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ 
          status: newStatus,
          notes: notes
        })
      });

      const data = await response.json();
      if (response.ok) {
        alert(`Order ${newStatus} successfully!`);
        fetchOrders();
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder(data.order);
        }
      } else {
        alert(data.error || 'Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status');
    } finally {
      setLoading(false);
    }
  };

  // Approve/Reject order
  const handleOrderAction = async (orderId, action, reason = '') => {
    const status = action === 'approve' ? 'confirmed' : 'cancelled';
    const notes = action === 'approve' ? 'Order approved by supplier' : `Order rejected: ${reason}`;
    await updateOrderStatus(orderId, status, notes);
  };

  // Handle status progression
  const handleStatusProgression = async (orderId, currentStatus) => {
    let nextStatus = '';
    
    switch (currentStatus) {
      case 'confirmed':
        nextStatus = 'packaging';
        break;
      case 'packaging':
        nextStatus = 'ready';
        break;
      case 'ready':
        nextStatus = 'on_the_way';
        break;
      case 'on_the_way':
        nextStatus = 'approach';
        break;
      case 'approach':
        nextStatus = 'delivered';
        break;
      default:
        return;
    }

    await updateOrderStatus(orderId, nextStatus);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#f39c12';
      case 'confirmed': return '#3498db';
      case 'packaging': return '#9b59b6';
      case 'ready': return '#2ecc71';
      case 'on_the_way': return '#e67e22';
      case 'approach': return '#e74c3c';
      case 'delivered': return '#27ae60';
      case 'cancelled': return '#95a5a6';
      default: return '#bdc3c7';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Pending Approval';
      case 'confirmed': return 'Confirmed';
      case 'packaging': return 'Packaging';
      case 'ready': return 'Ready';
      case 'on_the_way': return 'On The Way';
      case 'approach': return 'Approach';
      case 'delivered': return 'Delivered';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  const getNextStatusButton = (status) => {
    switch (status) {
      case 'confirmed':
        return { text: 'Start Packaging', nextStatus: 'packaging' };
      case 'packaging':
        return { text: 'Mark Ready', nextStatus: 'ready' };
      case 'ready':
        return { text: 'On The Way', nextStatus: 'on_the_way' };
      case 'on_the_way':
        return { text: 'Approaching', nextStatus: 'approach' };
      case 'approach':
        return { text: 'Mark Delivered', nextStatus: 'delivered' };
      default:
        return null;
    }
  };

  const openOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  const pendingOrders = orders.filter(order => order.status === 'pending');
  const activeOrders = orders.filter(order => 
    ['confirmed', 'packaging', 'ready', 'on_the_way', 'approach'].includes(order.status)
  );
  const completedOrders = orders.filter(order => 
    ['delivered', 'cancelled'].includes(order.status)
  );

  return (
    <div className="modern-supplier-dashboard">
      {/* Enhanced Header Section */}
      <div className="dashboard-header-1">
        <div className="header-content">
          <div className="header-title-section">
            <h1 className="main-title">Order Management</h1>
            <p className="header-subtitle">Manage your orders efficiently with real-time tracking</p>
          </div>
          <div className="header-actions">
            <button className="refresh-btn" onClick={fetchOrders}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 4v6h-6M1 20v-6h6M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
              </svg>
              Refresh
            </button>
          </div>
        </div>
        
        {/* Beautiful Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card pending-card">
            <div className="stat-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12,6 12,12 16,14"/>
              </svg>
            </div>
            <div className="stat-content">
              <h3 className="stat-number">{pendingOrders.length}</h3>
              <p className="stat-label">Pending Approval</p>
            </div>
            <div className="stat-trend">
              <span className="trend-indicator up">↗</span>
            </div>
          </div>
          
          <div className="stat-card active-card">
            <div className="stat-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <div className="stat-content">
              <h3 className="stat-number">{activeOrders.length}</h3>
              <p className="stat-label">Active Orders</p>
            </div>
            <div className="stat-trend">
              <span className="trend-indicator up">↗</span>
            </div>
          </div>
          
          <div className="stat-card completed-card">
            <div className="stat-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22,4 12,14.01 9,11.01"/>
              </svg>
            </div>
            <div className="stat-content">
              <h3 className="stat-number">{completedOrders.length}</h3>
              <p className="stat-label">Completed</p>
            </div>
            <div className="stat-trend">
              <span className="trend-indicator up">↗</span>
            </div>
          </div>
        </div>
      </div>

      {loading && (
        <div className="modern-loading">
          <div className="loading-spinner"></div>
          <p>Loading orders...</p>
        </div>
      )}

      {/* Pending Orders Section */}
      {pendingOrders.length > 0 && (
        <div className="orders-section">
          <div className="section-header">
            <h2 className="section-title">
              <span className="section-icon pending">⏳</span>
              Pending Approval ({pendingOrders.length})
            </h2>
          </div>
          <div className="modern-orders-grid">
            {pendingOrders.map(order => (
              <div key={order._id} className="modern-order-card pending-order">
                <div className="card-header">
                  <div className="order-id">
                    <h4>#{order.orderNumber}</h4>
                    <span className="order-date">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="status-badge pending-status">
                    {getStatusText(order.status)}
                  </div>
                </div>
                
                <div className="card-content">
                  <div className="order-summary">
                    <div className="summary-item">
                      <span className="summary-label">Total Amount</span>
                      <span className="summary-value">₹{order.total}</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Items</span>
                      <span className="summary-value">{order.items?.length || 0}</span>
                    </div>
                  </div>
                </div>

                <div className="card-actions">
                  <button 
                    className="action-btn approve-btn"
                    onClick={() => handleOrderAction(order._id, 'approve')}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20,6 9,17 4,12"/>
                    </svg>
                    Approve
                  </button>
                  <button 
                    className="action-btn reject-btn"
                    onClick={() => {
                      const reason = prompt('Reason for rejection:');
                      if (reason) handleOrderAction(order._id, 'reject', reason);
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                    Reject
                  </button>
                  <button 
                    className="action-btn details-btn"
                    onClick={() => openOrderDetails(order)}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="3"/>
                      <path d="M12 1v6m0 6v6"/>
                    </svg>
                    Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Orders Section */}
      {activeOrders.length > 0 && (
        <div className="orders-section">
          <div className="section-header">
            <h2 className="section-title">
              <span className="section-icon active">🚀</span>
              Active Orders ({activeOrders.length})
            </h2>
          </div>
          <div className="modern-orders-grid">
            {activeOrders.map(order => {
              const nextButton = getNextStatusButton(order.status);
              return (
                <div key={order._id} className="modern-order-card active-order">
                  <div className="card-header">
                    <div className="order-id">
                      <h4>#{order.orderNumber}</h4>
                      <span className="order-date">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="status-badge active-status">
                      {getStatusText(order.status)}
                    </div>
                  </div>
                  
                  <div className="card-content">
                    <div className="order-summary">
                      <div className="summary-item">
                        <span className="summary-label">Total Amount</span>
                        <span className="summary-value">₹{order.total}</span>
                      </div>
                      <div className="summary-item">
                        <span className="summary-label">Items</span>
                        <span className="summary-value">{order.items?.length || 0}</span>
                      </div>
                    </div>

                    {/* Enhanced Progress Bar */}
                    <div className="modern-progress-container">
                      <div className="progress-track">
                        {['confirmed', 'packaging', 'ready', 'on_the_way', 'approach', 'delivered'].map((step, index) => {
                          const stepIndex = ['confirmed', 'packaging', 'ready', 'on_the_way', 'approach', 'delivered'].indexOf(order.status);
                          const isCompleted = index <= stepIndex;
                          const isCurrent = index === stepIndex;
                          
                          return (
                            <div key={step} className={`progress-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}>
                              <div className="step-marker">
                                {isCompleted && (
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                    <polyline points="20,6 9,17 4,12"/>
                                  </svg>
                                )}
                              </div>
                              <span className="step-text">{getStatusText(step)}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="card-actions">
                    {nextButton && (
                      <button 
                        className="action-btn progress-btn"
                        onClick={() => handleStatusProgression(order._id, order.status)}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="5" y1="12" x2="19" y2="12"/>
                          <polyline points="12,5 19,12 12,19"/>
                        </svg>
                        {nextButton.text}
                      </button>
                    )}
                    <button 
                      className="action-btn details-btn"
                      onClick={() => openOrderDetails(order)}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="3"/>
                        <path d="M12 1v6m0 6v6"/>
                      </svg>
                      Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Completed Orders Section */}
      {completedOrders.length > 0 && (
        <div className="orders-section">
          <div className="section-header">
            <h2 className="section-title">
              <span className="section-icon completed">✅</span>
              Completed Orders ({completedOrders.length})
            </h2>
          </div>
          <div className="modern-orders-grid">
            {completedOrders.map(order => (
              <div key={order._id} className="modern-order-card completed-order">
                <div className="card-header">
                  <div className="order-id">
                    <h4>#{order.orderNumber}</h4>
                    <span className="order-date">
                      {new Date(order.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="status-badge completed-status">
                    {getStatusText(order.status)}
                  </div>
                </div>
                
                <div className="card-content">
                  <div className="order-summary">
                    <div className="summary-item">
                      <span className="summary-label">Total Amount</span>
                      <span className="summary-value">₹{order.total}</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Items</span>
                      <span className="summary-value">{order.items?.length || 0}</span>
                    </div>
                  </div>
                </div>

                <div className="card-actions">
                  <button 
                    className="action-btn details-btn"
                    onClick={() => openOrderDetails(order)}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="3"/>
                      <path d="M12 1v6m0 6v6"/>
                    </svg>
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Enhanced Modal */}
      {showDetailsModal && selectedOrder && (
        <div className="modern-modal-overlay">
          <div className="modern-modal">
            <div className="modal-header">
              <div className="modal-title-section">
                <h3>Order Details</h3>
                <span className="modal-order-id">#{selectedOrder.orderNumber}</span>
              </div>
              <button 
                className="modal-close-btn"
                onClick={() => setShowDetailsModal(false)}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            
            <div className="modal-content">
              <div className="modal-section">
                <h4 className="modal-section-title">Order Information</h4>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Status</span>
                    <span className="info-value">{getStatusText(selectedOrder.status)}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Total Amount</span>
                    <span className="info-value">₹{selectedOrder.total}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Order Date</span>
                    <span className="info-value">{new Date(selectedOrder.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Notes</span>
                    <span className="info-value">{selectedOrder.notes || 'No notes'}</span>
                  </div>
                </div>
              </div>

              <div className="modal-section">
                <h4 className="modal-section-title">Order Items</h4>
                <div className="items-table">
                  <div className="table-header">
                    <span>Item</span>
                    <span>Quantity</span>
                    <span>Price</span>
                    <span>Total</span>
                  </div>
                  {selectedOrder.items?.map((item, index) => (
                    <div key={index} className="table-row">
                      <span className="item-name">{item.name}</span>
                      <span className="item-quantity">{item.quantity}</span>
                      <span className="item-price">₹{item.price}</span>
                      <span className="item-total">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedOrder.tracking?.statusHistory && (
                <div className="modal-section">
                  <h4 className="modal-section-title">Order Timeline</h4>
                  <div className="timeline">
                    {selectedOrder.tracking.statusHistory.map((history, index) => (
                      <div key={index} className="timeline-item">
                        <div className="timeline-marker"></div>
                        <div className="timeline-content">
                          <div className="timeline-header">
                            <span className="timeline-status">{getStatusText(history.status)}</span>
                            <span className="timeline-date">
                              {new Date(history.timestamp).toLocaleString()}
                            </span>
                          </div>
                          {history.notes && (
                            <p className="timeline-notes">{history.notes}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button 
                className="modal-btn secondary"
                onClick={() => setShowDetailsModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {orders.length === 0 && !loading && (
        <div className="empty-state">
          <div className="empty-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <circle cx="12" cy="12" r="10"/>
              <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
              <line x1="9" y1="9" x2="9.01" y2="9"/>
              <line x1="15" y1="9" x2="15.01" y2="9"/>
            </svg>
          </div>
          <h3>No orders found</h3>
          <p>You haven't received any orders yet. Orders will appear here once customers start placing them.</p>
        </div>
      )}
    </div>
  );
};

export default SupplierOrderManagement;
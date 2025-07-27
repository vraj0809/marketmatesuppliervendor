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
    <div className="supplier-order-management">
      <div className="order-management-header">
        <h2>Order Management</h2>
        <div className="order-stats">
          <div className="stat-card">
            <h3>{pendingOrders.length}</h3>
            <p>Pending Approval</p>
          </div>
          <div className="stat-card">
            <h3>{activeOrders.length}</h3>
            <p>Active Orders</p>
          </div>
          <div className="stat-card">
            <h3>{completedOrders.length}</h3>
            <p>Completed</p>
          </div>
        </div>
      </div>

      {loading && <div className="loading">Loading orders...</div>}

      {/* Pending Orders Section */}
      {pendingOrders.length > 0 && (
        <div className="orders-section">
          <h3>Pending Approval ({pendingOrders.length})</h3>
          <div className="orders-grid">
            {pendingOrders.map(order => (
              <div key={order._id} className="order-card pending">
                <div className="order-header-info">
                  <h4>Order #{order.orderNumber}</h4>
                  <span 
                    className="order-status"
                    style={{ backgroundColor: getStatusColor(order.status) }}
                  >
                    {getStatusText(order.status)}
                  </span>
                </div>
                <div className="order-details">
                  <p><strong>Total:</strong> ₹{order.total}</p>
                  <p><strong>Items:</strong> {order.items?.length || 0}</p>
                  <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="order-actions">
                  <button 
                    className="approve-btn"
                    onClick={() => handleOrderAction(order._id, 'approve')}
                  >
                    Approve
                  </button>
                  <button 
                    className="reject-btn"
                    onClick={() => {
                      const reason = prompt('Reason for rejection:');
                      if (reason) handleOrderAction(order._id, 'reject', reason);
                    }}
                  >
                    Reject
                  </button>
                  <button 
                    className="details-btn"
                    onClick={() => openOrderDetails(order)}
                  >
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
          <h3>Active Orders ({activeOrders.length})</h3>
          <div className="orders-grid">
            {activeOrders.map(order => {
              const nextButton = getNextStatusButton(order.status);
              return (
                <div key={order._id} className="order-card active">
                  <div className="order-header-info">
                    <h4>Order #{order.orderNumber}</h4>
                    <span 
                      className="order-status"
                      style={{ backgroundColor: getStatusColor(order.status) }}
                    >
                      {getStatusText(order.status)}
                    </span>
                  </div>
                  <div className="order-details">
                    <p><strong>Total:</strong> ₹{order.total}</p>
                    <p><strong>Items:</strong> {order.items?.length || 0}</p>
                    <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  
                  {/* Status Progress Bar */}
                  <div className="status-progress">
                    <div className="progress-steps">
                      {['confirmed', 'packaging', 'ready', 'on_the_way', 'approach', 'delivered'].map((step, index) => (
                        <div 
                          key={step}
                          className={`progress-step ${
                            ['confirmed', 'packaging', 'ready', 'on_the_way', 'approach', 'delivered'].indexOf(order.status) >= index ? 'completed' : ''
                          }`}
                        >
                          <div className="step-circle"></div>
                          <span className="step-label">{getStatusText(step)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="order-actions">
                    {nextButton && (
                      <button 
                        className="progress-btn"
                        onClick={() => handleStatusProgression(order._id, order.status)}
                      >
                        {nextButton.text}
                      </button>
                    )}
                    <button 
                      className="details-btn"
                      onClick={() => openOrderDetails(order)}
                    >
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
          <h3>Completed Orders ({completedOrders.length})</h3>
          <div className="orders-grid">
            {completedOrders.map(order => (
              <div key={order._id} className="order-card completed">
                <div className="order-header-info">
                  <h4>Order #{order.orderNumber}</h4>
                  <span 
                    className="order-status"
                    style={{ backgroundColor: getStatusColor(order.status) }}
                  >
                    {getStatusText(order.status)}
                  </span>
                </div>
                <div className="order-details">
                  <p><strong>Total:</strong> ₹{order.total}</p>
                  <p><strong>Items:</strong> {order.items?.length || 0}</p>
                  <p><strong>Completed:</strong> {new Date(order.updatedAt).toLocaleDateString()}</p>
                </div>
                <div className="order-actions">
                  <button 
                    className="details-btn"
                    onClick={() => openOrderDetails(order)}
                  >
                    Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {showDetailsModal && selectedOrder && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Order Details - #{selectedOrder.orderNumber}</h3>
              <button 
                className="close-btn"
                onClick={() => setShowDetailsModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="order-info-section">
                <div className="order-basic-info">
                  <h4>Order Information</h4>
                  <p><strong>Status:</strong> {getStatusText(selectedOrder.status)}</p>
                  <p><strong>Total Amount:</strong> ₹{selectedOrder.total}</p>
                  <p><strong>Order Date:</strong> {new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                  <p><strong>Notes:</strong> {selectedOrder.notes || 'No notes'}</p>
                </div>

                <div className="order-items-section">
                  <h4>Order Items</h4>
                  <div className="items-list">
                    {selectedOrder.items?.map((item, index) => (
                      <div key={index} className="item-row">
                        <span className="item-name">{item.name}</span>
                        <span className="item-quantity">Qty: {item.quantity}</span>
                        <span className="item-price">₹{item.price}</span>
                        <span className="item-total">₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedOrder.tracking?.statusHistory && (
                  <div className="tracking-section">
                    <h4>Order Timeline</h4>
                    <div className="timeline">
                      {selectedOrder.tracking.statusHistory.map((history, index) => (
                        <div key={index} className="timeline-item">
                          <div className="timeline-date">
                            {new Date(history.timestamp).toLocaleString()}
                          </div>
                          <div className="timeline-status">
                            {getStatusText(history.status)}
                          </div>
                          {history.notes && (
                            <div className="timeline-notes">{history.notes}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="close-modal-btn"
                onClick={() => setShowDetailsModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {orders.length === 0 && !loading && (
        <div className="no-orders">
          <h3>No orders found</h3>
          <p>You haven't received any orders yet.</p>
        </div>
      )}
    </div>
  );
};

export default SupplierOrderManagement;
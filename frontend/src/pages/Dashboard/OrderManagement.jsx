import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import "../../styles/Dashboard/SupplierOrderManagement.css";


// Add API base URL configuration
const API_BASE_URL = 'http://localhost:5000'; // Your backend server URL

const OrderManagement = () => {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [supplierProducts, setSupplierProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showProductModal, setShowProductModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('orders');

  // Fetch vendor orders
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/vendor/orders`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (response.ok) {
        setOrders(data.orders || []);
      } else {
        console.error('Error fetching orders:', data.error);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all suppliers from database
  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      console.log('Fetching suppliers from database...');
      
      // Use the correct endpoint with full URL
      const response = await fetch(`${API_BASE_URL}/api/vendor/suppliers`, {
        credentials: 'include'
      });
      
      const data = await response.json();
      console.log('Suppliers response:', data);
      
      if (response.ok) {
        // Handle different response structures
        const suppliersData = data.suppliers || data || [];
        setSuppliers(suppliersData);
        console.log('Loaded suppliers:', suppliersData);
      } else {
        console.error('Error fetching suppliers:', data.error);
        alert('Failed to fetch suppliers: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      alert('Failed to fetch suppliers. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  // FIXED: Fetch supplier products with proper ID handling
  const fetchSupplierProducts = async (supplierId) => {
    try {
      setLoading(true);
      console.log('Fetching products for supplier:', supplierId);

      if (!supplierId) {
        console.error('Invalid supplier ID');
        alert('Invalid supplier selected');
        setSupplierProducts([]);
        setLoading(false);
        return;
      }

      // Clean the supplier ID to ensure it's properly formatted
      const cleanSupplierId = String(supplierId).replace(/[\[\]]/g, '');
      console.log('Cleaned supplier ID:', cleanSupplierId);

      // Validate that it's a valid ObjectId format
      if (!/^[0-9a-fA-F]{24}$/.test(cleanSupplierId)) {
        console.error('Invalid ObjectId format:', cleanSupplierId);
        alert('Invalid supplier ID format');
        setSupplierProducts([]);
        setLoading(false);
        return;
      }
      
      // Use the correct endpoint with full URL and cleaned ID
      const url = `${API_BASE_URL}/api/vendor/suppliers/${cleanSupplierId}/products`;
      console.log('Fetching from URL:', url);
      
      const response = await fetch(url, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error fetching supplier products:', errorData.error || response.statusText);
        alert('Failed to fetch products: ' + (errorData.error || 'Unknown error'));
        setSupplierProducts([]);
        setLoading(false);
        return;
      }

      const data = await response.json();
      console.log('Products response:', data);
      
      // Transform products to include proper image handling
      const transformedProducts = (data.products || []).map(product => ({
        ...product,
        // Ensure image is properly formatted
        image: product.images && product.images.length > 0 
          ? product.images[0] 
          : "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400",
        // Ensure stock is properly set
        stock: product.quantity || product.stock || 0
      }));
      
      setSupplierProducts(transformedProducts);
    } catch (error) {
      console.error('Error fetching supplier products:', error);
      alert('Failed to fetch products');
      setSupplierProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Send order request
  const sendOrderRequest = async () => {
    if (!selectedSupplier || selectedProducts.length === 0) {
      alert('Please select supplier and products');
      return;
    }

    try {
      setLoading(true);
      const orderData = {
        supplierId: selectedSupplier._id,
        vendorId: user._id,
        items: selectedProducts.map(product => ({
          productId: product._id,
          name: product.name,
          quantity: product.selectedQuantity || 1,
          price: product.price,
          unit: product.unit
        })),
        status: 'pending',
        total: selectedProducts.reduce((sum, product) => 
          sum + (product.price * (product.selectedQuantity || 1)), 0
        ),
        orderNumber: `ORD-${Date.now()}`,
        notes: 'Order request from vendor'
      };

      console.log('Sending order data:', orderData);

      const response = await fetch(`${API_BASE_URL}/api/vendor/orders/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(orderData)
      });

      const data = await response.json();
      if (response.ok) {
        alert('Order request sent successfully!');
        setSelectedProducts([]);
        setShowProductModal(false);
        fetchOrders();
      } else {
        alert(data.error || 'Failed to send order request');
      }
    } catch (error) {
      console.error('Error sending order request:', error);
      alert('Failed to send order request');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchSuppliers();
  }, []);

  // FIXED: Handle supplier selection with proper ID validation
  const handleSupplierSelect = (supplier) => {
    console.log('Selected supplier:', supplier);
    
    if (!supplier || !supplier._id) {
      console.error('Invalid supplier object:', supplier);
      alert('Invalid supplier selected');
      return;
    }

    setSelectedSupplier(supplier);
    fetchSupplierProducts(supplier._id);
    setShowProductModal(true);
  };

  const handleProductSelect = (product) => {
    const exists = selectedProducts.find(p => p._id === product._id);
    if (!exists) {
      setSelectedProducts([...selectedProducts, { ...product, selectedQuantity: 1 }]);
    }
  };

  const handleQuantityChange = (productId, quantity) => {
    setSelectedProducts(prev => 
      prev.map(p => p._id === productId ? { ...p, selectedQuantity: parseInt(quantity) } : p)
    );
  };

  const removeProduct = (productId) => {
    setSelectedProducts(prev => prev.filter(p => p._id !== productId));
  };

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

  return (
    <div className="order-management">
      <div className="order-header">
        <h2>Order Management</h2>
        <div className="tab-buttons">
          <button 
            className={activeTab === 'orders' ? 'active' : ''}
            onClick={() => setActiveTab('orders')}
          >
            My Orders
          </button>
          <button 
            className={activeTab === 'create' ? 'active' : ''}
            onClick={() => setActiveTab('create')}
          >
            Create Order
          </button>
        </div>
      </div>

      {activeTab === 'orders' && (
        <div className="orders-list">
          {loading ? (
            <div className="loading">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="no-orders">No orders found</div>
          ) : (
            <div className="orders-grid">
              {orders.map(order => (
                <div key={order._id} className="order-card">
                  <div className="order-header-info">
                    <h3>Order #{order.orderNumber}</h3>
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
                    <p><strong>Created:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
                    {order.deliveryDate && (
                      <p><strong>Delivery:</strong> {new Date(order.deliveryDate).toLocaleDateString()}</p>
                    )}
                  </div>
                  <div className="order-items">
                    <h4>Items:</h4>
                    {order.items?.map((item, index) => (
                      <div key={index} className="order-item">
                        <span>{item.name}</span>
                        <span>Qty: {item.quantity}</span>
                        <span>₹{item.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'create' && (
        <div className="create-order">
          <h3>Select Supplier</h3>
          {loading ? (
            <div className="loading">Loading suppliers...</div>
          ) : suppliers.length === 0 ? (
            <div className="no-orders">
              <p>No suppliers found in database.</p>
              <p>Please make sure suppliers are registered and active.</p>
            </div>
          ) : (
            <div className="suppliers-grid">
              {suppliers.map(supplier => (
                <div 
                  key={supplier._id} 
                  className="supplier-card"
                  onClick={() => handleSupplierSelect(supplier)}
                >
                  <div className="supplier-info">
                    <h4>{supplier.businessName || supplier.name}</h4>
                    <p>Trust Score: {supplier.trustScore || 0}/5</p>
                    <p>Location: {supplier.location?.city || 'N/A'}, {supplier.location?.state || 'N/A'}</p>
                    {supplier.isVerified && <span className="verified-badge">✓ Verified</span>}
                    <p><small>ID: {supplier._id}</small></p>
                  </div>
                  <button className="select-supplier-btn">
                    Select Supplier
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Product Selection Modal */}
      {showProductModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Select Products from {selectedSupplier?.businessName || selectedSupplier?.name}</h3>
              <button 
                className="close-btn"
                onClick={() => setShowProductModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="products-section">
                <h4>Available Products</h4>
                {loading ? (
                  <div className="loading">Loading products...</div>
                ) : supplierProducts.length === 0 ? (
                  <div className="no-orders">
                    <p>No products available from this supplier.</p>
                    <p>Supplier ID: {selectedSupplier?._id}</p>
                  </div>
                ) : (
                  <div className="products-grid">
                    {supplierProducts.map(product => (
                      <div key={product._id} className="product-card">
                        {/* Add product image */}
                        <div className="product-image-container">
                          <img 
                            src={product.image || product.images?.[0] || "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400"} 
                            alt={product.name}
                            className="product-image"
                            onError={(e) => {
                              e.target.src = "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400";
                            }}
                          />
                        </div>
                        <div className="product-info">
                          <h5>{product.name}</h5>
                          <p className="product-description">{product.description}</p>
                          <p className="product-price">Price: ₹{product.price}/{product.unit}</p>
                          <p className="product-stock">Stock: {product.stock || product.quantity || 0}</p>
                        </div>
                        <button 
                          className="add-product-btn"
                          onClick={() => handleProductSelect(product)}
                          disabled={selectedProducts.find(p => p._id === product._id)}
                        >
                          {selectedProducts.find(p => p._id === product._id) ? 'Added' : 'Add'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {selectedProducts.length > 0 && (
                <div className="selected-products">
                  <h4>Selected Products</h4>
                  <div className="selected-products-list">
                    {selectedProducts.map(product => (
                      <div key={product._id} className="selected-product">
                        <img 
                          src={product.image || product.images?.[0] || "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400"} 
                          alt={product.name}
                          className="selected-product-image"
                          onError={(e) => {
                            e.target.src = "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400";
                          }}
                        />
                        <span className="selected-product-name">{product.name}</span>
                        <input
                          type="number"
                          min="1"
                          max={product.stock || product.quantity || 999}
                          value={product.selectedQuantity}
                          onChange={(e) => handleQuantityChange(product._id, e.target.value)}
                          className="quantity-input"
                        />
                        <span className="selected-product-total">₹{product.price * product.selectedQuantity}</span>
                        <button 
                          className="remove-btn"
                          onClick={() => removeProduct(product._id)}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="order-total">
                    <strong>
                      Total: ₹{selectedProducts.reduce((sum, p) => sum + (p.price * p.selectedQuantity), 0)}
                    </strong>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button 
                className="cancel-btn"
                onClick={() => setShowProductModal(false)}
              >
                Cancel
              </button>
              <button 
                className="send-request-btn"
                onClick={sendOrderRequest}
                disabled={selectedProducts.length === 0 || loading}
              >
                {loading ? 'Sending...' : 'Send Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
import React, { useState } from 'react';
import '../styles/Dashboard/Products.css';

const Products = () => {
  const [products, setProducts] = useState([
    {
      id: 1,
      name: 'Premium Steel',
      category: 'Raw Materials',
      price: 1250.00,
      stock: 45,
      status: 'active',
      image: 'https://via.placeholder.com/60x60'
    },
    {
      id: 2,
      name: 'Aluminum Sheets',
      category: 'Raw Materials',
      price: 890.00,
      stock: 12,
      status: 'active',
      image: 'https://via.placeholder.com/60x60'
    },
    {
      id: 3,
      name: 'Copper Wire',
      category: 'Components',
      price: 450.00,
      stock: 0,
      status: 'inactive',
      image: 'https://via.placeholder.com/60x60'
    }
  ]);

  const [filters, setFilters] = useState({
    search: '',
    category: '',
    status: ''
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return 'out-of-stock';
    if (stock < 20) return 'low-stock';
    return 'in-stock';
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(filters.search.toLowerCase());
    const matchesCategory = !filters.category || product.category === filters.category;
    const matchesStatus = !filters.status || product.status === filters.status;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="products-container">
      <div className="products-header">
        <h1 className="products-title">Product Management</h1>
        <button className="add-product-btn">
          <span>+</span>
          Add Product
        </button>
      </div>

      <div className="products-filters">
        <div className="filters-row">
          <div className="filter-group">
            <label className="filter-label">Search Products</label>
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search by name..."
              className="filter-input"
            />
          </div>
          
          <div className="filter-group">
            <label className="filter-label">Category</label>
            <select
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              className="filter-select"
            >
              <option value="">All Categories</option>
              <option value="Raw Materials">Raw Materials</option>
              <option value="Components">Components</option>
              <option value="Finished Goods">Finished Goods</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label className="filter-label">Status</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="filter-select"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      <div className="products-table">
        <div className="table-header">
          <h2 className="table-title">Product List</h2>
        </div>
        
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id}>
                  <td>
                    <div className="product-info">
                      <img src={product.image} alt={product.name} className="product-image" />
                      <div>
                        <p className="product-name">{product.name}</p>
                        <p className="product-category">{product.category}</p>
                      </div>
                    </div>
                  </td>
                  <td>{product.category}</td>
                  <td>
                    <span className="product-price">${product.price.toFixed(2)}</span>
                  </td>
                  <td>
                    <div className="product-stock">
                      <span className={`stock-indicator ${getStockStatus(product.stock)}`}></span>
                      {product.stock} units
                    </div>
                  </td>
                  <td>
                    <span className={`product-status ${product.status}`}>
                      {product.status}
                    </span>
                  </td>
                  <td>
                    <div className="product-actions">
                      <button className="action-btn view-btn" title="View">
                        👁️
                      </button>
                      <button className="action-btn edit-btn" title="Edit">
                        ✏️
                      </button>
                      <button className="action-btn delete-btn" title="Delete">
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="pagination">
        <button className="pagination-btn" disabled>Previous</button>
        <button className="pagination-btn active">1</button>
        <button className="pagination-btn">2</button>
        <button className="pagination-btn">3</button>
        <button className="pagination-btn">Next</button>
      </div>
    </div>
  );
};

export default Products;
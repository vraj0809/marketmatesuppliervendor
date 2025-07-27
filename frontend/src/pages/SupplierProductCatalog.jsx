import React, { useEffect, useState } from 'react';
import '../styles/Dashboard/SupplierProductCatalog.css';

const initialProductState = {
  name: '',
  category: '',
  price: '',
  unit: '',
  quantity: '',
  description: '',
};

const SupplierProductCatalog = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newProduct, setNewProduct] = useState(initialProductState);
  const [editProduct, setEditProduct] = useState(initialProductState);
  const [editId, setEditId] = useState(null);
  const [addError, setAddError] = useState(null);
  const [addLoading, setAddLoading] = useState(false);
  const [editError, setEditError] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/supplier/products', {
        credentials: 'include',
      });
      const rawText = await res.text();
      let data;
      try {
        data = JSON.parse(rawText);
      } catch (jsonErr) {
        setError(`Invalid JSON response: ${rawText.substring(0, 200)}`);
        setLoading(false);
        return;
      }
      if (!data.success) throw new Error(data.message || 'Failed to fetch products');
      setProducts(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    // Use static categories instead of fetching from backend
    const staticCategories = [
      { _id: '1', name: 'Electronics' },
      { _id: '2', name: 'Clothing' },
      { _id: '3', name: 'Home & Kitchen' },
      { _id: '4', name: 'Books' },
      { _id: '5', name: 'Sports' },
      { _id: '6', name: 'Toys' },
    ];
    setCategories(staticCategories);
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setAddLoading(true);
    setAddError(null);
    if (!newProduct.name || !newProduct.category || !newProduct.price || !newProduct.unit || !newProduct.quantity) {
      setAddError('Please fill in all required fields.');
      setAddLoading(false);
      return;
    }
    try {
      const res = await fetch('/api/supplier/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...newProduct,
          price: Number(newProduct.price),
          quantity: Number(newProduct.quantity),
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Failed to add product');
      setShowAddModal(false);
      setNewProduct(initialProductState);
      fetchProducts();
    } catch (err) {
      setAddError(err.message);
    } finally {
      setAddLoading(false);
    }
  };

  const handleEditProduct = (product) => {
    setEditId(product._id);
    setEditProduct({
      name: product.name || '',
      category: product.category || '',
      price: product.price || '',
      unit: product.unit || '',
      quantity: product.quantity || '',
      description: product.description || '',
    });
    setShowEditModal(true);
    setEditError(null);
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError(null);
    if (!editProduct.name || !editProduct.category || !editProduct.price || !editProduct.unit || !editProduct.quantity) {
      setEditError('Please fill in all required fields.');
      setEditLoading(false);
      return;
    }
    try {
      const res = await fetch(`/api/supplier/products/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...editProduct,
          price: Number(editProduct.price),
          quantity: Number(editProduct.quantity),
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Failed to update product');
      setShowEditModal(false);
      setEditId(null);
      fetchProducts();
    } catch (err) {
      setEditError(err.message);
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/supplier/products/${id}`, { method: 'DELETE', credentials: 'include' });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Failed to delete product');
      setDeleteId(null);
      fetchProducts();
    } catch (err) {
      setDeleteError(err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="supplier-product-catalog">
      <header className="catalog-header">
        <h1>Supplier Product Catalog</h1>
        <button className="catalog-add-btn" onClick={() => setShowAddModal(true)}>
          + Add Product
        </button>
      </header>

      <section className="catalog-products-section">
        {loading ? (
          <div className="catalog-loading-skeleton" style={{ height: 200 }} />
        ) : error ? (
          <div className="catalog-error">{error}</div>
        ) : (
          <div className="catalog-product-grid">
            {products.map(product => (
              <div className="catalog-product-card" key={product._id}>
                {/* <img
                  src={product.images && product.images.length > 0 ? product.images[0] : 'https://via.placeholder.com/150'}
                  alt={product.name}
                  className="catalog-product-image"
                /> */}
                <div className="catalog-product-info">
                  <h2 className="catalog-product-name">{product.name}</h2>
                  <div className="catalog-product-category">{product.category}</div>
                  <div className="catalog-product-price">{product.price} / {product.unit}</div>
                  <div className="catalog-product-stock">
                    Stock: {product.quantity}
                  </div>
                </div>
                <button
                  className="catalog-edit-btn"
                  onClick={() => handleEditProduct(product)}
                  style={{ position: 'absolute', top: 12, left: 12 }}
                  aria-label={`Edit ${product.name}`}
                >
                  &#9998;
                </button>
                {/* <button
                  className="catalog-delete-btn"
                  onClick={() => setDeleteId(product._id)}
                  disabled={deleteLoading}
                  style={{ position: 'absolute', top: 12, right: 12 }}
                  aria-label={`Delete ${product.name}`}
                >
                  &#128465;
                </button> */}
              </div>
            ))}
          </div>
        )}
      </section>

      {showAddModal && (
        <div className="catalog-modal" onClick={() => setShowAddModal(false)}>
          <div className="catalog-modal-content" onClick={e => e.stopPropagation()}>
            <h2>Add New Product</h2>
            <form className="catalog-form" onSubmit={handleAddProduct}>
              <label htmlFor="name">
                Name*
                <input
                  id="name"
                  type="text"
                  value={newProduct.name}
                  onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                  required
                />
              </label>
              <label htmlFor="category">
                Category*
                <select
                  id="category"
                  value={newProduct.category}
                  onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
                  required
                >
                  <option value="">Select category</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </label>
              <label htmlFor="price">
                Price*
                <input
                  id="price"
                  type="number"
                  min="0"
                  value={newProduct.price}
                  onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
                  required
                />
              </label>
              <label htmlFor="unit">
                Unit*
                <input
                  id="unit"
                  type="text"
                  value={newProduct.unit}
                  onChange={e => setNewProduct({ ...newProduct, unit: e.target.value })}
                  required
                />
              </label>
              <label htmlFor="quantity">
                Quantity*
                <input
                  id="quantity"
                  type="number"
                  min="0"
                  value={newProduct.quantity}
                  onChange={e => setNewProduct({ ...newProduct, quantity: e.target.value })}
                  required
                />
              </label>
              <label htmlFor="description">
                Description
                <textarea
                  id="description"
                  value={newProduct.description}
                  onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
                />
              </label>
              {addError && <div className="catalog-error">{addError}</div>}
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="submit" className="catalog-add-btn" disabled={addLoading}>
                  {addLoading ? 'Adding...' : 'Add Product'}
                </button>
                <button type="button" className="catalog-cancel-btn" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="catalog-modal" onClick={() => setShowEditModal(false)}>
          <div className="catalog-modal-content" onClick={e => e.stopPropagation()}>
            <h2>Edit Product</h2>
            <form className="catalog-form" onSubmit={handleUpdateProduct}>
              <label>
                Name*
                <input
                  type="text"
                  value={editProduct.name}
                  onChange={e => setEditProduct({ ...editProduct, name: e.target.value })}
                  required
                />
              </label>
              <label>
                Category*
                <select
                  value={editProduct.category}
                  onChange={e => setEditProduct({ ...editProduct, category: e.target.value })}
                  required
                >
                  <option value="">Select category</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </label>
              <label>
                Price*
                <input
                  type="number"
                  min="0"
                  value={editProduct.price}
                  onChange={e => setEditProduct({ ...editProduct, price: e.target.value })}
                  required
                />
              </label>
              <label>
                Unit*
                <input
                  type="text"
                  value={editProduct.unit}
                  onChange={e => setEditProduct({ ...editProduct, unit: e.target.value })}
                  required
                />
              </label>
              <label>
                Quantity*
                <input
                  type="number"
                  min="0"
                  value={editProduct.quantity}
                  onChange={e => setEditProduct({ ...editProduct, quantity: e.target.value })}
                  required
                />
              </label>
              <label>
                Description
                <textarea
                  value={editProduct.description}
                  onChange={e => setEditProduct({ ...editProduct, description: e.target.value })}
                />
              </label>
              {editError && <div className="catalog-error">{editError}</div>}
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="submit" className="catalog-add-btn" disabled={editLoading}>
                  {editLoading ? 'Saving...' : 'Save Changes'}
                </button>
                <button type="button" className="catalog-cancel-btn" onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="catalog-modal" onClick={() => setDeleteId(null)}>
          <div className="catalog-modal-content" onClick={e => e.stopPropagation()}>
            <h2>Delete Product</h2>
            <p>Are you sure you want to delete this product?</p>
            {deleteError && <div className="catalog-error">{deleteError}</div>}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button
                className="catalog-delete-btn"
                onClick={() => handleDeleteProduct(deleteId)}
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Deleting...' : 'Delete'}
              </button>
              <button className="catalog-cancel-btn" onClick={() => setDeleteId(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierProductCatalog; 
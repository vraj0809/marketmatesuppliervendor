import React, { useState, useEffect } from 'react';
import AddProductForm from './Dashboard/AddProductForm';
import '../styles/ProductList.css';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', price: '', description: '' });
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:5000/api/products');
        const json = await response.json();
        if (json.success) {
          setProducts(json.data || []);
        } else {
          setError(json.message || 'Failed to fetch products');
        }
      } catch (err) {
        setError('Failed to fetch products');
      }
      setLoading(false);
    };
    fetchProducts();
  }, []);

  const handleAddProduct = (newProduct) => {
    setProducts((prev) => [...prev, newProduct]);
    setIsAdding(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/products/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        setProducts((prev) => prev.filter((p) => p._id !== id && p.id !== id));
      } else {
        alert(json.message || 'Failed to delete');
      }
    } catch (err) {
      alert('Failed to delete');
    }
  };

  const startEdit = (product) => {
    setEditingProduct(product);
    setEditForm({ name: product.name, price: product.price, description: product.description });
  };

  const handleEditChange = (e) => {
    setEditForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/products/${editingProduct._id || editingProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      const json = await res.json();
      if (json.success) {
        setProducts((prev) => prev.map((p) => (p._id === editingProduct._id || p.id === editingProduct.id ? json.data : p)));
        setEditingProduct(null);
      } else {
        alert(json.message || 'Failed to update');
      }
    } catch (err) {
      alert('Failed to update');
    }
    setEditLoading(false);
  };

  if (isAdding) {
    return <AddProductForm onAdd={handleAddProduct} onBack={() => setIsAdding(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 py-10 px-4 product-list-bg">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight drop-shadow">Product List</h2>
          <button
            onClick={() => setIsAdding(true)}
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-2 rounded-lg shadow hover:scale-105 hover:from-blue-600 hover:to-purple-600 transition-all font-semibold"
          >
            + Add Product
          </button>
        </div>
        {loading ? (
          <div className="text-center text-lg text-gray-500 py-10">Loading...</div>
        ) : error ? (
          <div className="text-center text-red-500 py-10">{error}</div>
        ) : products.length === 0 ? (
          <div className="text-center text-gray-500 py-10">No products found.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {products.map((product) => (
              <div
                key={product._id || product.id}
                className="bg-white rounded-2xl shadow-lg p-6 flex flex-col gap-2 border border-gray-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-200 product-card"
              >
                {editingProduct && (editingProduct._id === product._id || editingProduct.id === product.id) ? (
                  <form onSubmit={handleEditSubmit} className="flex flex-col gap-2">
                    <input
                      name="name"
                      value={editForm.name}
                      onChange={handleEditChange}
                      className="border rounded px-2 py-1"
                      required
                    />
                    <input
                      name="price"
                      type="number"
                      value={editForm.price}
                      onChange={handleEditChange}
                      className="border rounded px-2 py-1"
                      required
                    />
                    <textarea
                      name="description"
                      value={editForm.description}
                      onChange={handleEditChange}
                      className="border rounded px-2 py-1"
                      required
                    />
                    <div className="flex gap-2 mt-2">
                      <button type="submit" className="bg-green-500 text-white px-3 py-1 rounded" disabled={editLoading}>
                        {editLoading ? 'Saving...' : 'Save'}
                      </button>
                      <button type="button" className="bg-gray-300 px-3 py-1 rounded" onClick={() => setEditingProduct(null)}>
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <h3 className="font-bold text-xl text-gray-800 mb-1 truncate">{product.name}</h3>
                    <p className="text-indigo-600 font-semibold text-lg mb-2">${product.price}</p>
                    <p className="text-gray-600 text-sm flex-1">{product.description}</p>
                    <div className="flex gap-2 mt-3">
                      <button
                        className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded transition-all"
                        onClick={() => startEdit(product)}
                      >
                        Edit
                      </button>
                      <button
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition-all"
                        onClick={() => handleDelete(product._id || product.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductList;
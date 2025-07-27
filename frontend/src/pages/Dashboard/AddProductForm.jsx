
// AddProductForm.js
import React, { useState } from 'react';
import '../../styles/Dashboard/AddProductForm.css'

const AddProductForm = ({ onAdd, onBack }) => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: ''
  });

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (result.success) {
        onAdd(result.data); // pass new product back to parent
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error("Error adding product:", error);
      alert("Failed to add product");
    }
  };

  return (
    <div className="add-product-container">
      <div className="add-product-header">
        <h1 className="add-product-title">Add New Product</h1>
        <p className="add-product-subtitle">Fill in the details below to add a new product to your catalog.</p>
      </div>
      
      <form onSubmit={handleSubmit} className="add-product-form">
        <div className="form-section">
          <h2 className="section-title">Basic Information</h2>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label required">Product Name</label>
              <input
                name="name"
                type="text"
                placeholder="Enter product name"
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label required">Price</label>
              <input
                name="price"
                type="number"
                placeholder="Enter price"
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
            
            <div className="form-group full-width">
              <label className="form-label required">Description</label>
              <textarea
                name="description"
                placeholder="Enter product description"
                onChange={handleChange}
                className="form-input form-textarea"
                required
              />
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" onClick={onBack} className="cancel-btn">
            Cancel
          </button>
          <button type="submit" className="save-btn">
            Add Product
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProductForm;

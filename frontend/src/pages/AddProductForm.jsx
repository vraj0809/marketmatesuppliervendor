import React, { useState } from 'react';
import '../CSS/Form.css';

const AddProductForm = ({ onAdd, onBack }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    subcategory: '',
    price: '',
    unit: '',
    quantity: '',
    minOrderQuantity: '',
    images: [],
    specifications: {},
    tags: []
  });
  
  const [loading, setLoading] = useState(false);
  const [specificationKey, setSpecificationKey] = useState('');
  const [specificationValue, setSpecificationValue] = useState('');
  const [tagInput, setTagInput] = useState('');

  const categories = [
    'metals',
    'textiles', 
    'plastics',
    'wood',
    'electronics',
    'chemicals',
    'machinery',
    'tools',
    'other'
  ];

  const units = [
    'kg',
    'gram',
    'ton',
    'liter',
    'meter',
    'piece',
    'box',
    'roll',
    'sheet',
    'foot',
    'yard'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const imageUrls = e.target.value.split(',').map(url => url.trim()).filter(url => url);
    setFormData(prev => ({ ...prev, images: imageUrls }));
  };

  const addSpecification = () => {
    if (specificationKey && specificationValue) {
      setFormData(prev => ({
        ...prev,
        specifications: {
          ...prev.specifications,
          [specificationKey]: specificationValue
        }
      }));
      setSpecificationKey('');
      setSpecificationValue('');
    }
  };

  const removeSpecification = (key) => {
    setFormData(prev => {
      const newSpecs = { ...prev.specifications };
      delete newSpecs[key];
      return { ...prev, specifications: newSpecs };
    });
  };

  const addTag = () => {
    if (tagInput && !formData.tags.includes(tagInput)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Convert string numbers to actual numbers
      const processedData = {
        ...formData,
        price: parseFloat(formData.price),
        quantity: formData.quantity ? parseInt(formData.quantity) : undefined,
        minOrderQuantity: formData.minOrderQuantity ? parseInt(formData.minOrderQuantity) : undefined,
        // Add default supplierId - you should get this from your auth context
        supplierId: '507f1f77bcf86cd799439011' // Replace with actual supplier ID
      };

      const response = await fetch('http://localhost:5000/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(processedData),
      });

      const result = await response.json();
      if (result.success) {
        onAdd(result.data);
        // Reset form
        setFormData({
          name: '',
          description: '',
          category: '',
          subcategory: '',
          price: '',
          unit: '',
          quantity: '',
          minOrderQuantity: '',
          images: [],
          specifications: {},
          tags: []
        });
        alert('Product added successfully!');
      } else {
        alert(result.message || 'Failed to add product');
      }
    } catch (error) {
      console.error("Error adding product:", error);
      alert("Failed to add product. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-product-form-container">
      <div className="form-wrapper">
        <h2 className="form-title">Add New Product</h2>
        
        <form onSubmit={handleSubmit} className="product-form">
          {/* Basic Information */}
          <div className="form-section">
            <h3 className="section-title">Basic Information</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Product Name *</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter product name"
                  value={formData.name}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="description">Description *</label>
                <textarea
                  id="description"
                  name="description"
                  placeholder="Describe your product"
                  value={formData.description}
                  onChange={handleChange}
                  className="form-textarea"
                  rows="4"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="">Select a category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="subcategory">Subcategory</label>
                <input
                  id="subcategory"
                  name="subcategory"
                  type="text"
                  placeholder="Enter subcategory"
                  value={formData.subcategory}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>
          </div>

          {/* Pricing & Inventory */}
          <div className="form-section">
            <h3 className="section-title">Pricing & Inventory</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="price">Price *</label>
                <input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="unit">Unit</label>
                <select
                  id="unit"
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="">Select unit</option>
                  {units.map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="quantity">Available Quantity</label>
                <input
                  id="quantity"
                  name="quantity"
                  type="number"
                  placeholder="Enter available quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="minOrderQuantity">Minimum Order Quantity</label>
                <input
                  id="minOrderQuantity"
                  name="minOrderQuantity"
                  type="number"
                  placeholder="Enter minimum order quantity"
                  value={formData.minOrderQuantity}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="form-section">
            <h3 className="section-title">Product Images</h3>
            <div className="form-group">
              <label htmlFor="images">Image URLs (comma-separated)</label>
              <textarea
                id="images"
                placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                onChange={handleImageChange}
                className="form-textarea"
                rows="3"
              />
              <p className="form-help">Enter image URLs separated by commas</p>
            </div>
          </div>

          {/* Specifications */}
          <div className="form-section">
            <h3 className="section-title">Specifications</h3>
            
            <div className="spec-input-row">
              <input
                type="text"
                placeholder="Specification name"
                value={specificationKey}
                onChange={(e) => setSpecificationKey(e.target.value)}
                className="form-input"
              />
              <input
                type="text"
                placeholder="Specification value"
                value={specificationValue}
                onChange={(e) => setSpecificationValue(e.target.value)}
                className="form-input"
              />
              <button
                type="button"
                onClick={addSpecification}
                className="btn-add-spec"
              >
                Add
              </button>
            </div>

            <div className="specs-list">
              {Object.entries(formData.specifications).map(([key, value]) => (
                <div key={key} className="spec-item">
                  <span><strong>{key}:</strong> {value}</span>
                  <button
                    type="button"
                    onClick={() => removeSpecification(key)}
                    className="btn-remove"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="form-section">
            <h3 className="section-title">Tags</h3>
            
            <div className="tag-input-row">
              <input
                type="text"
                placeholder="Add a tag"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                className="form-input"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <button
                type="button"
                onClick={addTag}
                className="btn-add-tag"
              >
                Add Tag
              </button>
            </div>

            <div className="tags-list">
              {formData.tags.map((tag, index) => (
                <div key={index} className="tag-item">
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="btn-remove-tag"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button 
              type="button" 
              onClick={onBack} 
              className="btn-secondary"
              disabled={loading}
            >
              Back
            </button>
            <button 
              type="submit" 
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Adding Product...' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .add-product-form-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
        }

        .form-wrapper {
          max-width: 800px;
          margin: 0 auto;
          background: white;
          border-radius: 16px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .form-title {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          margin: 0;
          padding: 30px;
          font-size: 28px;
          font-weight: 600;
          text-align: center;
        }

        .product-form {
          padding: 30px;
        }

        .form-section {
          margin-bottom: 40px;
          padding-bottom: 30px;
          border-bottom: 1px solid #e5e7eb;
        }

        .form-section:last-child {
          border-bottom: none;
          margin-bottom: 0;
        }

        .section-title {
          color: #374151;
          font-size: 20px;
          font-weight: 600;
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 2px solid #e5e7eb;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 20px;
        }

        .form-row:last-child {
          margin-bottom: 0;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-row .form-group:only-child {
          grid-column: 1 / -1;
        }

        label {
          color: #374151;
          font-weight: 500;
          margin-bottom: 8px;
          font-size: 14px;
        }

        .form-input,
        .form-select,
        .form-textarea {
          padding: 12px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 16px;
          transition: all 0.3s ease;
          background-color: #f9fafb;
        }

        .form-input:focus,
        .form-select:focus,
        .form-textarea:focus {
          outline: none;
          border-color: #667eea;
          background-color: white;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .form-textarea {
          resize: vertical;
          min-height: 100px;
        }

        .form-help {
          font-size: 12px;
          color: #6b7280;
          margin-top: 5px;
        }

        .spec-input-row,
        .tag-input-row {
          display: flex;
          gap: 10px;
          margin-bottom: 15px;
        }

        .spec-input-row input {
          flex: 1;
        }

        .tag-input-row input {
          flex: 1;
        }

        .btn-add-spec,
        .btn-add-tag {
          padding: 12px 20px;
          background: #10b981;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: background-color 0.2s;
        }

        .btn-add-spec:hover,
        .btn-add-tag:hover {
          background: #059669;
        }

        .specs-list,
        .tags-list {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .spec-item,
        .tag-item {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #f3f4f6;
          padding: 8px 12px;
          border-radius: 20px;
          font-size: 14px;
        }

        .btn-remove,
        .btn-remove-tag {
          background: #ef4444;
          color: white;
          border: none;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          line-height: 1;
        }

        .btn-remove:hover,
        .btn-remove-tag:hover {
          background: #dc2626;
        }

        .form-actions {
          display: flex;
          gap: 15px;
          justify-content: flex-end;
          padding-top: 30px;
          border-top: 1px solid #e5e7eb;
        }

        .btn-primary,
        .btn-secondary {
          padding: 14px 28px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }

        .btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
        }

        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-secondary {
          background: #f3f4f6;
          color: #374151;
          border: 2px solid #e5e7eb;
        }

        .btn-secondary:hover:not(:disabled) {
          background: #e5e7eb;
        }

        @media (max-width: 768px) {
          .add-product-form-container {
            padding: 10px;
          }

          .form-wrapper {
            margin: 0;
            border-radius: 12px;
          }

          .form-title {
            padding: 20px;
            font-size: 24px;
          }

          .product-form {
            padding: 20px;
          }

          .form-row {
            grid-template-columns: 1fr;
            gap: 15px;
          }

          .spec-input-row,
          .tag-input-row {
            flex-direction: column;
          }

          .form-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default AddProductForm;
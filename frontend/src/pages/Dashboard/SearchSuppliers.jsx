// SearchSupplier.jsx

import React, { useState, useEffect, useCallback } from 'react';
import '../../CSS/SearchSuppliers.css';

const initialFilters = {
  location: '',
  distance: 50,
  categories: [],
  minOrder: '',
  paymentTerms: [],
  delivery: [],
  trustScore: [0, 100],
  priceRange: ['', ''],
};

const paymentOptions = ['COD', 'UPI', 'Bank Transfer', 'Credit'];
const deliveryOptions = ['Same Day', 'Next Day', 'Express', 'Standard'];
const categoryOptions = ['Electronics', 'Apparel', 'Food', 'Machinery', 'Other']; // Example

function SearchSuppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState(initialFilters);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedForComparison, setSelectedForComparison] = useState([]);
  const [showComparison, setShowComparison] = useState(false);
  const [favoriteSuppliers, setFavoriteSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Fetch suppliers from API
  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch('http://localhost:5000/api/vendor/suppliers', { 
        credentials: 'include' 
      });
      const result = await response.json();
      
      if (result.suppliers) {
        // Transform API data to match the expected format
        const transformedSuppliers = result.suppliers.map(supplier => ({
          _id: supplier._id,
          businessName: supplier.businessName || 'Unknown Business',
          ownerName: supplier.ownerName || 'Unknown Owner',
          location: {
            city: supplier.location?.city || 'Unknown City',
            state: supplier.location?.state || 'Unknown State',
            address: supplier.location?.address || '',
            pincode: supplier.location?.pincode || ''
          },
          trustScore: supplier.trustScore || 0,
          totalSales: supplier.totalSales || 0,
          isVerified: supplier.isVerified || false,
          createdAt: supplier.createdAt || new Date().toISOString(),
          
          // Add default values for missing properties
          user: {
            name: supplier.ownerName || 'Unknown Contact',
            rating: supplier.rating || 4.0,
            responseTime: supplier.responseTime || '2-4',
            deliverySuccess: supplier.deliverySuccess || 95,
            orderCompletion: supplier.orderCompletion || 98,
            contactEmail: supplier.email || supplier.contactEmail || 'contact@supplier.com',
            specializations: supplier.categories || supplier.specializations || ['General']
          },
          logoUrl: supplier.logo || supplier.logoUrl || '/default-avatar.png',
          certifications: supplier.certifications || ['Quality Assured'],
          reviews: supplier.reviews || [],
          priceRange: supplier.priceRange || ['₹100', '₹10000'],
          delivery: supplier.deliveryOptions || ['Standard', 'Express'],
          paymentTerms: supplier.paymentTerms || ['UPI', 'Bank Transfer'],
          isActive: supplier.isActive !== false
        }));
        
        setSuppliers(transformedSuppliers);
        setFilteredSuppliers(transformedSuppliers);
      } else {
        setError('No suppliers data received');
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
    setMounted(true);
    
    // Load favorite suppliers from memory (not localStorage in artifacts)
    const savedFavorites = [];
    setFavoriteSuppliers(savedFavorites);
  }, []);

  // Search and filter logic
  useEffect(() => {
    let filtered = suppliers;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(supplier =>
        supplier.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.location.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.location.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.user.specializations.some(spec => 
          spec.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Location filter
    if (filters.location) {
      filtered = filtered.filter(supplier =>
        supplier.location.city.toLowerCase().includes(filters.location.toLowerCase()) ||
        supplier.location.state.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    // Categories filter
    if (filters.categories.length > 0) {
      filtered = filtered.filter(supplier =>
        supplier.user.specializations.some(spec =>
          filters.categories.includes(spec)
        )
      );
    }

    // Trust score filter
    filtered = filtered.filter(supplier =>
      supplier.trustScore >= filters.trustScore[0] &&
      supplier.trustScore <= filters.trustScore[1]
    );

    // Payment terms filter
    if (filters.paymentTerms.length > 0) {
      filtered = filtered.filter(supplier =>
        supplier.paymentTerms.some(term =>
          filters.paymentTerms.includes(term)
        )
      );
    }

    // Delivery filter
    if (filters.delivery.length > 0) {
      filtered = filtered.filter(supplier =>
        supplier.delivery.some(del =>
          filters.delivery.includes(del)
        )
      );
    }

    setFilteredSuppliers(filtered);
  }, [searchTerm, filters, suppliers]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters(initialFilters);
    setSearchTerm('');
  };

  // Toggle favorite supplier
  const toggleFavorite = (supplierId) => {
    setFavoriteSuppliers((prev) => {
      const updated = prev.includes(supplierId)
        ? prev.filter((id) => id !== supplierId)
        : [...prev, supplierId];
      // In a real app, you'd save this to a database or localStorage
      return updated;
    });
  };

  // Handle compare selection
  const handleCompareSelect = (supplierId) => {
    setSelectedForComparison((prev) => {
      if (prev.includes(supplierId)) {
        return prev.filter((id) => id !== supplierId);
      }
      if (prev.length < 4) {
        return [...prev, supplierId];
      }
      return prev;
    });
  };

  // Open supplier profile modal
  const openProfileModal = (supplier) => {
    setSelectedSupplier(supplier);
    setShowProfileModal(true);
  };

  // Open contact modal
  const openContactModal = (supplier) => {
    setSelectedSupplier(supplier);
    setShowContactModal(true);
  };

  // Map view toggle
  const handleViewToggle = (mode) => {
    setViewMode(mode);
  };

  // Helper: Trust score color
  function getTrustColor(score) {
    if (score > 80) return 'green';
    if (score >= 60) return 'yellow';
    return 'red';
  }

  // Helper: Render stars
  function renderStars(rating) {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= rating ? 'star-filled' : 'star-empty'}>★</span>
      );
    }
    return stars;
  }

  // Render supplier cards
  const renderSupplierCards = () => (
    <div className="searchsupplier-grid-container">
      {filteredSuppliers.map((supplier, idx) => (
        <div 
          className={`searchsupplier-card${mounted ? ' animate-supplier-card' : ''}`}
          key={supplier._id}
          style={{
            animationDelay: mounted ? `${idx * 100}ms` : '0ms',
          }}
        >
          {/* <div className="searchsupplier-logo">
            <img 
              src={supplier.logoUrl || '/default-avatar.png'} 
              alt="logo"
              onError={(e) => {
                e.target.src = '/default-avatar.png';
              }}
            />
          </div>
           */}
          <div className="searchsupplier-company-name">
            {supplier.businessName}
          </div>
          <div className={`searchsupplier-trust-score trust-${getTrustColor(supplier.trustScore)}`}>
            Trust: {supplier.trustScore}
          </div>
          <div className="searchsupplier-rating">
            {renderStars(supplier.user?.rating || 0)}
          </div>
          <div className="searchsupplier-tags">
            {supplier.user?.specializations?.slice(0, 3).map((tag, index) => (
              <span key={index}>{tag}</span>
            ))}
          </div>
          <div className="searchsupplier-location">
            {supplier.location?.city}, {supplier.location?.state}
          </div>
          <div className="searchsupplier-metrics">
            <span>Owner: {supplier.ownerName}</span>
            <span>Sales: ₹{supplier.totalSales}</span>
            <span>Verified: {supplier.isVerified ? '✓' : '✗'}</span>
          </div>
          <div className="searchsupplier-actions">
            <button className="btn-searchsupplier-contact" onClick={() => openContactModal(supplier)}>
              Contact
            </button>
            <button 
              className={`btn-searchsupplier-favorite ${favoriteSuppliers.includes(supplier._id) ? 'active' : ''}`}
              onClick={() => toggleFavorite(supplier._id)}
            >
              {favoriteSuppliers.includes(supplier._id) ? '♥' : '♡'}
            </button>
            <button className="btn-searchsupplier-profile" onClick={() => openProfileModal(supplier)}>
              Profile
            </button>
            <label>
              <input
                type="checkbox"
                className="searchsupplier-compare-checkbox"
                checked={selectedForComparison.includes(supplier._id)}
                onChange={() => handleCompareSelect(supplier._id)}
                disabled={
                  !selectedForComparison.includes(supplier._id) && selectedForComparison.length >= 4
                }
              />
              Compare
            </label>
          </div>
        </div>
      ))}
    </div>
  );

  // Render comparison modal
  const renderComparisonModal = () => (
    <div className="searchsupplier-modal-overlay" onClick={() => setShowComparison(false)}>
      <div className="searchsupplier-modal-content searchsupplier-comparison-modal" onClick={e => e.stopPropagation()}>
        <h2>Compare Suppliers</h2>
        <div className="searchsupplier-comparison-table">
          <table>
            <thead>
              <tr>
                <th>Company</th>
                <th>Trust</th>
                <th>Owner</th>
                <th>Location</th>
                <th>Sales</th>
                <th>Verified</th>
              </tr>
            </thead>
            <tbody>
              {selectedForComparison.map((id) => {
                const s = suppliers.find((sup) => sup._id === id);
                return s ? (
                  <tr key={s._id}>
                    <td>{s.businessName}</td>
                    <td>{s.trustScore}</td>
                    <td>{s.ownerName}</td>
                    <td>{s.location?.city}, {s.location?.state}</td>
                    <td>₹{s.totalSales}</td>
                    <td>{s.isVerified ? '✓' : '✗'}</td>
                  </tr>
                ) : null;
              })}
            </tbody>
          </table>
        </div>
        <button className="btn-searchsupplier-close" onClick={() => setShowComparison(false)}>Close</button>
      </div>
    </div>
  );

  // Render profile modal
  const renderProfileModal = () => (
    <div className="searchsupplier-modal-overlay" onClick={() => setShowProfileModal(false)}>
      <div className="searchsupplier-modal-content" onClick={e => e.stopPropagation()}>
        <div className="searchsupplier-profile-header">
          <img 
            src={selectedSupplier?.logoUrl || '/default-avatar.png'} 
            alt="logo"
            onError={(e) => {
              e.target.src = '/default-avatar.png';
            }}
          />
          <div>
            <h2>{selectedSupplier?.businessName}</h2>
            <div className={`searchsupplier-trust-score trust-${getTrustColor(selectedSupplier?.trustScore)}`}>
              Trust Score: {selectedSupplier?.trustScore}
            </div>
            <div className="searchsupplier-rating">{renderStars(selectedSupplier?.user?.rating || 0)}</div>
          </div>
        </div>
        <div className="searchsupplier-company-details">
          <p><b>Owner:</b> {selectedSupplier?.ownerName}</p>
          <p><b>Location:</b> {selectedSupplier?.location?.address}, {selectedSupplier?.location?.city}, {selectedSupplier?.location?.state} - {selectedSupplier?.location?.pincode}</p>
          <p><b>Total Sales:</b> ₹{selectedSupplier?.totalSales}</p>
          <p><b>Verified:</b> {selectedSupplier?.isVerified ? 'Yes' : 'No'}</p>
          <p><b>Email:</b> {selectedSupplier?.user?.contactEmail}</p>
          <p><b>Specializations:</b> {selectedSupplier?.user?.specializations?.join(', ')}</p>
          <p><b>Member Since:</b> {new Date(selectedSupplier?.createdAt).toLocaleDateString()}</p>
        </div>
        <div className="searchsupplier-reviews">
          <h3>Customer Reviews</h3>
          {(selectedSupplier?.reviews || []).length > 0 ? (
            selectedSupplier.reviews.map((r, idx) => (
              <div key={idx} className="searchsupplier-review-item">
                <div>{renderStars(r.rating)} <span>{r.comment}</span></div>
              </div>
            ))
          ) : (
            <p>No reviews available</p>
          )}
        </div>
        <button className="btn-searchsupplier-close" onClick={() => setShowProfileModal(false)}>Close</button>
      </div>
    </div>
  );

  // Render contact modal
  const renderContactModal = () => (
    <div className="searchsupplier-modal-overlay" onClick={() => setShowContactModal(false)}>
      <div className="searchsupplier-modal-content" onClick={e => e.stopPropagation()}>
        <h3>Contact {selectedSupplier?.businessName}</h3>
        <div className="searchsupplier-contact-info">
          <p><b>Owner:</b> {selectedSupplier?.ownerName}</p>
          <p><b>Email:</b> {selectedSupplier?.user?.contactEmail}</p>
          <p><b>Location:</b> {selectedSupplier?.location?.city}, {selectedSupplier?.location?.state}</p>
        </div>
        <form className="searchsupplier-contact-form" onSubmit={(e) => {
          e.preventDefault();
          alert('Message sent successfully!');
          setShowContactModal(false);
        }}>
          <input type="text" placeholder="Your Name" required />
          <input type="email" placeholder="Your Email" required />
          <textarea placeholder="Message" required />
          <button type="submit">Send Message</button>
        </form>
        <button className="btn-searchsupplier-close" onClick={() => setShowContactModal(false)}>Close</button>
      </div>
    </div>
  );

  // Render map view (placeholder)
  const renderMapView = () => (
    <div className="searchsupplier-map-container">
      <div style={{ height: 400, background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span>Map View Coming Soon</span>
      </div>
    </div>
  );

  // Loading state
  if (loading) {
    return (
      <div className="container-searchsupplier">
        <div className="loading-container" style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '400px',
          flexDirection: 'column',
          gap: '20px'
        }}>
          <div style={{ 
            width: '48px', 
            height: '48px', 
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #3498db',
            borderRadius: '50%',
            animation: 'spin 2s linear infinite' 
          }}></div>
          <p style={{ fontSize: '18px', color: '#666' }}>Loading suppliers...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && suppliers.length === 0) {
    return (
      <div className="container-searchsupplier">
        <div className="error-container" style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '400px',
          flexDirection: 'column',
          gap: '20px'
        }}>
          <div style={{ 
            width: '48px', 
            height: '48px', 
            color: '#ef4444',
            fontSize: '48px'
          }}>⚠</div>
          <p style={{ fontSize: '18px', color: '#ef4444' }}>{error}</p>
          <button 
            onClick={fetchSuppliers}
            style={{
              padding: '10px 20px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-searchsupplier">
      <div className="searchsupplier-header">
        <h1>Search Suppliers</h1>
        <p>Found {filteredSuppliers.length} suppliers</p>
        <div className="searchsupplier-breadcrumbs">Dashboard &gt; Suppliers</div>
        <div className="searchsupplier-view-toggle">
          <button 
            className={`btn-searchsupplier-map-toggle ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => handleViewToggle('grid')}
          >
            Grid
          </button>
          <button 
            className={`btn-searchsupplier-map-toggle ${viewMode === 'map' ? 'active' : ''}`}
            onClick={() => handleViewToggle('map')}
          >
            Map
          </button>
        </div>
      </div>
      
      <div className="searchsupplier-search-section">
        <input
          className="searchsupplier-search-input"
          type="text"
          placeholder="Search suppliers by name, specialization, location..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <button className="btn-searchsupplier-filter" onClick={() => setShowFilters(v => !v)}>
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>
        <button className="btn-searchsupplier-clear-filters" onClick={clearFilters}>Clear Filters</button>
        {selectedForComparison.length >= 2 && (
          <button className="btn-searchsupplier-compare" onClick={() => setShowComparison(true)}>
            Compare ({selectedForComparison.length})
          </button>
        )}
      </div>

      {showFilters && (
        <div className="searchsupplier-filters-panel">
          <div className="searchsupplier-location-filter">
            <label>Location:</label>
            <input
              type="text"
              value={filters.location}
              onChange={e => handleFilterChange('location', e.target.value)}
              placeholder="City or State"
            />
          </div>
          
          <div className="searchsupplier-category-filter">
            <label>Categories:</label>
            {categoryOptions.map((cat) => (
              <label key={cat}>
                <input
                  type="checkbox"
                  checked={filters.categories.includes(cat)}
                  onChange={e => {
                    const newCats = e.target.checked
                      ? [...filters.categories, cat]
                      : filters.categories.filter(c => c !== cat);
                    handleFilterChange('categories', newCats);
                  }}
                />
                {cat}
              </label>
            ))}
          </div>
          
          <div className="searchsupplier-payment-filter">
            <label>Payment Terms:</label>
            {paymentOptions.map((opt) => (
              <label key={opt}>
                <input
                  type="checkbox"
                  checked={filters.paymentTerms.includes(opt)}
                  onChange={e => {
                    const newTerms = e.target.checked
                      ? [...filters.paymentTerms, opt]
                      : filters.paymentTerms.filter(t => t !== opt);
                    handleFilterChange('paymentTerms', newTerms);
                  }}
                />
                {opt}
              </label>
            ))}
          </div>
          
          <div className="searchsupplier-delivery-filter">
            <label>Delivery:</label>
            {deliveryOptions.map((opt) => (
              <label key={opt}>
                <input
                  type="checkbox"
                  checked={filters.delivery.includes(opt)}
                  onChange={e => {
                    const newDel = e.target.checked
                      ? [...filters.delivery, opt]
                      : filters.delivery.filter(d => d !== opt);
                    handleFilterChange('delivery', newDel);
                  }}
                />
                {opt}
              </label>
            ))}
          </div>
          
          <div className="searchsupplier-trustscore-slider">
            <label>Trust Score: {filters.trustScore[0]} - {filters.trustScore[1]}</label>
            <input
              type="range"
              min="0"
              max="100"
              value={filters.trustScore[0]}
              onChange={e => handleFilterChange('trustScore', [Number(e.target.value), filters.trustScore[1]])}
            />
            <input
              type="range"
              min="0"
              max="100"
              value={filters.trustScore[1]}
              onChange={e => handleFilterChange('trustScore', [filters.trustScore[0], Number(e.target.value)])}
            />
          </div>
        </div>
      )}

      <div className="searchsupplier-content">
        {filteredSuppliers.length === 0 && !loading ? (
          <div className="no-suppliers-found" style={{
            textAlign: 'center',
            padding: '40px',
            color: '#666'
          }}>
            <h3>No suppliers found</h3>
            <p>Try adjusting your search criteria or filters</p>
            <button 
              onClick={fetchSuppliers}
              style={{
                marginTop: '20px',
                padding: '10px 20px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Refresh Suppliers
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          renderSupplierCards()
        ) : (
          renderMapView()
        )}
      </div>

      {showComparison && renderComparisonModal()}
      {showProfileModal && renderProfileModal()}
      {showContactModal && renderContactModal()}
    </div>
  );
}

export default SearchSuppliers;
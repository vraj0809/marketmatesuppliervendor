import React, { useState, useEffect } from 'react';
import { Search, Filter, Grid3X3, List, Star, ShoppingCart, Heart, Eye, Package, Truck, Award, Zap } from 'lucide-react';
import '../CSS/ProductList.css';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('relevance');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPriceRange, setSelectedPriceRange] = useState('all');
  const [selectedRating, setSelectedRating] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mounted, setMounted] = useState(false);

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'metals', label: 'Metals & Alloys' },
    { value: 'textiles', label: 'Textiles & Fabrics' },
    { value: 'plastics', label: 'Plastics & Polymers' },
    { value: 'wood', label: 'Wood & Timber' },
    { value: 'electronics', label: 'Electronics' }
  ];

  const priceRanges = [
    { value: 'all', label: 'All Prices' },
    { value: '0-1000', label: 'Under ₹1,000' },
    { value: '1000-3000', label: '₹1,000 - ₹3,000' },
    { value: '3000-5000', label: '₹3,000 - ₹5,000' },
    { value: '5000+', label: 'Above ₹5,000' }
  ];

  // Fetch products from API
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/products', { credentials: 'include' });
      const result = await response.json();
      
      if (result.success) {
        // Transform API data to match the expected format
        const transformedProducts = result.data.map(product => ({
          id: product._id,
          name: product.name,
          category: product.category || 'general',
          price: product.price,
          originalPrice: product.price * 1.1, // Add 10% as original price for discount display
          rating: product.rating || 4.0,
          reviews: product.reviewCount || 0,
          supplier: product.supplierId?.name || 'Unknown Supplier',
          image: product.images?.[0] || "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400",
          badge: product.reviewCount > 100 ? "Best Seller" : "New",
          inStock: product.isActive,
          minOrder: product.minOrderQuantity ? `${product.minOrderQuantity} ${product.unit || 'units'}` : "1 unit",
          delivery: "2-5 days",
          description: product.description,
          specifications: product.specifications ? Object.entries(product.specifications).map(([key, value]) => `${key}: ${value}`) : ["Standard grade", "Quality assured"],
          unit: product.unit || 'piece',
          quantity: product.quantity || 0
        }));
        
        setProducts(transformedProducts);
        setFilteredProducts(transformedProducts);
      } else {
        setError(result.message || 'Failed to fetch products');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let filtered = products;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Price range filter
    if (selectedPriceRange !== 'all') {
      const [min, max] = selectedPriceRange.split('-').map(p => p.replace('+', ''));
      filtered = filtered.filter(product => {
        if (selectedPriceRange === '5000+') return product.price >= 5000;
        return product.price >= parseInt(min) && product.price <= parseInt(max);
      });
    }

    // Rating filter
    if (selectedRating !== 'all') {
      filtered = filtered.filter(product => product.rating >= parseFloat(selectedRating));
    }

    // Sort
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'reviews':
        filtered.sort((a, b) => b.reviews - a.reviews);
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      default:
        // relevance - keep original order
        break;
    }

    setFilteredProducts(filtered);
  }, [searchTerm, selectedCategory, sortBy, selectedPriceRange, selectedRating, products]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const calculateDiscount = (original, current) => {
    return Math.round(((original - current) / original) * 100);
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`star-icon ${i < Math.floor(rating) ? 'filled' : ''}`}
      />
    ));
  };

  // Add product to list (for real-time updates)
  const handleProductAdded = (newProduct) => {
    const transformedProduct = {
      id: newProduct._id,
      name: newProduct.name,
      category: newProduct.category || 'general',
      price: newProduct.price,
      originalPrice: newProduct.price * 1.1,
      rating: 4.0,
      reviews: 0,
      supplier: 'Your Company',
      image: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400",
      badge: "New",
      inStock: true,
      minOrder: "1 unit",
      delivery: "2-5 days",
      description: newProduct.description,
      specifications: ["Standard grade", "Quality assured"],
      unit: 'piece',
      quantity: 100
    };
    
    setProducts(prev => [transformedProduct, ...prev]);
  };

  if (loading) {
    return (
      <div className="product-list-wrapper">
        <div className="container-productlist">
          <div className="loading-container" style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '400px',
            flexDirection: 'column',
            gap: '20px'
          }}>
            <Package className="loading-icon" style={{ 
              width: '48px', 
              height: '48px', 
              animation: 'spin 2s linear infinite' 
            }} />
            <p style={{ fontSize: '18px', color: '#666' }}>Loading products...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="product-list-wrapper">
        <div className="container-productlist">
          <div className="error-container" style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '400px',
            flexDirection: 'column',
            gap: '20px'
          }}>
            <Package className="error-icon" style={{ 
              width: '48px', 
              height: '48px', 
              color: '#ef4444' 
            }} />
            <p style={{ fontSize: '18px', color: '#ef4444' }}>{error}</p>
            <button 
              onClick={fetchProducts}
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
      </div>
    );
  }

  return (
    <div className="product-list-wrapper">
      {/* Floating background elements */}
      <div className="floating-orb-productlist orb-1-productlist small">
        <div className="orb-inner-productlist"></div>
      </div>
      <div className="floating-orb-productlist orb-2-productlist medium">
        <div className="orb-inner-productlist"></div>
      </div>
      <div className="floating-orb-productlist orb-3-productlist large">
        <div className="orb-inner-productlist"></div>
      </div>

      <div className="container-productlist">
        {/* Header */}
        <div className="header-productlist">
          <div className="header-content-productlist">
            <div className="page-title-productlist">
              <Package className="title-icon-productlist" />
              <h1>Raw Materials Marketplace</h1>
              <span className="product-count-productlist">
                {filteredProducts.length} products found
              </span>
            </div>
            
            <div className="header-actions-productlist">
              <div className="view-toggle-productlist">
                <button
                  className={`view-btn-productlist ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3X3 className="icon" />
                </button>
                <button
                  className={`view-btn-productlist ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                >
                  <List className="icon" />
                </button>
              </div>
            </div>
          </div>

          {/* Search and Filters Bar */}
          <div className="search-filter-bar-productlist">
            <div className="search-container-productlist">
              <Search className="search-icon-productlist" />
              <input
                type="text"
                placeholder="Search raw materials, suppliers, categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input-productlist"
              />
            </div>

            <div className="filters-container-productlist">
              <button
                className="filter-toggle-productlist"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="icon" />
                Filters
              </button>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="filter-select-productlist"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-select-productlist"
              >
                <option value="relevance">Sort by Relevance</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="reviews">Most Reviews</option>
                <option value="newest">Newest First</option>
              </select>
            </div>
          </div>

          {/* Advanced Filters Panel */}
          {showFilters && (
            <div className="advanced-filters-productlist">
              <div className="filter-group-productlist">
                <label>Price Range</label>
                <select
                  value={selectedPriceRange}
                  onChange={(e) => setSelectedPriceRange(e.target.value)}
                  className="filter-select-productlist"
                >
                  {priceRanges.map(range => (
                    <option key={range.value} value={range.value}>{range.label}</option>
                  ))}
                </select>
              </div>

              <div className="filter-group-productlist">
                <label>Minimum Rating</label>
                <select
                  value={selectedRating}
                  onChange={(e) => setSelectedRating(e.target.value)}
                  className="filter-select-productlist"
                >
                  <option value="all">All Ratings</option>
                  <option value="4">4+ Stars</option>
                  <option value="4.5">4.5+ Stars</option>
                  <option value="4.8">4.8+ Stars</option>
                </select>
              </div>

              <button
                className="clear-filters-productlist"
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedPriceRange('all');
                  setSelectedRating('all');
                  setSearchTerm('');
                }}
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>

        {/* Products Grid/List */}
        <div className={`products-container-productlist ${viewMode}`}>
          {filteredProducts.length === 0 ? (
            <div className="no-products-productlist">
              <Package className="no-products-icon-productlist" />
              <h3>No products found</h3>
              <p>Try adjusting your search criteria or add some products to get started</p>
              <button 
                onClick={fetchProducts}
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
                Refresh Products
              </button>
            </div>
          ) : (
            filteredProducts.map((product, idx) => (
              <div
                key={product.id}
                className={`product-card-productlist${mounted ? ' animate-product-card' : ''}`}
                style={{
                  animationDelay: mounted ? `${idx * 100}ms` : '0ms',
                }}
              >
                <div className="product-image-container-productlist">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="product-image-productlist"
                    onError={(e) => {
                      e.target.src = "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400";
                    }}
                  />
                  {product.badge && (
                    <div className={`product-badge-productlist ${product.badge.toLowerCase().replace(' ', '-')}`}>
                      {product.badge === 'Best Seller' && <Zap className="badge-icon" />}
                      {product.badge === 'Premium' && <Award className="badge-icon" />}
                      {product.badge === 'Top Rated' && <Star className="badge-icon" />}
                      {product.badge}
                    </div>
                  )}
                  <div className="product-actions-productlist">
                    <button className="action-btn-productlist wishlist">
                      <Heart className="icon" />
                    </button>
                    <button className="action-btn-productlist quick-view">
                      <Eye className="icon" />
                    </button>
                  </div>
                </div>

                <div className="product-info-productlist">
                  <div className="product-header-productlist">
                    <h3 className="product-name-productlist">{product.name}</h3>
                    <div className="product-rating-productlist">
                      <div className="stars-productlist">
                        {renderStars(product.rating)}
                      </div>
                      <span className="rating-text-productlist">
                        {product.rating} ({product.reviews})
                      </span>
                    </div>
                  </div>

                  <p className="product-supplier-productlist">by {product.supplier}</p>
                  <p className="product-description-productlist">{product.description}</p>

                  <div className="product-specs-productlist">
                    {product.specifications?.slice(0, 2).map((spec, index) => (
                      <span key={index} className="spec-tag-productlist">{spec}</span>
                    ))}
                  </div>

                  <div className="product-footer-productlist">
                    <div className="price-container-productlist">
                      <span className="current-price-productlist">
                        {formatPrice(product.price)}
                      </span>
                      {product.originalPrice > product.price && (
                        <>
                          <span className="original-price-productlist">
                            {formatPrice(product.originalPrice)}
                          </span>
                          <span className="discount-badge-productlist">
                            {calculateDiscount(product.originalPrice, product.price)}% off
                          </span>
                        </>
                      )}
                      <span className="price-unit-productlist">per {product.unit}</span>
                    </div>

                    <div className="product-meta-productlist">
                      <div className="meta-item-productlist">
                        <Package className="meta-icon-productlist" />
                        <span>Min: {product.minOrder}</span>
                      </div>
                      <div className="meta-item-productlist">
                        <Truck className="meta-icon-productlist" />
                        <span>{product.delivery}</span>
                      </div>
                      {product.quantity > 0 && (
                        <div className="meta-item-productlist">
                          <span style={{ color: '#10b981' }}>
                            {product.quantity} available
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="product-buttons-productlist">
                      <button className="btn-productlist btn-secondary-productlist">
                        Get Quote
                      </button>
                      <button className="btn-productlist btn-primary-productlist">
                        <ShoppingCart className="icon" />
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductList;
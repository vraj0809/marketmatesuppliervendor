const express = require('express');
const router = express.Router();
const Order = require('../models/order.model');
const User = require('../models/User');
const Product = require('../models/products.model');
const Supplier = require('../models/supplier.model');
const mongoose = require('mongoose');

// Authentication middleware (session-based)
const authenticateToken = (req, res, next) => {
  console.log('Auth check - Session:', req.session);
  console.log('Auth check - User:', req.session?.user);
  
  if (!req.session || !req.session.user) {
    return res.status(401).json({ 
      success: false, 
      message: 'Unauthorized - Please login first',
      sessionExists: !!req.session,
      userExists: !!req.session?.user
    });
  }
  
  req.user = req.session.user;
  next();
};

// Debug middleware for all vendor routes
router.use((req, res, next) => {
  console.log(`=== VENDOR ROUTE ===`);
  console.log(`${req.method} ${req.originalUrl}`);
  console.log('Time:', new Date().toISOString());
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Session User ID:', req.session?.user?._id);
  console.log('==================');
  next();
});

// Test route - no auth required
router.get('/test', (req, res) => {
  res.json({ 
    success: true,
    message: 'Vendor routes are working!', 
    timestamp: new Date().toISOString(),
    route: req.originalUrl,
    method: req.method
  });
});

// Debug info route - no auth required
router.get('/debug/info', (req, res) => {
  res.json({
    success: true,
    message: 'Vendor router debug info',
    availableRoutes: [
      'GET /api/vendor/test',
      'GET /api/vendor/debug/info',
      'GET /api/vendor/orders',
      'GET /api/vendor/suppliers', 
      'GET /api/vendor/suppliers/:supplierId/products',
      'POST /api/vendor/orders/create'
    ],
    session: {
      exists: !!req.session,
      hasUser: !!req.session?.user,
      userId: req.session?.user?._id
    },
    timestamp: new Date().toISOString()
  });
});

// GET /api/vendor/orders - Get vendor's orders
router.get('/orders', authenticateToken, async (req, res) => {
  try {
    const vendorId = req.user._id;
    console.log('Fetching orders for vendor:', vendorId);
    
    const orders = await Order.find({ vendorId })
      .populate('supplierId', 'name businessName location trustScore')
      .sort({ createdAt: -1 })
      .exec();

    console.log(`Found ${orders.length} orders for vendor ${vendorId}`);

    res.json({ 
      success: true, 
      orders: orders || [],
      count: orders.length
    });
  } catch (error) {
    console.error('Error fetching vendor orders:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch orders', 
      details: error.message 
    });
  }
});

// GET /api/vendor/suppliers - Get all suppliers from database
router.get('/suppliers', authenticateToken, async (req, res) => {
  try {
    console.log('=== FETCHING SUPPLIERS ===');
    
    // First try to get from Supplier model
    let suppliers = await Supplier.find({})
      .populate('userId', 'name email phone location isActive')
      .select('businessName ownerName location trustScore totalSales isVerified createdAt userId')
      .lean();

    console.log('Suppliers from Supplier model:', suppliers?.length || 0);

    // If no suppliers in Supplier model, try User model
    if (!suppliers || suppliers.length === 0) {
      suppliers = await User.find({ 
        role: 'supplier',
        isActive: { $ne: false } 
      })
      .select('name businessName location trustScore isVerified totalSales email phone')
      .lean();
      
      console.log('Suppliers from User model:', suppliers?.length || 0);
    }

    // Transform the data to ensure consistent structure
    const transformedSuppliers = suppliers.map(supplier => ({
      _id: supplier._id,
      name: supplier.name || supplier.ownerName,
      businessName: supplier.businessName,
      location: supplier.location || {},
      trustScore: supplier.trustScore || 0,
      isVerified: supplier.isVerified || false,
      totalSales: supplier.totalSales || 0,
      email: supplier.email || supplier.userId?.email,
      phone: supplier.phone || supplier.userId?.phone
    }));

    console.log('Transformed suppliers count:', transformedSuppliers.length);

    res.json({ 
      success: true, 
      suppliers: transformedSuppliers,
      count: transformedSuppliers.length
    });
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch suppliers', 
      details: error.message 
    });
  }
});

// MAIN ROUTE: GET /api/vendor/suppliers/:supplierId/products
router.get('/suppliers/:supplierId/products', authenticateToken, async (req, res) => {
  try {
    const supplierId = req.params.supplierId;
    console.log('=== FETCHING SUPPLIER PRODUCTS ===');
    console.log('Raw supplier ID from params:', supplierId);
    console.log('Request URL:', req.originalUrl);
    console.log('Request method:', req.method);
    console.log('Authenticated user:', req.user._id);

    // Clean the supplier ID - remove any brackets or extra characters
    const cleanSupplierId = String(supplierId).replace(/[\[\]]/g, '').trim();
    console.log('Cleaned supplier ID:', cleanSupplierId);

    // Validate supplier ID format
    if (!mongoose.Types.ObjectId.isValid(cleanSupplierId)) {
      console.error('Invalid supplier ID format:', cleanSupplierId);
      return res.status(400).json({
        success: false,
        error: 'Invalid supplier ID format',
        providedId: supplierId,
        cleanedId: cleanSupplierId,
        validObjectId: false
      });
    }

    console.log('✅ Supplier ID is valid ObjectId format');

    // Find Supplier document by _id
    const supplierDoc = await Supplier.findById(cleanSupplierId);
    console.log('Supplier document lookup result:', supplierDoc ? `Found: ${supplierDoc.businessName}` : 'Not found');

    if (!supplierDoc) {
      console.error('❌ Supplier document not found with ID:', cleanSupplierId);

      // Log all suppliers for debugging
      const allSuppliers = await Supplier.find({}).select('_id businessName ownerName').lean();
      console.log(`Total suppliers in DB: ${allSuppliers.length}`);
      allSuppliers.forEach((sup, idx) => {
        console.log(`Supplier ${idx + 1}: _id=${sup._id}, businessName=${sup.businessName}, ownerName=${sup.ownerName}`);
      });

      return res.status(404).json({
        success: false,
        error: 'Supplier not found',
        supplierId: cleanSupplierId,
        debug: {
          totalSuppliers: allSuppliers.length,
          searchedId: cleanSupplierId,
          allSuppliersSample: allSuppliers.slice(0, 5)
        }
      });
    }

    // Get userId from Supplier document
    const userId = supplierDoc.userId;
    console.log('User ID from Supplier document:', userId);

    // Find User by userId
    const user = await User.findById(userId);
    console.log('User lookup result:', user ? `Found: ${user.name || user.businessName}` : 'Not found');

    if (!user) {
      console.error('❌ User not found with ID:', userId);
      return res.status(404).json({
        success: false,
        error: 'User not found for supplier',
        userId,
        supplierId: cleanSupplierId
      });
    }

    // Fetch products for this userId (supplier)
    console.log('🔍 Searching for products...');

    let products = [];

    // Method 1: Try with supplierId field and isActive filter
    products = await Product.find({
      supplierId: userId,
      isActive: { $ne: false }
    })
      .select('name price unit quantity stock category images description specifications createdAt supplierId')
      .lean();

    console.log(`Method 1 (supplierId + isActive): Found ${products.length} products`);

    // Method 2: Try without isActive filter
    if (products.length === 0) {
      products = await Product.find({
        supplierId: userId
      })
        .select('name price unit quantity stock category images description specifications createdAt supplierId')
        .lean();

      console.log(`Method 2 (supplierId only): Found ${products.length} products`);
    }

    // Method 3: Try with supplier field (alternative field name)
    if (products.length === 0) {
      products = await Product.find({
        supplier: userId
      })
        .select('name price unit quantity stock category images description specifications createdAt supplier')
        .lean();

      console.log(`Method 3 (supplier field): Found ${products.length} products`);
    }

    // Method 4: Try with string comparison (in case ObjectId vs String issue)
    if (products.length === 0) {
      const allProducts = await Product.find({})
        .select('name price unit quantity stock category images description specifications createdAt supplierId supplier')
        .lean();

      console.log(`Total products in database: ${allProducts.length}`);

      products = allProducts.filter(product => {
        const productSupplierId = product.supplierId || product.supplier;
        return String(productSupplierId) === String(userId);
      });

      console.log(`Method 4 (string comparison): Found ${products.length} products`);

      // Debug info
      if (allProducts.length > 0) {
        console.log('Sample product supplier IDs:');
        allProducts.slice(0, 3).forEach((p, i) => {
          console.log(`  Product ${i + 1}: supplierId=${p.supplierId}, supplier=${p.supplier}`);
        });
      }
    }

    // Transform products to ensure consistent structure
    const transformedProducts = products.map(product => ({
      _id: product._id,
      name: product.name || 'Unnamed Product',
      description: product.description || '',
      category: product.category || 'general',
      price: product.price || 0,
      unit: product.unit || 'piece',
      stock: product.quantity || product.stock || 0,
      quantity: product.quantity || product.stock || 0,
      images: product.images || [],
      specifications: product.specifications || {},
      createdAt: product.createdAt,
      supplierId: product.supplierId || product.supplier
    }));

    console.log(`✅ Successfully transformed ${transformedProducts.length} products`);

    // Success response
    res.json({
      success: true,
      products: transformedProducts,
      count: transformedProducts.length,
      supplier: {
        id: supplierDoc._id,
        businessName: supplierDoc.businessName,
        ownerName: supplierDoc.ownerName,
        userId: user._id,
        name: user.name,
        role: user.role
      },
      debug: {
        originalSupplierId: supplierId,
        cleanedSupplierId: cleanSupplierId,
        supplierExists: true,
        userExists: true,
        searchMethods: [
          'supplierId with isActive filter',
          'supplierId without filter',
          'supplier field',
          'string comparison'
        ]
      }
    });

  } catch (error) {
    console.error('❌ Error fetching supplier products:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch products',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// POST /api/vendor/orders/create - Create new order
router.post('/orders/create', authenticateToken, async (req, res) => {
  try {
    const vendorId = req.user._id;
    const { supplierId, items, notes, deliveryAddress } = req.body;

    console.log('=== CREATING ORDER ===');
    console.log('Vendor ID:', vendorId);
    console.log('Supplier ID:', supplierId);
    console.log('Items count:', items?.length);

    if (!supplierId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ 
        success: false,
        error: 'Missing required fields: supplierId and items' 
      });
    }

    // Find Supplier document by supplierId (Supplier _id)
    const supplierDoc = await Supplier.findById(supplierId);
    if (!supplierDoc) {
      return res.status(400).json({ 
        success: false,
        error: 'Supplier not found' 
      });
    }

    // Use supplierDoc.userId as the supplierId in the order
    const correctSupplierId = supplierDoc.userId;

    // Calculate total
    const total = items.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);

    // Generate unique order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create new order with correct supplierId
    const newOrder = new Order({
      orderNumber,
      vendorId,
      supplierId: correctSupplierId,
      items,
      status: 'pending',
      total,
      deliveryAddress,
      notes,
      tracking: {
        statusHistory: [{
          status: 'pending',
          timestamp: new Date(),
          notes: 'Order created and sent to supplier'
        }]
      },
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const savedOrder = await newOrder.save();
    console.log('✅ Order saved successfully with ID:', savedOrder._id);

    // Populate supplier information
    await savedOrder.populate('supplierId', 'name businessName location trustScore');

    res.status(201).json({ 
      success: true, 
      message: 'Order created successfully',
      order: savedOrder 
    });
  } catch (error) {
    console.error('❌ Error creating order:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to create order', 
      details: error.message 
    });
  }
});

// GET /api/vendor/orders/:id - Get specific order details
router.get('/orders/:id', authenticateToken, async (req, res) => {
  try {
    const orderId = req.params.id;
    const vendorId = req.user._id;

    console.log('Fetching order:', orderId, 'for vendor:', vendorId);

    const order = await Order.findOne({ 
      _id: orderId, 
      vendorId 
    })
    .populate('supplierId', 'name businessName location trustScore')
    .exec();

    if (!order) {
      return res.status(404).json({ 
        success: false,
        error: 'Order not found' 
      });
    }

    res.json({ 
      success: true, 
      order 
    });
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch order details', 
      details: error.message 
    });
  }
});

// PATCH /api/vendor/orders/:id/cancel - Cancel order
router.patch('/orders/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const orderId = req.params.id;
    const vendorId = req.user._id;
    const { reason } = req.body;

    const order = await Order.findOne({ 
      _id: orderId, 
      vendorId 
    });

    if (!order) {
      return res.status(404).json({ 
        success: false,
        error: 'Order not found' 
      });
    }

    // Only allow cancellation if order is still pending or confirmed
    if (!['pending', 'confirmed'].includes(order.status)) {
      return res.status(400).json({ 
        success: false,
        error: 'Order cannot be cancelled at this stage' 
      });
    }

    // Update order status
    order.status = 'cancelled';
    order.updatedAt = new Date();
    order.tracking.statusHistory.push({
      status: 'cancelled',
      timestamp: new Date(),
      notes: `Order cancelled by vendor. Reason: ${reason || 'No reason provided'}`
    });

    await order.save();

    res.json({ 
      success: true, 
      message: 'Order cancelled successfully',
      order 
    });
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to cancel order', 
      details: error.message 
    });
  }
});

module.exports = router;
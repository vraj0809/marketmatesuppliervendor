const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplier.controller');
const auth = (req, res, next) => { req.user = { _id: 'mockuserid' }; next(); }; // TODO: Replace with real auth
const orderController = require('../controllers/order.controller');
const validate = (req, res, next) => { next(); }; // Placeholder for validation middleware

// GET /api/vendor/overview
router.get('/overview', (req, res) => {
  res.json({
    totalOrders: 42,
    weeklySpend: 12000,
    favoriteSuppliers: [
      { name: 'Supplier A', trustScore: 95 },
      { name: 'Supplier B', trustScore: 90 }
    ]
  });
});

// GET /api/vendor/orders
router.get('/orders', (req, res) => {
  res.json({
    orders: [
      { id: 1, status: 'Delivered', total: 500, date: '2024-06-01' },
      { id: 2, status: 'Confirmed', total: 1200, date: '2024-06-03' }
    ]
  });
});

// POST /api/vendor/order
router.post('/order', (req, res) => {
  // Accepts: { items, supplierId, quantity, address, paymentMethod }
  res.json({ success: true, message: 'Order placed successfully', orderId: Math.floor(Math.random()*10000) });
});

// Supplier search & discovery
router.get('/suppliers', supplierController.getAllSuppliers);
router.get('/suppliers/:id', supplierController.getSupplierProfile);
router.post('/suppliers/:id/contact', auth, supplierController.contactSupplier);
router.post('/suppliers/:id/favorite', auth, supplierController.toggleFavoriteSupplier);
router.get('/suppliers/compare', supplierController.compareSuppliers);

// Order Management Endpoints
// GET /api/vendor/orders/queue
router.get('/orders/queue', auth, orderController.getOrderQueue);
// GET /api/vendor/orders/:id/details
router.get('/orders/:id/details', auth, orderController.getOrderDetails);
// POST /api/vendor/orders/bulk-action
router.post('/orders/bulk-action', auth, validate, orderController.bulkOrderActions);
// PUT /api/vendor/orders/:id/modify
router.put('/orders/:id/modify', auth, validate, orderController.modifyOrder);
// GET /api/vendor/orders/automation-rules
router.get('/orders/automation-rules', auth, orderController.getAutomationRules);
// POST /api/vendor/orders/automation-rules
router.post('/orders/automation-rules', auth, validate, orderController.saveAutomationRules);
// GET /api/vendor/orders/analytics
router.get('/orders/analytics', auth, orderController.getOrderAnalytics);

module.exports = router; 
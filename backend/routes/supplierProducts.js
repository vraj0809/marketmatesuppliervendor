const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');

// Product Management
router.get('/products', productController.getAllProducts);
router.get('/products/:id', productController.getProductById);
router.post('/products', productController.createProduct);
router.put('/products/:id', productController.updateProduct);
router.delete('/products/:id', productController.deleteProduct);
router.patch('/products/:id/status', productController.updateProductStatus);

// New route to get categories
router.get('/categories', productController.getCategories);

// Bulk Operations
router.post('/products/bulk-import', productController.bulkImportProducts);
router.get('/products/export', productController.exportProducts);
router.patch('/products/bulk-update', productController.bulkUpdateProducts);
router.delete('/products/bulk-delete', productController.bulkDeleteProducts);

// Inventory Management
router.patch('/products/:id/inventory', productController.updateInventory);
router.get('/products/low-stock', productController.getLowStockProducts);

router.post('/products/:id/restock-alert', productController.setRestockAlert);

// Analytics
router.get('/products/:id/analytics', productController.getProductAnalytics);
router.post('/products/:id/track-view', productController.trackProductView);
router.get('/products/analytics/dashboard', productController.getAnalyticsDashboard);

// File Upload
router.post('/products/upload-images', productController.uploadProductImages);
router.delete('/products/images/:imageId', productController.deleteProductImage);

module.exports = router;

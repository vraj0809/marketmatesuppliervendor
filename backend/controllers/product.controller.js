const Product = require('../models/Product');
const mongoose = require('mongoose');
const Category = require('../models/Category');

module.exports = {
  // Product Management
  getAllProducts: async (req, res) => {
    try {
      // Filtering, sorting, and pagination can be added here
      if (!req.session || !req.session.user) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }
      const user = req.session.user;
      let products;
      if (user.role === 'supplier') {
        // Supplier can see only their own products
        products = await Product.find({ supplierId: user._id });
      } else {
        // Other users (e.g., vendor) see all products
        products = await Product.find({});
      }
      res.status(200).json({ success: true, data: products });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
  },
  getProductById: async (req, res) => {
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: 'Invalid product ID' });
      }
      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }
      res.status(200).json({ success: true, data: product });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
  },
  createProduct: async (req, res) => {
    try {
      if (!req.session || !req.session.user) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }
      const { name, category, price, unit, quantity } = req.body;
      if (!name || !category || price === undefined || !unit || quantity === undefined) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
      }
      const productData = { ...req.body, supplierId: req.session.user._id };
      const product = new Product(productData);
      await product.save();
      res.status(201).json({ success: true, data: product });
    } catch (error) {
      res.status(400).json({ success: false, message: 'Product creation failed', error: error.message });
    }
  },
  updateProduct: async (req, res) => {
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: 'Invalid product ID' });
      }
      const updated = await Product.findByIdAndUpdate(id, req.body, { new: true });
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }
      res.status(200).json({ success: true, data: updated });
    } catch (error) {
      res.status(400).json({ success: false, message: 'Product update failed', error: error.message });
    }
  },
  deleteProduct: async (req, res) => {
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: 'Invalid product ID' });
      }
      const deleted = await Product.findByIdAndDelete(id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }
      res.status(200).json({ success: true, message: 'Product deleted' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Product deletion failed', error: error.message });
    }
  },
  updateProductStatus: (req, res) => {},

  // New method to get categories
  getCategories: async (req, res) => {
    try {
      const categories = await Category.find({});
      res.status(200).json({ success: true, data: categories });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch categories', error: error.message });
    }
  },

  // Bulk Operations
  bulkImportProducts: (req, res) => {},
  exportProducts: (req, res) => {},
  bulkUpdateProducts: (req, res) => {},
  bulkDeleteProducts: (req, res) => {},

  // Inventory Management
  updateInventory: (req, res) => {},
  getLowStockProducts: (req, res) => {},
  setRestockAlert: (req, res) => {},

  // Analytics
  getProductAnalytics: (req, res) => {},
  trackProductView: (req, res) => {},
  getAnalyticsDashboard: (req, res) => {},

  // File Upload
  uploadProductImages: (req, res) => {},
  deleteProductImage: (req, res) => {},
};

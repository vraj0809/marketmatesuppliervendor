const Category = require('../models/Category');
const mongoose = require('mongoose');

module.exports = {
  getAllCategories: async (req, res) => {
    try {
      const categories = await Category.find();
      res.status(200).json({ success: true, data: categories });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
  },
  createCategory: async (req, res) => {
    try {
      const category = new Category(req.body);
      await category.save();
      res.status(201).json({ success: true, data: category });
    } catch (error) {
      res.status(400).json({ success: false, message: 'Category creation failed', error: error.message });
    }
  },
  updateCategory: async (req, res) => {
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: 'Invalid category ID' });
      }
      const updated = await Category.findByIdAndUpdate(id, req.body, { new: true });
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Category not found' });
      }
      res.status(200).json({ success: true, data: updated });
    } catch (error) {
      res.status(400).json({ success: false, message: 'Category update failed', error: error.message });
    }
  },
  deleteCategory: async (req, res) => {
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: 'Invalid category ID' });
      }
      const deleted = await Category.findByIdAndDelete(id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Category not found' });
      }
      res.status(200).json({ success: true, message: 'Category deleted' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Category deletion failed', error: error.message });
    }
  },
}; 
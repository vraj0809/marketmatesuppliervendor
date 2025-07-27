const mongoose = require('mongoose');
const { Schema } = mongoose;

const CategorySchema = new Schema({
  name: { type: String, required: true, unique: true },
  description: String,
  parentCategory: { type: Schema.Types.ObjectId, ref: 'Category' },
  subcategories: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
  image: String,
  isActive: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Category', CategorySchema); 
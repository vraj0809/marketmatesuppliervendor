const mongoose = require('mongoose');
const { Schema } = mongoose;

const VariantSchema = new Schema({
  name: String,
  price: Number,
  quantity: Number,
  sku: String
}, { _id: false });

const BulkDiscountSchema = new Schema({
  minQuantity: Number,
  discountPercent: Number
}, { _id: false });

const ProductSchema = new Schema({
  supplierId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true, index: true },
  description: String,
  category: { type: String, required: true, index: true },
  subcategory: String,
  price: { type: Number, required: true },
  unit: { type: String, required: true },
  quantity: { type: Number, required: true, default: 0 },
  minOrderQuantity: { type: Number, default: 1 },
  images: [String],
  specifications: {
    size: String,
    color: String,
    material: String,
    weight: String,
    dimensions: String,
    customFields: Schema.Types.Mixed
  },
  variants: [VariantSchema],
  pricing: {
    bulkDiscounts: [BulkDiscountSchema],
    promotionalPrice: Number,
    promotionalEndDate: Date
  },
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String],
    slug: { type: String, unique: true, index: true }
  },
  analytics: {
    views: { type: Number, default: 0 },
    inquiries: { type: Number, default: 0 },
    orders: { type: Number, default: 0 },
    conversionRate: { type: Number, default: 0 },
    lastViewedAt: Date
  },
  tags: [String],
  rating: { type: Number, default: 0, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  lowStockThreshold: { type: Number, default: 10 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

ProductSchema.index({ name: 'text', description: 'text', 'seo.keywords': 'text' });

module.exports = mongoose.model('Product', ProductSchema); 
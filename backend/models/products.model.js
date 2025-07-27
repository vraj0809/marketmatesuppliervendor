const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: String,
  subcategory: String,
  price: { type: Number, required: true },
  unit: String,
  quantity: Number,
  minOrderQuantity: Number,
  images: [String],
  specifications: Object,
  tags: [String],
  rating: Number,
  reviewCount: Number,
  // Supplier analytics fields for dashboard
  salesAnalytics: {
    totalSold: { type: Number, default: 0 },
    revenueContribution: { type: Number, default: 0 },
    demandTrends: [{
      date: Date,
      quantity: Number
    }],
    seasonalPerformance: [{
      season: String,
      quantity: Number
    }]
  },
  inventoryAlerts: {
    lowStock: { type: Boolean, default: false },
    suggestedProduction: { type: Number, default: 0 }
  },
  demandForecasting: {
    forecastedDemand: { type: Number, default: 0 },
    lastForecasted: { type: Date }
  },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Product || mongoose.model('Product', ProductSchema);

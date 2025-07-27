const mongoose = require('mongoose');

const StatusHistorySchema = new mongoose.Schema({
  status: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  notes: String
}, { _id: false });

const OrderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: String,
  price: Number,
  quantity: Number,
  unit: String
}, { _id: false });

const OrderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true, required: true },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [OrderItemSchema],
  status: { type: String, required: true },
  total: Number,
  deliveryAddress: Object,
  deliveryDate: Date,
  paymentMethod: String,
  paymentStatus: String,
  notes: String,
  tracking: {
    statusHistory: [StatusHistorySchema]
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  // Priority scoring system
  priorityScore: { type: Number, default: 0, index: true },
  // Customer interaction logs
  customerInteractionLogs: [{
    type: {
      type: String,
      enum: ['call', 'email', 'message', 'note'],
      required: true
    },
    content: String,
    timestamp: { type: Date, default: Date.now },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],
  // Modification tracking
  modificationHistory: [{
    changeType: String,
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    changeDetails: Object,
    approved: { type: Boolean, default: false },
    approvalStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    timestamp: { type: Date, default: Date.now }
  }],
  // Automation rule associations
  automationRuleAssociations: [{
    ruleId: { type: mongoose.Schema.Types.ObjectId, ref: 'AutomationRule' },
    executedAt: Date,
    result: String
  }],
  // Performance metrics
  performanceMetrics: {
    processingTime: Number, // in minutes
    deliveryTime: Number, // in minutes
    lastStatusChange: Date
  },
  // Supplier analytics fields for dashboard
  analytics: {
    fulfillmentRate: { type: Number, default: 0 },
    orderValueHistory: [{
      date: Date,
      value: Number
    }],
    segmentation: {
      region: String,
      vendorType: String
    }
  }
});

// Add compound indexes for efficient querying
OrderSchema.index({ vendorId: 1, status: 1, priorityScore: -1 });
OrderSchema.index({ 'customerInteractionLogs.user': 1 });
OrderSchema.index({ 'modificationHistory.changeType': 1 });
OrderSchema.index({ 'automationRuleAssociations.ruleId': 1 });

module.exports = mongoose.model('Order', OrderSchema); 
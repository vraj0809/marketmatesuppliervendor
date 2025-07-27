const Order = require('../models/order.model');
const User = require('../models/User');
const Product = require('../models/products.model');
const mongoose = require('mongoose');

// Helper: Calculate priority score
function calculatePriority(order, customer) {
  let score = 0;
  // Order value
  score += order.total || 0;
  // Customer tier (assume customer.tier: 'premium' > 'regular' > 'new')
  if (customer && customer.tier) {
    if (customer.tier === 'premium') score += 1000;
    else if (customer.tier === 'regular') score += 500;
    else score += 100;
  }
  // Delivery urgency
  if (order.deliveryDate) {
    const now = new Date();
    const diff = (new Date(order.deliveryDate) - now) / (1000 * 60 * 60 * 24); // days
    if (diff < 1) score += 1000; // urgent
    else if (diff < 3) score += 500;
    else if (diff < 7) score += 100;
  }
  // Special requirements (if notes or items have special flags)
  if (order.notes && order.notes.toLowerCase().includes('urgent')) score += 500;
  if (order.items && order.items.some(i => i.specialRequirement)) score += 200;
  return score;
}

// Get prioritized order queue
exports.getOrderQueue = async (req, res) => {
  try {
    const vendorId = req.user._id;
    let orders = await Order.find({ vendorId }).lean();
    // Fetch customer info for each order
    const customerIds = [...new Set(orders.map(o => o.supplierId.toString()))];
    const customers = await User.find({ _id: { $in: customerIds } }).lean();
    const customerMap = {};
    customers.forEach(c => { customerMap[c._id.toString()] = c; });
    // Calculate priority and stats
    let pendingCount = 0, totalProcessingTime = 0, processingCount = 0;
    orders = orders.map(order => {
      const customer = customerMap[order.supplierId.toString()] || {};
      order.priorityScore = calculatePriority(order, customer);
      if (order.status === 'pending') pendingCount++;
      if (order.performanceMetrics && order.performanceMetrics.processingTime) {
        totalProcessingTime += order.performanceMetrics.processingTime;
        processingCount++;
      }
      return order;
    });
    // Sort by priorityScore descending
    orders.sort((a, b) => b.priorityScore - a.priorityScore);
    // Stats
    const avgProcessingTime = processingCount ? (totalProcessingTime / processingCount) : 0;
    res.json({
      queue: orders,
      stats: {
        totalPending: pendingCount,
        avgProcessingTime,
        totalOrders: orders.length
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch order queue', details: err.message });
  }
};

// Create new order (Vendor side)
exports.createOrder = async (req, res) => {
  try {
    const vendorId = req.user._id;
    const { supplierId, items, notes, deliveryAddress } = req.body;

    if (!supplierId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ 
        error: 'Missing required fields: supplierId and items' 
      });
    }

    // Calculate total
    const total = items.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);

    // Generate unique order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create new order
    const newOrder = new Order({
      orderNumber,
      vendorId,
      supplierId,
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

    // Populate supplier information
    await savedOrder.populate('supplierId', 'name businessName location trustScore');

    res.status(201).json({ 
      success: true, 
      message: 'Order created successfully',
      order: savedOrder 
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ 
      error: 'Failed to create order', 
      details: error.message 
    });
  }
};

// Get vendor orders
exports.getVendorOrders = async (req, res) => {
  try {
    const vendorId = req.user._id;
    
    const orders = await Order.find({ vendorId })
      .populate('supplierId', 'name businessName location trustScore')
      .sort({ createdAt: -1 })
      .exec();

    res.json({ 
      success: true, 
      orders: orders || [] 
    });
  } catch (error) {
    console.error('Error fetching vendor orders:', error);
    res.status(500).json({ 
      error: 'Failed to fetch orders', 
      details: error.message 
    });
  }
};

// Get supplier orders
exports.getSupplierOrders = async (req, res) => {
  try {
    const supplierId = req.user._id;
    
    const orders = await Order.find({ supplierId })
      .populate('vendorId', 'name businessName location email phone')
      .sort({ createdAt: -1 })
      .exec();

    res.json({ 
      success: true, 
      orders: orders || [] 
    });
  } catch (error) {
    console.error('Error fetching supplier orders:', error);
    res.status(500).json({ 
      error: 'Failed to fetch orders', 
      details: error.message 
    });
  }
};

// Update order status (Supplier side)
exports.updateOrderStatus = async (req, res) => {
  try {
    const orderId = req.params.id;
    const supplierId = req.user._id;
    const { status, notes } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    // Validate status transitions
    const validStatuses = [
      'pending', 'confirmed', 'cancelled', 'packaging', 
      'ready', 'on_the_way', 'approach', 'delivered'
    ];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const order = await Order.findOne({ 
      _id: orderId, 
      supplierId 
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Update order status
    order.status = status;
    order.updatedAt = new Date();
    
    // Add to status history
    order.tracking.statusHistory.push({
      status,
      timestamp: new Date(),
      notes: notes || `Order status updated to ${status}`
    });

    // Set delivery date for confirmed orders
    if (status === 'confirmed' && !order.deliveryDate) {
      const deliveryDate = new Date();
      deliveryDate.setDate(deliveryDate.getDate() + 7); // Default 7 days
      order.deliveryDate = deliveryDate;
    }

    await order.save();

    // Populate vendor information for response
    await order.populate('vendorId', 'name businessName location email phone');

    res.json({ 
      success: true, 
      message: `Order ${status} successfully`,
      order 
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ 
      error: 'Failed to update order status', 
      details: error.message 
    });
  }
};

// Get complete order details
exports.getOrderDetails = async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await Order.findById(orderId).lean();
    if (!order) return res.status(404).json({ error: 'Order not found' });
    
    // Customer details
    const customer = await User.findById(order.supplierId).lean();
    // Previous orders
    const previousOrders = await Order.find({ supplierId: order.supplierId, _id: { $ne: order._id } }).sort({ createdAt: -1 }).limit(5).lean();
    // Communication history
    const communication = order.customerInteractionLogs || [];
    // Modification history
    const modifications = order.modificationHistory || [];
    // Product details (simulate inventory check)
    const products = (order.items || []).map(item => ({
      ...item,
      inventoryStatus: 'Available', // Placeholder
      specifications: {}, // Placeholder
      images: [], // Placeholder
      description: '' // Placeholder
    }));
    // Payment info
    const payment = {
      method: order.paymentMethod,
      status: order.paymentStatus,
      transaction: order.paymentTransaction || {}
    };
    // Timeline
    const timeline = (order.tracking && order.tracking.statusHistory) || [];
    // Customer rating, preferences, reliability (simulate)
    const customerProfile = {
      ...customer,
      rating: customer?.rating || 4.5,
      reliabilityScore: customer?.reliabilityScore || 90,
      preferences: customer?.preferences || [],
      orderHistory: previousOrders
    };
    res.json({
      order: {
        ...order,
        customer: customerProfile,
        products,
        payment,
        timeline,
        communication,
        modifications
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch order details', details: err.message });
  }
};

// Get all suppliers (for vendor)
exports.getAllSuppliers = async (req, res) => {
  try {
    const suppliers = await User.find({ 
      role: 'supplier', 
      isActive: { $ne: false } 
    })
    .select('name businessName location trustScore isVerified totalSales')
    .lean();

    res.json({ 
      success: true, 
      suppliers: suppliers || [] 
    });
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    res.status(500).json({ 
      error: 'Failed to fetch suppliers', 
      details: error.message 
    });
  }
};

// Get supplier products (for vendor)
exports.getSupplierProducts = async (req, res) => {
  try {
    const supplierId = req.params.id;
    
    const products = await Product.find({ 
      supplierId,
      isActive: { $ne: false } 
    })
    .select('name price unit stock category images description')
    .lean();

    res.json({ 
      success: true, 
      products: products || [] 
    });
  } catch (error) {
    console.error('Error fetching supplier products:', error);
    res.status(500).json({ 
      error: 'Failed to fetch products', 
      details: error.message 
    });
  }
};

// Cancel order (Vendor side)
exports.cancelVendorOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const vendorId = req.user._id;
    const { reason } = req.body;

    const order = await Order.findOne({ 
      _id: orderId, 
      vendorId 
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Only allow cancellation if order is still pending or confirmed
    if (!['pending', 'confirmed'].includes(order.status)) {
      return res.status(400).json({ 
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
      error: 'Failed to cancel order', 
      details: error.message 
    });
  }
};

// Bulk order actions (accept, reject, schedule, update status)
exports.bulkOrderActions = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { action, orderIds, payload } = req.body;
    if (!Array.isArray(orderIds) || !action) throw new Error('Invalid request');
    const results = [];
    for (const orderId of orderIds) {
      let update = {}, log = '';
      if (action === 'accept') {
        update = { status: 'confirmed', $push: { 'tracking.statusHistory': { status: 'confirmed', timestamp: new Date() } } };
        log = 'Order accepted';
      } else if (action === 'reject') {
        update = { status: 'cancelled', $push: { 'tracking.statusHistory': { status: 'cancelled', timestamp: new Date(), notes: payload?.reason } } };
        log = 'Order rejected';
      } else if (action === 'schedule') {
        update = { deliveryDate: payload?.deliveryDate, $push: { 'tracking.statusHistory': { status: 'scheduled', timestamp: new Date(), notes: `Scheduled for ${payload?.deliveryDate}` } } };
        log = 'Order scheduled';
      } else if (action === 'updateStatus') {
        update = { status: payload?.status, $push: { 'tracking.statusHistory': { status: payload?.status, timestamp: new Date() } } };
        log = `Status updated to ${payload?.status}`;
      } else {
        throw new Error('Unsupported bulk action');
      }
      const result = await Order.findByIdAndUpdate(orderId, update, { new: true, session });
      results.push({ orderId, result, log });
    }
    await session.commitTransaction();
    session.endSession();
    res.json({ success: true, report: results });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ error: 'Bulk operation failed', details: err.message });
  }
};

// Modify order with approval workflow
exports.modifyOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { changeType, changeDetails } = req.body;
    if (!changeType || !changeDetails) throw new Error('Missing changeType or changeDetails');
    // Add modification request to history (pending approval)
    const modification = {
      changeType,
      changedBy: req.user._id,
      changeDetails,
      approved: false,
      approvalStatus: 'pending',
      timestamp: new Date()
    };
    await Order.findByIdAndUpdate(orderId, { $push: { modificationHistory: modification } });
    // TODO: Notify customer for approval if required
    res.json({ success: true, message: 'Modification request submitted for approval' });
  } catch (err) {
    res.status(500).json({ error: 'Order modification failed', details: err.message });
  }
};

// Automation rules (in-memory for demo; replace with DB in production)
let automationRules = [];
let automationLogs = [];

// Process automation rules for incoming orders
exports.processAutomationRules = async (req, res) => {
  try {
    const { order } = req.body;
    if (!order) throw new Error('No order provided');
    let appliedRules = [];
    for (const rule of automationRules) {
      // Simple rule matching (expand as needed)
      let match = true;
      if (rule.condition.customerType && rule.condition.customerType !== order.customerType) match = false;
      if (rule.condition.minValue && order.total < rule.condition.minValue) match = false;
      if (rule.condition.productCategory && !order.items.some(i => i.category === rule.condition.productCategory)) match = false;
      if (match) {
        appliedRules.push(rule);
        // Execute action (simulate)
        automationLogs.push({ ruleId: rule.id, orderId: order._id, executedAt: new Date(), result: 'applied' });
      }
    }
    res.json({ appliedRules });
  } catch (err) {
    res.status(500).json({ error: 'Automation rule processing failed', details: err.message });
  }
};

// Get automation rules
exports.getAutomationRules = async (req, res) => {
  res.json({ rules: automationRules });
};

// Create/update automation rules
exports.saveAutomationRules = async (req, res) => {
  try {
    const { rules } = req.body;
    if (!Array.isArray(rules)) throw new Error('Invalid rules');
    automationRules = rules;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save automation rules', details: err.message });
  }
};

// Get analytics
exports.getOrderAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;
    
    let matchCondition = {};
    if (userRole === 'vendor') {
      matchCondition.vendorId = userId;
    } else if (userRole === 'supplier') {
      matchCondition.supplierId = userId;
    }

    // Basic analytics
    const totalOrders = await Order.countDocuments(matchCondition);
    
    const ordersByStatus = await Order.aggregate([
      { $match: matchCondition },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const revenueData = await Order.aggregate([
      { 
        $match: { 
          ...matchCondition,
          status: { $in: ['delivered', 'completed'] }
        } 
      },
      { $group: { _id: null, totalRevenue: { $sum: '$total' } } }
    ]);

    const monthlyOrders = await Order.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 },
          revenue: { $sum: '$total' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({ 
      success: true,
      analytics: {
        totalOrders,
        ordersByStatus: ordersByStatus.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        totalRevenue: revenueData[0]?.totalRevenue || 0,
        monthlyTrends: monthlyOrders
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch analytics', details: err.message });
  }
};
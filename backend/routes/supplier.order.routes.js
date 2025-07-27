const express = require('express');
const router = express.Router();
const Order = require('../models/order.model');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');
const mongoose = require('mongoose');

// GET /api/supplier/orders - Get supplier's orders
router.get('/orders', authenticateToken, async (req, res) => {
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
});

// PATCH /api/supplier/orders/:id/status - Update order status
router.patch('/orders/:id/status', authenticateToken, async (req, res) => {
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
});

// GET /api/supplier/orders/:id - Get specific order details
router.get('/orders/:id', authenticateToken, async (req, res) => {
  try {
    const orderId = req.params.id;
    const supplierId = req.user._id;

    const order = await Order.findOne({ 
      _id: orderId, 
      supplierId 
    })
    .populate('vendorId', 'name businessName location email phone')
    .exec();

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ 
      success: true, 
      order 
    });
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({ 
      error: 'Failed to fetch order details', 
      details: error.message 
    });
  }
});

// POST /api/supplier/orders/:id/approve - Approve order
router.post('/orders/:id/approve', authenticateToken, async (req, res) => {
  try {
    const orderId = req.params.id;
    const supplierId = req.user._id;
    const { deliveryDate, notes } = req.body;

    const order = await Order.findOne({ 
      _id: orderId, 
      supplierId,
      status: 'pending'
    });

    if (!order) {
      return res.status(404).json({ 
        error: 'Order not found or not in pending status' 
      });
    }

    // Update order
    order.status = 'confirmed';
    order.updatedAt = new Date();
    
    if (deliveryDate) {
      order.deliveryDate = new Date(deliveryDate);
    } else {
      const defaultDelivery = new Date();
      defaultDelivery.setDate(defaultDelivery.getDate() + 7);
      order.deliveryDate = defaultDelivery;
    }

    order.tracking.statusHistory.push({
      status: 'confirmed',
      timestamp: new Date(),
      notes: notes || 'Order approved by supplier'
    });

    await order.save();

    res.json({ 
      success: true, 
      message: 'Order approved successfully',
      order 
    });
  } catch (error) {
    console.error('Error approving order:', error);
    res.status(500).json({ 
      error: 'Failed to approve order', 
      details: error.message 
    });
  }
});

// POST /api/supplier/orders/:id/reject - Reject order
router.post('/orders/:id/reject', authenticateToken, async (req, res) => {
  try {
    const orderId = req.params.id;
    const supplierId = req.user._id;
    const { reason } = req.body;

    const order = await Order.findOne({ 
      _id: orderId, 
      supplierId,
      status: 'pending'
    });

    if (!order) {
      return res.status(404).json({ 
        error: 'Order not found or not in pending status' 
      });
    }

    // Update order
    order.status = 'cancelled';
    order.updatedAt = new Date();
    
    order.tracking.statusHistory.push({
      status: 'cancelled',
      timestamp: new Date(),
      notes: `Order rejected by supplier. Reason: ${reason || 'No reason provided'}`
    });

    await order.save();

    res.json({ 
      success: true, 
      message: 'Order rejected successfully',
      order 
    });
  } catch (error) {
    console.error('Error rejecting order:', error);
    res.status(500).json({ 
      error: 'Failed to reject order', 
      details: error.message 
    });
  }
});

// GET /api/supplier/orders/stats - Get order statistics
router.get('/orders/stats', authenticateToken, async (req, res) => {
  try {
    const supplierId = req.user._id;

    const stats = await Order.aggregate([
      { $match: { supplierId: mongoose.Types.ObjectId(supplierId) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalValue: { $sum: '$total' }
        }
      }
    ]);

    const totalOrders = await Order.countDocuments({ supplierId });
    const totalRevenue = await Order.aggregate([
      { 
        $match: { 
          supplierId: mongoose.Types.ObjectId(supplierId),
          status: { $in: ['delivered'] }
        } 
      },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);

    const result = {
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      statusBreakdown: stats.reduce((acc, stat) => {
        acc[stat._id] = {
          count: stat.count,
          totalValue: stat.totalValue
        };
        return acc;
      }, {})
    };

    res.json({ 
      success: true, 
      stats: result 
    });
  } catch (error) {
    console.error('Error fetching order stats:', error);
    res.status(500).json({ 
      error: 'Failed to fetch order statistics', 
      details: error.message 
    });
  }
});

// PATCH /api/supplier/orders/:id/delivery-date - Update delivery date
router.patch('/orders/:id/delivery-date', authenticateToken, async (req, res) => {
  try {
    const orderId = req.params.id;
    const supplierId = req.user._id;
    const { deliveryDate } = req.body;

    if (!deliveryDate) {
      return res.status(400).json({ error: 'Delivery date is required' });
    }

    const order = await Order.findOne({ 
      _id: orderId, 
      supplierId 
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    order.deliveryDate = new Date(deliveryDate);
    order.updatedAt = new Date();
    
    order.tracking.statusHistory.push({
      status: order.status,
      timestamp: new Date(),
      notes: `Delivery date updated to ${new Date(deliveryDate).toLocaleDateString()}`
    });

    await order.save();

    res.json({ 
      success: true, 
      message: 'Delivery date updated successfully',
      order 
    });
  } catch (error) {
    console.error('Error updating delivery date:', error);
    res.status(500).json({ 
      error: 'Failed to update delivery date', 
      details: error.message 
    });
  }
});

module.exports = router;
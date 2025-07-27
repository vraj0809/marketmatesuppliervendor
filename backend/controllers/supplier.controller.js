const User = require("../models/User");
const mongoose = require("mongoose");
const Order = require("../models/order.model");
const Product = require("../models/products.model");
const Supplier = require('../models/supplier.model');

exports.getAllSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find({ })
      .select("_id businessName ownerName location trustScore totalSales isVerified createdAt")
      .lean();

    res.json({ suppliers });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to fetch all suppliers", details: err.message });
  }
};

// GET /api/vendor/suppliers - Advanced search & filter
exports.searchSuppliers = async (req, res) => {
  try {
    const {
      search = "",
      location = "",
      // distance = 500,
      categories = [],
      minOrder = 0,
      paymentTerms = [],
      delivery = [],
      trustScore = [0, 100],
      priceRange = [0, 1000000],
      page = 1,
      limit = 20,
      sort = "relevance",
    } = req.query;

    // Build query
    let query = { role: "supplier", isActive: true };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { "profile.company": { $regex: search, $options: "i" } },
        { specializations: { $regex: search, $options: "i" } },
        { categories: { $regex: search, $options: "i" } },
      ];
    }
    if (categories.length)
      query.categories = {
        $in: Array.isArray(categories) ? categories : [categories],
      };
    if (paymentTerms.length)
      query.paymentTerms = {
        $in: Array.isArray(paymentTerms) ? paymentTerms : [paymentTerms],
      };
    if (delivery.length)
      query.delivery = { $in: Array.isArray(delivery) ? delivery : [delivery] };
    if (minOrder) query.minOrder = { $gte: Number(minOrder) };
    if (trustScore.length === 2)
      query.trustScore = {
        $gte: Number(trustScore[0]),
        $lte: Number(trustScore[1]),
      };
    if (priceRange.length === 2)
      query.priceRange = {
        $gte: Number(priceRange[0]),
        $lte: Number(priceRange[1]),
      };
    if (location) {
      query.$or = [
        ...(query.$or || []),
        { city: { $regex: location, $options: "i" } },
        { state: { $regex: location, $options: "i" } },
      ];
    }
    // TODO: Add geo-distance filter if geo and distance provided

    // Sorting
    let sortObj = {};
    if (sort === "trust") sortObj.trustScore = -1;
    else if (sort === "rating") sortObj["performance.orderCompletion"] = -1;
    else sortObj.createdAt = -1;

    // Pagination
    const skip = (page - 1) * limit;
    const suppliers = await User.find(query)
      .select("-password")
      .sort(sortObj)
      .skip(skip)
      .limit(Number(limit));

    // Autocomplete suggestions (mocked)
    const suggestions = suppliers.map((s) => s.profile?.company || s.name);

    res.json({ suppliers, suggestions });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to search suppliers", details: err.message });
  }
};

// GET /api/vendor/suppliers/:id - Supplier profile
exports.getSupplierProfile = async (req, res) => {
  try {
    const supplier = await User.findById(req.params.id)
      .select("-password")
      .populate("reviews.reviewer", "name profile")
      .populate("certifications");
    if (!supplier || supplier.role !== "supplier")
      return res.status(404).json({ error: "Supplier not found" });
    res.json(supplier);
  } catch (err) {
    res
      .status(500)
      .json({
        error: "Failed to fetch supplier profile",
        details: err.message,
      });
  }
};

// POST /api/vendor/suppliers/:id/favorite - Toggle favorite supplier
exports.toggleFavoriteSupplier = async (req, res) => {
  try {
    const userId = req.user._id;
    const supplierId = req.params.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    const idx = user.favoriteSuppliers.findIndex((id) => id.equals(supplierId));
    if (idx > -1) user.favoriteSuppliers.splice(idx, 1);
    else user.favoriteSuppliers.push(supplierId);
    await user.save();
    res.json({ favoriteSuppliers: user.favoriteSuppliers });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to toggle favorite", details: err.message });
  }
};

// POST /api/vendor/suppliers/:id/contact - Contact supplier
exports.contactSupplier = async (req, res) => {
  try {
    // In real app, send message/email/notification
    // For now, just acknowledge
    res.json({ success: true, message: "Contact request sent" });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to contact supplier", details: err.message });
  }
};

// GET /api/vendor/suppliers/compare?ids=... - Compare suppliers
exports.compareSuppliers = async (req, res) => {
  try {
    const ids = (req.query.ids || "").split(",").filter(Boolean);
    if (!ids.length)
      return res.status(400).json({ error: "No supplier IDs provided" });
    const suppliers = await User.find({
      _id: { $in: ids },
      role: "supplier",
    }).select("-password");
    res.json({ suppliers });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to compare suppliers", details: err.message });
  }
};

// GET /api/supplier/dashboard/overview
exports.getSupplierDashboard = async (req, res) => {
  try {
    const supplierId = req.user?._id || req.query.supplierId; // fallback for testing
    if (!supplierId)
      return res.status(400).json({ error: "Supplier ID required" });

    // Revenue metrics
    const revenueAgg = await Order.aggregate([
      {
        $match: {
          supplierId: mongoose.Types.ObjectId(supplierId),
          status: { $in: ["Completed", "Delivered"] },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$total" },
          totalOrders: { $sum: 1 },
          avgOrderValue: { $avg: "$total" },
        },
      },
    ]);
    const revenue = revenueAgg[0] || {
      totalRevenue: 0,
      totalOrders: 0,
      avgOrderValue: 0,
    };

    // Order analytics
    const orderStats = await Order.aggregate([
      { $match: { supplierId: mongoose.Types.ObjectId(supplierId) } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);
    const orderStatus = orderStats.reduce((acc, cur) => {
      acc[cur._id] = cur.count;
      return acc;
    }, {});
    const pendingOrders = orderStatus["Pending"] || 0;
    const completedOrders = orderStatus["Completed"] || 0;
    const shippedOrders = orderStatus["Shipped"] || 0;
    const deliveredOrders = orderStatus["Delivered"] || 0;

    // Top products
    const topProducts = await Product.aggregate([
      { $match: { supplierId: mongoose.Types.ObjectId(supplierId) } },
      {
        $project: {
          name: 1,
          images: 1,
          "salesAnalytics.totalSold": 1,
          "salesAnalytics.revenueContribution": 1,
        },
      },
      { $sort: { "salesAnalytics.totalSold": -1 } },
      { $limit: 5 },
    ]);

    // Performance KPIs (from User)
    const supplier = await User.findById(supplierId).select(
      "performance trustScore businessMetrics reviews"
    );
    const satisfactionScore = supplier?.reviews?.length
      ? supplier.reviews.reduce((sum, r) => sum + (r.rating || 0), 0) /
        supplier.reviews.length
      : 0;

    // Vendor analytics (customer insights)
    const vendorAgg = await Order.aggregate([
      { $match: { supplierId: mongoose.Types.ObjectId(supplierId) } },
      {
        $group: {
          _id: "$vendorId",
          orderCount: { $sum: 1 },
          totalSpent: { $sum: "$total" },
        },
      },
      { $sort: { orderCount: -1 } },
    ]);
    const newVendors = vendorAgg.length;
    const repeatVendors = vendorAgg.filter((v) => v.orderCount > 1).length;

    // Market trends (category demand)
    const categoryTrends = await Product.aggregate([
      { $match: { supplierId: mongoose.Types.ObjectId(supplierId) } },
      {
        $group: {
          _id: "$category",
          totalSold: { $sum: "$salesAnalytics.totalSold" },
        },
      },
      { $sort: { totalSold: -1 } },
    ]);

    res.json({
      revenue,
      orderStatus: {
        pendingOrders,
        completedOrders,
        shippedOrders,
        deliveredOrders,
      },
      topProducts,
      performance: {
        satisfactionScore,
        trustScore: supplier?.trustScore || 0,
        deliverySuccess: supplier?.performance?.deliverySuccess || 0,
        responseTime: supplier?.performance?.responseTime || 0,
        orderCompletion: supplier?.performance?.orderCompletion || 0,
      },
      vendorAnalytics: {
        newVendors,
        repeatVendors,
        vendorLifetimeValue:
          vendorAgg.reduce((sum, v) => sum + v.totalSpent, 0) /
          (vendorAgg.length || 1),
      },
      categoryTrends,
    });
  } catch (err) {
    res
      .status(500)
      .json({
        error: "Failed to fetch supplier dashboard",
        details: err.message,
      });
  }
};

// GET /api/supplier/dashboard/revenue
exports.getSupplierRevenue = async (req, res) => {
  try {
    const supplierId = req.user?._id || req.query.supplierId;
    const { range = "monthly" } = req.query;
    if (!supplierId)
      return res.status(400).json({ error: "Supplier ID required" });
    let groupBy, dateFrom;
    const now = new Date();
    if (range === "daily") {
      groupBy = {
        year: { $year: "$createdAt" },
        month: { $month: "$createdAt" },
        day: { $dayOfMonth: "$createdAt" },
      };
      dateFrom = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
    } else if (range === "weekly") {
      groupBy = {
        year: { $year: "$createdAt" },
        week: { $week: "$createdAt" },
      };
      dateFrom = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - 30
      );
    } else {
      groupBy = {
        year: { $year: "$createdAt" },
        month: { $month: "$createdAt" },
      };
      dateFrom = new Date(now.getFullYear(), now.getMonth() - 12, 1);
    }
    const revenueData = await Order.aggregate([
      {
        $match: {
          supplierId: mongoose.Types.ObjectId(supplierId),
          status: { $in: ["Completed", "Delivered"] },
          createdAt: { $gte: dateFrom },
        },
      },
      { $group: { _id: groupBy, total: { $sum: "$total" } } },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1, "_id.week": 1 } },
    ]);
    res.json({ revenueData });
  } catch (err) {
    res
      .status(500)
      .json({
        error: "Failed to fetch revenue analytics",
        details: err.message,
      });
  }
};

// GET /api/supplier/dashboard/orders
exports.getSupplierOrders = async (req, res) => {
  try {
    const supplierId = req.user?._id || req.query.supplierId;
    if (!supplierId)
      return res.status(400).json({ error: "Supplier ID required" });
    const orders = await Order.find({ supplierId })
      .sort({ createdAt: -1 })
      .limit(100);
    res.json({ orders });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to fetch orders", details: err.message });
  }
};

// GET /api/supplier/dashboard/products
exports.getSupplierProducts = async (req, res) => {
  try {
    const supplierId = req.user?._id || req.query.supplierId;
    if (!supplierId)
      return res.status(400).json({ error: "Supplier ID required" });
    const products = await Product.find({ supplierId });
    res.json({ products });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to fetch products", details: err.message });
  }
};

// GET /api/supplier/dashboard/customers
exports.getSupplierCustomers = async (req, res) => {
  try {
    const supplierId = req.user?._id || req.query.supplierId;
    if (!supplierId)
      return res.status(400).json({ error: "Supplier ID required" });
    const vendorAgg = await Order.aggregate([
      { $match: { supplierId: mongoose.Types.ObjectId(supplierId) } },
      {
        $group: {
          _id: "$vendorId",
          orderCount: { $sum: 1 },
          totalSpent: { $sum: "$total" },
        },
      },
      { $sort: { orderCount: -1 } },
    ]);
    res.json({ vendors: vendorAgg });
  } catch (err) {
    res
      .status(500)
      .json({
        error: "Failed to fetch customer analytics",
        details: err.message,
      });
  }
};

// GET /api/supplier/dashboard/performance
exports.getSupplierPerformance = async (req, res) => {
  try {
    const supplierId = req.user?._id || req.query.supplierId;
    if (!supplierId)
      return res.status(400).json({ error: "Supplier ID required" });
    const supplier = await User.findById(supplierId).select(
      "performance trustScore businessMetrics reviews"
    );
    res.json({
      performance: supplier?.performance,
      trustScore: supplier?.trustScore,
      businessMetrics: supplier?.businessMetrics,
      reviews: supplier?.reviews,
    });
  } catch (err) {
    res
      .status(500)
      .json({
        error: "Failed to fetch performance analytics",
        details: err.message,
      });
  }
};
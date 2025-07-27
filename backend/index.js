require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const supplierProductsRoutes = require("./routes/supplierProducts");
const supplierCategoriesRoutes = require("./routes/supplierCategories");
const session = require("express-session");
const productRoutes = require("./routes/product.route");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173", // or your frontend URL
    credentials: true,
  })
);
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET || "yourSecret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Logging middleware to debug cookies and session
app.use((req, res, next) => {
  console.log("Cookies:", req.headers.cookie);
  console.log("Session:", req.session);
  next();
});

// New Auth Routes
const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

// Routes
app.use("/api/supplier", supplierProductsRoutes);
app.use("/api/supplier", supplierCategoriesRoutes);

const supplierOrderRoutes = require("./routes/supplier.order.routes");
app.use("/api/supplier", supplierOrderRoutes);


app.use("/api/products", productRoutes);

const vendorRoutes = require("./routes/vendor.route");
const vendorOrderRoutes = require("./routes/vendor.order.routes");

app.use("/api/vendor", vendorRoutes);
app.use("/api/vendor", vendorOrderRoutes);

// Error handling middleware (placeholder)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(500)
    .json({ success: false, message: "Server Error", error: err.message });
  next();
});

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.get("/", (req, res) => {
  res.send("API Running");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;

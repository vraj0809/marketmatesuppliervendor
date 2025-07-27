const User = require("../models/User");
const Supplier = require("../models/supplier.model"); // Import the Supplier model
const bcrypt = require("bcryptjs");

// Register a new user
exports.register = async (req, res) => {
  const { username, email, password, role } = req.body;

  if (!username || !email || !password || !role) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists." });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Get phone from profile if supplier, otherwise set as empty
    const phone = role === "supplier" ? req.body.profile?.phone || "" : "";

    // Create user
    const user = new User({
      username,
      email,
      password: hashedPassword,
      role,
      phone,
    });
    await user.save();

    // If role is supplier, create supplier profile
    if (role === "supplier") {
      const { profile } = req.body;

      // Validate required supplier fields
      if (!profile || !profile.company || !profile.phone) {
        // Delete the created user if supplier validation fails
        await User.findByIdAndDelete(user._id);
        return res.status(400).json({
          message: "Company name and phone are required for suppliers.",
        });
      }

      // Create supplier profile
      const supplierData = {
        userId: user._id,
        businessName: profile.company,
        ownerName: username, // Using username as owner name
        location: {
          address: profile.address?.street || "",
          city: profile.address?.city || "",
          state: profile.address?.state || "",
          pincode: profile.address?.zip || "",
          // You can add coordinates later with geocoding
          coordinates: {
            latitude: null,
            longitude: null,
          },
        },
        businessType: "wholesaler", // Default to wholesaler, you can add this to frontend later
        licenseNumber: "", // Can be added to frontend later
        gstNumber: "", // Can be added to frontend later
        deliveryRadius: 10, // Default value
        minimumOrderValue: 0, // Default value
        paymentMethods: ["cash", "upi"], // Default payment methods
      };

      const supplier = new Supplier(supplierData);
      await supplier.save();

      // Set session with supplier info
      req.session.user = {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        supplierId: supplier._id,
      };

      // Return response with both user and supplier data
      const userObj = user.toObject();
      delete userObj.password;

      const supplierObj = supplier.toObject();

      res.status(201).json({
        message: "Supplier registered successfully.",
        user: userObj,
        supplier: supplierObj,
      });
    } else {
      // For non-supplier users (vendors), just create user account
      req.session.user = {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      };

      const userObj = user.toObject();
      delete userObj.password;

      res.status(201).json({
        message: "User registered successfully.",
        user: userObj,
      });
    }
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ message: "Server error." });
  }
};

// Login user (updated to include supplier/vendor profile data)
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    let profileData = null;
    let sessionData = {
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    // If user is a supplier, get supplier profile
    if (user.role === "supplier") {
      const supplier = await Supplier.findOne({ userId: user._id });
      if (supplier) {
        profileData = supplier.toObject();
        sessionData.supplierId = supplier._id;
      }
    }
    // You can add similar logic for vendor profile when you create Vendor model

    req.session.user = sessionData;

    const userObj = user.toObject();
    delete userObj.password;

    res.json({
      message: "Login successful.",
      user: userObj,
      profile: profileData,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error." });
  }
};

// Logout user
exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Logout failed." });
    }
    res.clearCookie("connect.sid");
    res.json({ message: "Logged out successfully." });
  });
};

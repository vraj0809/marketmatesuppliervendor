const mongoose = require('mongoose');
const User = require('../models/User');
const db = require('../config/db');

// No dummy suppliers. Add real supplier data here if needed.
const suppliers = [
  // Add real supplier objects here
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/market-mate');
    await User.deleteMany({ role: 'supplier' });
    if (suppliers.length > 0) {
      await User.insertMany(suppliers);
      console.log('Suppliers seeded!');
    } else {
      console.log('No suppliers to seed.');
    }
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed(); 
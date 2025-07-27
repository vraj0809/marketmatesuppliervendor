const mongoose = require('mongoose');
const User = require('../models/User');

async function deleteSuppliers() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/market-mate');
    const result = await User.deleteMany({ role: 'supplier' });
    console.log(`Deleted ${result.deletedCount} suppliers.`);
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

deleteSuppliers(); 
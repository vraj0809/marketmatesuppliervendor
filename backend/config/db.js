const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const connectDB = async () => {
  try {
    // Use MongoDB Atlas connection string or local MongoDB
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/marketmate';
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    // Don't exit process, just log the error
    console.log('Continuing without database connection...');
  }
};

module.exports = connectDB;
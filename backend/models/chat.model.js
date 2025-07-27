const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: String,
  messageType: { type: String, enum: ['text', 'image', 'file'], default: 'text' },
  timestamp: { type: Date, default: Date.now },
  isRead: { type: Boolean, default: false }
}, { _id: false });

const ChatSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  messages: [MessageSchema],
  lastMessage: Date,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Chat', ChatSchema); 
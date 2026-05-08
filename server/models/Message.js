const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  roomHash: {
    type: String,
    required: true,
    index: true,
  },
  cipherText: {
    type: String,
    required: true,
  },
  senderId: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('Message', messageSchema);

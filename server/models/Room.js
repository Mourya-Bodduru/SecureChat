const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomHash: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastActive: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('Room', roomSchema);

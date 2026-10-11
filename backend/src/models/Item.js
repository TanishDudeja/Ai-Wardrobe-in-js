const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  userId: {
    type: String,
    default: null,
    index: true,
  },
  isSample: {
    type: Boolean,
    default: false,
  },
  name: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['tops', 'bottoms', 'outerwear', 'shoes', 'accessories'],
  },
  color: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Item', itemSchema);

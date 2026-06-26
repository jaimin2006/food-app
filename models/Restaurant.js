const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  cuisine: [{ type: String }],
  rating: { type: Number, default: 0, min: 0, max: 5 },
  totalRatings: { type: Number, default: 0 },
  popularItems: [{ type: String }],
  location: { type: String },
  priceRange: {
    type: String,
    enum: ['budget', 'mid', 'premium'],
    default: 'mid'
  },
  isActive: { type: Boolean, default: true },
  orderCount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Restaurant', restaurantSchema);
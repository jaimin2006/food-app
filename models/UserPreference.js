const mongoose = require('mongoose');

const userPreferenceSchema = new mongoose.Schema({
  firebaseUid: { type: String, required: true, unique: true },
  email: { type: String },
  preferredCuisines: [{ type: String }],
  frequentlyOrderedItems: [{ type: String }],
  visitedRestaurants: [
    {
      restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' },
      orderCount: { type: Number, default: 1 },
      lastOrdered: { type: Date, default: Date.now }
    }
  ],
  totalOrders: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('UserPreference', userPreferenceSchema);
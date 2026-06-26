const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  firebaseUid: { type: String, required: true },
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  items: [
    {
      name: { type: String, required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true }
    }
  ],
  totalAmount: { type: Number, required: true },
  deliveryAddress: { type: String, required: true },
  status: {
    type: String,
    enum: ['Order Placed', 'Restaurant Accepted', 'Preparing Food', 'Out for Delivery', 'Delivered'],
    default: 'Order Placed'
  },
  statusHistory: [
    {
      status: String,
      updatedAt: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');
const UserPreference = require('../models/UserPreference');

const createOrder = async (req, res) => {
  try {
    const { customerName, customerPhone, restaurantId, items, deliveryAddress } = req.body;
    const firebaseUid = req.user.uid;

    if (!customerName || !customerPhone || !restaurantId || !items || !deliveryAddress) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) return res.status(404).json({ success: false, message: 'Restaurant not found.' });

    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const order = new Order({
      firebaseUid, customerName, customerPhone, restaurantId,
      items, totalAmount, deliveryAddress,
      status: 'Order Placed',
      statusHistory: [{ status: 'Order Placed' }]
    });

    await order.save();
    await Restaurant.findByIdAndUpdate(restaurantId, { $inc: { orderCount: 1 } });
    await updateUserPreferences(firebaseUid, restaurant, items);

    res.status(201).json({ success: true, message: 'Order placed successfully!', order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateUserPreferences = async (firebaseUid, restaurant, items) => {
  let userPref = await UserPreference.findOne({ firebaseUid });
  if (!userPref) userPref = new UserPreference({ firebaseUid });

  restaurant.cuisine.forEach(c => {
    if (!userPref.preferredCuisines.includes(c)) userPref.preferredCuisines.push(c);
  });

  items.forEach(item => {
    if (!userPref.frequentlyOrderedItems.includes(item.name)) userPref.frequentlyOrderedItems.push(item.name);
  });

  const visited = userPref.visitedRestaurants.find(
    v => v.restaurantId.toString() === restaurant._id.toString()
  );
  if (visited) {
    visited.orderCount += 1;
    visited.lastOrdered = new Date();
  } else {
    userPref.visitedRestaurants.push({ restaurantId: restaurant._id });
  }

  userPref.totalOrders += 1;
  await userPref.save();
};

const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const validStatuses = ['Order Placed', 'Restaurant Accepted', 'Preparing Food', 'Out for Delivery', 'Delivered'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    order.status = status;
    order.statusHistory.push({ status });
    await order.save();

    const io = req.app.get('io');
    io.to(orderId).emit('order-status-update', { orderId, status, updatedAt: new Date() });

    res.status(200).json({ success: true, message: `Order status updated to "${status}"`, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId).populate('restaurantId', 'name cuisine');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    res.status(200).json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('restaurantId', 'name').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: orders.length, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createOrder, updateOrderStatus, getOrder, getAllOrders };
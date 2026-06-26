const express = require('express');
const router = express.Router();
const { createOrder, updateOrderStatus, getOrder, getAllOrders } = require('../controllers/orderController');
const firebaseAuth = require('../middleware/firebaseAuth');
const adminAuth = require('../middleware/adminAuth');

router.post('/create', firebaseAuth, createOrder);
router.get('/:orderId', getOrder);
router.put('/update-status/:orderId', adminAuth, updateOrderStatus);
router.get('/', adminAuth, getAllOrders);

module.exports = router;
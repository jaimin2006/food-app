const express = require('express');
const router = express.Router();
const { addRestaurant, getAllRestaurants, getRecommendations, updateRestaurant } = require('../controllers/restaurantController');
const adminAuth = require('../middleware/adminAuth');
const firebaseAuth = require('../middleware/firebaseAuth');

router.get('/', getAllRestaurants);
router.get('/recommendations/:userId', firebaseAuth, getRecommendations);
router.post('/', adminAuth, addRestaurant);
router.put('/:id', adminAuth, updateRestaurant);

module.exports = router;
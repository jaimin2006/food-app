const Restaurant = require('../models/Restaurant');
const UserPreference = require('../models/UserPreference');

const addRestaurant = async (req, res) => {
  try {
    const { name, cuisine, rating, popularItems, location, priceRange } = req.body;
    const restaurant = new Restaurant({ name, cuisine, rating, popularItems, location, priceRange });
    await restaurant.save();
    res.status(201).json({ success: true, message: 'Restaurant added!', restaurant });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getAllRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find({ isActive: true }).sort({ rating: -1 });
    res.status(200).json({ success: true, count: restaurants.length, restaurants });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getRecommendations = async (req, res) => {
  try {
    const { userId } = req.params;
    const userPref = await UserPreference.findOne({ firebaseUid: userId });

    if (!userPref || userPref.totalOrders === 0) {
      const topRestaurants = await Restaurant.find({ isActive: true })
        .sort({ rating: -1, orderCount: -1 }).limit(5);
      return res.status(200).json({
        success: true,
        message: 'Showing top-rated restaurants (no order history found)',
        recommendations: topRestaurants
      });
    }

    const preferredCuisines = userPref.preferredCuisines;
    const visitedRestaurantIds = userPref.visitedRestaurants.map(v => v.restaurantId.toString());

    const recommendations = await Restaurant.aggregate([
      { $match: { isActive: true } },
      {
        $addFields: {
          cuisineScore: {
            $multiply: [
              { $size: { $ifNull: [{ $filter: { input: '$cuisine', as: 'c', cond: { $in: ['$$c', preferredCuisines] } } }, []] } },
              10
            ]
          },
          ratingScore: { $multiply: ['$rating', 10] },
          popularityScore: { $min: [{ $divide: ['$orderCount', 10] }, 10] }
        }
      },
      { $addFields: {
        recommendationScore: { $add: ['$cuisineScore', '$ratingScore', '$popularityScore'] },
        isVisited: { $in: [{ $toString: '$_id' }, visitedRestaurantIds] }
      }},
      { $sort: { recommendationScore: -1, rating: -1 } },
      { $limit: 10 },
      { $project: { name: 1, cuisine: 1, rating: 1, popularItems: 1, location: 1, priceRange: 1, orderCount: 1, recommendationScore: { $round: ['$recommendationScore', 1] }, isVisited: 1 } }
    ]);

    res.status(200).json({
      success: true,
      message: 'Personalized recommendations generated!',
      userPreferences: { preferredCuisines, totalOrders: userPref.totalOrders },
      recommendations
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!restaurant) return res.status(404).json({ success: false, message: 'Restaurant not found.' });
    res.status(200).json({ success: true, message: 'Restaurant updated!', restaurant });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { addRestaurant, getAllRestaurants, getRecommendations, updateRestaurant };
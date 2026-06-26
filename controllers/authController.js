const UserPreference = require('../models/UserPreference');

const loginUser = async (req, res) => {
  try {
    const { uid, email } = req.user;

    let userPref = await UserPreference.findOne({ firebaseUid: uid });
    if (!userPref) {
      userPref = new UserPreference({ firebaseUid: uid, email });
      await userPref.save();
    }

    res.status(200).json({
      success: true,
      message: 'User logged in successfully!',
      user: {
        uid,
        email,
        totalOrders: userPref.totalOrders,
        preferredCuisines: userPref.preferredCuisines
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { loginUser };
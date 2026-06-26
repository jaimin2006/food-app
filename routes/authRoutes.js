const express = require('express');
const router = express.Router();
const { loginUser } = require('../controllers/authController');
const firebaseAuth = require('../middleware/firebaseAuth');

router.post('/login', firebaseAuth, loginUser);

module.exports = router;
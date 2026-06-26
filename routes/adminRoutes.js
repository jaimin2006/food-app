const express = require('express');
const router = express.Router();
const { setupAdmin, loginAdmin } = require('../controllers/adminController');

router.post('/setup', setupAdmin);
router.post('/login', loginAdmin);

module.exports = router;
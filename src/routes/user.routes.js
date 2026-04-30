const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const userController = require('../controllers/user.controller');

router.get('/me', protect, userController.getCurrentUser);

module.exports = router;

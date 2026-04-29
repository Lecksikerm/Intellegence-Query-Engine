const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profile.controller');
const { protect, requireRoles } = require('../middleware/auth');

router.get('/search', protect, requireRoles('admin', 'analyst'), profileController.searchProfiles);
router.get('/', protect, requireRoles('admin', 'analyst'), profileController.getProfiles);

module.exports = router;
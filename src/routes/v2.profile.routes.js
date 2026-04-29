const express = require('express');
const router = express.Router();

const profileController = require('../controllers/profile.controller');
const { protect, requireRoles } = require('../middleware/auth');

router.get(
    '/export',
    protect,
    requireRoles('admin'),
    profileController.exportProfiles
);

router.get(
    '/search',
    protect,
    requireRoles('admin', 'analyst'),
    profileController.searchProfilesV2
);

router.get(
    '/',
    protect,
    requireRoles('admin', 'analyst'),
    profileController.getProfilesV2
);

module.exports = router;

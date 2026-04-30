const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profile.controller');
const { protect, requireRoles } = require('../middleware/auth');

router.get('/search', protect, requireRoles('admin', 'analyst'), profileController.searchProfiles);
router.get('/', protect, requireRoles('admin', 'analyst'), profileController.getProfiles);
router.post('/', protect, requireRoles('admin', 'analyst'), (req, res) => {
    return res.status(501).json({
        status: 'error',
        message: 'Not implemented'
    });
});

module.exports = router;
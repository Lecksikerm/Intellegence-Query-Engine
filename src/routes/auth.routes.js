const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { requireCsrf } = require('../middleware/csrf');
const { protect } = require('../middleware/auth');

router.get('/github', authController.githubLogin);
router.get('/github/callback', authController.githubCallback);
router.post('/cli/complete', authController.completeCliLogin);
router.post('/refresh', requireCsrf, authController.refreshToken);
router.post('/logout', requireCsrf, authController.logout);
router.get('/me', protect, authController.me);

module.exports = router;
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { requireCsrf } = require('../middleware/csrf');
const { protect } = require('../middleware/auth');

router.get('/github', authController.githubLogin);
router.get('/github/callback', authController.githubCallback);
router.get('/csrf', authController.csrfToken);
router.post('/cli/complete', authController.completeCliLogin);
router.post('/refresh', requireCsrf, authController.refreshToken);
router.post('/logout', requireCsrf, authController.logout);
router.get('/me', protect, authController.me);
router.all('/refresh', (req, res) =>
    res.status(405).json({ status: 'error', message: 'Method not allowed' })
);
router.all('/logout', (req, res) =>
    res.status(405).json({ status: 'error', message: 'Method not allowed' })
);

module.exports = router;
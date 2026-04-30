const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { requireCsrf } = require('../middleware/csrf');
const { protect } = require('../middleware/auth');
const { oauthGithubLimiter } = require('../middleware/rateLimiter');

// Middleware to enforce POST-only for refresh and logout
const enforcePost = (req, res, next) => {
    if (req.method !== 'POST') {
        return res.status(405).json({
            status: 'error',
            message: 'Method not allowed'
        });
    }
    next();
};

router.get('/github', oauthGithubLimiter, authController.githubLogin);
router.get('/github/callback', authController.githubCallback);
router.get('/csrf', authController.csrfToken);
router.get('/test-token', authController.getTestToken);
router.post('/cli/complete', authController.completeCliLogin);
router.post('/refresh', enforcePost, requireCsrf, authController.refreshToken);
router.post('/logout', enforcePost, requireCsrf, authController.logout);
router.get('/me', protect, authController.me);

module.exports = router;
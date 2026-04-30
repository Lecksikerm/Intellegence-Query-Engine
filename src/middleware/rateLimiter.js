const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: 'error',
        message: 'Too many requests, please try again later'
    }
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: 'error',
        message: 'Too many authentication attempts, please try again later'
    }
});

const oauthGithubLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: () => 'global-oauth-github',
    message: {
        status: 'error',
        message: 'Too many authentication attempts, please try again later'
    }
});

module.exports = {
    apiLimiter,
    authLimiter,
    oauthGithubLimiter
};
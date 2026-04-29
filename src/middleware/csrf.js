function requireCsrf(req, res, next) {
    if (!req.cookies?.refresh_token) {
        return next();
    }

    const csrfHeader = req.headers['x-csrf-token'];
    const csrfCookie = req.cookies?.csrf_token;

    if (!csrfHeader || !csrfCookie || csrfHeader !== csrfCookie) {
        return res.status(403).json({
            status: 'error',
            message: 'Invalid CSRF token'
        });
    }

    next();
}

module.exports = {
    requireCsrf
};

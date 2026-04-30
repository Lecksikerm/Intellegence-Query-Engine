function requireCsrf(req, res, next) {
    // Only require CSRF if there's a refresh token in cookies
    // (indicating a session with cookies)
    const hasSessionCookie = !!req.cookies?.refresh_token;
    const hasBodyToken = !!req.body?.refreshToken || !!req.body?.requestToken;

    // If no refresh token at all, skip CSRF check
    if (!hasSessionCookie && !hasBodyToken) {
        return next();
    }

    // If using session cookies, require CSRF
    if (hasSessionCookie) {
        const csrfHeader = req.headers['x-csrf-token'];
        const csrfCookie = req.cookies?.csrf_token;

        if (!csrfHeader || !csrfCookie || csrfHeader !== csrfCookie) {
            return res.status(403).json({
                status: 'error',
                message: 'Invalid CSRF token'
            });
        }
    }

    next();
}

module.exports = {
    requireCsrf
};
